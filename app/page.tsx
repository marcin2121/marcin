'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Code2, Smartphone, Zap, Gauge, ArrowRight, Facebook, Linkedin, Monitor, Smartphone as PhoneIcon, X, Terminal } from 'lucide-react';
import MagicBento from '@/components/ui/MagicBento';
import Hero from '@/components/Hero';
import MagneticWrapper from '@/components/ui/MagneticWrapper';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import AnimatedWebP from '@/components/ui/AnimatedWebP';
import Link from 'next/link';
import TiltCard from '@/components/ui/TiltCard';
import BottomSheet from '@/components/ui/BottomSheet';
import Configurator from '@/components/ui/Configurator';
import FAQ from '@/components/ui/FAQ';

// Dynamically loaded to avoid blocking initial paint
const Particles = dynamic(() => import('@/components/ui/Particles'), { ssr: false });
const UrwisModel = dynamic(() => import('@/components/UrwisModel'), { ssr: false });

/** Defers non-critical work to idle browser frames with setTimeout fallback */
const rIC = (cb: IdleRequestCallback): number => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(cb);
  }
  return setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 50) as unknown as number;
};

/** Cancels a previously scheduled idle callback */
const cIC = (id: number): void => {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

type DemoConfig = {
  url: string;
  title: string;
  colorClass: string;
  bgClass: string;
};

const NAV_DOTS = [
  { id: 0, title: 'Start' },
  { id: 1, title: 'Usługi' },
  { id: 2, title: 'O mnie' },
  { id: 3, title: 'Portfolio' },
  { id: 4, title: 'Sklep Urwis' },
  { id: 5, title: 'zamowtu.pl' },
  { id: 6, title: 'Zielnik' },
  { id: 7, title: 'MDK' },
  { id: 8, title: 'Opal' },
  { id: 9, title: 'FAQ' },
  { id: 10, title: 'Kontakt' },
] as const;

/** Pushes custom events to GTM dataLayer for analytics tracking */
export const pushGTMEvent = (eventName: string, params: Record<string, unknown> = {}) => {
  if (typeof window !== 'undefined') {
    const w = window as unknown as { dataLayer: Record<string, unknown>[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: eventName, ...params });
  }
};

export default function PortfolioHome() {
  const containerRef    = useRef<HTMLDivElement>(null);
  const horizontal1Ref  = useRef<HTMLDivElement>(null);
  const horizontal2Ref  = useRef<HTMLDivElement>(null);

  const gsapRef = useRef<typeof import('gsap')['default'] | null>(null);
  const stRef = useRef<typeof import('gsap/ScrollTrigger').ScrollTrigger | null>(null);
  const ctxRef = useRef<{ revert: () => void } | null>(null);
  
  const [activeDot, setActiveDot]         = useState(0);
  const [openDemo, setOpenDemo]           = useState<DemoConfig | null>(null);
  const [viewMode, setViewMode]           = useState<'desktop' | 'mobile'>('desktop');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [formError, setFormError]         = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Lazy-load sound on first interaction to avoid Howler.js in initial bundle
  const playRef = useRef<(() => void) | null>(null);
  const playNavClick = useCallback(() => {
    if (playRef.current) { playRef.current(); return; }
    import('use-sound').then(({ default: useSoundFactory }) => {
      const audio = new Audio('/sfx/click.mp3');
      audio.volume = 0.1;
      audio.play().catch(() => {});
      playRef.current = () => { const a = new Audio('/sfx/click.mp3'); a.volume = 0.1; a.play().catch(() => {}); };
    }).catch(() => {});
  }, []);

  const rawProgress   = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, { stiffness: 80, damping: 18, mass: 0.8 });
  const lavaHeight    = useTransform(smoothProgress, [0, 1], ['0%', '100%']);
  const lavaWidth     = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    document.getElementById('scroll-container')?.scrollTo(0, 0);
    let isMounted = true;
    let idleId: number = -1;

    idleId = rIC(async () => {
      const { default: gsap }  = await import('gsap');
      const { ScrollTrigger }  = await import('gsap/ScrollTrigger');
      const { ScrollToPlugin } = await import('gsap/ScrollToPlugin');
      if (!isMounted) return; 

      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
      gsapRef.current = gsap;
      stRef.current   = ScrollTrigger;

      const ctx = gsap.context(() => {
        const scrollerNode = document.getElementById('scroll-container') || window;
        
        const mm = gsap.matchMedia();
        mm.add('(min-width: 1024px)', () => {
          gsap.to(horizontal1Ref.current, { xPercent: -50, ease: 'none', scrollTrigger: { scroller: scrollerNode, trigger: horizontal1Ref.current, start: 'top top', end: '+=100%', pin: true, scrub: true } });
          gsap.to(horizontal2Ref.current, { xPercent: -83.33, ease: 'none', scrollTrigger: { scroller: scrollerNode, trigger: horizontal2Ref.current, start: 'top top', end: '+=500%', pin: true, scrub: true } });
          
          ScrollTrigger.create({
            scroller: scrollerNode,
            start: 0,
            end: 'max',
            snap: {
              snapTo: (progress) => {
                const step = 1 / (NAV_DOTS.length - 1);
                const closestPoint = Math.round(progress / step) * step;
                if (Math.abs(progress - closestPoint) < 0.03) return closestPoint;
                return progress;
              },
              duration: { min: 0.1, max: 0.3 },
              delay: 0,
              ease: 'power1.inOut',
            }
          });
          
          ScrollTrigger.refresh();
        });

        ScrollTrigger.create({
          scroller: scrollerNode,
          start: 0,
          end: 'max',
          onUpdate: (self) => {
            rawProgress.set(self.progress); // MotionValue update — no React re-render
            setActiveDot(prev => {
              const next = Math.round(self.progress * (NAV_DOTS.length - 1));
              return prev !== next ? next : prev; // Only re-render on actual dot change
            });
          },
        });
      }, containerRef);
      ctxRef.current = ctx;
    });

    return () => {
      isMounted = false;
      if (idleId !== -1) cIC(idleId);
      ctxRef.current?.revert();
    };
  }, [rawProgress]);

  useEffect(() => {
    if (!openDemo) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenDemo(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openDemo]);

  const scrollToSection = useCallback((index: number) => {
    const gsap = gsapRef.current;
    const ScrollTrigger = stRef.current;
    if (!gsap || !ScrollTrigger) return; 
    playNavClick();
    pushGTMEvent('nawigacja_klikniecie', { sekcja_docelowa: NAV_DOTS.find((d) => d.id === index)?.title ?? 'Nieznana' });
    const scroller = document.getElementById('scroll-container');
    const targetY = (ScrollTrigger.maxScroll(scroller || window) / (NAV_DOTS.length - 1)) * index;
    gsap.to(scroller || window, { scrollTo: targetY, duration: 1.2, ease: 'power3.inOut', overwrite: 'auto' });
  }, [playNavClick]);

  const handleOpenDemo = useCallback((config: DemoConfig) => {
    if (typeof window !== 'undefined') setViewMode(window.innerWidth < 768 ? 'mobile' : 'desktop');
    pushGTMEvent('otwarcie_dema', { nazwa_projektu: config.title });
    setOpenDemo(config);
  }, []);

  const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch('https://formspree.io/f/mgolplyg', { method: 'POST', body: formData, headers: { Accept: 'application/json' } });
      if (response.ok) {
        pushGTMEvent('formularz_kontaktowy_wyslany');
        setIsFormSubmitted(true);
        setFormError('');
        form.reset();
      }
    } catch { setFormError('Błąd połączenia.'); } finally { setIsSubmitting(false); }
  }, [isSubmitting]);

  return (
    <>
      {/* Global engineering grid background */}
      <div className="fixed inset-0 z-[-1] bg-zinc-950 pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_80%_80%_at_0%_50%,#000_30%,transparent_100%)] opacity-80 pointer-events-none" />
      </div>

      <div ref={containerRef} className="relative text-zinc-50 font-sans selection:bg-orange-500 selection:text-white">
        
        {/* Sidebar navigation with lava progress bar */}
        <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-24 bg-zinc-950 border-r border-white/5 z-50 flex-col items-center justify-center">
          <div className="absolute top-10 w-full text-center text-[8px] font-black uppercase tracking-widest text-zinc-400 italic px-2 leading-tight">
            Marcin Molenda<br />Development
          </div>
          <div className="relative h-[60vh] w-4 mt-8">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-white/5 rounded-full" />
            <motion.div className="absolute left-1/2 -translate-x-1/2 top-0 w-1 bg-orange-500 rounded-full origin-top z-0" style={{ height: lavaHeight }} />
            
            {NAV_DOTS.map((dot, index) => {
              const isActive = activeDot === index;
              const isPassed = index < activeDot;
              
              let dotClasses = 'bg-zinc-900 border-white/10';
              let textClasses = 'opacity-0 group-hover:opacity-50 text-white';

              if (isActive) {
                dotClasses = 'bg-orange-500 border-orange-500 shadow-[0_0_12px_#ea580c] scale-125';
                textClasses = 'opacity-100 text-orange-400 scale-110 font-bold';
              } else if (isPassed) {
                dotClasses = 'bg-orange-900/60 border-orange-500/40';
                textClasses = 'opacity-0 group-hover:opacity-100 text-orange-300';
              }

              return (
                <button
                  key={dot.id}
                  aria-label={`Przejdź do: ${dot.title}`}
                  onClick={() => scrollToSection(dot.id)}
                  className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border cursor-pointer group hover:scale-150 transition-all duration-300 z-10 ${dotClasses}`}
                  style={{ top: `${index * (100 / (NAV_DOTS.length - 1))}%` }}
                >
                  <span className={`absolute left-8 text-[10px] uppercase font-mono tracking-widest transition-all duration-300 whitespace-nowrap ${textClasses}`}>{dot.title}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ─── Mobile Bottom Nav (Sticky CTA) ─── */}
        <nav className="flex lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl z-50 items-center justify-between px-4 py-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col gap-1.5 w-[45%]">
            <div className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest truncate">
              {NAV_DOTS[activeDot]?.title || 'Przewijaj'}
            </div>
            <div className="relative w-full h-1 flex items-center shrink-0">
              <div className="absolute left-0 right-0 h-full bg-white/10 rounded-full" />
              <motion.div className="absolute left-0 h-full bg-orange-500 rounded-full z-0" style={{ width: lavaWidth }} />
            </div>
          </div>
          <button 
            onClick={() => {
              pushGTMEvent('mobile_nav_cta_click');
              setIsBottomSheetOpen(true);
            }} 
            className="px-5 py-2.5 bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-orange-500 shadow-[0_0_15px_#ea580c40] transition-colors whitespace-nowrap active:scale-95"
          >
            Wyceń Projekt
          </button>
        </nav>

        <main className="pl-0 lg:pl-24 w-full overflow-x-hidden">
          <div ref={horizontal1Ref} className="flex flex-col lg:flex-row w-full lg:w-[200%] h-auto lg:h-screen">
            
            <Hero onNavigate={scrollToSection} />

       {/* ─── Usługi ─── */}
       <section className="w-full lg:w-1/2 h-screen flex items-center justify-center px-6 sm:px-10 lg:px-12 py-10 lg:py-0 relative overflow-hidden bg-transparent">
              <div className="flex flex-col gap-6 lg:gap-10 max-w-5xl w-full relative z-10 overflow-y-auto max-h-full scrollbar-hide py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 w-full">
                  <MagicBento className="bg-zinc-950 border border-white/5 hover:border-orange-500/40 transition-all group">
                    <div className="flex items-center justify-between mb-6">
                      <Zap className="text-orange-500 w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-mono text-[10px] text-zinc-400">sys.module_01</span>
                    </div>
                    <h3 className="font-bold text-sm lg:text-base mb-3 text-white">
                      <span className="text-orange-500 mr-2">&gt;</span>Strony WWW
                    </h3>
                    <p className="text-xs text-zinc-300 font-light leading-relaxed">
                      Architektura oparta o Next.js. Natychmiastowe ładowanie, przewaga w wynikach wyszukiwania i bezbłędny UX.
                    </p>
                  </MagicBento>

                  <MagicBento className="bg-zinc-950 border border-white/5 hover:border-orange-500/40 transition-all group">
                    <div className="flex items-center justify-between mb-6">
                      <Smartphone className="text-orange-500 w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-mono text-[10px] text-zinc-400">sys.module_02</span>
                    </div>
                    <h3 className="font-bold text-sm lg:text-base mb-3 text-white">
                      <span className="text-orange-500 mr-2">&gt;</span>Aplikacje SaaS
                    </h3>
                    <p className="text-xs text-zinc-300 font-light leading-relaxed">
                      Systemy klasy Enterprise. Relacyjne bazy danych, bezpieczna autoryzacja i skomplikowane procesy w czystym UI.
                    </p>
                  </MagicBento>

                  <MagicBento className="bg-zinc-950 border border-white/5 hover:border-orange-500/40 transition-all group">
                    <div className="flex items-center justify-between mb-6">
                      <Gauge className="text-orange-500 w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-mono text-[10px] text-zinc-400">sys.module_03</span>
                    </div>
                    <h3 className="font-bold text-sm lg:text-base mb-3 text-white">
                      <span className="text-orange-500 mr-2">&gt;</span>Optymalizacja
                    </h3>
                    <p className="text-xs text-zinc-300 font-light leading-relaxed">
                      Głęboka refaktoryzacja kodu, redukcja długu technologicznego i optymalizacja pod najwyższe standardy Core Web Vitals.
                    </p>
                  </MagicBento>

                  <MagicBento className="bg-zinc-950 border border-white/5 hover:border-orange-500/40 transition-all group">
                    <div className="flex items-center justify-between mb-6">
                      <Code2 className="text-orange-500 w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-mono text-[10px] text-zinc-400">sys.module_04</span>
                    </div>
                    <h3 className="font-bold text-sm lg:text-base mb-3 text-white">
                      <span className="text-orange-500 mr-2">&gt;</span>Narzędzia B2B
                    </h3>
                    <p className="text-xs text-zinc-300 font-light leading-relaxed">
                      Dedykowane algorytmy, inteligentne konfiguratory ofert i kalkulatory zamieniające ruch w wartościowe zapytania.
                    </p>
                  </MagicBento>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full p-6 bg-zinc-950/40 border border-white/5 rounded-2xl flex flex-col sm:flex-row items-center gap-6"
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <Terminal size={16} className="text-orange-500" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Scale_Logic:</span>
                  </div>
                  <p className="text-[11px] lg:text-xs text-zinc-400 font-light leading-relaxed text-center sm:text-left">
                    Moje wsparcie obejmuje pełne spektrum techniczne: od <span className="text-zinc-200">mikro-optymalizacji</span> (np. szybkość obrazów, poprawa LCP) po <span className="text-zinc-200">złożone systemy dedykowane</span>. Niezależnie od skali zadania, jakość kodu pozostaje bezkompromisowa.
                  </p>
                </motion.div>
              </div>
            </section>
          </div>

         {/* ─── O Mnie ─── */}
         <section className="w-screen h-screen flex flex-col items-center justify-center px-6 lg:px-10 py-20 bg-transparent relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full opacity-[0.02] pointer-events-none text-[25vw] font-black text-center leading-none select-none tracking-tighter">
              ROOT
            </div>
            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
              
              {/* 🔥 Zmiana text-zinc-500 na text-zinc-400 */}
              <div className="font-mono text-[10px] text-zinc-400 mb-8 flex items-center gap-2 tracking-[0.2em]">
                <span className="text-orange-500">~/marcin-molenda</span>
                <span className="text-zinc-400">/</span>
                <Terminal size={12} className="text-zinc-400" />
                <span className="text-zinc-400">whoami --full</span>
              </div>
              
              <h2 className="text-4xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] mb-10 tracking-tighter text-white leading-[0.9] max-w-3xl">
                <span className="text-orange-500 mr-4 font-mono font-light">&gt;</span>Kod pisany pod Twoje zasady.
              </h2>
              
              <div className="space-y-6 max-w-2xl">
                <p className="text-sm sm:text-lg lg:text-xl text-zinc-300 font-light leading-relaxed">
                  Odrzucam gotowe szablony i ociężałe kreatory. Każdy projekt traktuję jak <span className="text-white font-medium">system krytyczny</span>, projektując logikę dopasowaną do realnych wyzwań Twojego biznesu.
                </p>
                <p className="text-xs sm:text-base text-zinc-400 font-light leading-relaxed">
                  Moja rola zaczyna się tam, gdzie liczy się precyzja: od wdrażania <span className="text-orange-500">mikrousług</span>, po pełną <span className="text-orange-500">architekturę systemów SaaS</span>. Dostarczam technologię, która nie zna pojęcia kompromisu i skaluje się wraz z Twoim sukcesem.
                </p>
              </div>
              
              <div className="mt-16 flex flex-col items-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-px bg-zinc-800" />
                  <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-[0.4em]">Ready for execution</span>
                  <div className="w-8 h-px bg-zinc-800" />
                </div>
                
                <div className="flex flex-col items-center gap-3 animate-bounce">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-orange-600">Scroll.init()</span>
                  <ArrowRight className="w-4 h-4 rotate-90 text-orange-600" />
                </div>
              </div>
            </div>
          </section>

          <div ref={horizontal2Ref} className="flex flex-col lg:flex-row w-full lg:w-[600%] h-auto lg:h-screen bg-transparent">
            
            {/* Portfolio Intro */}
            <section className="w-full lg:w-1/6 min-h-[50vh] lg:h-full flex flex-col items-center justify-center bg-transparent relative overflow-hidden py-20 lg:py-0 border-y lg:border-none border-white/5">
              <div className="absolute -top-40 -left-40 w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] bg-orange-900/10 blur-[120px] rounded-full pointer-events-none" />
              <div className="font-mono text-[10px] text-orange-500 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                LIVE DEPLOYMENTS
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl xl:text-[5.5rem] font-mono tracking-tighter leading-tight mb-8 text-white">
                Case<br />Studies
              </h2>
            </section>

            {/* Sklep Urwis */}
            <section className="w-full lg:w-1/6 min-h-screen lg:h-full flex items-center justify-center bg-transparent lg:border-l border-white/5 px-6 lg:px-20 py-20 lg:py-0">
              <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
                <div className="space-y-6 text-center lg:text-left order-2 lg:order-1 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-md mx-auto lg:mx-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="font-mono text-[9px] text-zinc-300 uppercase tracking-widest">Grywalizacja / PWA</span>
                  </div>
                  <h2 className="text-4xl sm:text-6xl text-white tracking-tighter">Sklep Urwis</h2>
                  <div className="space-y-4 text-zinc-400 text-sm sm:text-base font-light leading-relaxed">
                    <p>Zaawansowana platforma PWA łącząca e-commerce z potężnym systemem grywalizacji (HTML5 Games). Centralnym punktem doświadczenia użytkownika jest inteligentny chatbot AI ("Wirtualny Urwis") oparty na modelach Gemini, który precyzyjnie nawiguje klientów po asortymencie i strefie zabawy.</p>
                    <p>W Strefie Zabawy wdrożyłem szereg autorskich mechanik: od edytora kolorowanek online, przez gry logiczno-zręcznościowe z globalnymi rankingami, po system WebAR z projekcją 3D maskotki sklepu. Całość dopełnia zaawansowana obsługa Offline Mode (Serwist), synchronizacja w tle i system powiadomień Push, tworząc unikalny ekosystem "Phygital".</p>
                  </div>
                  <div className="flex justify-center lg:justify-start pt-4">
                    <MagneticWrapper>
                      <button onClick={() => {
                        pushGTMEvent('portfolio_uruchomiono_demo', { projekt: 'Sklep Urwis' });
                        handleOpenDemo({ url: 'https://www.sklep-urwis.pl', title: 'sklep-urwis.pl', colorClass: 'text-orange-500', bgClass: 'bg-orange-800' });
                      }} className="px-8 py-4 bg-orange-800 text-white font-mono uppercase text-[10px] lg:text-xs tracking-widest rounded-lg shadow-lg hover:bg-orange-700 transition-colors flex items-center gap-3">
                        <Terminal size={14} />
                        <span>Init Demo</span>
                      </button>
                    </MagneticWrapper>
                  </div>
                </div>
                <div className="aspect-4/3 w-full bg-zinc-950/40 rounded-2xl border border-white/10 overflow-hidden relative group shadow-2xl order-1 lg:order-2">
                  <UrwisModel />
                  {/* Overlay — pointer-events-none allows dragging the 3D model underneath */}
                  <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-between p-4 pointer-events-none">
                    <button 
                      onClick={() => {
                        pushGTMEvent('portfolio_obraz_uruchomiono_demo', { projekt: 'Sklep Urwis' });
                        handleOpenDemo({ url: 'https://www.sklep-urwis.pl', title: 'sklep-urwis.pl', colorClass: 'text-orange-500', bgClass: 'bg-orange-800' });
                      }} 
                      className="text-white font-mono font-bold text-[10px] uppercase tracking-widest bg-orange-800 hover:bg-orange-700 px-4 py-2 rounded-lg shadow-2xl transition-all cursor-pointer pointer-events-auto border border-white/10 hover:scale-105 active:scale-95"
                    >
                      Uruchom Demo
                    </button>

                    <div className="self-center font-mono text-[9px] text-zinc-300 uppercase tracking-widest bg-zinc-950/70 px-4 py-2 rounded-xl backdrop-blur-md border border-white/5 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                      Przeciągnij by obrócić
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* zamowtu.pl */}
            <section className="w-full lg:w-1/6 min-h-screen lg:h-full flex items-center justify-center bg-transparent lg:border-l border-white/5 px-6 lg:px-20 py-20 lg:py-0 border-t lg:border-none">
              <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
                <div className="space-y-6 text-center lg:text-left order-2 lg:order-1 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-md mx-auto lg:mx-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="font-mono text-[9px] text-zinc-300 uppercase tracking-widest">SaaS / Fintech</span>
                  </div>
                  <h2 className="text-4xl sm:text-6xl text-white tracking-tighter">zamowtu.pl</h2>
                  <p className="text-zinc-400 text-sm sm:text-base font-light leading-relaxed">Kompleksowa platforma SaaS potęgująca sprzedaż bezpośrednią dla branży gastronomicznej. Rozwiązanie to dając pełną swobodę uwalnia restauratorów wprowadzając cyfrową niezależność – od budowy i edycji menu, przez konfigurację ustawień lokalu, po bezproblemowe podłączenie natychmiastowych płatności online. Właściciele zyskują dostęp do zaawansowanego panelu do kompleksowego śledzenia statystyk biznesowych na żywo. Dla swoich stałych bywalców otrzymują interfejs błyskawicznego zamówienia, definitywnie przenosząc przestarzały ruch telefoniczny na pełną automatyzację.</p>
                  <div className="flex justify-center lg:justify-start pt-4">
                    <MagneticWrapper>
                      <button onClick={() => {
                        pushGTMEvent('portfolio_uruchomiono_demo', { projekt: 'zamowtu.pl' });
                        handleOpenDemo({ url: 'https://zamówtu.pl/demo', title: 'zamowtu.pl', colorClass: 'text-orange-500', bgClass: 'bg-orange-800' });
                      }} className="px-8 py-4 bg-orange-800 text-white font-mono uppercase text-[10px] lg:text-xs tracking-widest rounded-lg shadow-lg hover:bg-orange-700 transition-colors flex items-center gap-3">
                        <Terminal size={14} />
                        <span>Init Demo</span>
                      </button>
                    </MagneticWrapper>
                  </div>
                </div>
                <TiltCard disableDesktop onClick={() => {
                  pushGTMEvent('portfolio_obraz_uruchomiono_demo', { projekt: 'zamowtu.pl' });
                  handleOpenDemo({ url: 'https://zamówtu.pl/demo', title: 'zamowtu.pl', colorClass: 'text-orange-500', bgClass: 'bg-orange-800' });
                }} className="aspect-4/3 w-full cursor-pointer order-1 lg:order-2 group">
                  <Image src="/zamowtu.webp" alt="Podgląd systemu zamówień Zamowtu" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-mono font-bold text-[10px] uppercase tracking-widest bg-orange-800 px-6 py-3 rounded-lg shadow-2xl">Execute</span>
                  </div>
                </TiltCard>
              </div>
            </section>

            {/* Zielnik */}
            <section className="w-full lg:w-1/6 min-h-screen lg:h-full flex items-center justify-center bg-transparent lg:border-l border-white/5 px-6 lg:px-20 py-20 lg:py-0 border-t lg:border-none">
              <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
                <div className="space-y-6 text-center lg:text-left order-2 lg:order-1 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-md mx-auto lg:mx-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="font-mono text-[9px] text-zinc-300 uppercase tracking-widest">E-commerce / GreenTech</span>
                  </div>
                  <h2 className="text-4xl sm:text-6xl text-white tracking-tighter">Zielnik</h2>
                  <p className="text-zinc-400 text-sm sm:text-base font-light leading-relaxed">Zaawansowana aplikacja terenowa PWA dla pasjonatów przyrody, łącząca Google Gemini AI z precyzyjną kartografią Mazowsza. System wykorzystuje model Gemini Flash-Lite do inteligentnego skanowania roślin oraz interaktywnego czatu botanicznego w czasie rzeczywistym. Wdrożyłem unikalną mechanikę &quot;Mgły Wojny&quot; (Fog of War) na mapie, system grywalizacji odkryć oraz pełną obsługę Offline First z synchronizacją danych przez Supabase, tworząc elitarne narzędzie do cyfrowej dokumentacji flory.</p>
                </div>
                <TiltCard disableDesktop className="aspect-4/3 w-full order-1 lg:order-2 group">
                  <AnimatedWebP src="/zielnik.webp" alt="Animacja projektu Zielnik" className="opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                </TiltCard>
              </div>
            </section>

            {/* MDK */}
            <section className="w-full lg:w-1/6 min-h-screen lg:h-full flex items-center justify-center bg-transparent lg:border-l border-white/5 px-6 lg:px-20 py-20 lg:py-0 border-t lg:border-none">
              <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
                <div className="space-y-6 text-center lg:text-left order-2 lg:order-1 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-md mx-auto lg:mx-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="font-mono text-[9px] text-zinc-300 uppercase tracking-widest">DevTools / Automatyzacja</span>
                  </div>
                  <h2 className="text-4xl sm:text-6xl text-white tracking-tighter">MDK</h2>
                  <p className="text-zinc-400 text-sm sm:text-base font-light leading-relaxed">Molenda Development Kit to mój autorski system optymalizacji produkcji oprogramowania. Zamiast pisać każdą aplikację od zera – mechanizmy MDK automatycznie generują najwyższej jakości architekturę bazodanową, systemy zabezpieczeń ról (RBAC) oraz fundamenty aplikacji, przyspieszając proces wdrożenia komercyjnego (time-to-market) o kilkadziesiąt procent względem klasycznych agencji IT. Dzięki temu budżet projektu inwestowany jest wyłącznie w to, co realnie napędza Twój biznes.</p>
                </div>
                <TiltCard disableDesktop className="aspect-4/3 w-full order-1 lg:order-2 group">
                  <AnimatedWebP src="/MDK.webp" alt="Animacja projektu MDK" className="opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                </TiltCard>
              </div>
            </section>

            {/* Opal */}
            <section className="w-full lg:w-1/6 min-h-screen lg:h-full flex items-center justify-center bg-transparent lg:border-l border-white/5 px-6 lg:px-20 py-20 lg:py-0 border-t lg:border-none">
              <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
                <div className="space-y-6 text-center lg:text-left order-2 lg:order-1 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-md mx-auto lg:mx-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="font-mono text-[9px] text-zinc-300 uppercase tracking-widest">BI / Machine Learning</span>
                  </div>
                  <h2 className="text-4xl sm:text-6xl text-white tracking-tighter">Opal</h2>
                  <p className="text-zinc-400 text-sm sm:text-base font-light leading-relaxed">Zaawansowany panel analityczny Business Intelligence (BI) wykorzystujący nienadzorowane uczenie maszynowe (K-Means Clustering) do segmentacji rzeczywistych danych rynkowych. System, zbudowany w 100% w architekturze Node.js, eliminuje potrzebę zewnętrznych mikroserwisów Python, oferując błyskawiczną klasyfikację profili. Wdrożyłem interaktywny Cluster Explorer z diagnostyką Metody Łokcia (Elbow Method), wielowymiarowe wykresy profilowe oraz symulator &quot;What-If&quot;, dostarczając precyzyjnych wglądów biznesowych w czasie rzeczywistym.</p>
                </div>
                <TiltCard disableDesktop className="aspect-4/3 w-full order-1 lg:order-2 group">
                  <AnimatedWebP src="/opal.webp" alt="Animacja projektu Opal" className="opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                </TiltCard>
              </div>
            </section>
          </div>

          <FAQ />

          {/* SEKCJA 7: Kontakt */}
          <section className="w-full h-screen flex flex-col items-center justify-center px-6 sm:px-10 lg:px-20 bg-transparent border-t border-white/5 relative overflow-hidden py-10 lg:py-0">
            <Particles color="#ea580c" />
            <div className="max-w-5xl w-full bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 lg:p-16 flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 relative z-10 backdrop-blur-2xl shadow-2xl">
              <div className="text-center lg:text-left flex flex-col justify-center">
                <div className="flex items-center justify-center lg:justify-start gap-3 font-mono text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest mb-8">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-50"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  <span>system.status: awaiting_input</span>
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-6 text-white">Czas na konkret.</h2>
                <p className="text-zinc-400 mb-10 font-light leading-relaxed text-sm sm:text-base max-w-md mx-auto lg:mx-0">
                Ty wyznaczasz cel biznesowy, ja projektuję architekturę, która go realizuje. Bez technologicznych kompromisów.
                </p>
                <a href="mailto:kontakt@molendadevelopment.pl" className="text-sm sm:text-base font-mono text-zinc-300 border-b border-white/10 pb-1 hover:text-white hover:border-orange-500 transition-colors w-fit mx-auto lg:mx-0">
                  kontakt@molendadevelopment.pl
                </a>
                <div className="flex justify-center lg:justify-start gap-4 mt-12">
                  <a href="https://www.facebook.com/profile.php?id=61564367727437" target="_blank" rel="noopener noreferrer" aria-label="Profil Marcin Molenda Development na Facebooku" onClick={() => pushGTMEvent('klikniecie_socialF', { platforma: 'Facebook' })} className="p-3 bg-zinc-900 rounded-xl border border-white/5 hover:border-zinc-500 transition-all group">
                    <Facebook className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                  </a>
                  <a href="https://www.linkedin.com/in/marcin-molenda-447251289/" target="_blank" rel="noopener noreferrer" aria-label="Profil Marcin Molenda na LinkedIn" onClick={() => pushGTMEvent('klikniecie_socialL', { platforma: 'LinkedIn' })} className="p-3 bg-zinc-900 rounded-xl border border-white/5 hover:border-zinc-500 transition-all group">
                    <Linkedin className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                  </a>
                </div>
              </div>

              <div className="relative bg-zinc-950 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
                <div className="absolute top-4 left-4 flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" /><div className="w-2.5 h-2.5 rounded-full bg-zinc-800" /><div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                </div>
                <form onSubmit={handleFormSubmit} className="space-y-4 mt-6">
                  {isFormSubmitted ? (
                    <div className="w-full h-48 flex flex-col items-center justify-center text-center">
                      <div className="font-mono text-green-500/70 text-xs mb-3">~ % execution_success</div>
                      <p className="text-white font-bold mb-1">Specyfikacja przyjęta.</p>
                      <p className="text-xs text-zinc-500 font-light">Odezwę się najszybciej, jak to możliwe.</p>
                    </div>
                  ) : (
                    <>
                      <input type="text" name="name" placeholder="Imię / Nazwa Firmy" aria-label="Twoje Imię" required disabled={isSubmitting} className="w-full p-4 bg-zinc-900 border border-white/5 rounded-xl outline-none focus:border-white/20 text-zinc-200 text-sm font-mono transition-colors placeholder:text-zinc-600" />
                      <input type="email" name="email" placeholder="Adres e-mail" aria-label="Twój Email" required disabled={isSubmitting} className="w-full p-4 bg-zinc-900 border border-white/5 rounded-xl outline-none focus:border-white/20 text-zinc-200 text-sm font-mono transition-colors placeholder:text-zinc-600" />
                      <textarea name="msg" placeholder="Mały problem czy wielka wizja? Zostaw szczegóły tutaj..." aria-label="Wiadomość" rows={4} required disabled={isSubmitting} className="w-full p-4 bg-zinc-900 border border-white/5 rounded-xl outline-none focus:border-white/20 text-zinc-200 text-sm font-mono resize-none transition-colors placeholder:text-zinc-600" />
                      {formError && <p className="text-red-500/80 font-mono text-[10px] px-2">error: {formError}</p>}
                      <MagneticWrapper className="w-full pt-2">
                        <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl shadow-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                          {isSubmitting ? 'Przetwarzanie...' : 'Działamy'}
                          {!isSubmitting && <ArrowRight size={14} />}
                        </button>
                      </MagneticWrapper>
                    </>
                  )}
                </form>
              </div>
            </div>
            <div className="mt-12 lg:absolute lg:bottom-6 lg:mt-0 text-[9px] lg:text-[10px] text-zinc-400 font-mono uppercase tracking-[0.2em] text-center flex flex-col items-center gap-2">
              <span>&copy; {new Date().getFullYear()} Marcin Molenda // molendadevelopment.pl</span>
              <Link href="/polityka-prywatnosci" className="hover:text-orange-500 transition-colors underline-offset-2 hover:underline">Polityka Prywatności</Link>
            </div>
          </section>

        </main>
      </div>

      <BottomSheet isOpen={isBottomSheetOpen} onClose={() => setIsBottomSheetOpen(false)}>
        <Configurator />
      </BottomSheet>

      <AnimatePresence>
        {openDemo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-999 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 lg:p-12">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full h-full bg-zinc-950 rounded-3xl lg:rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl">
              <div className="p-3 lg:p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900 shrink-0">
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="flex gap-1.5 lg:gap-2 pl-2">
                    <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex bg-black p-1 rounded-xl gap-1">
                    <button onClick={() => setViewMode('desktop')} className={`px-3 lg:px-4 py-2 rounded-lg text-[9px] lg:text-[10px] font-mono uppercase flex items-center gap-1.5 lg:gap-2 transition-all ${viewMode === 'desktop' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
                      <Monitor size={14} className="hidden sm:block" /> Desktop
                    </button>
                    <button onClick={() => setViewMode('mobile')} className={`px-3 lg:px-4 py-2 rounded-lg text-[9px] lg:text-[10px] font-mono uppercase flex items-center gap-1.5 lg:gap-2 transition-all ${viewMode === 'mobile' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
                      <PhoneIcon size={14} className="hidden sm:block" /> Mobile
                    </button>
                  </div>
                </div>
                <div className="text-[9px] lg:text-[10px] text-zinc-400 font-mono uppercase tracking-widest hidden md:block truncate max-w-[200px]">Preview // {openDemo.title}</div>
                <button onClick={() => setOpenDemo(null)} aria-label="Zamknij" className="p-2 lg:p-3 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white cursor-pointer"><X size={20} /></button>
              </div>
              <div className="flex-1 bg-black flex justify-center items-center overflow-hidden p-2 lg:p-4">
                <motion.div animate={{ width: viewMode === 'desktop' ? '100%' : '375px', height: viewMode === 'desktop' ? '100%' : '812px', borderRadius: viewMode === 'desktop' ? '0px' : '36px' }} transition={{ type: 'spring', stiffness: 100, damping: 20 }} className={`bg-zinc-950 shadow-2xl overflow-hidden relative flex flex-col ${viewMode === 'mobile' ? 'border-[6px] lg:border-8 border-zinc-900' : ''}`}>
                  <div className="flex-1 w-full relative"><iframe src={openDemo.url} title={`Podgląd projektu: ${openDemo.title}`} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" className="absolute inset-0 w-full h-full border-none pointer-events-auto bg-white" /></div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}