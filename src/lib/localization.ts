import { SupportedLanguage } from '@/i18n/translations';
import { Country } from '@/types/quiz';
import { ptCountryNames, ptCapitalNames } from '@/data/ptLocalizations';

export const getLocalizedCountryName = (country: Country, language: SupportedLanguage) => {
  if (language === 'pt-BR') {
    return ptCountryNames[country.id] || country.name;
  }
  return country.name;
};

export const getLocalizedCapital = (country: Country, language: SupportedLanguage) => {
  if (language === 'pt-BR') {
    return ptCapitalNames[country.id] || country.capital;
  }
  return country.capital;
};

export const getLocalizedCountry = (country: Country, language: SupportedLanguage): Country & { localizedName: string; localizedCapital: string } => ({
  ...country,
  localizedName: getLocalizedCountryName(country, language),
  localizedCapital: getLocalizedCapital(country, language),
});
