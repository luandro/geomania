import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Country, GameMode, QuizQuestion, QuizSession } from '@/types/quiz';
import { Json } from '@/integrations/supabase/types';

const TOTAL_QUESTIONS = 10;
const OPTIONS_COUNT = 4;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestions(countries: Country[], mode: GameMode): QuizQuestion[] {
  const shuffledCountries = shuffleArray(countries);
  const selectedCountries = shuffledCountries.slice(0, TOTAL_QUESTIONS);
  
  return selectedCountries.map((correctCountry) => {
    const otherCountries = countries.filter(c => c.id !== correctCountry.id);
    const shuffledOthers = shuffleArray(otherCountries);
    const wrongOptions = shuffledOthers.slice(0, OPTIONS_COUNT - 1);
    
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

  const startQuiz = useCallback(async (mode: GameMode) => {
    if (countries.length < TOTAL_QUESTIONS) return;
    
    setIsLoading(true);
    
    const questions = generateQuestions(countries, mode);
    
    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({
        game_mode: mode,
        score: 0,
        total_questions: TOTAL_QUESTIONS,
        questions_data: questions as unknown as Json,
        completed: false,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating session:', error);
      setIsLoading(false);
      return;
    }
    
    setSession({
      id: data.id,
      gameMode: mode,
      score: 0,
      totalQuestions: TOTAL_QUESTIONS,
      currentQuestionIndex: 0,
      questions,
      completed: false,
    });
    
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
      currentQuestionIndex: isLastQuestion ? session.currentQuestionIndex : session.currentQuestionIndex,
    };
    
    setSession(updatedSession);
    
    await supabase
      .from('quiz_sessions')
      .update({
        score: newScore,
        questions_data: updatedQuestions as unknown as Json,
        completed: isLastQuestion,
      })
      .eq('id', session.id);
    
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
