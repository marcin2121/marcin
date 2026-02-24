'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Code2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import MagneticWrapper from '@/components/ui/MagneticWrapper';

// 🔥 OPTYMALIZACJA 1: Leniwe ładowanie cząsteczek (odciąża start strony)
const Particles = dynamic(() => import('@/components/ui/Particles'), { ssr: false });

interface HeroProps {
  onNavigate: (index: number) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <section className="w-full lg:w-1/2 min-h-screen lg:h-full flex flex-col items-center justify-center relative overflow-hidden px-6 sm:px-12 lg:px-20 py-20 lg:py-0 text-center">
      {/* Tło */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-60" />
      
      <Particles color="#ea580c" />
      
      {/* 🔥 OPTYMALIZACJA 2: will-change-transform zapobiega klatkowaniu bluru */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] lg:w-[1000px] lg:h-[1000px] bg-gradient-to-tr from-orange-600/10 via-red-600/5 to-transparent blur-[100px] lg:blur-[140px] rounded-full pointer-events-none will-change-transform"
      />

      {/* Floating badge — Lighthouse 100 */}
      <motion.div
        animate={{ y: [-15, 15, -15], rotate: [-3, 3, -3] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute hidden xl:flex top-28 left-4 p-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] items-center gap-4 z-0 group hover:border-green-500/50 transition-colors"
      >
        <div className="relative w-12 h-12 rounded-full flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="24" cy="24" r="22" className="stroke-white/10" strokeWidth="4" fill="none" />
            <motion.circle
              initial={{ strokeDashoffset: 138 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 2, delay: 1 }}
              cx="24"
              cy="24"
              r="22"
              className="stroke-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"
              strokeWidth="4"
              fill="none"
              strokeDasharray="138"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-green-500 font-black text-sm relative z-10">100</span>
        </div>
        <div className="text-left">
          <p className="text-white font-bold text-sm">Performance</p>
          <p className="text-zinc-400 text-[10px] uppercase tracking-widest">Lighthouse V10</p>
        </div>
      </motion.div>

      {/* Floating badge — API 12ms */}
      <motion.div
        animate={{ y: [15, -15, 15], rotate: [2, -2, 2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute hidden xl:flex top-40 right-10 p-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] items-center gap-3 z-0"
      >
        <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
          <Zap size={20} className="drop-shadow-[0_0_8px_rgba(234,88,12,0.8)]" />
        </div>
        <div className="text-left">
          <p className="text-white font-black text-lg leading-none">
            12<span className="text-xs text-zinc-500">ms</span>
          </p>
          <p className="text-zinc-400 text-[10px] uppercase tracking-widest mt-0.5">API Response</p>
        </div>
      </motion.div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
        
        {/* 🔥 OPTYMALIZACJA LCP: H1 jest całkowicie poza Framer Motion! Pojawi się natychmiast po pobraniu HTML */}
        <h1 className="text-7xl sm:text-8xl lg:text-[9rem] font-black tracking-tighter leading-[0.85] mb-4 mx-auto text-white drop-shadow-2xl">
          Marcin<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-500 animate-gradient-x bg-[length:200%_auto]">
            Molenda
          </span>
        </h1>

        {/* Cała reszta wjeżdża z delikatną animacją pod H1 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="flex flex-col items-center w-full"
        >
          <div className="text-sm sm:text-lg lg:text-xl font-black uppercase tracking-[0.4em] text-zinc-500 italic mb-8 lg:mb-10">
            molendadevelopment.pl
          </div>

          <p className="text-zinc-400 text-sm sm:text-base lg:text-xl font-light leading-relaxed mb-12 max-w-2xl mx-auto">
            <strong className="text-white font-bold">Twórca nowoczesnych stron internetowych i aplikacji webowych.</strong><br /><br />
            Dostarczam technologię dopasowaną do potrzeb Twojej firmy. Projektuję wydajne rozwiązania od zera, bez ociężałych szablonów.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto mb-16 relative z-20">
            <MagneticWrapper>
              <button
                onClick={() => onNavigate(6)}
                className="w-[280px] sm:w-auto px-10 py-5 bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-[0.15em] text-[10px] lg:text-xs rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-colors flex items-center justify-center gap-4 group cursor-pointer"
              >
                Rozpocznij współpracę
                <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight size={14} className="text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </MagneticWrapper>

            <MagneticWrapper>
              <button
                onClick={() => onNavigate(3)}
                className="w-[280px] sm:w-auto px-10 py-5 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-white font-black uppercase tracking-[0.15em] text-[10px] lg:text-xs rounded-2xl transition-colors flex items-center justify-center gap-3 backdrop-blur-xl group cursor-pointer"
              >
                Sprawdź realizacje
                <Code2 size={18} className="text-orange-500 group-hover:rotate-12 transition-transform duration-300" />
              </button>
            </MagneticWrapper>
          </div>

          {/* Tech stack */}
          <div className="flex flex-col items-center opacity-90 mt-auto">
            <span className="text-[8px] lg:text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-5">
              Nowoczesne technologie
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-3">
              {['Next.js 15', 'React 19', 'TypeScript', 'Tailwind', 'Supabase'].map((tech) => (
                <motion.span
                  key={tech}
                  whileHover={{ scale: 1.05, y: -2, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  className="text-[10px] sm:text-xs font-bold text-zinc-300 border border-white/10 px-5 py-2.5 rounded-xl bg-black/40 backdrop-blur-xl shadow-lg transition-colors cursor-default"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}