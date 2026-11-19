import React from 'react';
import { cn } from '../utils/cn';

interface BrandLogoProps {
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  onClick,
  className,
  size = 'md',
}) => {
  const isSmall = size === 'sm';

  const content = (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-xl bg-[#E9DFD0] text-[#493B32] transition-colors',
          isSmall ? 'h-8 w-8' : 'h-9 w-9'
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={isSmall ? 'h-4 w-4' : 'h-5 w-5'}
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3c.9 1.1 1.4 2 1.4 2.8a1.4 1.4 0 1 1-2.8 0C10.6 5 11.1 4.1 12 3Z" fill="#B58C6A" stroke="#B58C6A" />
          <path d="M12 7.5v2.5" />
          <rect x="4.5" y="10" width="15" height="9.5" rx="3" fill="#FFFFFF" />
          <path d="M4.5 13.8c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 1.5-.3 1.5-.3" stroke="#B58C6A" />
          <path d="M3 19.5h18" />
        </svg>
      </span>
      <span
        className={cn(
          'font-[var(--font-display)] font-semibold tracking-tight text-[#493B32]',
          isSmall ? 'text-lg' : 'text-xl'
        )}
      >
        CakeDay
      </span>
    </span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex items-center min-h-[44px] rounded-xl px-1 -ml-1 text-left transition-opacity hover:opacity-85 cursor-pointer',
          className
        )}
        aria-label="CakeDay 홈으로 이동"
      >
        {content}
      </button>
    );
  }

  return <span className={cn('inline-flex items-center', className)}>{content}</span>;
};
