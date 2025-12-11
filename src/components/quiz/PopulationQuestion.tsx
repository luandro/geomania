import { useState, useMemo } from 'react';
import { QuizQuestion, Country } from '@/types/quiz';
import { Button } from '@/components/ui/button';

interface PopulationQuestionProps {
  question: QuizQuestion;
  onAnswer: (country: Country) => Promise<{ isCorrect: boolean; isLastQuestion: boolean } | undefined>;
  onNext: () => void;
}

export const PopulationQuestion = ({ question, onAnswer, onNext }: PopulationQuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<Country | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLastQuestion, setIsLastQuestion] = useState(false);

  // Pick two countries for comparison
  const [countryA, countryB] = useMemo(() => {
    const sorted = [...question.options].sort((a, b) => b.population - a.population);
    return [sorted[0], sorted[1]];
  }, [question.options]);

  // The correct answer is the one with higher population
  const correctCountry = countryA.population > countryB.population ? countryA : countryB;

  const handleAnswer = async (country: Country) => {
    if (answered) return;
    
    setSelectedAnswer(country);
    
    // For population mode, we check against the higher population country
    const correct = country.id === correctCountry.id;
    setIsCorrect(correct);
    
    const result = await onAnswer(correct ? question.correctAnswer : question.options[0]);
    
    if (result) {
      setIsLastQuestion(result.isLastQuestion);
      setAnswered(true);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setAnswered(false);
    onNext();
  };

  const formatPopulation = (pop: number) => {
    if (pop >= 1000000000) return `${(pop / 1000000000).toFixed(2)}B`;
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop >= 1000) return `${(pop / 1000).toFixed(1)}K`;
    return pop.toString();
  };

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
    <div className="w-full max-w-2xl mx-auto fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-6 text-foreground">
          Which country has the larger population?
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {[countryA, countryB].map((country, index) => (
          <Button
            key={country.id}
            variant={getButtonVariant(country)}
            size="answer"
            onClick={() => handleAnswer(country)}
            disabled={answered}
            className={`flex flex-col items-center gap-4 p-6 h-auto slide-up`}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <img
              src={country.flag_url}
              alt={country.name}
              className="w-24 h-16 object-contain rounded shadow-sm"
            />
            <span className="text-lg font-bold">{country.name}</span>
            {answered && (
              <span className="text-sm font-medium opacity-80">
                Pop: {formatPopulation(country.population)}
              </span>
            )}
          </Button>
        ))}
      </div>

      {answered && (
        <div className="text-center bounce-in">
          <p className={`text-lg font-semibold mb-4 ${isCorrect ? 'text-success' : 'text-destructive'}`}>
            {isCorrect 
              ? '🎉 Correct!' 
              : `❌ Wrong! ${correctCountry.name} has ${formatPopulation(correctCountry.population)} people`
            }
          </p>
          <Button variant="hero" size="lg" onClick={handleNext}>
            {isLastQuestion ? 'See Results' : 'Next Question'}
          </Button>
        </div>
      )}
    </div>
  );
};
