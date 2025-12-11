export interface Country {
  id: string;
  name: string;
  capital: string;
  flag_url: string;
  population: number;
  region: string;
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
