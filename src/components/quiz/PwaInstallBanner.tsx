import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/i18n/use-language';

interface PwaInstallBannerProps {
  canPrompt: boolean;
  showIOSInstructions: boolean;
  onInstall: () => Promise<void> | void;
  onDismiss: () => void;
}

export const PwaInstallBanner = ({
  canPrompt,
  showIOSInstructions,
  onInstall,
  onDismiss,
}: PwaInstallBannerProps) => {
  const { t } = useLanguage();
  const [iosOpen, setIosOpen] = useState(false);

  return (
    <div className="mt-4 sm:mt-6 rounded-2xl border border-primary/20 bg-card/90 p-4 sm:p-5 text-left shadow-lg backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm sm:text-base font-semibold text-foreground">
            {t.installTitle}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t.installBody}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {showIOSInstructions ? (
            <>
              <Button
                variant="hero"
                size="sm"
                onClick={() => setIosOpen(true)}
                className="w-full sm:w-auto"
              >
                {t.installIOSCTA}
              </Button>
              <Dialog open={iosOpen} onOpenChange={setIosOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t.installTitle}</DialogTitle>
                    <DialogDescription>{t.installIOSBody}</DialogDescription>
                  </DialogHeader>
                  <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
                    <li>{t.installIOSStep1}</li>
                    <li>{t.installIOSStep2}</li>
                    <li>{t.installIOSStep3}</li>
                  </ol>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <Button
              variant="hero"
              size="sm"
              onClick={onInstall}
              className="w-full sm:w-auto"
              disabled={!canPrompt}
            >
              {t.installCTA}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIosOpen(false);
              onDismiss();
            }}
            className="w-full sm:w-auto"
          >
            {t.installDismiss}
          </Button>
        </div>
      </div>
    </div>
  );
};
