'use client';

import React, { useRef, useState } from 'react';

export default function MagicBento({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    // Obliczamy pozycję kursora wewnątrz karty
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-4xl bg-zinc-900/50 border border-white/10 transition-colors duration-500 ${className}`}
    >
      {/* Poświata śledząca kursor */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(249,115,22,0.15), transparent 40%)`,
        }}
      />
      {/* Zawartość właściwa */}
      <div className="relative z-10 p-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}