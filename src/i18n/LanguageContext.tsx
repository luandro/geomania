import { useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, translations, detectLanguage } from './translations';
import { LanguageContext, type LanguageContextType } from './LanguageContextDef';

const LANGUAGE_STORAGE_KEY = 'geoquiz-language';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    // Check localStorage first, then detect from browser
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'pt-BR') {
      return stored;
    }
    return detectLanguage();
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  // Update document lang attribute for accessibility
  useEffect(() => {
    document.documentElement.lang = language === 'pt-BR' ? 'pt-BR' : 'en';
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
