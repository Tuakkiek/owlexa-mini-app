import React from "react";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface-page font-sans text-text-body">
      {children}
    </div>
  );
};

export default PublicLayout;
