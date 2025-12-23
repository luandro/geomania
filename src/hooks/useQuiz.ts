import { useState, useCallback } from 'react';
import { Country, GameMode, QuizSession, Difficulty } from '@/types/quiz';
import { toast } from '@/hooks/use-toast';
import { generateQuestions, MapQuestionOptions } from '@/lib/quizGenerator';

export const useQuiz = (countries: Country[]) => {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startQuiz = useCallback(async (
    mode: GameMode,
    difficulty: Difficulty,
    mapOptions?: MapQuestionOptions,
  ) => {
    if (!countries || countries.length === 0) {
      toast({
        title: "Error",
        description: "No countries data available. Please refresh.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const questions = generateQuestions(countries, mode, difficulty, mapOptions);
    
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
      // Don't mark as completed yet - let nextQuestion() do that after feedback is shown
      completed: false,
    };

    setSession(updatedSession);

    return { isCorrect, isLastQuestion };
  }, [session]);

  const nextQuestion = useCallback(() => {
    if (!session || session.completed) return;

    const isLastQuestion = session.currentQuestionIndex === session.totalQuestions - 1;

    if (isLastQuestion) {
      // Mark quiz as completed when moving past the last question
      setSession({
        ...session,
        completed: true,
      });
    } else {
      setSession({
        ...session,
        currentQuestionIndex: session.currentQuestionIndex + 1,
      });
    }
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
