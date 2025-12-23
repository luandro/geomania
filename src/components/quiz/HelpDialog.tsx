import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';
import { Copy, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface HelpDialogProps {
  trigger: ReactNode;
}

export const HelpDialog = ({ trigger }: HelpDialogProps) => {
  const { t } = useLanguage();
  const mailto = `mailto:${t.feedbackEmail}?subject=${encodeURIComponent(t.feedbackSubject)}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(t.feedbackEmail);
    toast.success(t.emailCopied);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl text-left">
        <DialogHeader>
          <DialogTitle>{t.helpTitle}</DialogTitle>
          <DialogDescription>{t.helpDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div>
            <h4 className="text-sm font-semibold text-foreground">{t.helpBasicsTitle}</h4>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
              <li>{t.helpBasicsItem1}</li>
              <li>{t.helpBasicsItem2}</li>
              <li>{t.helpBasicsItem3}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">{t.helpDifficultyTitle}</h4>
            <p className="mt-2 text-muted-foreground">{t.helpDifficultyBody}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">{t.helpAccessibilityTitle}</h4>
            <p className="mt-2 text-muted-foreground">{t.helpAccessibilityBody}</p>
          </div>

          <div className="rounded-lg border border-primary/20 bg-muted/40 p-3">
            <h4 className="text-sm font-semibold text-foreground">{t.helpFeedbackTitle}</h4>
            <p className="mt-2 text-muted-foreground">{t.helpFeedbackBody}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={handleCopyEmail} variant="hero" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                {t.copyEmail}
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={mailto}>
                  <Mail className="mr-2 h-4 w-4" />
                  {t.openMailApp}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
