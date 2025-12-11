import { Country } from '@/types/quiz';

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const findCountryMatch = (countries: Country[], rawAnswer: string) => {
  if (!rawAnswer) return undefined;

  const answer = normalize(rawAnswer);

  return countries.find((country) => {
    const nameMatch = normalize(country.name) === answer;
    const capitalMatch =
      country.capital && normalize(country.capital) === answer;
    return nameMatch || capitalMatch;
  });
};

export const buildAnswerSuggestions = (countries: Country[]) => {
  const seen = new Set<string>();

  countries.forEach((country) => {
    if (country.name) seen.add(country.name);
    if (country.capital) seen.add(country.capital);
  });

  return Array.from(seen).sort((a, b) => a.localeCompare(b));
};
