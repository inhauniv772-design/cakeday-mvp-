import { useState } from 'react';
import { Cake } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackLabel = 'CakeDay Atelier',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-zinc-100 via-stone-100 to-zinc-200 text-zinc-500 p-6 text-center ${className}`}
      >
        <Cake className="w-8 h-8 mb-2 text-[#7E2240]/70" strokeWidth={1.5} />
        <span className="font-serif text-sm text-zinc-700">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
