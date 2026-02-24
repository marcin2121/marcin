'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
// ✅ GSAP usunięty ze statycznych importów — ładuje się leniwie
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Code2, Smartphone, Zap, Gauge, Rocket, ArrowRight, Facebook, Linkedin, Monitor, Smartphone as PhoneIcon, X } from 'lucide-react';
import useSound from 'use-sound';
import MagicBento from '@/components/ui/MagicBento';
import Particles from '@/components/ui/Particles';
import Hero from '@/components/Hero';
import MagneticWrapper from '@/components/ui/MagneticWrapper';

// ✅ Funkcje zamiast wyrażeń — TypeScript nie wnioskuje 'never'
const rIC = (cb: IdleRequestCallback): number => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(cb);
  }
  return setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 50) as unknown as number;
};

const cIC = (id: number): void => {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id); // ← bez 'window.' — globalny clearTimeout zawsze istnieje
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
  { id: 6, title: 'Kontakt' },
] as const;

// Bezpieczne zdarzenia GTM
const pushGTMEvent = (eventName: string, params: Record<string, unknown> = {}) => {
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

  // ✅ Refy na instancje GSAP — potrzebne po przejściu na dynamic import
  const gsapRef = useRef<Awaited<typeof import('gsap')>['default'] | null>(null);
  const stRef   = useRef<Awaited<typeof import('gsap/ScrollTrigger')>['ScrollTrigger'] | null>(null);
  const ctxRef  = useRef<{ revert: () => void } | null>(null);

  const [activeDot, setActiveDot]         = useState(0);
  const [openDemo, setOpenDemo]           = useState<DemoConfig | null>(null);
  const [viewMode, setViewMode]           = useState<'desktop' | 'mobile'>('desktop');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [formError, setFormError]         = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const [playNavClick] = useSound('/sfx/click.mp3', { volume: 0.1 });

  // Fizyka paska bocznego
  const rawProgress   = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, { stiffness: 80, damping: 18, mass: 0.8 });
  const lavaHeight    = useTransform(smoothProgress, [0, 1], ['0%', '100%']);
  const lavaWidth     = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  // ✅ GSAP ładuje się AFTER first paint — Speed Index i LCP nie są blokowane
  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true; // ← flaga

    let idleId: number;

    idleId = rIC(async () => {
      const { default: gsap }  = await import('gsap');
      const { ScrollTrigger }  = await import('gsap/ScrollTrigger');
      const { ScrollToPlugin } = await import('gsap/ScrollToPlugin');
      if (!isMounted) return; // ← komponent już odmontowany podczas importu

      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
      ScrollTrigger.config({ limitCallbacks: true, syncInterval: 40 });

      if (window.history && 'scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }

      // Zapisz instancje do refów — scrollToSection będzie z nich korzystać
      gsapRef.current = gsap;
      stRef.current   = ScrollTrigger;

      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add('(min-width: 1024px)', () => {
          gsap.to(horizontal1Ref.current, {
            xPercent: -50,
            ease: 'none',
            scrollTrigger: {
              trigger: horizontal1Ref.current,
              start: 'top top',
              end: '+=100%',
              pin: true,
              scrub: true,
            },
          });

          gsap.to(horizontal2Ref.current, {
            xPercent: -66.66,
            ease: 'none',
            scrollTrigger: {
              trigger: horizontal2Ref.current,
              start: 'top top',
              end: '+=200%',
              pin: true,
              scrub: true,
            },
          });
        });

        // 🔥 LOGIKA PRZYCIĄGANIA TYLKO W POBLIŻU (Proximity Snapping) 🔥
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          snap: {
            snapTo: (progress) => {
              const step = 1 / (NAV_DOTS.length - 1);
              const closestPoint = Math.round(progress / step) * step;
              if (Math.abs(progress - closestPoint) < 0.04) return closestPoint;
              return progress;
            },
            duration: { min: 0.1, max: 0.3 },
            delay: 0.1,
            ease: 'power1.out',
          },
          onUpdate: (self) => {
            rawProgress.set(self.progress);
            setActiveDot(Math.round(self.progress * (NAV_DOTS.length - 1)));
          },
        });
      }, containerRef);

      ctxRef.current = ctx;
    });

    return () => {
      isMounted = false; // ← zatrzymaj async callback
      cIC(idleId);
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, [rawProgress]);

  // Escape zamyka modal demo
  useEffect(() => {
    if (!openDemo) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenDemo(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openDemo]);

  // ✅ scrollToSection korzysta z gsapRef/stRef zamiast module-scope
  const scrollToSection = useCallback(
    (index: number) => {
      const gsap          = gsapRef.current;
      const ScrollTrigger = stRef.current;
      if (!gsap || !ScrollTrigger) return; // GSAP jeszcze się ładuje

      playNavClick();
      pushGTMEvent('nawigacja_klikniecie', {
        sekcja_docelowa: NAV_DOTS.find((d) => d.id === index)?.title ?? 'Nieznana',
      });

      const totalScroll = ScrollTrigger.maxScroll(window);
      const targetY     = (totalScroll / (NAV_DOTS.length - 1)) * index;

      gsap.to(window, {
        scrollTo: targetY,
        duration: 1.2,
        ease: 'power3.inOut',
        overwrite: 'auto',
      });
    },
    [playNavClick]
  );

  const handleOpenDemo = useCallback((config: DemoConfig) => {
    if (typeof window !== 'undefined') {
      setViewMode(window.innerWidth < 768 ? 'mobile' : 'desktop');
    }
    pushGTMEvent('otwarcie_dema', { nazwa_projektu: config.title });
    setOpenDemo(config);
  }, []);

  // Form Submit Handler
  const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError('');
    setIsSubmitting(true);

    const form     = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/mgolplyg', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        pushGTMEvent('wyslanie_formularza_kontakt');
        setIsFormSubmitted(true);
        form.reset();
      } else {
        setFormError('Wystąpił błąd po stronie serwera. Spróbuj ponownie później.');
      }
    } catch {
      setFormError('Brak połączenia. Sprawdź swoje połączenie z internetem.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  return (
    <div ref={containerRef} className="relative bg-zinc-950 text-zinc-50 font-sans selection:bg-orange-500 selection:text-white">
      {/* ─── Desktop Sidebar Nav ─── */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-24 bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 z-50 flex-col items-center justify-center">
        <div className="absolute top-10 w-full text-center text-[8px] font-black uppercase tracking-widest text-zinc-600 italic px-2 leading-tight">
          Marcin Molenda
          <br />
          Development
        </div>
        <div className="relative h-[60vh] w-4 mt-8">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-white/5 rounded-full" />
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-0 w-1 bg-orange-500 rounded-full origin-top z-0"
            style={{ height: lavaHeight }}
          />

          {NAV_DOTS.map((dot, index) => {
            const isActive = activeDot === index;
            const isPassed = index < activeDot;
            let dotClasses = 'bg-zinc-900 border-white/10';
            let textClasses = 'opacity-0 group-hover:opacity-50 text-white';

            if (isActive) {
              dotClasses = 'bg-orange-500 border-orange-500 shadow-[0_0_12px_#ea580c] scale-125';
              textClasses = 'opacity-100 text-orange-500 scale-110 font-black';
            } else if (isPassed) {
              dotClasses = 'bg-orange-900/80 border-orange-500/50 shadow-[0_0_5px_rgba(234,88,12,0.3)]';
              textClasses = 'opacity-0 group-hover:opacity-80 text-orange-300';
            }

            return (
              <div
                key={dot.id}
                role="button"
                aria-label={`Przejdź do sekcji: ${dot.title}`}
                tabIndex={0}
                onClick={() => scrollToSection(dot.id)}
                onKeyDown={(e) => e.key === 'Enter' && scrollToSection(dot.id)}
                className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border cursor-pointer group hover:scale-150 transition-all duration-300 z-10 ${dotClasses}`}
                style={{ top: `${index * (100 / (NAV_DOTS.length - 1))}%` }}
              >
                <span
                  className={`absolute left-8 text-[10px] uppercase font-bold tracking-widest transition-all duration-300 whitespace-nowrap ${textClasses}`}
                >
                  {dot.title}
                </span>
              </div>
            );
          })}
        </div>
      </nav>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="flex lg:hidden fixed bottom-0 left-0 right-0 h-[70px] bg-zinc-950/90 backdrop-blur-xl border-t border-white/5 z-50 items-center justify-center px-8 pb-2">
        <div className="relative w-full h-1.5 flex items-center">
          <div className="absolute left-0 right-0 h-full bg-white/5 rounded-full" />
          <motion.div
            className="absolute left-0 h-full bg-orange-500 rounded-full z-0"
            style={{ width: lavaWidth }}
          />
          <div className="absolute left-0 right-0 flex justify-between items-center w-full">
            {NAV_DOTS.map((dot, index) => {
              const isActive = activeDot === index;
              const isPassed = index < activeDot;
              return (
                <div
                  key={dot.id}
                  role="button"
                  aria-label={`Przejdź do sekcji: ${dot.title}`}
                  tabIndex={0}
                  onClick={() => scrollToSection(dot.id)}
                  onKeyDown={(e) => e.key === 'Enter' && scrollToSection(dot.id)}
                  className={`relative z-10 w-3 h-3 sm:w-4 sm:h-4 rounded-full border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-orange-500 border-orange-500 scale-150 shadow-[0_0_10px_#ea580c]'
                      : isPassed
                      ? 'bg-orange-900/80 border-orange-500/50'
                      : 'bg-zinc-900 border-white/10'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </nav>

      <main className="pl-0 lg:pl-24 w-full pb-20 lg:pb-0 overflow-x-hidden">

        {/* ─── SEKCJA 1+2: Hero + Usługi (horizontal scroll) ─── */}
        <div ref={horizontal1Ref} className="flex flex-col lg:flex-row w-full lg:w-[200%] h-auto lg:h-screen">

          {/* 🔥 WSTAWIAMY KOMPONENT HERO ZAMIAST INLINE KODU */}
          <Hero onNavigate={scrollToSection} />

          {/* Usługi */}
          <section className="w-full lg:w-1/2 min-h-screen lg:h-full flex items-center justify-center bg-zinc-900/20 px-6 sm:px-10 lg:px-12 py-20 lg:py-0 relative overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl text-left w-full relative z-10">
              <MagicBento>
                <Zap className="text-orange-500 mb-4 w-8 h-8 lg:w-10 lg:h-10" />
                <h3 className="font-bold text-base lg:text-lg mb-2 text-white uppercase italic">Nowoczesne Strony WWW</h3>
                <p className="text-xs text-zinc-400">
                  Projektuję i koduję od zera strony firmowe oraz Landing Page, które ładują się natychmiast.
                </p>
              </MagicBento>
              <MagicBento>
                <Smartphone className="text-red-500 mb-4 w-8 h-8 lg:w-10 lg:h-10" />
                <h3 className="font-bold text-base lg:text-lg mb-2 text-white uppercase italic">Aplikacje SaaS</h3>
                <p className="text-xs text-zinc-400">
                  Zmieniam skomplikowane procesy w proste narzędzia. Tworzę dedykowane systemy webowe.
                </p>
              </MagicBento>
              <MagicBento>
                <Gauge className="text-rose-500 mb-4 w-8 h-8 lg:w-10 lg:h-10" />
                <h3 className="font-bold text-base lg:text-lg mb-2 text-white uppercase italic">Optymalizacja i SEO</h3>
                <p className="text-xs text-zinc-400">
                  Wykonuję audyty techniczne i naprawiam błędy, przywracając witrynie szybkość.
                </p>
              </MagicBento>
              <MagicBento>
                <Code2 className="text-orange-400 mb-4 w-8 h-8 lg:w-10 lg:h-10" />
                <h3 className="font-bold text-base lg:text-lg mb-2 text-white uppercase italic">Narzędzia Dedykowane</h3>
                <p className="text-xs text-zinc-400">
                  Buduję inteligentne konfiguratory ofert i kalkulatory wycen generujące zapytania.
                </p>
              </MagicBento>
            </div>
          </section>
        </div>

        {/* ─── SEKCJA 3: O mnie ─── */}
        <section className="w-full min-h-[80vh] lg:h-screen flex flex-col items-center justify-center px-6 lg:px-10 py-20 bg-zinc-950 relative overflow-hidden">
          <div className="absolute top-1/4 left-0 w-[200%] flex whitespace-nowrap opacity-5 pointer-events-none -rotate-2">
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
              className="text-[12rem] font-black italic uppercase text-transparent stroke-text"
              style={{ WebkitTextStroke: '2px white' }}
            >
              PREMIUM WEB DEVELOPMENT • NEXT.JS EXPERT • HIGH PERFORMANCE •{' '}
            </motion.div>
          </div>
          <div className="absolute bottom-1/4 left-0 w-[200%] flex whitespace-nowrap opacity-5 pointer-events-none rotate-2">
            <motion.div
              animate={{ x: [-1000, 0] }}
              transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
              className="text-[12rem] font-black italic uppercase text-transparent stroke-text"
              style={{ WebkitTextStroke: '2px white' }}
            >
              CUSTOM SOFTWARE • SCALABLE SOLUTIONS • UI/UX DESIGN •{' '}
            </motion.div>
          </div>

          <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
            <span className="text-orange-500 font-black tracking-widest uppercase text-[10px] lg:text-xs mb-4">
              O Mnie
            </span>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 lg:mb-8 italic tracking-tighter text-white text-center">
              Mój kod, Twoje zasady.
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-zinc-400 text-center font-light leading-relaxed mb-12">
              Zamiast masowych produktów, dostarczam technologię dopasowaną do potrzeb Twojej firmy. Rezygnuję z
              ociężałych szablonów na rzecz{' '}
              <span className="text-orange-500 font-bold italic underline">
                wydajnych rozwiązań budowanych od zera.
              </span>
            </p>

            <div className="mt-16 flex flex-col items-center gap-4 opacity-30 animate-bounce hidden lg:flex">
              <span className="text-[10px] font-black uppercase tracking-widest">Scrolluj do Portfolio</span>
              <ArrowRight className="w-5 h-5 rotate-90" />
            </div>
          </div>
        </section>

        {/* ─── SEKCJE 4+5+6: Portfolio — Case Studies (horizontal scroll) ─── */}
        <div
          ref={horizontal2Ref}
          className="flex flex-col lg:flex-row w-full lg:w-[300%] h-auto lg:h-screen bg-zinc-900/20"
        >
          {/* Portfolio title panel */}
          <section className="w-full lg:w-1/3 min-h-[50vh] lg:h-full flex flex-col items-center justify-center bg-zinc-950 relative overflow-hidden py-20 lg:py-0 border-y lg:border-none border-white/5">
            <div className="absolute -top-40 -left-40 w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />
            <span className="text-orange-500 font-black tracking-widest uppercase text-[10px] lg:text-xs mb-4">
              Realizacje
            </span>
            <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter text-white text-center">
              Case
              <br />
              Studies
            </h2>
          </section>

          {/* Case Study: Sklep Urwis */}
          <section className="w-full lg:w-1/3 min-h-screen lg:h-full flex items-center justify-center bg-zinc-950 lg:border-l border-white/5 px-6 lg:px-20 py-20 lg:py-0">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
              <div className="space-y-6 text-center lg:text-left order-2 lg:order-1 relative z-10">
                <span className="px-4 py-1.5 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[9px] lg:text-[10px] font-black uppercase rounded-full inline-block tracking-widest">
                  E-commerce / PWA
                </span>
                <h3 className="text-5xl sm:text-6xl font-black italic text-white uppercase tracking-tighter">
                  Sklep Urwis
                </h3>
                <p className="text-zinc-400 text-base lg:text-lg font-light leading-relaxed">
                  Kompleksowa platforma sprzedażowa z kreatorem rysowania na żywo i systemem lojalnościowym
                  zintegrowanym z bazą danych.
                </p>
                <div className="flex justify-center lg:justify-start">
                  <MagneticWrapper>
                    <button
                      onClick={() =>
                        handleOpenDemo({
                          url: 'https://sklep-urwis.pl',
                          title: 'sklep-urwis.pl',
                          colorClass: 'text-orange-500',
                          bgClass: 'bg-orange-600',
                        })
                      }
                      className="px-8 py-4 bg-orange-600 text-white font-black rounded-full uppercase text-[10px] lg:text-xs tracking-widest cursor-pointer shadow-lg shadow-orange-900/30 hover:bg-orange-700 transition-colors"
                    >
                      Uruchom Demo
                    </button>
                  </MagneticWrapper>
                </div>
              </div>
              <div
                onClick={() =>
                  handleOpenDemo({
                    url: 'https://sklep-urwis.pl',
                    title: 'sklep-urwis.pl',
                    colorClass: 'text-orange-500',
                    bgClass: 'bg-orange-600',
                  })
                }
                className="aspect-4/3 w-full bg-zinc-900 rounded-[2rem] border border-white/10 overflow-hidden relative group shadow-2xl cursor-pointer flex items-center justify-center order-1 lg:order-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-orange-600/40 to-black/80 z-0 transition-opacity duration-700 group-hover:opacity-0" />
                <div className="absolute inset-0 bg-[url('/sklepurwis.webp')] bg-cover bg-center opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 z-10" />
                <span className="text-white font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-500 relative z-20 px-6 py-3 bg-orange-600/90 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl shadow-orange-900/50 pointer-events-none">
                  Podgląd Demo
                </span>
              </div>
            </div>
          </section>

          {/* Case Study: zamowtu.pl */}
          <section className="w-full lg:w-1/3 min-h-screen lg:h-full flex items-center justify-center bg-zinc-950 lg:border-l border-white/5 px-6 lg:px-20 py-20 lg:py-0 border-t lg:border-none">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
              <div className="space-y-6 text-center lg:text-left order-2 lg:order-1 relative z-10">
                <span className="px-4 py-1.5 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[9px] lg:text-[10px] font-black uppercase rounded-full inline-block tracking-widest">
                  SaaS / Gastronomia
                </span>
                <h3 className="text-5xl sm:text-6xl font-black italic text-white uppercase tracking-tighter">
                  zamowtu.pl
                </h3>
                <p className="text-zinc-400 text-base lg:text-lg font-light leading-relaxed">
                  System zamówień online dla gastronomii. Fintech, dashboardy analityczne i pełna automatyzacja
                  sprzedaży bez prowizji.
                </p>
                <div className="flex justify-center lg:justify-start">
                  <MagneticWrapper>
                    <button
                      onClick={() =>
                        handleOpenDemo({
                          url: 'https://zamowtu.pl/demo',
                          title: 'zamowtu.pl',
                          colorClass: 'text-orange-500',
                          bgClass: 'bg-orange-600',
                        })
                      }
                      className="px-8 py-4 bg-orange-600 text-white font-black rounded-full uppercase text-[10px] lg:text-xs tracking-widest cursor-pointer shadow-lg shadow-orange-900/30 hover:bg-orange-700 transition-colors"
                    >
                      Uruchom Demo
                    </button>
                  </MagneticWrapper>
                </div>
              </div>
              <div
                onClick={() =>
                  handleOpenDemo({
                    url: 'https://zamowtu.pl/demo',
                    title: 'zamowtu.pl',
                    colorClass: 'text-orange-500',
                    bgClass: 'bg-orange-600',
                  })
                }
                className="aspect-4/3 w-full bg-zinc-900 rounded-[2rem] border border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl cursor-pointer group order-1 lg:order-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-orange-600/40 to-black/80 z-0 transition-opacity duration-700 group-hover:opacity-0" />
                <div className="absolute inset-0 bg-[url('/zamowtu.webp')] bg-cover bg-center opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 z-10" />
                <span className="text-white font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-500 relative z-20 px-6 py-3 bg-orange-600/90 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl shadow-orange-900/50 pointer-events-none">
                  Podgląd Demo
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* ─── SEKCJA 7: Kontakt ─── */}
        <section className="w-full min-h-screen flex flex-col items-center justify-center p-6 sm:p-10 lg:p-20 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
          <Particles color="#e11d48" />
          <div className="max-w-5xl w-full bg-zinc-900/50 border border-white/10 rounded-3xl lg:rounded-[3rem] p-8 lg:p-16 flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 relative z-10 backdrop-blur-xl">
            <div className="text-center lg:text-left">
              <Rocket className="text-rose-500 w-10 h-10 lg:w-12 lg:h-12 mb-6 lg:mb-8 animate-bounce mx-auto lg:mx-0" />
              <h2 className="text-4xl sm:text-5xl font-black italic mb-4 lg:mb-6 text-white leading-tight">
                Zacznijmy projekt, który wygrywa.
              </h2>
              <p className="text-zinc-400 mb-8 lg:mb-10 font-light leading-relaxed text-sm sm:text-base">
                Twoja firma zasługuje na technologię, która realnie zwiększa obroty i odciąża Cię z powtarzalnych
                zadań.
              </p>
              <a
                href="mailto:kontakt@molendadevelopment.pl"
                className="text-lg sm:text-xl font-bold text-white border-b-2 border-orange-500 pb-1 hover:text-orange-500 transition-colors"
              >
                kontakt@molendadevelopment.pl
              </a>
              <div className="flex justify-center lg:justify-start gap-4 mt-10 lg:mt-12">
                <a
                  href="https://www.facebook.com/profile.php?id=61564367727437"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => pushGTMEvent('klikniecie_social', { platforma: 'Facebook' })}
                  className="p-3 bg-white/5 rounded-full border border-white/10 hover:bg-[#1877F2] hover:border-[#1877F2] transition-all group"
                >
                  <Facebook className="w-5 h-5 text-zinc-400 group-hover:text-white pointer-events-none" />
                </a>
                <a
                  href="https://www.linkedin.com/in/marcin-molenda-447251289/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => pushGTMEvent('klikniecie_social', { platforma: 'LinkedIn' })}
                  className="p-3 bg-white/5 rounded-full border border-white/10 hover:bg-blue-600 hover:border-blue-600 transition-all group"
                >
                  <Linkedin className="w-5 h-5 text-zinc-400 group-hover:text-white pointer-events-none" />
                </a>
              </div>
            </div>

            {/* Formularz */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {isFormSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full h-full flex flex-col items-center justify-center p-10 bg-green-500/10 border border-green-500/30 rounded-3xl text-center"
                >
                  <div className="text-3xl mb-3">🚀</div>
                  <p className="text-green-400 font-bold mb-1">Wiadomość została wysłana!</p>
                  <p className="text-xs text-green-400/70 font-light">Odezwę się najszybciej jak to możliwe.</p>
                </motion.div>
              ) : (
                <>
                  <input
                    type="text"
                    name="Imię/Firma"
                    placeholder="Imię / Nazwa Firmy"
                    required
                    disabled={isSubmitting}
                    className="w-full p-4 lg:p-5 bg-black/50 border border-white/10 rounded-2xl outline-none focus:border-orange-500 transition-all font-light text-sm lg:text-base disabled:opacity-50"
                  />
                  <input
                    type="email"
                    name="Email"
                    placeholder="Adres e-mail"
                    required
                    disabled={isSubmitting}
                    className="w-full p-4 lg:p-5 bg-black/50 border border-white/10 rounded-2xl outline-none focus:border-orange-500 transition-all font-light text-sm lg:text-base disabled:opacity-50"
                  />
                  <textarea
                    name="Wiadomość"
                    placeholder="Opisz krótko, czego potrzebujesz..."
                    rows={4}
                    required
                    disabled={isSubmitting}
                    className="w-full p-4 lg:p-5 bg-black/50 border border-white/10 rounded-2xl outline-none focus:border-orange-500 transition-all resize-none font-light text-sm lg:text-base disabled:opacity-50"
                  />

                  {formError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs font-semibold px-2"
                    >
                      {formError}
                    </motion.p>
                  )}

                  <MagneticWrapper className="w-full">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-5 lg:py-6 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black uppercase text-[10px] lg:text-xs tracking-widest rounded-2xl shadow-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Wysyłanie...' : 'Wyślij zapytanie'}
                    </button>
                  </MagneticWrapper>
                </>
              )}
            </form>
          </div>

          <div className="mt-12 lg:mt-20 text-[9px] lg:text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] text-center mb-10 lg:mb-0">
            &copy; {new Date().getFullYear()} Marcin Molenda - molendadevelopment.pl
            <br />
            Wykonano w technologii Next.js 15 &amp; React 19
          </div>
        </section>
      </main>

      {/* ─── Modal Demo ─── */}
      <AnimatePresence>
        {openDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 lg:p-12"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full h-full bg-zinc-900 rounded-3xl lg:rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal toolbar */}
              <div className="p-3 lg:p-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/50 shrink-0">
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="flex gap-1.5 lg:gap-2 pl-2">
                    <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-red-500/30" />
                    <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-yellow-500/30" />
                    <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-green-500/30" />
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                    <button
                      onClick={() => setViewMode('desktop')}
                      className={`px-3 lg:px-4 py-2 rounded-lg text-[9px] lg:text-[10px] font-black uppercase flex items-center gap-1.5 lg:gap-2 transition-all ${
                        viewMode === 'desktop'
                          ? `${openDemo.bgClass} text-white shadow-lg`
                          : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      <Monitor size={14} className="hidden sm:block" /> Desktop
                    </button>
                    <button
                      onClick={() => setViewMode('mobile')}
                      className={`px-3 lg:px-4 py-2 rounded-lg text-[9px] lg:text-[10px] font-black uppercase flex items-center gap-1.5 lg:gap-2 transition-all ${
                        viewMode === 'mobile'
                          ? `${openDemo.bgClass} text-white shadow-lg`
                          : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      <PhoneIcon size={14} className="hidden sm:block" /> Mobile
                    </button>
                  </div>
                </div>
                <div
                  className={`text-[9px] lg:text-[10px] ${openDemo.colorClass} font-black uppercase tracking-widest hidden md:block truncate max-w-[200px]`}
                >
                  {openDemo.title} Preview
                </div>
                <button
                  onClick={() => setOpenDemo(null)}
                  aria-label="Zamknij podgląd demo"
                  className="p-2 lg:p-3 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* iframe */}
              <div className="flex-1 bg-zinc-800 flex justify-center items-center overflow-hidden p-2 lg:p-4">
                <motion.div
                  animate={{
                    width: viewMode === 'desktop' ? '100%' : '375px',
                    height: viewMode === 'desktop' ? '100%' : '812px',
                    borderRadius: viewMode === 'desktop' ? '0px' : '36px',
                  }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  className={`bg-black shadow-2xl overflow-hidden relative flex flex-col ${
                    viewMode === 'mobile' ? 'border-[6px] lg:border-[8px] border-zinc-950/90' : ''
                  }`}
                >
                  {viewMode === 'mobile' && (
                    <div className="h-6 w-full flex justify-between items-center px-6 text-[10px] font-bold text-white shrink-0 bg-black relative z-50">
                      <span className="w-10">9:41</span>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-zinc-950/90 rounded-b-[1rem]" />
                      <div className="flex gap-1.5 items-center relative z-10 w-10 justify-end">
                        <div className="w-5 h-2.5 border border-white/50 rounded-[3px] p-[1px] relative flex items-center">
                          <div className="w-[80%] h-full bg-white rounded-[1px]" />
                          <div className="absolute -right-[2px] top-1/2 -translate-y-1/2 w-[2px] h-1 bg-white/50 rounded-r-sm" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex-1 w-full bg-white relative">
                    <iframe
                      src={openDemo.url}
                      title={`Podgląd projektu: ${openDemo.title}`}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      className="absolute inset-0 w-full h-full border-none pointer-events-auto"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}