'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Minus } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: "Dlaczego Next.js, a nie WordPress?",
    answer: "WordPress to stary standard. Next.js to szybkość, najwyższe bezpieczeństwo i brak ograniczeń w designie. Twoja strona będzie klasą premium, a nie szablonem."
  },
  {
    question: "Czy będę mógł sam edytować treści?",
    answer: "Tak. Wdrażam dedykowane panele administracyjne (CMS), gdzie zmiana tekstu czy zdjęcia jest tak prosta jak edycja dokumentu Word."
  },
  {
    question: "Jak długo trwa budowa profesjonalnego systemu?",
    answer: "Dzięki autorskiemu systemowi MDK, zaawansowane aplikacje wdrażam w 1-4 tygodni."
  },
  {
    question: "Czy moje dane i płatności będą bezpieczne?",
    answer: "Stosuję światowe standardy: certyfikaty SSL, bezpieczne bazy danych Supabase oraz sprawdzone integracje płatnicze (Stripe / Przelewy24)."
  },
  {
    question: "Co jeśli będę potrzebował rozbudowy w przyszłości?",
    answer: "Moje systemy są modułowe. Skalowanie biznesu nie wymaga pisania wszystkiego od nowa – po prostu dodajemy nowe funkcje do istniejącego fundamentu."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full min-h-screen lg:h-screen h-auto flex flex-col items-center justify-center px-6 sm:px-10 lg:px-20 bg-transparent relative overflow-hidden border-t border-white/5">
      <div className="max-w-4xl mx-auto w-full py-20 lg:py-0 lg:overflow-y-auto lg:max-h-full scrollbar-hide">
        <div className="flex flex-col items-center text-center mb-10 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-md mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="font-mono text-[9px] text-zinc-300 uppercase tracking-widest">Współpraca / FAQ</span>
          </div>
          <h2 className="text-4xl sm:text-6xl text-white tracking-tighter mb-6">Odpowiedzi na obawy</h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light max-w-2xl">
            Inwestycja w nowoczesną technologię to klucz do przewagi rynkowej. Oto wyjaśnienie najczęstszych kwestii technicznych w języku biznesu.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className={`group border rounded-2xl transition-all duration-500 ${isOpen ? 'bg-zinc-900/40 border-white/10 shadow-2xl' : 'bg-transparent border-white/5 hover:border-white/10 hover:bg-zinc-900/20'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 sm:p-8 text-left"
                >
                  <span className={`text-lg sm:text-xl font-medium transition-colors duration-300 ${isOpen ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                    {item.question}
                  </span>
                  <div className={`p-2 rounded-full transition-transform duration-500 ${isOpen ? 'bg-orange-500 rotate-180 text-white' : 'bg-zinc-900 text-zinc-600'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-8 sm:px-8 text-zinc-400 text-sm sm:text-base leading-relaxed font-light border-t border-white/5 pt-6">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
