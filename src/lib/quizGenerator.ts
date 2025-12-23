import { Country, Difficulty, GameMode, QuizQuestion } from '@/types/quiz';
import { MapCapitalRecord } from '@/types/map';
import { FLAG_MODE_EXCLUDED_COUNTRY_IDS } from '@/data/flagConflicts';

const OPTIONS_COUNT = 4;

export type MapQuestionOptions = {
  eligibleIsoA3?: Set<string>;
  capitals?: MapCapitalRecord[];
};

const isMapMode = (mode: GameMode) => mode === 'map_country' || mode === 'map_capital';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getQuestionCount(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 8;
    case 'medium':
      return 10;
    case 'hard':
      return 12;
    case 'super_hard':
      return 15;
    case 'god_mode':
      return 20;
  }
}

function getCountryPool(countries: Country[], difficulty: Difficulty): Country[] {
  switch (difficulty) {
    case 'easy':
      return countries.filter((c) => c.difficulty === 'easy');
    case 'medium':
      return countries.filter((c) => c.difficulty === 'easy' || c.difficulty === 'medium');
    case 'hard':
      return countries.filter((c) => c.difficulty === 'medium' || c.difficulty === 'hard');
    case 'super_hard':
      return countries.filter((c) => c.difficulty === 'hard' || c.difficulty === 'super_hard');
    case 'god_mode':
      return countries.filter((c) => c.difficulty === 'super_hard' || c.difficulty === 'god_mode');
  }
}

function getDistractors(correct: Country, pool: Country[], difficulty: Difficulty): Country[] {
  let candidates = pool.filter((c) => c.id !== correct.id);

  if (difficulty === 'hard' || difficulty === 'super_hard' || difficulty === 'god_mode') {
    const sameRegion = candidates.filter((c) => c.region === correct.region);
    if (sameRegion.length >= OPTIONS_COUNT - 1) {
      candidates = sameRegion;
    }
  }

  return shuffleArray(candidates).slice(0, OPTIONS_COUNT - 1);
}

const filterMapEligible = (countries: Country[], eligibleIsoA3?: Set<string>) => {
  return countries.filter((country) => {
    const iso3 = country.codes?.iso3;
    if (!iso3) return false;
    return eligibleIsoA3 ? eligibleIsoA3.has(iso3) : true;
  });
};

export function generateQuestions(
  allCountries: Country[],
  mode: GameMode,
  difficulty: Difficulty,
  mapOptions?: MapQuestionOptions,
): QuizQuestion[] {
  let pool = getCountryPool(allCountries, difficulty);
  const requiredCount = getQuestionCount(difficulty);

  if (isMapMode(mode)) {
    pool = filterMapEligible(pool, mapOptions?.eligibleIsoA3);
  }

  const minPoolSize = mode === 'population'
    ? requiredCount * 2
    : mode === 'flag' || mode === 'capital'
      ? requiredCount + OPTIONS_COUNT
      : requiredCount;

  if (pool.length < minPoolSize) {
    console.warn(`Pool too small for ${difficulty} (${pool.length} items). Broadening pool.`);
    if (difficulty === 'god_mode') pool = allCountries.filter((c) => ['hard', 'super_hard', 'god_mode'].includes(c.difficulty));
    if (pool.length < minPoolSize) pool = allCountries.filter((c) => ['medium', 'hard', 'super_hard', 'god_mode'].includes(c.difficulty));
    if (pool.length < minPoolSize) pool = allCountries;
    if (isMapMode(mode)) {
      pool = filterMapEligible(pool, mapOptions?.eligibleIsoA3);
    }
  }

  let validCountries = mode === 'population'
    ? pool.filter((c) => c.population > 0)
    : mode === 'capital' || mode === 'map_capital'
      ? pool.filter((c) => c.capital && c.capital.trim().length > 0)
      : pool;

  if (mode === 'map_capital' && mapOptions?.capitals?.length) {
    const capitalIsoSet = new Set(mapOptions.capitals.map((entry) => entry.iso_a3));
    validCountries = validCountries.filter((country) => {
      const iso3 = country.codes?.iso3;
      return iso3 ? capitalIsoSet.has(iso3) : false;
    });
  }

  if (mode === 'flag' && FLAG_MODE_EXCLUDED_COUNTRY_IDS.size) {
    validCountries = validCountries.filter((c) => !FLAG_MODE_EXCLUDED_COUNTRY_IDS.has(c.id));
  }

  if (validCountries.length < 2 && mode !== 'map_country' && mode !== 'map_capital') return [];
  if ((mode === 'map_country' || mode === 'map_capital') && validCountries.length < 1) return [];

  if (mode === 'population') {
    const questions: QuizQuestion[] = [];
    let pairs: [Country, Country][] = [];

    if (difficulty === 'super_hard' || difficulty === 'god_mode') {
      const sorted = [...validCountries].sort((a, b) => a.population - b.population);
      for (let i = 0; i < sorted.length - 1; i++) {
        pairs.push([sorted[i], sorted[i + 1]]);
      }
      pairs = shuffleArray(pairs);
    } else {
      const shuffled = shuffleArray(validCountries);
      for (let i = 0; i < shuffled.length - 1; i += 2) {
        pairs.push([shuffled[i], shuffled[i + 1]]);
      }
    }

    for (const [countryA, countryB] of pairs) {
      if (questions.length >= requiredCount) break;

      const correctCountry = countryA.population > countryB.population ? countryA : countryB;
      const randomOrder = Math.random() < 0.5 ? [countryA, countryB] : [countryB, countryA];

      questions.push({
        id: crypto.randomUUID(),
        correctAnswer: correctCountry,
        options: randomOrder,
        comparedCountries: randomOrder as [Country, Country],
      });
    }

    return questions;
  }

  const shuffledCountries = shuffleArray(validCountries);
  const selectedCountries = shuffledCountries.slice(0, requiredCount);

  if (mode === 'map_country' || mode === 'map_capital') {
    return selectedCountries.map((correctCountry) => ({
      id: crypto.randomUUID(),
      correctAnswer: correctCountry,
      options: [correctCountry],
      mapPromptType: mode === 'map_capital' ? 'capital' : 'country',
    }));
  }

  return selectedCountries.map((correctCountry) => {
    const wrongOptions = getDistractors(correctCountry, validCountries, difficulty);
    const allOptions = shuffleArray([correctCountry, ...wrongOptions]);

    return {
      id: crypto.randomUUID(),
      correctAnswer: correctCountry,
      options: allOptions,
    };
  });
}
