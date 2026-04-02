'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis 
      root 
      ref={lenisRef}
      options={{ 
        duration: 1.2, 
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.1,
        touchMultiplier: 1.5,
        autoRaf: false, // We use GSAP's ticker
      }}
    >
      {children}
    </ReactLenis>
  );
}
