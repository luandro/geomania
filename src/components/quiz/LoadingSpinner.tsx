import { Globe } from 'lucide-react';

export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="relative">
        <Globe className="w-16 h-16 text-primary animate-pulse" />
        <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping" />
      </div>
      <p className="text-muted-foreground font-medium animate-pulse">
        Loading countries...
      </p>
    </div>
  );
};
