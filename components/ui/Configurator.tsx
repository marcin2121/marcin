'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronRight, ArrowLeft, CheckSquare, Square, Target, Zap, Clock, Rocket, Brush, Code, CalendarSearch, Frown, FileWarning, Presentation, MonitorSmartphone, ShoppingCart, Lock, Sparkles, Server, Lightbulb, Activity } from 'lucide-react';
import MagneticWrapper from '@/components/ui/MagneticWrapper';
import { pushGTMEvent } from '@/app/page';

const STEPS_DATA = {
  1: {
    title: 'Co obecnie najbardziej blokuje Twój biznes?',
    subtitle: 'Wybierz jedno największe wyzwanie',
    options: [
      { id: 'brak_sprzedazy', icon: Frown, label: 'Brak konwersji ze strony', desc: 'Mam ruch, ale nie przekłada się to na zapytania.' },
      { id: 'reczna_praca', icon: FileWarning, label: 'Tonę w procesach ręcznych', desc: 'Odpisywanie na powtarzalne maile, ręczne wyceny.' },
      { id: 'wizerunek', icon: Presentation, label: 'Przestarzały wizerunek', desc: 'Rozwijam się, ale strona wygląda gorzej niż u konkurencji.' },
      { id: 'nowy_pomysl', icon: Rocket, label: 'Startuję z nowym projektem', desc: 'Mam wizję i szukam kogoś, kto ją zbuduje od zera.' },
    ]
  },
  2: {
    title: 'Zaznacz, co usprawniłoby Twoją firmę',
    subtitle: 'Możesz wybrać wiele rozwiązań',
    options: [
      { id: 'strona_www', icon: MonitorSmartphone, label: 'Nowoczesna Strona', desc: 'Ultraszybka platforma bez używania WordPressa.' },
      { id: 'sklep_ecom', icon: ShoppingCart, label: 'Sklep E-commerce', desc: 'System zoptymalizowany pod ekstremalną sprzedaż.' },
      { id: 'b2b_portal', icon: Lock, label: 'Platforma B2B', desc: 'Strefa, gdzie klienci B2B składają swoje zamówienia.' },
      { id: 'ai_chatbot', icon: Sparkles, label: 'Wirtualny Asystent AI', desc: 'Chatbot automatyzujący obsługę klienta (24/7).' },
      { id: 'kalkulator', icon: Server, label: 'Konfigurator ofert', desc: 'Aplikacja obliczająca na żywo wyceny usług.' },
      { id: 'inny_system', icon: Lightbulb, label: 'Inny projekt / Custom', desc: 'Szukam czegoś nietypowego lub nowej integracji.' },
    ]
  },
  3: {
    title: 'Na jakim etapie prac jesteś?',
    subtitle: 'Wybierz, co jest już gotowe',
    options: [
      { id: 'tylko_pomysl', icon: Target, label: 'Tylko pomysł w głowie', desc: 'Potrzebuję kogoś, kto wymyśli kod i UX.' },
      { id: 'mam_makiety', icon: Brush, label: 'Mam projekt graficzny', desc: 'Szukam tylko zaawansowanego wdrożenia w kodzie.' },
      { id: 'stary_kod', icon: Code, label: 'Budowa od nowa', desc: 'Mamy stary system, burzymy go i robimy na nowo.' },
      { id: 'optymalizacja', icon: Activity, label: 'Tylko Optymalizacja', desc: 'Zostajemy przy obecnej stronie, tylko przyspieszamy.' },
    ]
  },
  4: {
    title: 'Priorytet wdrożenia',
    subtitle: 'Kiedy chcesz wystartować?',
    options: [
      { id: 'pilne', icon: Zap, label: 'Jak najszybciej', desc: 'Sprawa pilna, chcę ruszyć z kodowaniem od zaraz.' },
      { id: 'optymalnie', icon: Clock, label: '1 do 3 miesięcy', desc: 'Projekt zaplanowany na najbliższy kwartał.' },
      { id: 'badanie', icon: CalendarSearch, label: 'Dopiero badam rynek', desc: 'Chcę poznać możliwości i wstępne estymacje.' },
    ]
  }
};

export default function Configurator() {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState<Record<number, string | string[]>>({
    1: '', 2: [], 3: '', 4: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  React.useEffect(() => {
    // Notify the scroll engine that height may have changed
    window.dispatchEvent(new Event('refreshScroll'));
  }, [step, isDone]);

  const handleSingleSelect = (stepIndex: number, optionId: string) => {
    setSelections(prev => ({ ...prev, [stepIndex]: optionId }));
    setTimeout(() => setStep(stepIndex + 1), 300);
  };

  const toggleMultiSelect = (stepIndex: number, optionId: string) => {
    setSelections(prev => {
      const current = (prev[stepIndex] as string[]) || [];
      const isSelected = current.includes(optionId);
      return {
        ...prev,
        [stepIndex]: isSelected ? current.filter(id => id !== optionId) : [...current, optionId]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    formData.append('1_Wyzwanie', STEPS_DATA[1].options.find(o => o.id === selections[1])?.label || 'Brak');
    formData.append('2_Rozwiazania', (selections[2] as string[]).map(id => STEPS_DATA[2].options.find(o => o.id === id)?.label).join(', ') || 'Brak');
    formData.append('3_Etap', STEPS_DATA[3].options.find(o => o.id === selections[3])?.label || 'Brak');
    formData.append('4_Priorytet', STEPS_DATA[4].options.find(o => o.id === selections[4])?.label || 'Brak');

    try {
      const response = await fetch('https://formspree.io/f/mgolplyg', { method: 'POST', body: formData, headers: { Accept: 'application/json' } });
      if (response.ok) {
        pushGTMEvent('formularz_premium_wyslany', { etap: selections[3] });
        setIsDone(true);
      }
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (isDone) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-20 h-20 md:w-24 md:h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 md:mb-8">
          <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-green-500" />
        </motion.div>
        <h3 className="text-2xl md:text-3xl text-white font-bold mb-4">Projekt na horyzoncie!</h3>
        <p className="text-base md:text-lg text-zinc-400 max-w-lg">Dziękuję za szczegóły. Przeanalizuję Twój przypadek i odezwę się wkrótce z konkretem.</p>
      </div>
    );
  }

  const renderStepContent = () => {
    if (step === 5) {
      return (
        <motion.div key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col w-full max-w-4xl mx-auto px-4 md:px-0">
          <div className="text-center mb-8 md:mb-10">
            <h3 className="text-2xl md:text-4xl text-white font-bold mb-2 md:mb-3">Ostatni krok. Kontakt.</h3>
            <p className="text-zinc-400 text-sm md:text-lg">Zostaw dane, odezwę się by na luzie omówić, co da się zrobić.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <input type="text" name="name" placeholder="Imię / Nazwa Firmy" required disabled={isSubmitting} className="w-full p-4 md:p-6 bg-zinc-950/50 border border-white/10 rounded-xl md:rounded-2xl outline-none focus:border-white/30 text-zinc-200 text-xs md:text-sm font-mono transition-colors" />
              <input type="email" name="email" placeholder="Adres e-mail" required disabled={isSubmitting} className="w-full p-4 md:p-6 bg-zinc-950/50 border border-white/10 rounded-xl md:rounded-2xl outline-none focus:border-white/30 text-zinc-200 text-xs md:text-sm font-mono transition-colors" />
            </div>
            <textarea name="msg" placeholder="Link do strony lub krótki opis projektu..." rows={3} disabled={isSubmitting} className="w-full p-4 md:p-6 bg-zinc-950/50 border border-white/10 rounded-xl md:rounded-2xl outline-none focus:border-white/30 text-zinc-200 text-xs md:text-sm font-mono resize-none transition-colors" />
            
            <MagneticWrapper className="w-full pt-2 md:pt-4">
              <button type="submit" disabled={isSubmitting} className="w-full py-4 md:py-6 bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-[0.15em] rounded-xl md:rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 md:gap-3 active:scale-[0.98] text-[10px] md:text-sm">
                {isSubmitting ? 'Wysyłanie...' : 'Rozpocznijmy rozmowę'}
                {!isSubmitting && <ArrowRight size={16} />}
              </button>
            </MagneticWrapper>
          </form>
        </motion.div>
      );
    }

    const currentData = STEPS_DATA[step as keyof typeof STEPS_DATA];
    const isMultiSelect = step === 2;

    return (
      <motion.div key={`step${step}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col w-full px-2 md:px-0">
        <div className="text-center mb-6 md:mb-10">
          <h3 className="text-2xl md:text-4xl text-white font-bold mb-2 md:mb-3">{currentData.title}</h3>
          <p className="text-zinc-500 md:text-zinc-400 font-mono text-[10px] md:text-sm uppercase tracking-widest">{currentData.subtitle}</p>
        </div>
        
        {/* Optymalizacja Mobile: grid-cols-1 i mniejsze paddingi, na desktop grid-cols-2 lub 3 */}
        <div className={`grid gap-2 md:gap-4 ${step === 2 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} max-w-6xl mx-auto w-full`}>
          {currentData.options.map((opt: any) => {
            const Icon = opt.icon;
            const isSelected = isMultiSelect 
              ? (selections[step] as string[]).includes(opt.id)
              : selections[step] === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => isMultiSelect ? toggleMultiSelect(step, opt.id) : handleSingleSelect(step, opt.id)}
                className={`w-full text-left p-4 md:p-8 rounded-2xl md:rounded-3xl border transition-all flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-4 group relative overflow-hidden ${isSelected ? 'bg-white/10 border-white/30' : 'bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-800/40'}`}
              >
                <div className="flex md:w-full justify-between items-center md:items-start shrink-0">
                  <div className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl ${isSelected ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 group-hover:text-white group-hover:bg-white/10'} transition-colors`}>
                    <Icon size={20} className="md:w-7 md:h-7" strokeWidth={1.5} />
                  </div>
                  {isMultiSelect && (
                    <div className="hidden md:block mt-2">
                      {isSelected ? <CheckSquare className="w-6 h-6 text-white" /> : <Square className="w-6 h-6 text-zinc-600 group-hover:text-zinc-400" />}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex justify-between items-center md:block">
                  <div>
                    <div className={`text-sm md:text-xl font-bold mb-0.5 md:mb-2 ${isSelected ? 'text-white' : 'text-zinc-200'}`}>{opt.label}</div>
                    <div className="hidden md:block text-sm text-zinc-500 leading-relaxed">{opt.desc}</div>
                  </div>
                  {/* Checkbox na mobile */}
                  {isMultiSelect && (
                    <div className="md:hidden ml-2 shrink-0">
                      {isSelected ? <CheckSquare className="w-5 h-5 text-white" /> : <Square className="w-5 h-5 text-zinc-600" />}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {isMultiSelect && (selections[step] as string[]).length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex justify-center mt-6 md:mt-10">
              <button onClick={() => setStep(step + 1)} className="w-full md:w-auto px-6 py-4 md:px-10 md:py-5 bg-white text-black font-black text-[10px] md:text-sm uppercase tracking-widest rounded-xl md:rounded-2xl shadow-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3 active:scale-[0.98]">
                Przejdź dalej <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col w-full py-4 md:py-8">
      <div className="flex items-center justify-center gap-2 md:gap-3 mb-8 md:mb-16 max-w-2xl mx-auto w-full px-4">
        {[1, 2, 3, 4, 5].map(s => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold font-mono transition-all duration-500 shrink-0 ${s === step ? 'bg-white text-black scale-110' : s < step ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-900/50 text-zinc-600 border border-white/5'}`}>
              {s < step ? <CheckCircle2 size={14} className="md:w-4 md:h-4" /> : s}
            </div>
            {s < 5 && <div className={`h-0.5 md:h-1 w-full rounded-full transition-all duration-700 ${s < step ? 'bg-zinc-600' : 'bg-zinc-900/50 border-t border-b border-white/5'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="relative min-h-[300px] md:min-h-[400px] w-full flex flex-col justify-center">
        {step > 1 && step < 6 && (
          <button onClick={() => setStep(step - 1)} className="absolute -top-10 md:-top-6 left-2 md:-left-12 p-2 md:p-3 bg-zinc-900/80 backdrop-blur rounded-xl md:rounded-2xl border border-white/5 hover:border-white/20 transition-all text-zinc-400 hover:text-white active:scale-95 z-10 flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-mono uppercase">
            <ArrowLeft size={14} /> <span className="hidden md:inline">Wstecz</span>
          </button>
        )}
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>
    </div>
  );
}