import React from 'react';
import { cn } from '../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#8F6849] text-[#FFFFFF] hover:bg-[#7A573B] active:scale-[0.99] shadow-sm shadow-[#493B32]/10',
  secondary:
    'bg-[#E9DFD0] text-[#493B32] hover:bg-[#DFD2BF] active:scale-[0.99]',
  outline:
    'bg-[#FFFFFF] text-[#493B32] border border-[#B58C6A]/45 hover:bg-[#FAF8F3] hover:border-[#B58C6A] active:scale-[0.99]',
  ghost:
    'bg-transparent text-[#493B32] hover:bg-[#E9DFD0]/55 active:scale-[0.99]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'min-h-[44px] px-5 py-2.5 text-sm',
  lg: 'min-h-[48px] px-7 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-medium whitespace-nowrap shrink-0 transition-all duration-150 ease-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
