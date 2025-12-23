import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-md",
        quiz: "bg-card text-card-foreground border-2 border-border hover:border-primary hover:bg-primary/5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-foreground/80",
        quizCorrect: "bg-success text-success-foreground border-2 border-success shadow-md",
        quizIncorrect: "bg-destructive text-destructive-foreground border-2 border-destructive shadow-md",
        hero: "bg-gradient-to-r from-black via-secondary to-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300",
        gameMode: "bg-transparent text-foreground border-0 shadow-none transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
        answer: "h-auto min-h-[60px] px-6 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
