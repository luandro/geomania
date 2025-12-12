import { useLanguage } from '@/i18n/use-language';
import { SupportedLanguage } from '@/i18n/translations';
import { Globe } from 'lucide-react';

// List of all supported languages - add new languages here
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'pt-BR'];

export const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full p-1">
      <Globe className="w-4 h-4 ml-2 text-primary-foreground" aria-hidden="true" />
      <div className="flex gap-1" role="group" aria-label={t.language}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = language === lang;
          return (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`
                px-3 py-1 rounded-full text-xs font-semibold transition-all
                ${isActive
                  ? 'bg-primary-foreground text-primary shadow-sm'
                  : 'text-primary-foreground hover:bg-primary-foreground/20'
                }
              `}
              aria-pressed={isActive}
              aria-label={t.languageNames[lang]}
            >
              {t.languageNames[lang]}
            </button>
          );
        })}
      </div>
    </div>
  );
};
