import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ elevated = false, className = "", ...props }) => (
  <section {...props} className={`rounded-card border border-surface-border bg-surface-card p-4 ${elevated ? "shadow-sm" : ""} ${className}`} />
);
