import { useState, useCallback } from 'react';
import { Country, GameMode, QuizQuestion, QuizSession, Difficulty } from '@/types/quiz';
import { toast } from '@/hooks/use-toast';

const OPTIONS_COUNT = 4;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getQuestionCount(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 8;
    case 'medium': return 10;
    case 'hard': return 12;
    case 'super_hard': return 15;
    case 'god_mode': return 20;
  }
}

function getCountryPool(countries: Country[], difficulty: Difficulty): Country[] {
  switch (difficulty) {
    case 'easy':
      return countries.filter(c => c.difficulty === 'easy');
    case 'medium':
      return countries.filter(c => c.difficulty === 'easy' || c.difficulty === 'medium');
    case 'hard':
      return countries.filter(c => c.difficulty === 'medium' || c.difficulty === 'hard');
    case 'super_hard':
      return countries.filter(c => c.difficulty === 'hard' || c.difficulty === 'super_hard');
    case 'god_mode':
      // God mode includes super hard and god mode, but fallback to hard if needed
      return countries.filter(c => c.difficulty === 'super_hard' || c.difficulty === 'god_mode');
  }
}

function getDistractors(correct: Country, pool: Country[], difficulty: Difficulty): Country[] {
  let candidates = pool.filter(c => c.id !== correct.id);
  
  if (difficulty === 'hard' || difficulty === 'super_hard' || difficulty === 'god_mode') {
    // Prefer same region for harder difficulties
    const sameRegion = candidates.filter(c => c.region === correct.region);
    // Ensure we have enough candidates in the region
    if (sameRegion.length >= OPTIONS_COUNT - 1) {
      candidates = sameRegion;
    }
  }

  return shuffleArray(candidates).slice(0, OPTIONS_COUNT - 1);
}

function generateQuestions(allCountries: Country[], mode: GameMode, difficulty: Difficulty): QuizQuestion[] {
  let pool = getCountryPool(allCountries, difficulty);
  
  // Robust Fallback: If pool is too small, progressively broaden it
  const requiredCount = getQuestionCount(difficulty);
  const minPoolSize = mode === 'population' ? requiredCount * 2 : requiredCount + OPTIONS_COUNT;

  if (pool.length < minPoolSize) {
    console.warn(`Pool too small for ${difficulty} (${pool.length} items). Broadening pool.`);
    // Try adding 'hard' then 'medium' etc until we have enough
    if (difficulty === 'god_mode') pool = allCountries.filter(c => ['hard', 'super_hard', 'god_mode'].includes(c.difficulty));
    if (pool.length < minPoolSize) pool = allCountries.filter(c => ['medium', 'hard', 'super_hard', 'god_mode'].includes(c.difficulty));
    if (pool.length < minPoolSize) pool = allCountries; // Ultimate fallback
  }

  const validCountries = mode === 'population' 
    ? pool.filter(c => c.population > 0)
    : pool;

  // Final check
  if (validCountries.length < 2) return [];

  if (mode === 'population') {
    // Population Mode Logic
    const questions: QuizQuestion[] = [];
    const usedIds = new Set<string>();

    let pairs: [Country, Country][] = [];
    
    if (difficulty === 'super_hard' || difficulty === 'god_mode') {
      // Sort by population and pick neighbors for challenge
      const sorted = [...validCountries].sort((a, b) => a.population - b.population);
      for (let i = 0; i < sorted.length - 1; i++) {
        pairs.push([sorted[i], sorted[i+1]]);
      }
      pairs = shuffleArray(pairs);
    } else {
      // Random pairs
      const shuffled = shuffleArray(validCountries);
      for (let i = 0; i < shuffled.length - 1; i += 2) {
        pairs.push([shuffled[i], shuffled[i+1]]);
      }
    }

    for (const [countryA, countryB] of pairs) {
      if (questions.length >= requiredCount) break;

      const correctCountry = countryA.population > countryB.population ? countryA : countryB;

      // Randomize the order so the correct answer isn't always on the same side
      const randomOrder = Math.random() < 0.5
        ? [countryA, countryB]
        : [countryB, countryA];

      questions.push({
        id: crypto.randomUUID(),
        correctAnswer: correctCountry,
        options: randomOrder,
        comparedCountries: randomOrder as [Country, Country],
      });
    }

    return questions;
  }

  // Flag & Capital Mode Logic
  const shuffledCountries = shuffleArray(validCountries);
  const selectedCountries = shuffledCountries.slice(0, requiredCount);

  return selectedCountries.map((correctCountry) => {
    // Use the potentially broader pool for distractors too
    const wrongOptions = getDistractors(correctCountry, validCountries, difficulty);
    const allOptions = shuffleArray([correctCountry, ...wrongOptions]);
    
    return {
      id: crypto.randomUUID(),
      correctAnswer: correctCountry,
      options: allOptions,
    };
  });
}

export const useQuiz = (countries: Country[]) => {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startQuiz = useCallback(async (mode: GameMode, difficulty: Difficulty) => {
    if (!countries || countries.length === 0) {
      toast({
        title: "Error",
        description: "No countries data available. Please refresh.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const questions = generateQuestions(countries, mode, difficulty);
    
    if (questions.length === 0) {
      console.error('Failed to generate questions');
      toast({
        title: "Could not start quiz",
        description: `Not enough countries found for ${difficulty} mode. Try a different level.`,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // IMPORTANT: Use the ACTUAL number of questions generated, which might be less than requested if pool is small
    const actualTotalQuestions = questions.length;

    // Prepare a local session so we can start the quiz even if Supabase is unreachable
    const localSession: QuizSession = {
      id: crypto.randomUUID(),
      gameMode: mode,
      difficulty: difficulty,
      score: 0,
      totalQuestions: actualTotalQuestions,
      currentQuestionIndex: 0,
      questions,
      completed: false,
    };

    // No remote persistence; rely solely on local session state
    setSession(localSession);
    setIsLoading(false);
  }, [countries]);

  const answerQuestion = useCallback(async (selectedCountry: Country) => {
    if (!session || session.completed) return;
    
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = selectedCountry.id === currentQuestion.correctAnswer.id;
    
    const updatedQuestions = [...session.questions];
    updatedQuestions[session.currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: selectedCountry,
      isCorrect,
    };
    
    const newScore = isCorrect ? session.score + 1 : session.score;
    const isLastQuestion = session.currentQuestionIndex === session.totalQuestions - 1;
    
    const updatedSession: QuizSession = {
      ...session,
      score: newScore,
      questions: updatedQuestions,
      completed: isLastQuestion,
    };
    
    setSession(updatedSession);
    
    return { isCorrect, isLastQuestion };
  }, [session]);

  const nextQuestion = useCallback(() => {
    if (!session || session.completed) return;
    
    setSession({
      ...session,
      currentQuestionIndex: session.currentQuestionIndex + 1,
    });
  }, [session]);

  const resetQuiz = useCallback(() => {
    setSession(null);
  }, []);

  const currentQuestion = session?.questions[session.currentQuestionIndex];

  return {
    session,
    currentQuestion,
    isLoading,
    startQuiz,
    answerQuestion,
    nextQuestion,
    resetQuiz,
  };
};
