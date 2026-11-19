import React from 'react';
import { cn } from '../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  tone?: 'white' | 'beige';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  tone = 'white',
}) => {
  return (
    <div
      className={cn(
        'rounded-3xl p-6 sm:p-8 transition-colors duration-150',
        tone === 'white'
          ? 'bg-[#FFFFFF] border border-[#E9DFD0]'
          : 'bg-[#E9DFD0]/55 border border-[#E9DFD0]',
        className
      )}
    >
      {children}
    </div>
  );
};
