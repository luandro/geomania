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
  flagImageAlt: string; // Generic alt text for flag images during quiz
  
  // Feedback
  correct: string;
  incorrect: string;
  wrongAnswer: string;
  wrongCapital: string;
  wrongPopulation: string;
  typeYourAnswer: string;
  typeAnswerPlaceholder: string;
  typeCountryPlaceholder: string;
  typeCapitalPlaceholder: string;
  submitAnswer: string;
  invalidAnswer: string;
  invalidCountry: string;
  invalidCapital: string;
  
  // Buttons
  nextQuestion: string;
  seeResults: string;
  playAgain: string;
  chooseMode: string;
  autoAdvancing: string;
  autoAdvanceLabel: string;

  // Help & feedback
  help: string;
  helpTitle: string;
  helpDescription: string;
  helpBasicsTitle: string;
  helpBasicsItem1: string;
  helpBasicsItem2: string;
  helpBasicsItem3: string;
  helpDifficultyTitle: string;
  helpDifficultyBody: string;
  helpAccessibilityTitle: string;
  helpAccessibilityBody: string;
  helpFeedbackTitle: string;
  helpFeedbackBody: string;
  feedbackButton: string;
  feedbackEmail: string;
  feedbackSubject: string;
  
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

  // Updates & Offline
  dataUpdated: string;
  dataUpdatedDesc: string;
  offlineReady: string;
  offlineReadyDesc: string;
  
  // Language
  language: string;
  languageNames: {
    en: string;
    'pt-BR': string;
  };
  madeWith: string;
}

const DEFAULT_FEEDBACK_EMAIL = 'luandro@gmail.com';

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
    quizInfo: 'Question count scales with difficulty: Easy 8, Medium 10, Hard 12, Super Hard 15, God Mode 20.',
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
    flagImageAlt: 'Country flag',
    
    // Feedback
    correct: '🎉 Correct!',
    incorrect: '❌ Wrong!',
    wrongAnswer: 'It was {answer}',
    wrongCapital: 'The capital is {capital}',
    wrongPopulation: '{country} has {population} people',
    typeYourAnswer: 'Type your answer below (country or capital).',
    typeAnswerPlaceholder: 'Start typing a country or capital city...',
    typeCountryPlaceholder: 'Start typing the country name...',
    typeCapitalPlaceholder: 'Start typing the capital city...',
    submitAnswer: 'Submit Answer',
    invalidAnswer: 'Choose a valid country or capital from the list.',
    invalidCountry: 'Choose a valid country from the list.',
    invalidCapital: 'Choose a valid capital from the list.',
    
    // Buttons
    nextQuestion: 'Next Question',
    seeResults: 'See Results',
    playAgain: 'Play Again',
    chooseMode: 'Choose Mode',
    autoAdvancing: 'Auto-advancing...',
    autoAdvanceLabel: 'Auto-advance',

    // Help & feedback
    help: 'Help',
    helpTitle: 'How to Play',
    helpDescription: 'Quick rules and accessibility tips.',
    helpBasicsTitle: 'Basics',
    helpBasicsItem1: 'Pick a mode, then choose a difficulty.',
    helpBasicsItem2: 'Answer each question; you get 1 point for every correct answer.',
    helpBasicsItem3: 'Your progress is shown in the top bar.',
    helpDifficultyTitle: 'Question counts',
    helpDifficultyBody: 'Easy 8 · Medium 10 · Hard 12 · Super Hard 15 · God Mode 20.',
    helpAccessibilityTitle: 'Accessibility',
    helpAccessibilityBody: 'Use Tab/Shift+Tab to move, Enter/Space to select. Toggle auto-advance off if you want more time.',
    helpFeedbackTitle: 'Feedback',
    helpFeedbackBody: 'Found a bug or have an idea? Send us a note.',
    feedbackButton: 'Send feedback',
    feedbackEmail: DEFAULT_FEEDBACK_EMAIL,
    feedbackSubject: 'GeoMania feedback',
    
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

    // Updates & Offline
    dataUpdated: 'Data Updated',
    dataUpdatedDesc: 'New questions and countries available.',
    offlineReady: 'Offline Ready',
    offlineReadyDesc: 'You can now play offline with full flag support.',
    
    // Language
    language: 'Language',
    languageNames: {
      en: 'English',
      'pt-BR': 'Português',
    },
    madeWith: 'Made with 💜 for Kira',
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
    quizInfo: 'O número de perguntas varia conforme a dificuldade: Fácil 8, Médio 10, Difícil 12, Super Difícil 15, Modo Deus 20.',
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
    flagImageAlt: 'Bandeira de país',
    
    // Feedback
    correct: '🎉 Correto!',
    incorrect: '❌ Errado!',
    wrongAnswer: 'Era {answer}',
    wrongCapital: 'A capital é {capital}',
    wrongPopulation: '{country} tem {population} habitantes',
    typeYourAnswer: 'Digite sua resposta abaixo (país ou capital).',
    typeAnswerPlaceholder: 'Comece digitando um país ou capital...',
    typeCountryPlaceholder: 'Comece digitando o nome do país...',
    typeCapitalPlaceholder: 'Comece digitando a capital...',
    submitAnswer: 'Enviar resposta',
    invalidAnswer: 'Escolha um país ou capital válido da lista.',
    invalidCountry: 'Escolha um país válido da lista.',
    invalidCapital: 'Escolha uma capital válida da lista.',
    
    // Buttons
    nextQuestion: 'Próxima Pergunta',
    seeResults: 'Ver Resultados',
    playAgain: 'Jogar Novamente',
    chooseMode: 'Escolher Modo',
    autoAdvancing: 'Avançando automaticamente...',
    autoAdvanceLabel: 'Avanço automático',

    // Help & feedback
    help: 'Ajuda',
    helpTitle: 'Como jogar',
    helpDescription: 'Regras rápidas e dicas de acessibilidade.',
    helpBasicsTitle: 'Básico',
    helpBasicsItem1: 'Escolha um modo e depois a dificuldade.',
    helpBasicsItem2: 'Cada resposta correta vale 1 ponto.',
    helpBasicsItem3: 'Seu progresso aparece no topo.',
    helpDifficultyTitle: 'Número de perguntas',
    helpDifficultyBody: 'Fácil 8 · Médio 10 · Difícil 12 · Super Difícil 15 · Modo Deus 20.',
    helpAccessibilityTitle: 'Acessibilidade',
    helpAccessibilityBody: 'Use Tab/Shift+Tab para navegar e Enter/Espaço para selecionar. Desative o avanço automático se precisar de mais tempo.',
    helpFeedbackTitle: 'Feedback',
    helpFeedbackBody: 'Encontrou um bug ou tem uma ideia? Mande uma mensagem.',
    feedbackButton: 'Enviar feedback',
    feedbackEmail: DEFAULT_FEEDBACK_EMAIL,
    feedbackSubject: 'Feedback do GeoMania',
    
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

    // Updates & Offline
    dataUpdated: 'Dados Atualizados',
    dataUpdatedDesc: 'Novas perguntas e países disponíveis.',
    offlineReady: 'Pronto para Offline',
    offlineReadyDesc: 'Agora você pode jogar offline com suporte completo a bandeiras.',
    
    // Language
    language: 'Idioma',
    languageNames: {
      en: 'English',
      'pt-BR': 'Português',
    },
    madeWith: 'Feito com 💜 para Kira',
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
