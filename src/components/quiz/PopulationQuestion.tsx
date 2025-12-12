import { useState, useEffect, useCallback } from 'react';
import { QuizQuestion, Country } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';
import { formatPopulation } from '@/i18n/translations';
import { getLocalizedCountryName } from '@/lib/localization';
import { getAssetUrl } from '@/lib/assets';

interface PopulationQuestionProps {
  question: QuizQuestion;
  onAnswer: (country: Country) => Promise<{ isCorrect: boolean; isLastQuestion: boolean } | undefined>;
  onNext: () => void;
}

export const PopulationQuestion = ({ question, onAnswer, onNext }: PopulationQuestionProps) => {
  const { t, language } = useLanguage();
  const [selectedAnswer, setSelectedAnswer] = useState<Country | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLastQuestion, setIsLastQuestion] = useState(false);

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

  const handleNext = useCallback(() => {
    setSelectedAnswer(null);
    setAnswered(false);
    onNext();
  }, [onNext]);

  // Auto-advance to next question after 1 second
  useEffect(() => {
    if (answered) {
      const timer = setTimeout(() => {
        handleNext();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [answered, handleNext]);

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
            className="flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 h-auto min-h-[140px] sm:min-h-[180px] slide-up"
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <img
              src={getAssetUrl(country.flag_url)}
              alt={t.flagImageAlt}
              className="w-14 sm:w-16 h-8 sm:h-10 object-contain rounded shadow-sm"
            />
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
          <div className="flex flex-col items-center gap-2">
            <div className="w-full sm:w-64 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-[shrink_1s_linear_forwards]" style={{ width: '100%' }} />
            </div>
            <p className="text-xs text-muted-foreground">{t.autoAdvancing}</p>
          </div>
        </div>
      )}
    </div>
  );
};
