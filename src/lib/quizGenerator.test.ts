import { describe, expect, it } from 'vitest';
import { generateQuestions } from '@/lib/quizGenerator';
import type { Country } from '@/types/quiz';
import type { MapCapitalRecord } from '@/types/map';

const baseCountry = {
  region: 'Test',
  population: 100,
  difficulty: 'easy' as const,
  flag_url: '/flags/test.svg',
};

const makeCountry = (overrides: Partial<Country>): Country => ({
  id: 'id',
  name: 'Name',
  capital: 'Capital',
  ...baseCountry,
  ...overrides,
});

describe('generateQuestions (map modes)', () => {
  it('filters by eligible ISO set for map_country', () => {
    const countries: Country[] = [
      makeCountry({ id: 'a', name: 'Alpha', codes: { iso3: 'AAA' } }),
      makeCountry({ id: 'b', name: 'Beta', codes: { iso3: 'BBB' } }),
    ];

    const questions = generateQuestions(countries, 'map_country', 'easy', {
      eligibleIsoA3: new Set(['BBB']),
    });

    expect(questions.length).toBe(1);
    expect(questions[0].mapPromptType).toBe('country');
    expect(questions[0].correctAnswer.codes?.iso3).toBe('BBB');
  });

  it('respects capital availability for map_capital', () => {
    const countries: Country[] = [
      makeCountry({ id: 'a', name: 'Alpha', codes: { iso3: 'AAA' }, capital: 'Alpha City' }),
      makeCountry({ id: 'b', name: 'Beta', codes: { iso3: 'BBB' }, capital: 'Beta City' }),
    ];
    const capitals: MapCapitalRecord[] = [
      { capital: 'Alpha City', country: 'Alpha', iso_a2: 'AA', iso_a3: 'AAA' },
    ];

    const questions = generateQuestions(countries, 'map_capital', 'easy', {
      eligibleIsoA3: new Set(['AAA', 'BBB']),
      capitals,
    });

    expect(questions.length).toBe(1);
    expect(questions[0].mapPromptType).toBe('capital');
    expect(questions[0].correctAnswer.codes?.iso3).toBe('AAA');
  });
});
