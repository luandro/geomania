import { useLanguage } from '@/i18n/use-language';
import { SupportedLanguage } from '@/i18n/translations';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang: SupportedLanguage = language === 'en' ? 'pt-BR' : 'en';
    setLanguage(newLang);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="text-primary-foreground hover:bg-primary-foreground/10 gap-1.5 px-2 sm:px-3"
      aria-label={`Switch to ${language === 'en' ? 'Portuguese' : 'English'}`}
    >
      <Globe className="w-4 h-4" />
      <span className="text-xs font-semibold">
        {language === 'en' ? 'PT' : 'EN'}
      </span>
    </Button>
  );
};
