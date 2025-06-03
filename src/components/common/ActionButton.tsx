import React, { ButtonHTMLAttributes } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: any;
  label: string;
  primary?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  primary = false,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`flex items-center justify-center px-4 sm:px-5 py-3 rounded-lg transition-all duration-200 ${
        primary
          ? "bg-primary hover:bg-primary-dark text-white"
          : "bg-[rgb(var(--button-light))] text-[rgb(var(--text))]"
      } ${className}`}
      {...props}
    >
      <Icon size={18} className="mr-2" />
      <span>{label}</span>
    </button>
  );
};

export default ActionButton;
