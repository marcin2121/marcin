'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, Terminal } from 'lucide-react';
import dynamic from 'next/dynamic';
import MagneticWrapper from '@/components/ui/MagneticWrapper';
import { pushGTMEvent } from '@/app/page';

// Lazy-loaded for performance — excluded from initial bundle
const Particles = dynamic(() => import('@/components/ui/Particles'), { ssr: false });

interface HeroProps {
  onNavigate: (index: number) => void;
}

const TECH_STACK = [
  { name: 'Next.js 16', color: '#ffffff' },
  { name: 'React 19', color: '#61dafb' },
  { name: 'Supabase', color: '#3ecf8e' },
  { name: 'Tailwind CSS', color: '#38bdf8' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'GSAP', color: '#88ce02' },
];

export default function Hero({ onNavigate }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [orbitRadius, setOrbitRadius] = useState(160);
  const [isMounted, setIsMounted] = useState(false);

  // Cursor coordinates for parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotation = useMotionValue(0);

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth > 1536) setOrbitRadius(240);
        else if (window.innerWidth > 1024) setOrbitRadius(200);
        else setOrbitRadius(140);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    mouseX.set(((e.clientX - left) / width - 0.5) * 2);
    mouseY.set(((e.clientY - top) / height - 0.5) * 2);
  };

  useAnimationFrame((_, delta) => {
    rotation.set(rotation.get() + (delta * 0.04) + (mouseX.get() * 0.4));
  });

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="w-full lg:w-1/2 min-h-screen lg:h-full flex flex-col items-start justify-center relative overflow-hidden px-8 sm:px-16 lg:px-20 py-20 lg:py-0 text-left"
    >
      <Particles color="#ea580c" />
      
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] lg:w-[800px] lg:h-[800px] bg-linear-to-tr from-orange-600/20 via-zinc-900 to-transparent blur-[120px] rounded-full pointer-events-none will-change-transform"
      />

      <div className="absolute top-1/2 -translate-y-1/2 left-[45%] sm:left-[55%] lg:left-[55%] xl:left-[60%] w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] pointer-events-none hidden md:flex items-center justify-center opacity-30 lg:opacity-100 z-0 transition-all duration-700">
        {isMounted && TECH_STACK.map((tech, i) => (
          <TechNode 
            key={tech.name} 
            tech={tech} 
            baseAngle={(i / TECH_STACK.length) * 360} 
            rotation={rotation}
            mouseX={mouseX}
            mouseY={mouseY}
            radius={orbitRadius}
          />
        ))}
        <div className="absolute w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_30px_5px_#ea580c] animate-pulse" />
        <div className="absolute w-[80%] h-[80%] border border-white/5 rounded-full" />
        <div className="absolute w-full h-full border border-white/2 rounded-full border-dashed animate-[spin_60s_linear_infinite]" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-start max-w-2xl">
        
        <div className="flex items-center gap-3 font-mono text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest mb-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-50"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <span>system.status: high_performance_ready</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-[5.5rem] font-mono tracking-tighter leading-tight mb-8 text-white">
          <motion.div 
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0 0 0)" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0 }}
            className="overflow-hidden whitespace-nowrap"
          >
            &gt; Precyzja.
          </motion.div>

          <motion.div 
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0 0 0)" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
            className="overflow-hidden whitespace-nowrap text-transparent bg-clip-text bg-linear-to-r from-zinc-400 via-zinc-100 to-white"
          >
            &gt; Wydajność.
          </motion.div>

          <motion.div 
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0 0 0)" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }}
            className="overflow-hidden whitespace-nowrap flex items-center"
          >
            &gt; Rezultat.
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="ml-2 w-[0.4em] h-[1em] bg-orange-500 inline-block"
            />
          </motion.div>
        </h1>

        {/* LCP element — rendered immediately, no animation delay */}
          <p className="font-mono text-zinc-300 text-sm sm:text-base lg:text-lg font-light leading-relaxed mb-12 max-w-lg">
            Projektuję ekosystemy cyfrowe dla web i mobile. Odrzucam kompromisy i szablony, dostarczając kod, który <strong className="text-white font-medium">ładuje się natychmiast i pracuje na Twój wynik biznesowy.</strong>
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 1.2 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full mb-16"
          >
            <MagneticWrapper>
              <button
                onClick={() => {
                  pushGTMEvent('strona_glowna_eksploruj_oferte_klikniecie');
                  onNavigate(1);
                }}
                className="group relative px-8 py-4 bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-[0.15em] text-[10px] lg:text-xs rounded-xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.05)]"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Eksploruj ofertę
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </MagneticWrapper>

            <MagneticWrapper>
              <button
                onClick={() => {
                  pushGTMEvent('strona_glowna_inicjuj_kontakt_klikniecie');
                  onNavigate(10);
                }}
                className="px-8 py-4 bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-500 font-black uppercase tracking-[0.15em] text-[10px] lg:text-xs rounded-xl transition-colors flex items-center gap-3"
              >
                <Terminal size={14} className="text-orange-500" />
                Inicjuj kontakt
              </button>
            </MagneticWrapper>
          </motion.div>
      </div>
    </section>
  );
}

function TechNode({ tech, baseAngle, rotation, mouseX, mouseY, radius }: {
  tech: { name: string, color: string },
  baseAngle: number,
  rotation: import('framer-motion').MotionValue<number>,
  mouseX: import('framer-motion').MotionValue<number>,
  mouseY: import('framer-motion').MotionValue<number>,
  radius: number
}) {
  const x = useTransform(() => {
    const angle = (baseAngle + rotation.get()) * (Math.PI / 180);
    return Math.cos(angle) * radius + (mouseX.get() * 20);
  });

  const y = useTransform(() => {
    const angle = (baseAngle + rotation.get()) * (Math.PI / 180);
    return Math.sin(angle) * (radius * 0.4) + (mouseY.get() * 20);
  });

  const scale = useTransform(() => {
    const angle = (baseAngle + rotation.get()) % 360;
    return angle > 0 && angle < 180 ? 1.05 : 0.85;
  });

  const opacity = useTransform(() => {
    const angle = (baseAngle + rotation.get()) % 360;
    return angle > 0 && angle < 180 ? 1 : 0.2;
  });

  return (
    <motion.div
      style={{ x, y, scale, opacity }}
      className="absolute flex items-center gap-4 px-6 py-3 bg-zinc-900/60 backdrop-blur-sm border border-white/5 rounded-full"
    >
      <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: tech.color, color: tech.color }} />
      <span className="text-[11px] font-mono text-zinc-300 tracking-widest uppercase whitespace-nowrap">
        {tech.name}
      </span>
    </motion.div>
  );
}