'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Code2, Smartphone, Zap, Gauge, Rocket, ArrowRight, Github, Linkedin } from 'lucide-react';
import useSound from 'use-sound';
import MagicBento from '@/components/ui/MagicBento';
import MagneticButton from '@/components/ui/MagneticButton';
import Particles from '@/components/ui/Particles';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  if (window.history && 'scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
}

export default function PortfolioHome() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const horizontal1Ref = useRef<HTMLDivElement>(null);
  const vertical1Ref = useRef<HTMLDivElement>(null);
  const horizontal2Ref = useRef<HTMLDivElement>(null);
  const vertical2Ref = useRef<HTMLDivElement>(null);

  const lastSnappedRef = useRef(-1);
  const [activeDot, setActiveDot] = useState(0);
  const [playNavClick] = useSound('/sfx/click.mp3', { volume: 0.1 }); 

  const rawProgress = useMotionValue(0); 
  const smoothProgress = useSpring(rawProgress, { stiffness: 80, damping: 18, mass: 0.8 });
  const lavaHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  const navDots = [
    { id: 0, title: "Start" },
    { id: 1, title: "Usługi" },
    { id: 2, title: "O mnie" },
    { id: 3, title: "Portfolio" },
    { id: 4, title: "Sklep Urwis" },
    { id: 5, title: "Kontakt" }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);

    let ctx = gsap.context(() => {
      
      gsap.to(horizontal1Ref.current, { xPercent: -50, ease: "none", scrollTrigger: { trigger: horizontal1Ref.current, start: "top top", end: "+=100%", pin: true, scrub: true }});
      gsap.to(horizontal2Ref.current, { xPercent: -50, ease: "none", scrollTrigger: { trigger: horizontal2Ref.current, start: "top top", end: "+=100%", pin: true, scrub: true }});

      ScrollTrigger.create({
        start: 0,
        end: "max", 
        snap: {
          snapTo: (p) => {
            const step = 0.2; 
            const nearestIndex = Math.round(p / step);
            const nearest = nearestIndex * step;

            if (Math.abs(p - nearest) < 0.08) {
              if (lastSnappedRef.current !== nearestIndex) {
                lastSnappedRef.current = nearestIndex; 
                return nearest; 
              }
              return p; 
            }
            lastSnappedRef.current = -1;
            return p; 
          },
          duration: { min: 0.2, max: 0.5 },
          delay: 0.1, 
          ease: "power2.out"
        },
        onUpdate: (self) => {
          rawProgress.set(self.progress);
          const currentDot = Math.round(self.progress * 5);
          setActiveDot(prev => {
            if (prev !== currentDot) {
              playNavClick(); 
              return currentDot;
            }
            return prev;
          });
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, [rawProgress, playNavClick]);

  const scrollToSection = (index: number) => {
    playNavClick();
    lastSnappedRef.current = index; 
    const totalScroll = ScrollTrigger.maxScroll(window); 
    const targetY = (totalScroll / 5) * index;
    gsap.to(window, { scrollTo: targetY, duration: 1.2, ease: "power3.inOut" });
  };

  return (
    <div ref={containerRef} className="relative bg-zinc-950 text-zinc-50 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* LEWY NAVBAR */}
      <nav className="fixed left-0 top-0 bottom-0 w-24 bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 z-100 flex flex-col items-center justify-center py-10">
        <div className="absolute top-10 w-full text-center text-[10px] font-black uppercase tracking-widest text-zinc-500">DEV</div>
        <div className="relative h-[60vh] w-4 mt-8">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1.5 bg-white/5 rounded-full shadow-inner z-0" />
          <motion.div className="absolute left-1/2 -translate-x-1/2 top-0 w-1.5 bg-linear-to-b from-orange-500 via-red-500 to-rose-600 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] origin-top z-0" style={{ height: lavaHeight }} />
          <motion.div className="absolute left-1/2 w-5 h-5 bg-white rounded-full z-20 shadow-[0_0_20px_rgba(255,255,255,0.9),0_0_40px_rgba(239,68,68,1)] pointer-events-none" style={{ top: lavaHeight, x: "-50%", y: "-50%" }}>
            <div className="absolute inset-1 bg-linear-to-br from-orange-200 to-red-600 rounded-full" />
          </motion.div>
          {/* Matematycznie nałożone punkty kontrolne (20% co krok, z-10) */}
          {navDots.map((dot, index) => {
            const isActive = activeDot === index;
            const isPassed = index < activeDot; 
            
            let dotClasses = 'bg-zinc-900 border-zinc-700';
            let textClasses = 'opacity-0 group-hover:opacity-100 text-zinc-500';

            if (isActive) {
              dotClasses = 'bg-orange-500 border-white shadow-[0_0_12px_rgba(249,115,22,0.9)] scale-110';
              textClasses = 'opacity-100 text-white font-black scale-110';
            } else if (isPassed) {
              dotClasses = 'bg-orange-600/60 border-orange-400/50 shadow-[0_0_8px_rgba(249,115,22,0.4)]';
              textClasses = 'opacity-0 group-hover:opacity-100 text-orange-200/60';
            }

            return (
              <div 
                key={dot.id}
                onClick={() => scrollToSection(dot.id)}
                className={`absolute left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 z-10 cursor-pointer hover:scale-150 transition-all duration-500 group flex items-center ${dotClasses}`}
                style={{ top: `${index * 20}%` }} 
              >
                <span className={`absolute left-8 transition-all duration-300 text-[10px] uppercase tracking-widest whitespace-nowrap ${textClasses}`}>
                  {dot.title}
                </span>
              </div>
            )
          })}
        </div>
      </nav>

      {/* GŁÓWNA ZAWARTOŚĆ */}
      <main className="pl-24 w-full overflow-x-hidden">
        
        {/* ETAP 1 */}
        <div ref={horizontal1Ref} className="flex w-[200%] h-screen">
          <section className="w-1/2 h-full flex flex-col items-center justify-center border-r border-white/5 relative overflow-hidden">
            <Particles color="#ea580c" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-400 text-xs font-black uppercase tracking-widest mb-8 relative z-10 hover:bg-white/10 transition-colors cursor-default">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Dostępny na nowe wyzwania
            </div>
            <h1 className="text-7xl font-black tracking-tighter mb-6 relative z-10 text-center leading-tight">
              Cześć, nazywam się <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-red-500">Marcin Molenda</span>.<br /> Buduję nowoczesny web.
            </h1>
            <p className="text-xl text-zinc-400 max-w-xl text-center font-light mb-10 relative z-10">
              Przekształcam skomplikowane problemy biznesowe w ultraszybkie, intuicyjne i zyskowne aplikacje internetowe (PWA).
            </p>
          </section>

          <section className="w-1/2 h-full flex items-center justify-center bg-zinc-900/30">
            <div className="max-w-5xl w-full px-12 text-center">
              <h2 className="text-5xl font-black mb-16 text-left">W czym mogę Ci pomóc?</h2>
              <div className="grid grid-cols-2 gap-6 text-left">
                
                {/* KARTA 1: Wizytówki Premium */}
                <MagicBento className="group">
                  <Zap className="w-10 h-10 text-orange-500 mb-5 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-3 text-white">Strony Wizytówkowe WOW</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">
                    Koniec z nudnymi szablonami. Tworzę nowoczesne Landing Page'e i strony firmowe z płynnymi animacjami, które od pierwszej sekundy budują zaufanie i wyróżniają Cię na tle lokalnej konkurencji.
                  </p>
                </MagicBento>

                {/* KARTA 2: PWA */}
                <MagicBento className="group">
                  <Smartphone className="w-10 h-10 text-red-500 mb-5 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-3 text-white">PWA: Aplikacja na telefon</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">
                    Zmieniam zwykłe strony w aplikacje. Twój klient może jednym kliknięciem dodać Twój biznes na ekran główny swojego smartfona (bez App Store) i przeglądać ofertę nawet przy słabym internecie.
                  </p>
                </MagicBento>

                {/* KARTA 3: Szybkość 100/100 */}
                <MagicBento className="group">
                  <Gauge className="w-10 h-10 text-rose-500 mb-5 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-3 text-white">Ratunek dla wolnych stron</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">
                    Uciekają Ci klienci przez zacinającego się WordPressa? Przepisuję przestarzałe strony na ultraszybki kod w technologii Next.js. Wynik 100/100 w testach szybkości od razu poprawi Twoje pozycje w Google.
                  </p>
                </MagicBento>

                {/* KARTA 4: Kalkulatory */}
                <MagicBento className="group">
                  <Code2 className="w-10 h-10 text-orange-400 mb-5 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-3 text-white">Interaktywne Narzędzia</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">
                    Koniec z odpisywaniem na te same maile o wycenę. Buduję na stronach małe aplikacje – np. inteligentne konfiguratory ofert i kalkulatory, które angażują klienta i automatycznie zbierają dla Ciebie leady.
                  </p>
                </MagicBento>

              </div>
            </div>
          </section>
        </div>

        {/* ETAP 2 */}
        <section ref={vertical1Ref} className="w-full h-screen flex items-center justify-center relative bg-zinc-950">
          <div className="max-w-4xl w-full text-center px-10 relative z-10">
            <h2 className="text-6xl font-black mb-10">Mój kod, Twoje zasady.</h2>
            <p className="text-2xl text-zinc-400 leading-relaxed font-light mb-16 max-w-3xl mx-auto">
              Większość wykonawców instaluje Ci ciężkiego, dziurawego WordPressa i liczy na to, że "jakoś to będzie". <strong className="text-white font-bold text-orange-400">Ja piszę kod od zera.</strong><br/><br/>
              Współpracując ze mną, otrzymujesz bezpieczny, zamknięty w nowoczesnej architekturze ekosystem, w którym to technologia dopasowuje się do Twojej firmy, a nie na odwrót.
            </p>
            <MagneticButton onClick={() => scrollToSection(3)}>
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-zinc-700 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black hover:border-white transition-colors shadow-lg shadow-black/50 cursor-pointer">
                Sprawdź realizacje <ArrowRight className="w-4 h-4" />
              </div>
            </MagneticButton>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-zinc-900 to-transparent pointer-events-none" />
        </section>

        {/* ETAP 3 */}
        <div ref={horizontal2Ref} className="flex w-[200%] h-screen bg-zinc-900 border-t border-white/5">
          <section className="w-1/2 h-full flex flex-col items-center justify-center border-r border-white/5 relative overflow-hidden">
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />
            <p className="text-orange-500 font-black tracking-widest uppercase mb-4 text-sm">Wybrane prace</p>
            <h2 className="text-8xl font-black uppercase tracking-tighter">Case<br/>Studies</h2>
          </section>

          <section className="w-1/2 h-full flex items-center justify-center relative overflow-hidden bg-zinc-950">
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="flex gap-16 items-center max-w-7xl w-full px-16 relative z-10">
              <div className="flex-1">
                <span className="px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-black uppercase rounded-full mb-6 inline-block tracking-widest">Web App / E-commerce</span>
                <h2 className="text-7xl font-black mb-6 tracking-tight">Sklep Urwis</h2>
                <p className="text-zinc-400 mb-10 leading-relaxed text-lg font-light">
                  Kompleksowa platforma sprzedażowa z elementami gamifikacji. Aplikacja posiada wbudowany kreator rysowania na żywo (Canvas), autorski system powiadomień Web-Push z segmentacją odbiorców oraz cyfrowy portfel lojalnościowy zintegrowany z backendem w Supabase.
                </p>
                <div className="flex gap-4">
                  <MagneticButton>
                    <a href="https://sklep-urwis.pl" target="_blank" rel="noreferrer" className="block px-8 py-4 bg-white text-zinc-950 rounded-full font-black uppercase tracking-wider text-sm hover:bg-zinc-200 transition-colors shadow-xl">
                      Live Demo
                    </a>
                  </MagneticButton>
                </div>
              </div>
              <div className="flex-1 aspect-4/3 bg-zinc-900 rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[url('/gallery/sklep-front.webp')] bg-cover bg-center opacity-60 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-105" />
                 <span className="relative z-10 px-6 py-3 bg-black/70 backdrop-blur-md rounded-xl text-white font-black uppercase tracking-widest text-sm border border-white/10 opacity-100 group-hover:opacity-0 transition-opacity">sklep-urwis.pl</span>
              </div>
            </div>
          </section>
        </div>

        {/* ETAP 4 */}
        <section ref={vertical2Ref} className="w-full min-h-screen flex flex-col items-center justify-center bg-zinc-950 border-t border-white/5 relative overflow-hidden py-20">
          <Particles color="#e11d48" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-5xl w-full p-16 bg-zinc-900/50 border border-white/10 rounded-[3rem] backdrop-blur-xl relative z-10 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-16">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Rocket className="w-12 h-12 text-rose-500 mb-8 animate-bounce" />
                  <h2 className="text-5xl font-black mb-6 leading-tight">Zbudujmy coś<br/>wyjątkowego.</h2>
                  <p className="text-zinc-400 leading-relaxed font-light mb-8 max-w-sm">
                    Niezależnie czy potrzebujesz innowacyjnej aplikacji, czy sklepu, który wyróżni się na tle konkurencji – porozmawiajmy o tym.
                  </p>
                </div>
                
                <div className="mt-8">
                  <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mb-4">Napisz bezpośrednio:</p>
                  <a href="mailto:[TwojEmail@domena.pl]" className="text-2xl font-bold text-white hover:text-orange-500 transition-colors border-b-2 border-orange-500 pb-1 inline-block">
                    [TwojEmail@domena.pl]
                  </a>
                  
                  {/* Social Links */}
                  <div className="flex gap-4 mt-10">
                    <a href="https://github.com/[TwojGithub]" target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-full border border-white/10 hover:bg-orange-500 hover:border-orange-500 transition-all group">
                      <Github className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                    </a>
                    <a href="https://linkedin.com/in/[TwojLinkedIn]" target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-full border border-white/10 hover:bg-blue-600 hover:border-blue-600 transition-all group">
                      <Linkedin className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Formularz wymaga podpięcia np. pod Formspree!'); }}>
                  <input type="text" required placeholder="Imię / Nazwa Firmy" className="w-full p-5 bg-zinc-950/80 border border-white/10 rounded-2xl outline-none focus:border-orange-500 focus:bg-zinc-950 transition-all font-light" />
                  <input type="email" required placeholder="Adres e-mail" className="w-full p-5 bg-zinc-950/80 border border-white/10 rounded-2xl outline-none focus:border-orange-500 focus:bg-zinc-950 transition-all font-light" />
                  <textarea required placeholder="Opisz krótko, czego potrzebujesz..." rows={5} className="w-full p-5 bg-zinc-950/80 border border-white/10 rounded-2xl outline-none focus:border-orange-500 focus:bg-zinc-950 transition-all resize-none font-light" />
                  
                  <MagneticButton className="w-full">
                    <button type="submit" className="w-full py-6 px-10 bg-linear-to-r from-orange-500 to-red-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                      Wyślij zapytanie
                    </button>
                  </MagneticButton>
                </form>
              </div>
            </div>
          </div>
          
          <div className="w-full text-center mt-12 text-zinc-600 text-sm font-light relative z-10">
            &copy; {new Date().getFullYear()} Marcin Molenda. Wszelkie prawa zastrzeżone. <br/>Zaprojektowane i zakodowane z pasją.
          </div>
        </section>

      </main>
    </div>
  );
}