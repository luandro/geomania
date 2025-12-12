export type Difficulty = 'easy' | 'medium' | 'hard' | 'super_hard' | 'god_mode';

export interface Country {
  id: string;
  name: string;
  capital: string;
  flag_url: string;
  population: number;
  region: string;
  difficulty: Difficulty;
}

export interface LocalizedCountryInfo {
  name: string;
  capital: string;
  officialName?: string;
  altNames?: string[];
  altCapitals?: string[];
}

export interface CountryEconomics {
  gdpUsd?: number;
  gdpPerCapitaUsd?: number;
  year?: number;
}

export type PoliticalSpectrum = 'left' | 'center' | 'right' | 'mixed' | 'unknown';

export interface CountryPolitics {
  headOfState?: string;
  headOfGovernment?: string;
  governmentType?: string;
  politicalSpectrum?: PoliticalSpectrum;
  updatedAt?: string;
}

export interface CountryCulture {
  religions?: Array<{ name: string; percentage?: number }>;
  majorSports?: string[];
  updatedAt?: string;
}

export interface CountryCodes {
  iso2?: string;
  iso3?: string;
  numeric?: string;
}

export interface CountryMeta {
  lastUpdated?: Record<string, string>;
  sources?: Record<string, string>;
  notes?: string;
}

export interface CountryData extends Country {
  localizations?: Record<string, LocalizedCountryInfo>;
  economics?: CountryEconomics;
  politics?: CountryPolitics;
  culture?: CountryCulture;
  codes?: CountryCodes;
  meta?: CountryMeta;
}

export type GameMode = 'flag' | 'capital' | 'population';

export interface QuizQuestion {
  id: string;
  correctAnswer: Country;
  options: Country[];
  userAnswer?: Country;
  isCorrect?: boolean;
  // For population mode: store the two countries being compared
  comparedCountries?: [Country, Country];
}

export interface QuizSession {
  id: string;
  gameMode: GameMode;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  questions: QuizQuestion[];
  completed: boolean;
}

export interface GameModeConfig {
  mode: GameMode;
  title: string;
  description: string;
  icon: string;
  color: string;
}
