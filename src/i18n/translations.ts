// Translation dictionaries for the GeoMania app
// To add a new language:
// 1. Add the language code to the SupportedLanguage type
// 2. Create a new translation object following the same structure
// 3. Add it to the translations object

export type SupportedLanguage = 'en' | 'pt-BR';

export interface Translations {
  // Header & Navigation
  appName: string;
  back: string;
  
  // Game modes
  gameModes: {
    flag: string;
    capital: string;
    population: string;
  };
  gameModeDescriptions: {
    flag: string;
    capital: string;
    population: string;
  };
  
  // Landing page
  welcome: string;
  welcomeHighlight: string;
  landingDescription: string;
  quizInfo: string;
  selectDifficulty: string;
  difficultyDescription: string;

  difficulty: {
    easy: string;
    medium: string;
    hard: string;
    super_hard: string;
    god_mode: string;
  };

  difficultyDescriptions: {
    easy: string;
    medium: string;
    hard: string;
    super_hard: string;
    god_mode: string;
  };
  
  // Questions
  flagQuestion: string;
  capitalQuestion: string;
  populationQuestion: string;
  
  // Feedback
  correct: string;
  incorrect: string;
  wrongAnswer: string;
  wrongCapital: string;
  wrongPopulation: string;
  typeYourAnswer: string;
  typeAnswerPlaceholder: string;
  submitAnswer: string;
  invalidAnswer: string;
  
  // Buttons
  nextQuestion: string;
  seeResults: string;
  playAgain: string;
  chooseMode: string;
  autoAdvancing: string;
  
  // Results
  perfectScore: string;
  excellent: string;
  goodJob: string;
  keepLearning: string;
  keepPracticing: string;
  completed: string;
  score: string;
  questions: string;
  accuracy: string;
  questionReview: string;
  
  // Population comparison
  population: string;
  vs: string;
  yourAnswer: string;
  correctAnswer: string;
  
  // Errors
  oops: string;
  failedToLoad: string;
  
  // Language
  language: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    // Header & Navigation
    appName: 'GeoMania',
    back: 'Back',
    
    // Game modes
    gameModes: {
      flag: 'Flag Guess',
      capital: 'Capital Guess',
      population: 'Population Compare',
    },
    gameModeDescriptions: {
      flag: 'Identify countries by their flags',
      capital: 'Match countries with their capital cities',
      population: 'Guess which country has more people',
    },
    
    // Landing page
    welcome: 'Welcome to',
    welcomeHighlight: 'GeoMania',
    landingDescription: 'Test your geography knowledge! Identify flags, capitals, and compare populations from {count} countries around the world.',
    quizInfo: 'Each quiz has 10 questions. Good luck! 🌍',
    selectDifficulty: 'Select Difficulty',
    difficultyDescription: 'Choose your challenge level',
    
    difficulty: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      super_hard: 'Super Hard',
      god_mode: 'God Mode',
    },
    difficultyDescriptions: {
      easy: 'Common countries, distinctive choices',
      medium: 'Mix of well-known and mid-size nations',
      hard: 'Smaller countries, trickier options',
      super_hard: 'Islands, similar flags, close populations',
      god_mode: 'The most obscure nations on Earth',
    },
    
    // Questions
    flagQuestion: 'Which country does this flag belong to?',
    capitalQuestion: 'What is the capital of',
    populationQuestion: 'Which country has the larger population?',
    
    // Feedback
    correct: '🎉 Correct!',
    incorrect: '❌ Wrong!',
    wrongAnswer: 'It was {answer}',
    wrongCapital: 'The capital is {capital}',
    wrongPopulation: '{country} has {population} people',
    typeYourAnswer: 'Type your answer below (country or capital).',
    typeAnswerPlaceholder: 'Start typing a country or capital city...',
    submitAnswer: 'Submit Answer',
    invalidAnswer: 'Choose a valid country or capital from the list.',
    
    // Buttons
    nextQuestion: 'Next Question',
    seeResults: 'See Results',
    playAgain: 'Play Again',
    chooseMode: 'Choose Mode',
    autoAdvancing: 'Auto-advancing...',
    
    // Results
    perfectScore: 'Perfect Score!',
    excellent: 'Excellent!',
    goodJob: 'Good Job!',
    keepLearning: 'Keep Learning!',
    keepPracticing: 'Keep Practicing!',
    completed: 'completed!',
    score: 'Score',
    questions: 'Questions',
    accuracy: 'Accuracy',
    questionReview: 'Question Review',
    
    // Population comparison
    population: 'Pop',
    vs: 'vs',
    yourAnswer: 'Your answer',
    correctAnswer: 'Correct',
    
    // Errors
    oops: 'Oops!',
    failedToLoad: 'Failed to load countries. Please refresh the page.',
    
    // Language
    language: 'Language',
  },
  'pt-BR': {
    // Header & Navigation
    appName: 'GeoMania',
    back: 'Voltar',
    
    // Game modes
    gameModes: {
      flag: 'Adivinhe a Bandeira',
      capital: 'Adivinhe a Capital',
      population: 'Compare Populações',
    },
    gameModeDescriptions: {
      flag: 'Identifique países pelas suas bandeiras',
      capital: 'Relacione países com suas capitais',
      population: 'Adivinhe qual país tem mais habitantes',
    },
    
    // Landing page
    welcome: 'Bem-vindo ao',
    welcomeHighlight: 'GeoMania',
    landingDescription: 'Teste seus conhecimentos de geografia! Identifique bandeiras, capitais e compare populações de {count} países ao redor do mundo.',
    quizInfo: 'Cada quiz tem 10 perguntas. Boa sorte! 🌍',
    selectDifficulty: 'Selecione a Dificuldade',
    difficultyDescription: 'Escolha o seu nível de desafio',

    difficulty: {
      easy: 'Fácil',
      medium: 'Médio',
      hard: 'Difícil',
      super_hard: 'Super Difícil',
      god_mode: 'Modo Deus',
    },
    difficultyDescriptions: {
      easy: 'Países comuns, escolhas distintas',
      medium: 'Mistura de nações conhecidas e médias',
      hard: 'Países menores, opções mais difíceis',
      super_hard: 'Ilhas, bandeiras similares, populações próximas',
      god_mode: 'As nações mais obscuras da Terra',
    },
    
    // Questions
    flagQuestion: 'A qual país pertence esta bandeira?',
    capitalQuestion: 'Qual é a capital de',
    populationQuestion: 'Qual país tem a maior população?',
    
    // Feedback
    correct: '🎉 Correto!',
    incorrect: '❌ Errado!',
    wrongAnswer: 'Era {answer}',
    wrongCapital: 'A capital é {capital}',
    wrongPopulation: '{country} tem {population} habitantes',
    typeYourAnswer: 'Digite sua resposta abaixo (país ou capital).',
    typeAnswerPlaceholder: 'Comece digitando um país ou capital...',
    submitAnswer: 'Enviar resposta',
    invalidAnswer: 'Escolha um país ou capital válido da lista.',
    
    // Buttons
    nextQuestion: 'Próxima Pergunta',
    seeResults: 'Ver Resultados',
    playAgain: 'Jogar Novamente',
    chooseMode: 'Escolher Modo',
    autoAdvancing: 'Avançando automaticamente...',
    
    // Results
    perfectScore: 'Pontuação Perfeita!',
    excellent: 'Excelente!',
    goodJob: 'Bom Trabalho!',
    keepLearning: 'Continue Aprendendo!',
    keepPracticing: 'Continue Praticando!',
    completed: 'concluído!',
    score: 'Pontos',
    questions: 'Perguntas',
    accuracy: 'Precisão',
    questionReview: 'Revisão das Perguntas',
    
    // Population comparison
    population: 'Pop',
    vs: 'vs',
    yourAnswer: 'Sua resposta',
    correctAnswer: 'Correto',
    
    // Errors
    oops: 'Ops!',
    failedToLoad: 'Falha ao carregar países. Por favor, atualize a página.',
    
    // Language
    language: 'Idioma',
  },
};

/**
 * Detects the user's preferred language from browser settings.
 * Returns 'pt-BR' if the browser language starts with 'pt', otherwise 'en'.
 */
export function detectLanguage(): SupportedLanguage {
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || 'en';
  
  if (browserLang.toLowerCase().startsWith('pt')) {
    return 'pt-BR';
  }
  
  return 'en';
}

/**
 * Formats a number according to the locale.
 * Uses appropriate thousands separators for each language.
 */
export function formatNumber(num: number, language: SupportedLanguage): string {
  const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Formats population numbers in a compact way (e.g., 1.5B, 340M, 50K)
 */
export function formatPopulation(pop: number, language: SupportedLanguage): string {
  if (pop >= 1000000000) {
    const value = (pop / 1000000000).toFixed(2);
    return language === 'pt-BR' ? `${value.replace('.', ',')}B` : `${value}B`;
  }
  if (pop >= 1000000) {
    const value = (pop / 1000000).toFixed(1);
    return language === 'pt-BR' ? `${value.replace('.', ',')}M` : `${value}M`;
  }
  if (pop >= 1000) {
    const value = (pop / 1000).toFixed(1);
    return language === 'pt-BR' ? `${value.replace('.', ',')}K` : `${value}K`;
  }
  return formatNumber(pop, language);
}
