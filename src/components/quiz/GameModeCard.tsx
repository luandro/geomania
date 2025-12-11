import { Button } from '@/components/ui/button';
import { GameModeConfig } from '@/types/quiz';
import { Flag, Building, Users } from 'lucide-react';

interface GameModeCardProps {
  config: GameModeConfig;
  onSelect: () => void;
  disabled?: boolean;
}

const iconMap = {
  flag: Flag,
  capital: Building,
  population: Users,
};

export const GameModeCard = ({ config, onSelect, disabled }: GameModeCardProps) => {
  const Icon = iconMap[config.mode];
  
  return (
    <Button
      variant="gameMode"
      size="answer"
      onClick={onSelect}
      disabled={disabled}
      className="flex flex-col items-center gap-4 p-8 h-auto w-full max-w-sm"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">{config.title}</h3>
        <p className="text-muted-foreground text-sm">{config.description}</p>
      </div>
    </Button>
  );
};
