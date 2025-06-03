import React from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass" | "outline";
  onClick?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
  animate?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = "default",
  padding = "md",
  animate = false,
  onClick,
  ...props
}) => {
  const baseStyles =
    "rounded-xl shadow-card transition-all duration-200 min-h-[240px] card";

  const variantStyles = {
    default: "border border-neutral-800",
    glass: "backdrop-blur-md border border-neutral-800/50",
    outline: "bg-transparent border border-neutral-700",
  };

  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  const hoverStyles = onClick
    ? "cursor-pointer hover:shadow-glow hover:border-primary/50"
    : "";
  const animationStyles = animate ? "animate-fade-in" : "";

  return (
    <div
      className={twMerge(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        hoverStyles,
        animationStyles,
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
