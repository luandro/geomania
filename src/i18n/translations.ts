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
    map: string;
    mapCountry: string;
    mapCapital: string;
  };
  gameModeDescriptions: {
    flag: string;
    capital: string;
    population: string;
    map: string;
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
  mapPromptCountry: string;
  mapPromptCapital: string;
  mapTitle: string;
  mapCapitalLabel: string;
  mapHint: string;
  mapRecenter: string;
  mapZoomToSelection: string;
  mapLoading: string;
  
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
  retry: string;
  autoAdvancing: string;
  autoAdvanceLabel: string;
  dismiss: string;
  mapModeCountry: string;
  mapModeCapital: string;

  // Install
  installTitle: string;
  installBody: string;
  installCTA: string;
  installDismiss: string;
  installIOSCTA: string;
  installIOSBody: string;
  installIOSStep1: string;
  installIOSStep2: string;
  installIOSStep3: string;

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
  copyEmail: string;
  emailCopied: string;
  openMailApp: string;
  
  // Results
  perfectScore: string;
  perfectScoreBadge: string;
  perfectScorePrompt: string;
  excellent: string;
  goodJob: string;
  keepLearning: string;
  keepPracticing: string;
  completed: string;
  score: string;
  questions: string;
  accuracy: string;
  questionReview: string;
  viewLeaderboard: string;
  saveScore: string;
  skipScore: string;
  savingScore: string;
  savedScore: string;
  savedScoreOffline: string;

  // Scoreboards
  scoreboards: string;
  scoreboardsSubtitle: string;
  backToHome: string;
  loadingScoreboards: string;
  scoreboardsError: string;
  scoreboardsEmpty: string;
  scoreboardsEmptyOffline: string;
  scoreboardsOfflineNotice: string;
  scoreboardsStaleNotice: string;
  scoreboardsUpdated: string;
  initials: string;
  difficultyShort: string;
  date: string;
  today: string;
  daysAgo: string;
  
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
  mapDownloadingTitle: string;
  mapDownloadingBody: string;
  mapDownloadProgress: string;
  mapOfflineTitle: string;
  mapOfflineBody: string;
  mapLoadFailed: string;
  
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
      map: 'Map Guess',
      mapCountry: 'Map Guess — Country',
      mapCapital: 'Map Guess — Capital',
    },
    gameModeDescriptions: {
      flag: 'Identify countries by their flags',
      capital: 'Match countries with their capital cities',
      population: 'Guess which country has more people',
      map: 'Tap the correct country on a blank map',
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
    mapPromptCountry: 'Find {country} on the map.',
    mapPromptCapital: 'Find the country for {capital}.',
    mapTitle: 'Find on the map',
    mapCapitalLabel: 'Capital',
    mapHint: 'Tap a country on the map to answer.',
    mapRecenter: 'Recenter',
    mapZoomToSelection: 'Zoom to selection',
    mapLoading: 'Loading map...',
    
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
    retry: 'Retry',
    autoAdvancing: 'Auto-advancing...',
    autoAdvanceLabel: 'Auto-advance',
    dismiss: 'Got it',
    mapModeCountry: 'Country → Map',
    mapModeCapital: 'Capital → Map',

    // Install
    installTitle: 'Install Geomania',
    installBody: 'Play faster and keep it offline with one tap.',
    installCTA: 'Install',
    installDismiss: 'Not now',
    installIOSCTA: 'How to install',
    installIOSBody: 'Install on iPhone or iPad:',
    installIOSStep1: 'Tap the Share button in Safari.',
    installIOSStep2: 'Scroll and choose Add to Home Screen.',
    installIOSStep3: 'Confirm to add Geomania.',

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
    copyEmail: 'Copy email',
    emailCopied: 'Email copied!',
    openMailApp: 'Open Mail App',
    
    // Results
    perfectScore: 'Perfect Score!',
    perfectScoreBadge: 'Perfect Score',
    perfectScorePrompt: 'Perfect Score! Enter your initials',
    excellent: 'Excellent!',
    goodJob: 'Good Job!',
    keepLearning: 'Keep Learning!',
    keepPracticing: 'Keep Practicing!',
    completed: 'completed!',
    score: 'Score',
    questions: 'Questions',
    accuracy: 'Accuracy',
    questionReview: 'Question Review',
    viewLeaderboard: 'View Leaderboard',
    saveScore: 'Save Score',
    skipScore: 'Skip',
    savingScore: 'Saving...',
    savedScore: 'Saved!',
    savedScoreOffline: 'Saved locally — will upload when online',

    // Scoreboards
    scoreboards: 'Scoreboards',
    scoreboardsSubtitle: 'Atari-style hall of fame per mode.',
    backToHome: 'Back to Home',
    loadingScoreboards: 'Loading scoreboards...',
    scoreboardsError: 'Could not load scoreboards.',
    scoreboardsEmpty: 'No scores yet. Be the first!',
    scoreboardsEmptyOffline: 'No leaderboard cached yet. Play once online to load.',
    scoreboardsOfflineNotice: 'Offline — showing cached scores',
    scoreboardsStaleNotice: 'Could not refresh — showing cached scores',
    scoreboardsUpdated: 'Updated {time}',
    initials: 'Initials',
    difficultyShort: 'Diff',
    date: 'Date',
    today: 'Today',
    daysAgo: '{days}d ago',
    
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
    mapDownloadingTitle: 'Downloading offline map...',
    mapDownloadingBody: 'Preparing map data so Map Guess works offline.',
    mapDownloadProgress: '{current}/{total} files',
    mapOfflineTitle: 'Map data not ready',
    mapOfflineBody: "You're offline and the map data isn't cached yet. Connect once to download the map.",
    mapLoadFailed: 'Could not load the map data. Please try again.',
    
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
      map: 'Adivinhe no Mapa',
      mapCountry: 'Mapa — País',
      mapCapital: 'Mapa — Capital',
    },
    gameModeDescriptions: {
      flag: 'Identifique países pelas suas bandeiras',
      capital: 'Relacione países com suas capitais',
      population: 'Adivinhe qual país tem mais habitantes',
      map: 'Toque no país correto em um mapa sem nomes',
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
    mapPromptCountry: 'Encontre {country} no mapa.',
    mapPromptCapital: 'Encontre o país de {capital}.',
    mapTitle: 'Encontre no mapa',
    mapCapitalLabel: 'Capital',
    mapHint: 'Toque em um país no mapa para responder.',
    mapRecenter: 'Recentrar',
    mapZoomToSelection: 'Zoom na seleção',
    mapLoading: 'Carregando mapa...',
    
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
    retry: 'Tentar novamente',
    autoAdvancing: 'Avançando automaticamente...',
    autoAdvanceLabel: 'Avanço automático',
    dismiss: 'Entendi',
    mapModeCountry: 'País → Mapa',
    mapModeCapital: 'Capital → Mapa',

    // Install
    installTitle: 'Instale o GeoMania',
    installBody: 'Jogue mais rápido e mantenha offline com um toque.',
    installCTA: 'Instalar',
    installDismiss: 'Agora não',
    installIOSCTA: 'Como instalar',
    installIOSBody: 'Instale no iPhone ou iPad:',
    installIOSStep1: 'Toque no botão Compartilhar no Safari.',
    installIOSStep2: 'Role e toque em Adicionar à Tela de Início.',
    installIOSStep3: 'Confirme para adicionar o GeoMania.',

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
    copyEmail: 'Copiar e-mail',
    emailCopied: 'E-mail copiado!',
    openMailApp: 'Abrir App de Email',
    
    // Results
    perfectScore: 'Pontuação Perfeita!',
    perfectScoreBadge: 'Pontuação Perfeita',
    perfectScorePrompt: 'Pontuação perfeita! Digite suas iniciais',
    excellent: 'Excelente!',
    goodJob: 'Bom Trabalho!',
    keepLearning: 'Continue Aprendendo!',
    keepPracticing: 'Continue Praticando!',
    completed: 'concluído!',
    score: 'Pontos',
    questions: 'Perguntas',
    accuracy: 'Precisão',
    questionReview: 'Revisão das Perguntas',
    viewLeaderboard: 'Ver Placar',
    saveScore: 'Salvar Pontuação',
    skipScore: 'Pular',
    savingScore: 'Salvando...',
    savedScore: 'Salvo!',
    savedScoreOffline: 'Salvo localmente — enviaremos quando ficar online',

    // Scoreboards
    scoreboards: 'Placares',
    scoreboardsSubtitle: 'Hall da fama em estilo Atari por modo.',
    backToHome: 'Voltar ao início',
    loadingScoreboards: 'Carregando placares...',
    scoreboardsError: 'Não foi possível carregar os placares.',
    scoreboardsEmpty: 'Sem pontuações ainda. Seja o primeiro!',
    scoreboardsEmptyOffline: 'Nenhum placar em cache ainda. Jogue online uma vez para carregar.',
    scoreboardsOfflineNotice: 'Offline — mostrando placares em cache',
    scoreboardsStaleNotice: 'Não foi possível atualizar — mostrando placares em cache',
    scoreboardsUpdated: 'Atualizado {time}',
    initials: 'Iniciais',
    difficultyShort: 'Dif',
    date: 'Data',
    today: 'Hoje',
    daysAgo: 'há {days}d',
    
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
    mapDownloadingTitle: 'Baixando mapa offline...',
    mapDownloadingBody: 'Preparando os dados do mapa para jogar offline.',
    mapDownloadProgress: '{current}/{total} arquivos',
    mapOfflineTitle: 'Mapa ainda não disponível',
    mapOfflineBody: 'Você está offline e o mapa ainda não foi baixado. Conecte-se uma vez para fazer o download.',
    mapLoadFailed: 'Não foi possível carregar o mapa. Tente novamente.',
    
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
