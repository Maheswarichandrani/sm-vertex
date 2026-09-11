import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "text";
type ButtonSize = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-400 disabled:bg-primary-200 disabled:text-white/70",
  secondary:
    "bg-white text-primary-500 border border-primary-500 hover:bg-primary-100 disabled:border-neutral-200 disabled:text-neutral-300 disabled:bg-white",
  tertiary:
    "bg-transparent text-neutral-900 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 disabled:text-neutral-300 disabled:border-neutral-100",
  text: "bg-transparent text-primary-500 hover:text-primary-400 disabled:text-neutral-300 px-0 h-auto",
};

const sizeClasses: Record<ButtonSize, string> = {
  lg: "h-11 px-4 text-[15px]",
  md: "h-11 px-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "lg",
  icon,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const isTextVariant = variant === "text";
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium font-sans transition-colors disabled:cursor-not-allowed ${
        isTextVariant ? "h-auto px-0" : sizeClasses[size]
      } ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
      {icon}
    </button>
  );
}
