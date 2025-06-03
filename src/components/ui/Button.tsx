import React from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    "font-medium rounded-lg transition-all duration-200 flex items-center justify-center";

  const variantStyles = {
    primary: "bg-primary hover:bg-primary-dark text-white",
    secondary: "bg-secondary hover:bg-secondary-dark text-[rgb(var(--text))] ",
    accent: "bg-accent hover:bg-accent-dark text-[rgb(var(--text))] ",
    outline:
      "bg-transparent border border-neutral-600 hover:border-neutral-400 text-[rgb(var(--text))] ",
    ghost: "bg-transparent  text-[rgb(var(--text))] ",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const widthStyle = fullWidth ? "w-full" : "";
  const disabledStyle =
    disabled || isLoading ? "opacity-60 cursor-not-allowed" : "";

  return (
    <button
      className={twMerge(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyle,
        disabledStyle,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}

      {children}

      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
