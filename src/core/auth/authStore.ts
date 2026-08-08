import { atom } from "jotai";
import type { AuthStateEnum, UserInfo } from "./authTypes";

export const authStateAtom = atom<AuthStateEnum>("HYDRATING");
export const accessTokenAtom = atom<string | null>(null);
export const userProfileAtom = atom<UserInfo | null>(null);
export const authGenerationAtom = atom<number>(0);
export const isLoggingOutAtom = atom<boolean>(false);
