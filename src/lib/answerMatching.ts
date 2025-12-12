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
  language: SupportedLanguage = 'en'
) => {
  const seen = new Set<string>();

  countries.forEach((country) => {
    if (country.name) seen.add(country.name);
    if (country.capital) seen.add(country.capital);

    if (language === 'pt-BR') {
      const translatedName = ptCountryNames[country.id];
      const translatedCapital = ptCapitalNames[country.id];
      if (translatedName) seen.add(translatedName);
      if (translatedCapital) seen.add(translatedCapital);
    }
  });

  return Array.from(seen).sort((a, b) => a.localeCompare(b));
};
