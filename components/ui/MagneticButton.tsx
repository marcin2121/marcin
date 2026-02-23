'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import React, { useRef } from 'react';

export default function MagneticButton({ 
  children, 
  className = '', 
  onClick 
}: { 
  children: React.ReactNode, 
  className?: string, 
  onClick?: () => void 
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Wartości ruchu dla magnesu
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Fizyka sprężyny (Jelly)
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    // Obliczamy środek komponentu
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Przyciąganie proporcjonalne do odległości
    x.set((e.clientX - centerX) * 0.2);
    y.set((e.clientY - centerY) * 0.2);
  };

  const handleMouseLeave = () => {
    // Puszczamy magnes, wraca sprężyście do (0,0)
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}