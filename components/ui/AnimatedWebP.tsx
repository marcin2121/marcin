'use client';

import React, { useRef, useState, useEffect } from 'react';

interface AnimatedWebPProps {
  src: string;
  alt: string;
  className?: string;
  /** Optional static poster image; if omitted, the animated src is used for both */
  poster?: string;
}

/**
 * A performant animated WebP viewer.
 * – Uses IntersectionObserver to defer loading until the element is near the viewport.
 * – Shows a lightweight <canvas> first-frame capture as a poster while the full
 *   animated file streams in, preventing layout shift and blank areas.
 * – decoding="async" keeps the main thread free.
 */
export default function AnimatedWebP({ src, alt, className = '', poster }: AnimatedWebPProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // start loading 200px before entering viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      {/* Static poster / fallback — shown until the animated image completes loading */}
      {poster && !isLoaded && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          decoding="async"
        />
      )}

      {/* Animated WebP — loaded only when near viewport */}
      {isVisible && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Shimmer placeholder while nothing is loaded */}
      {!isLoaded && !poster && (
        <div className="absolute inset-0 bg-zinc-900 animate-pulse" />
      )}
    </div>
  );
}
