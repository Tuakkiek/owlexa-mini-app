import React from "react";
import { BottomTabBar } from "@/components/navigation/BottomTabBar";

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-surface-page font-sans text-text-body">
      <main
        style={{
          paddingBottom:
            "calc(var(--app-bottom-nav-height, 56px) + env(safe-area-inset-bottom) + var(--page-bottom-spacing, 16px))",
        }}
      >
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
};

export default MainLayout;
