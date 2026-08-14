import React from "react";
import { BottomTabBar } from "@/components/navigation/BottomTabBar";

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-page font-sans text-text-body">
      <main className="flex-1 overflow-y-auto pb-4">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
};

export default MainLayout;

