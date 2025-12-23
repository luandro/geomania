import { useState, useEffect, useCallback, useRef } from 'react';
import { QuizQuestion, Country } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';
import { useAutoAdvancePreference } from '@/hooks/useAutoAdvancePreference';
import { formatPopulation } from '@/i18n/translations';
import { getLocalizedCountryName } from '@/lib/localization';
import { getAssetUrl } from '@/lib/assets';
import { AutoAdvanceControls } from './AutoAdvanceControls';

interface PopulationQuestionProps {
  question: QuizQuestion;
  onAnswer: (country: Country) => Promise<{ isCorrect: boolean; isLastQuestion: boolean } | undefined>;
  onNext: () => void;
}

export const PopulationQuestion = ({ question, onAnswer, onNext }: PopulationQuestionProps) => {
  const { t, language } = useLanguage();
  const { autoAdvance, setAutoAdvance } = useAutoAdvancePreference();
  const [selectedAnswer, setSelectedAnswer] = useState<Country | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get the two countries from comparedCountries or fall back to options
  const [countryA, countryB] = question.comparedCountries || [question.options[0], question.options[1]];
  
  // The correct answer is already set as question.correctAnswer
  const correctCountry = question.correctAnswer;

  const handleAnswer = async (country: Country) => {
    if (answered) return;
    
    setSelectedAnswer(country);
    
    // For population mode, pass the selected country directly
    const result = await onAnswer(country);
    
    if (result) {
      setIsCorrect(result.isCorrect);
      setIsLastQuestion(result.isLastQuestion);
      setAnswered(true);
    }
  };

  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  }, []);

  const handleNext = useCallback(() => {
    clearAutoAdvanceTimer();
    setSelectedAnswer(null);
    setAnswered(false);
    onNext();
  }, [clearAutoAdvanceTimer, onNext]);

  // Auto-advance to next question after 1 second
  useEffect(() => {
    if (answered && autoAdvance) {
      autoAdvanceTimer.current = window.setTimeout(() => {
        handleNext();
      }, 1000);
    }
    return () => clearAutoAdvanceTimer();
  }, [answered, autoAdvance, handleNext, clearAutoAdvanceTimer]);

  const getButtonVariant = (country: Country) => {
    if (!answered) return 'quiz';
    
    if (country.id === correctCountry.id) {
      return 'quizCorrect';
    }
    
    if (selectedAnswer?.id === country.id && !isCorrect) {
      return 'quizIncorrect';
    }
    
    return 'quiz';
  };

  return (
    <div className="w-full max-w-2xl mx-auto fade-in px-2">
      <div className="mb-6 sm:mb-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">
          {t.populationQuestion}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {[countryA, countryB].map((country, index) => (
          <Button
            key={country.id}
            variant={getButtonVariant(country)}
            size="answer"
            onClick={() => handleAnswer(country)}
            disabled={answered}
            className="flex flex-col items-center gap-4 sm:gap-5 p-5 sm:p-7 h-auto min-h-[180px] sm:min-h-[220px] slide-up"
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <div className="bg-quiz-flag/50 rounded-lg p-2 sm:p-3">
              <img
                src={getAssetUrl(country.flag_url)}
                alt={t.flagImageAlt}
                className="w-24 sm:w-32 h-16 sm:h-20 object-contain rounded"
              />
            </div>
            <span className="text-base sm:text-lg font-bold text-center leading-tight">
              {getLocalizedCountryName(country, language)}
            </span>
            {answered && (
              <span className="text-xs sm:text-sm font-medium opacity-80">
                {t.population}: {formatPopulation(country.population, language)}
              </span>
            )}
          </Button>
        ))}
      </div>

      {answered && (
        <div className="text-center bounce-in">
          <p className={`text-base sm:text-lg font-semibold mb-4 ${isCorrect ? 'text-success' : 'text-destructive'}`}>
            {isCorrect
              ? t.correct
              : `${t.incorrect} ${t.wrongPopulation.replace('{country}', getLocalizedCountryName(correctCountry, language)).replace('{population}', formatPopulation(correctCountry.population, language))}`
            }
          </p>
        </div>
      )}

      <AutoAdvanceControls
        answered={answered}
        isLastQuestion={isLastQuestion}
        autoAdvance={autoAdvance}
        onToggleAutoAdvance={setAutoAdvance}
        onNext={handleNext}
        autoAdvancingLabel={t.autoAdvancing}
        autoAdvanceLabel={t.autoAdvanceLabel}
        nextLabel={t.nextQuestion}
        resultsLabel={t.seeResults}
      />
    </div>
  );
};
