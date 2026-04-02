'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import MagneticWrapper from '@/components/ui/MagneticWrapper';
import { pushGTMEvent } from '@/app/page';

const STEPS = [
  {
    id: 1,
    title: 'Wybierz cel biznesowy',
    options: [
      { id: 'ecommerce', label: 'E-commerce (Sklep)', desc: 'Zwiększenie sprzedaży on-line' },
      { id: 'saas', label: 'Aplikacja SaaS', desc: 'Panel klienta, automatyzacja, platforma' },
      { id: 'www', label: 'Strona Wizytówka', desc: 'Prestiżowa prezentacja usług' },
      { id: 'opt', label: 'Optymalizacja (SEO / Speed)', desc: 'Naprawa obecnej, wolnej strony' },
    ]
  },
  {
    id: 2,
    title: 'Główny problem dzisiaj?',
    options: [
      { id: 'slow', label: 'Strona działa wolno', desc: 'Klienci uciekają z powodu ładowania' },
      { id: 'manual', label: 'Zbyt dużo ręcznej pracy', desc: 'Brakuje automatyzacji i integracji' },
      { id: 'design', label: 'Przestarzały wygląd', desc: 'Nie wzbudza zaufania (brak "Wow")' },
      { id: 'idea', label: 'Startuję z nowym pomysłem', desc: 'Szukam architekta systemu' },
    ]
  }
];

export default function Configurator() {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSelect = (optionId: string) => {
    setSelections(prev => ({ ...prev, [step]: optionId }));
    setTimeout(() => {
      if (step <= STEPS.length) {
        setStep(step + 1);
      }
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Append previous selections
    formData.append('Cel', selections[1] || 'Nie wybrano');
    formData.append('Problem', selections[2] || 'Nie wybrano');

    try {
      const response = await fetch('https://formspree.io/f/mgolplyg', { method: 'POST', body: formData, headers: { Accept: 'application/json' } });
      if (response.ok) {
        pushGTMEvent('formularz_konfigurator_wyslany', { cel: selections[1], problem: selections[2] });
        setIsDone(true);
      }
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (isDone) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </motion.div>
        <h3 className="text-xl text-white font-bold mb-2">Priorytet Przyjęty</h3>
        <p className="text-sm text-zinc-400">Przeanalizuję Twój profil bizesowy i odezwę się z gotową koncepcją technologiczną w ciągu 24h.</p>
      </div>
    );
  }

  const currentStepData = STEPS.find(s => s.id === step);

  return (
    <div className="flex flex-col w-full">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-orange-500' : 'bg-zinc-800'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentStepData ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col"
          >
            <h3 className="text-xl text-white font-bold mb-6">{currentStepData.title}</h3>
            <div className="space-y-3">
              {currentStepData.options.map(opt => {
                const isSelected = selections[step] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${isSelected ? 'bg-orange-500/10 border-orange-500' : 'bg-zinc-900/50 border-white/5 hover:border-white/20 hover:bg-zinc-800/50'}`}
                  >
                    <div>
                      <div className={`text-sm font-bold mb-1 ${isSelected ? 'text-orange-400' : 'text-white'}`}>{opt.label}</div>
                      <div className="text-[10px] sm:text-xs font-mono text-zinc-500">{opt.desc}</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isSelected ? 'text-orange-400' : 'text-zinc-600'}`} />
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="final"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h3 className="text-xl text-white font-bold mb-6">Zostaw kontakt</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" placeholder="Imię / Nazwa Firmy" required disabled={isSubmitting} className="w-full p-4 bg-zinc-900 border border-white/5 rounded-xl outline-none focus:border-white/20 text-zinc-200 text-sm font-mono transition-colors" />
              <input type="text" name="email" placeholder="Telefon lub E-mail" required disabled={isSubmitting} className="w-full p-4 bg-zinc-900 border border-white/5 rounded-xl outline-none focus:border-white/20 text-zinc-200 text-sm font-mono transition-colors" />
              <textarea name="msg" placeholder="Opcjonalne szczegóły projektu..." rows={3} disabled={isSubmitting} className="w-full p-4 bg-zinc-900 border border-white/5 rounded-xl outline-none focus:border-white/20 text-zinc-200 text-sm font-mono resize-none transition-colors" />
              
              <MagneticWrapper className="w-full pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-orange-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl shadow-[0_0_20px_#ea580c80] hover:bg-orange-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-3">
                  {isSubmitting ? 'Wysyłanie...' : 'Wyślij zapytanie'}
                  {!isSubmitting && <ArrowRight size={14} />}
                </button>
              </MagneticWrapper>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
