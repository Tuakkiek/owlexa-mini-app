import React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-surface-hover text-text-heading hover:bg-surface-border",
  outline: "border border-surface-border bg-white text-text-body hover:bg-surface-hover",
  ghost: "text-text-body hover:bg-surface-hover",
  danger: "border border-error/20 bg-red-50 text-error hover:bg-red-100",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-btn px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
  >
    {loading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border border-current border-t-transparent" />}
    {children}
  </button>
);
