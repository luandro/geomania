import { Country } from '@/types/quiz';
import { SupportedLanguage } from '@/i18n/translations';
import { ptCapitalNames, ptCountryNames } from '@/data/ptLocalizations';

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

export const findCountryMatch = (
  countries: Country[],
  rawAnswer: string,
  language: SupportedLanguage = 'en'
) => {
  if (!rawAnswer) return undefined;

  const answer = normalize(rawAnswer);

  return countries.find((country) => {
    const candidates: string[] = [country.name, country.capital];

    if (language === 'pt-BR') {
      const translatedName = ptCountryNames[country.id];
      const translatedCapital = ptCapitalNames[country.id];
      if (translatedName) candidates.push(translatedName);
      if (translatedCapital) candidates.push(translatedCapital);
    }

    return candidates.some((value) => value && normalize(value) === answer);
  });
};

export const buildAnswerSuggestions = (
  countries: Country[],
  language: SupportedLanguage = 'en',
  type: 'country' | 'capital' | 'both' = 'both'
) => {
  const seen = new Set<string>();

  countries.forEach((country) => {
    // Add country names if type is 'country' or 'both'
    if ((type === 'country' || type === 'both') && country.name) {
      seen.add(country.name);
    }

    // Add capital names if type is 'capital' or 'both'
    if ((type === 'capital' || type === 'both') && country.capital) {
      seen.add(country.capital);
    }

    if (language === 'pt-BR') {
      const translatedName = ptCountryNames[country.id];
      const translatedCapital = ptCapitalNames[country.id];

      // Add translated country names if type is 'country' or 'both'
      if ((type === 'country' || type === 'both') && translatedName) {
        seen.add(translatedName);
      }

      // Add translated capital names if type is 'capital' or 'both'
      if ((type === 'capital' || type === 'both') && translatedCapital) {
        seen.add(translatedCapital);
      }
    }
  });

  return Array.from(seen).sort((a, b) => a.localeCompare(b));
};
