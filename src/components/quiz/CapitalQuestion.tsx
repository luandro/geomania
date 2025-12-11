import { useState } from 'react';
import { QuizQuestion, Country } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';

interface CapitalQuestionProps {
  question: QuizQuestion;
  onAnswer: (country: Country) => Promise<{ isCorrect: boolean; isLastQuestion: boolean } | undefined>;
  onNext: () => void;
}

export const CapitalQuestion = ({ question, onAnswer, onNext }: CapitalQuestionProps) => {
  const { t } = useLanguage();
  const [selectedAnswer, setSelectedAnswer] = useState<Country | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLastQuestion, setIsLastQuestion] = useState(false);

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

  const handleNext = () => {
    setSelectedAnswer(null);
    setAnswered(false);
    onNext();
  };

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

  return (
    <div className="w-full max-w-2xl mx-auto fade-in px-2">
      <div className="mb-6 sm:mb-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          {t.capitalQuestion}
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <img
            src={question.correctAnswer.flag_url}
            alt={question.correctAnswer.name}
            className="w-10 sm:w-12 h-6 sm:h-8 object-contain rounded shadow-sm"
          />
          <span className="text-2xl sm:text-3xl font-extrabold text-primary text-center">
            {question.correctAnswer.name}
          </span>
        </div>
      </div>

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
            {option.capital}
          </Button>
        ))}
      </div>

      {answered && (
        <div className="text-center bounce-in">
          <p className={`text-base sm:text-lg font-semibold mb-4 ${isCorrect ? 'text-success' : 'text-destructive'}`}>
            {isCorrect 
              ? t.correct 
              : `${t.incorrect} ${t.wrongCapital.replace('{capital}', question.correctAnswer.capital)}`
            }
          </p>
          <Button variant="hero" size="lg" onClick={handleNext} className="w-full sm:w-auto">
            {isLastQuestion ? t.seeResults : t.nextQuestion}
          </Button>
        </div>
      )}
    </div>
  );
};
