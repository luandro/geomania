import { useState, useEffect, useCallback } from 'react';
import { QuizQuestion, Country, Difficulty } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/i18n/use-language';
import { buildAnswerSuggestions, findCountryMatch } from '@/lib/answerMatching';
import { getLocalizedCapital, getLocalizedCountryName } from '@/lib/localization';
import { getAssetUrl } from '@/lib/assets';

interface CapitalQuestionProps {
  question: QuizQuestion;
  onAnswer: (country: Country) => Promise<{ isCorrect: boolean; isLastQuestion: boolean } | undefined>;
  onNext: () => void;
  difficulty: Difficulty;
  allCountries: Country[];
}

export const CapitalQuestion = ({ question, onAnswer, onNext, difficulty, allCountries }: CapitalQuestionProps) => {
  const { t, language } = useLanguage();
  const [selectedAnswer, setSelectedAnswer] = useState<Country | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [inputError, setInputError] = useState('');

  const isGodMode = difficulty === 'god_mode';
  const suggestions = buildAnswerSuggestions(allCountries, language, 'capital');
  const dataListId = `capital-suggestions-${question.id}`;

  const handleAnswer = async (country: Country) => {
    if (answered) return;
    
    setSelectedAnswer(country);
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
    setTypedAnswer('');
    setInputError('');
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

  const getButtonVariant = (option: Country) => {
    if (!answered) return 'quiz';
    
    if (option.id === question.correctAnswer.id) {
      return 'quizCorrect';
    }
    
    if (selectedAnswer?.id === option.id && !isCorrect) {
      return 'quizIncorrect';
    }
    
    return 'quiz';
  };

  const handleSubmitTyped = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (answered) return;

    const match = findCountryMatch(allCountries, typedAnswer, language);

    if (!match) {
      setInputError(t.invalidCapital);
      return;
    }

    setInputError('');
    await handleAnswer(match);
  };

  return (
    <div className="w-full max-w-2xl mx-auto fade-in px-2">
      <div className="mb-6 sm:mb-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          {t.capitalQuestion}
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <img
            src={getAssetUrl(question.correctAnswer.flag_url)}
            alt={getLocalizedCountryName(question.correctAnswer, language)}
            className="w-8 sm:w-10 h-5 sm:h-6 object-contain rounded shadow-sm"
          />
          <span className="text-2xl sm:text-3xl font-extrabold text-primary text-center">
            {getLocalizedCountryName(question.correctAnswer, language)}
          </span>
        </div>
      </div>

      {isGodMode ? (
        <form onSubmit={handleSubmitTyped} className="space-y-3 mb-6 max-w-xl mx-auto">
          <Input
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            placeholder={t.typeCapitalPlaceholder}
            list={dataListId}
            autoComplete="off"
            disabled={answered}
            className="h-12 text-base"
          />
          <datalist id={dataListId}>
            {suggestions.map((suggestion) => (
              <option value={suggestion} key={suggestion} />
            ))}
          </datalist>
          {inputError && <p className="text-sm text-destructive">{inputError}</p>}
          <Button type="submit" variant="hero" size="lg" disabled={answered || !typedAnswer.trim()} className="w-full sm:w-auto">
            {t.submitAnswer}
          </Button>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          {question.options.map((option, index) => (
            <Button
              key={option.id}
              variant={getButtonVariant(option)}
              size="answer"
              onClick={() => handleAnswer(option)}
              disabled={answered}
              className="w-full min-h-[52px] slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {getLocalizedCapital(option, language)}
            </Button>
          ))}
        </div>
      )}

      {answered && (
        <div className="text-center bounce-in">
          <p className={`text-base sm:text-lg font-semibold mb-4 ${isCorrect ? 'text-success' : 'text-destructive'}`}>
            {isCorrect
              ? t.correct
              : `${t.incorrect} ${t.wrongCapital.replace('{capital}', getLocalizedCapital(question.correctAnswer, language))}`
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
