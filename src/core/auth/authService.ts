import { getDefaultStore } from "jotai";
import { httpClient, setupHttpClient, clearRequestQueue, normalizeError, type AppApiError } from "@/core/api/httpClient";
import { storageAdapter, STORAGE_KEYS } from "@/core/storage/storageAdapter";
import {
  accessTokenAtom,
  authGenerationAtom,
  authStateAtom,
  isLoggingOutAtom,
  userProfileAtom,
} from "./authStore";
import type {
  AccountResponse,
  AuthResponse,
  LoginRequest,
  RefreshTokenResponse,
} from "./authTypes";

const jotaiStore = getDefaultStore();

// Setup httpClient getters/handlers
setupHttpClient({
  getAccessToken: () => jotaiStore.get(accessTokenAtom),
  onSessionExpired: () => {
    handleSessionExpired();
  },
});

function handleSessionExpired() {
  jotaiStore.set(authGenerationAtom, (prev) => prev + 1);
  jotaiStore.set(accessTokenAtom, null);
  jotaiStore.set(userProfileAtom, null);
  jotaiStore.set(authStateAtom, "SESSION_EXPIRED");
  storageAdapter.removeItem(STORAGE_KEYS.ACCESS_TOKEN).catch(() => {});
}

export const authService = {
  /**
   * Login Flow:
   * 1. POST /auth/login -> Receive accessToken (held temporarily in memory)
   * 2. GET /account -> Verify session & fetch fresh profile
   * 3. Check roleName == 'STUDENT'
   * 4. Save token to storage & set AUTHENTICATED_STUDENT
   */
  login: async (credentials: LoginRequest): Promise<AccountResponse> => {
    const currentGeneration = jotaiStore.get(authGenerationAtom) + 1;
    jotaiStore.set(authGenerationAtom, currentGeneration);
    jotaiStore.set(isLoggingOutAtom, false);

    // Step 1: Login API
    const loginRes = await httpClient.post<AuthResponse>("/auth/login", credentials);
    const authData = loginRes.data;

    const tempAccessToken = authData.accessToken;
    // Hold temporarily in memory for GET /account call
    jotaiStore.set(accessTokenAtom, tempAccessToken);

    try {
      // Step 2: Verify via GET /account
      const accountRes = await httpClient.get<AccountResponse>("/account", {
        headers: { Authorization: `Bearer ${tempAccessToken}` },
        allowAuthReplay: false,
      });

      const profile = accountRes.data;

      // Step 3: Validate Role
      if (profile.roleName !== "STUDENT") {
        await authService.revokeSessionBestEffort(tempAccessToken);
        authService.clearClientMemoryState();
        jotaiStore.set(authStateAtom, "FORBIDDEN_ROLE");
        throw {
          kind: "FORBIDDEN",
          status: 403,
          message: "Rất tiếc! Ứng dụng Zalo Mini App chỉ dành cho Học viên.",
        } as AppApiError;
      }

      // Step 4: Write to Storage
      await storageAdapter.setItem(STORAGE_KEYS.ACCESS_TOKEN, tempAccessToken);

      // Verify generation hasn't changed during async operations
      if (jotaiStore.get(authGenerationAtom) !== currentGeneration) {
        throw new Error("Auth generation changed during login");
      }

      jotaiStore.set(userProfileAtom, {
        userId: profile.userId,
        phoneNumber: profile.phoneNumber,
        email: profile.email,
        fullName: profile.fullName,
        roleName: profile.roleName as any,
        centerName: profile.centerName,
        centerId: profile.centerId,
        permissions: profile.permissions,
      });
      jotaiStore.set(authStateAtom, "AUTHENTICATED_STUDENT");

      return profile;
    } catch (err: any) {
      // Clean up memory on failure
      authService.clearClientMemoryState();
      if (err?.kind === "FORBIDDEN") {
        throw err;
      }
      throw normalizeError(err);
    }
  },

  /**
   * Hydration Flow:
   * Called on app bootstrap to read stored token & verify session.
   */
  hydrateAuth: async (): Promise<void> => {
    jotaiStore.set(authStateAtom, "HYDRATING");

    let storedToken: string | null = null;
    try {
      storedToken = await storageAdapter.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch {
      jotaiStore.set(authStateAtom, "STORAGE_ERROR");
      return;
    }

    if (!storedToken) {
      jotaiStore.set(authStateAtom, "GUEST");
      return;
    }

    jotaiStore.set(accessTokenAtom, storedToken);

    try {
      const accountRes = await httpClient.get<AccountResponse>("/account", {
        allowAuthReplay: true,
      });
      const profile = accountRes.data;

      if (profile.roleName !== "STUDENT") {
        authService.clearClientMemoryState();
        await storageAdapter.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        jotaiStore.set(authStateAtom, "FORBIDDEN_ROLE");
        return;
      }

      jotaiStore.set(userProfileAtom, {
        userId: profile.userId,
        phoneNumber: profile.phoneNumber,
        email: profile.email,
        fullName: profile.fullName,
        roleName: profile.roleName as any,
        centerName: profile.centerName,
        centerId: profile.centerId,
        permissions: profile.permissions,
      });
      jotaiStore.set(authStateAtom, "AUTHENTICATED_STUDENT");
    } catch (err: any) {
      // If 401, refresh token once
      if (err?.status === 401) {
        try {
          const refreshRes = await httpClient.post<RefreshTokenResponse>(
            "/auth/refresh-token",
            {},
            { withCredentials: true },
          );

          const newAccessToken = refreshRes.data?.auth?.accessToken;
          if (!newAccessToken) {
            throw new Error("No token in refresh response");
          }

          jotaiStore.set(accessTokenAtom, newAccessToken);
          await storageAdapter.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

          // Retry GET /account
          const retryAccountRes = await httpClient.get<AccountResponse>("/account", {
            allowAuthReplay: false,
          });
          const profile = retryAccountRes.data;

          if (profile.roleName !== "STUDENT") {
            authService.clearClientMemoryState();
            await storageAdapter.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            jotaiStore.set(authStateAtom, "FORBIDDEN_ROLE");
            return;
          }

          jotaiStore.set(userProfileAtom, {
            userId: profile.userId,
            phoneNumber: profile.phoneNumber,
            email: profile.email,
            fullName: profile.fullName,
            roleName: profile.roleName as any,
            centerName: profile.centerName,
            centerId: profile.centerId,
            permissions: profile.permissions,
          });
          jotaiStore.set(authStateAtom, "AUTHENTICATED_STUDENT");
          return;
        } catch {
          // Refresh failed
          authService.clearClientMemoryState();
          await storageAdapter.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          jotaiStore.set(authStateAtom, "SESSION_EXPIRED");
          return;
        }
      }

      // Other network or server errors
      jotaiStore.set(authStateAtom, "GUEST");
    }
  },

  /**
   * Logout Policy:
   * 1. Mark isLoggingOut = true
   * 2. Increment authGeneration (invalidates in-flight requests)
   * 3. Clear failedQueue
   * 4. Best-effort POST /auth/logout
   * 5. Finally: clear storage & reset state to GUEST
   */
  logout: async (): Promise<void> => {
    jotaiStore.set(isLoggingOutAtom, true);
    jotaiStore.set(authGenerationAtom, (prev) => prev + 1);
    clearRequestQueue();

    const currentToken = jotaiStore.get(accessTokenAtom);

    try {
      if (currentToken) {
        await httpClient.post("/auth/logout", {}, { withCredentials: true, timeout: 5000 });
      }
    } catch {
      // Best-effort backend logout — ignore errors
    } finally {
      authService.clearClientMemoryState();
      try {
        await storageAdapter.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      } catch {
        // Ignore storage removal errors on logout
      }
      jotaiStore.set(isLoggingOutAtom, false);
      jotaiStore.set(authStateAtom, "GUEST");
    }
  },

  revokeSessionBestEffort: async (token: string): Promise<void> => {
    try {
      await httpClient.post(
        "/auth/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          timeout: 3000,
        },
      );
    } catch {
      // Best effort
    }
  },

  clearClientMemoryState: () => {
    jotaiStore.set(accessTokenAtom, null);
    jotaiStore.set(userProfileAtom, null);
  },
};
