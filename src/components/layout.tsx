import React, { useEffect } from "react";
import { getSystemInfo } from "zmp-sdk";
import { App, SnackbarProvider, ZMPRouter } from "zmp-ui";
import { AppProps } from "zmp-ui/app";
import { AppRoutes } from "@/router/AppRoutes";
import { authService } from "@/core/auth/authService";

const Layout: React.FC = () => {
  useEffect(() => {
    authService.hydrateAuth();
  }, []);

  return (
    <App theme={getSystemInfo().zaloTheme as AppProps["theme"]}>
      <SnackbarProvider>
        <ZMPRouter>
          <AppRoutes />
        </ZMPRouter>
      </SnackbarProvider>
    </App>
  );
};

export default Layout;
