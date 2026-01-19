"use client";
import { ReactNode } from "react";

interface ButtonProps {
  label: string;
  onClickButton: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
}
const Button: React.FC<ButtonProps> = ({
  label,
  onClickButton,
  isLoading = false,
  disabled = false,
  icon,
  className = "",
}) => {
  const handleClick = () => {
    if (isLoading || disabled) return;
    onClickButton();
  };
  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`flex items-center gap-2 bg-blue-500 rounded-xl 
         text-white hover:bg-blue-700 transition-colors 
        justify-center border border-solid ${className} `}
    >
      {icon}
      {label}
    </button>
  );
};
export default Button;
