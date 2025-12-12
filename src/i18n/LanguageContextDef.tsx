import { createContext } from 'react';
import { SupportedLanguage, Translations } from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
export type { LanguageContextType };
