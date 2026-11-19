import React, { useState } from 'react';
import { CakeSlice } from 'lucide-react';
import { cn } from '../utils/cn';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackTitle?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className,
  containerClassName,
  fallbackTitle = 'CakeDay',
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-br from-[#E9DFD0] to-[#FAF8F3] border border-[#E9DFD0] text-[#493B32] p-8 text-center',
          containerClassName
        )}
        role="img"
        aria-label={alt}
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFFFF] text-[#B58C6A]">
          <CakeSlice className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium text-[#6E5C50]">{fallbackTitle}</span>
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-3xl bg-[#E9DFD0]/50', containerClassName)}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={cn('h-full w-full object-cover', className)}
      />
    </div>
  );
};
