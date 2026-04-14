import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language } from '../types';
import { loadLanguage, saveLanguage } from '../services/storage';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'off',
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('off');

  useEffect(() => {
    loadLanguage().then(setLanguageState);
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    saveLanguage(lang);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
