import React from 'react';
import { cn } from '../utils/cn';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  helperText?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  id,
  error,
  helperText,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-[#493B32]">
        {label}
      </label>
      <input
        id={id}
        className={cn(
          'min-h-[48px] w-full rounded-2xl border bg-[#FAF8F3] px-4 py-3 text-base text-[#493B32] placeholder:text-[#6E5C50]/65 transition-colors duration-150 focus:bg-[#FFFFFF] focus:outline-none',
          error
            ? 'border-[#9F4A3B] focus:border-[#9F4A3B]'
            : 'border-[#E9DFD0] focus:border-[#B58C6A]',
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-[#9F4A3B]">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-xs text-[#6E5C50]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
