import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { QuizQuestion, Country } from '@/types/quiz';
import { MapData } from '@/types/map';
import { useLanguage } from '@/i18n/use-language';
import { useAutoAdvancePreference } from '@/hooks/useAutoAdvancePreference';
import { useIsMobile } from '@/hooks/use-mobile';
import { getLocalizedCapital, getLocalizedCountryName } from '@/lib/localization';
import { getAssetUrl } from '@/lib/assets';
import { AutoAdvanceControls } from './AutoAdvanceControls';
import { Button } from '@/components/ui/button';

interface MapQuestionProps {
  question: QuizQuestion;
  onAnswer: (country: Country) => Promise<{ isCorrect: boolean; isLastQuestion: boolean } | undefined>;
  onNext: () => void;
  mapData: MapData | null;
  allCountries?: Country[];
}

const HINT_STORAGE_KEY = 'geomania:mapHintDismissed';

export const MapQuestion = ({ question, onAnswer, onNext, mapData, allCountries = [] }: MapQuestionProps) => {
  const { t, language } = useLanguage();
  const { autoAdvance, setAutoAdvance } = useAutoAdvancePreference();
  const isMobile = useIsMobile();
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [hoveredIso, setHoveredIso] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [revealCorrect, setRevealCorrect] = useState(false);
  const [blinkOn, setBlinkOn] = useState(true);

  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const layerByIso = useRef<Record<string, L.Layer>>({});
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredRef = useRef(false);
  const isMobileRef = useRef(isMobile);
  const tapTargetsRef = useRef<Array<{ iso: string; point: L.Point }>>([]);

  const correctIso = question.correctAnswer.codes?.iso3 ?? null;

  const countryByIso = useMemo(() => {
    const map = new Map<string, Country>();
    allCountries.forEach((country) => {
      const iso = country.codes?.iso3;
      if (iso) map.set(iso, country);
    });
    return map;
  }, [allCountries]);

  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  }, []);

  const clearRevealTimers = useCallback((resetState = true) => {
    if (revealTimer.current) {
      clearTimeout(revealTimer.current);
      revealTimer.current = null;
    }
    if (blinkTimer.current) {
      clearInterval(blinkTimer.current);
      blinkTimer.current = null;
    }
    if (resetState) {
      setRevealCorrect(false);
      setBlinkOn(true);
    }
  }, []);

  const startCorrectReveal = useCallback(() => {
    clearRevealTimers(false);
    setRevealCorrect(true);
    setBlinkOn(true);

    if (correctIso && mapRef.current) {
      const layer = layerByIso.current[correctIso];
      if (layer && (layer as L.Path).getBounds) {
        mapRef.current.flyToBounds((layer as L.Path).getBounds(), { padding: [28, 28], duration: 0.6 });
      }
    }

    blinkTimer.current = window.setInterval(() => {
      setBlinkOn((prev) => !prev);
    }, 420);

    revealTimer.current = window.setTimeout(() => {
      clearRevealTimers(true);
    }, 3000);
  }, [clearRevealTimers, correctIso]);

  const handleNext = useCallback(() => {
    clearAutoAdvanceTimer();
    clearRevealTimers();
    setSelectedIso(null);
    setHoveredIso(null);
    setAnswered(false);
    setIsCorrect(false);
    setIsLastQuestion(false);
    onNext();
  }, [clearAutoAdvanceTimer, onNext]);

  const updateTapTargets = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    tapTargetsRef.current = Object.entries(layerByIso.current).map(([iso, layer]) => {
      const bounds = (layer as L.Path).getBounds?.();
      const center = bounds ? bounds.getCenter() : map.getCenter();
      return { iso, point: map.latLngToContainerPoint(center) };
    });
  }, []);

  const handleSelectIso = useCallback(async (iso: string) => {
    if (answeredRef.current) return;
    const selectedCountry = countryByIso.get(iso);
    if (!selectedCountry) return;

    clearRevealTimers();
    setSelectedIso(iso);
    const result = await onAnswer(selectedCountry);
    if (result) {
      setIsCorrect(result.isCorrect);
      setIsLastQuestion(result.isLastQuestion);
      setAnswered(true);
      if (!result.isCorrect) {
        startCorrectReveal();
      }
    }
  }, [countryByIso, onAnswer, clearRevealTimers, startCorrectReveal]);

  const updateLayerStyles = useCallback(() => {
    if (!layerRef.current) return;
    layerRef.current.setStyle((feature) => {
      const iso = feature?.properties?.iso_a3;
      const isHovered = !answeredRef.current && iso && iso === hoveredIso;
      const isSelected = iso && iso === selectedIso;
      const isCorrectIso = iso && iso === correctIso;

      if (answeredRef.current) {
        if (isCorrectIso) {
          if (revealCorrect) {
            return blinkOn
              ? { color: '#22c55e', weight: 3, fillColor: '#86efac', fillOpacity: 0.9 }
              : { color: '#16a34a', weight: 2, fillColor: '#bbf7d0', fillOpacity: 0.35 };
          }
          return { color: '#22c55e', weight: 3, fillColor: '#86efac', fillOpacity: 0.85 };
        }
        if (isSelected && !isCorrect) {
          return { color: '#ef4444', weight: 2, fillColor: '#fca5a5', fillOpacity: 0.8 };
        }
      }

      if (isHovered) {
        return { color: '#f472b6', weight: 2, fillColor: '#fbcfe8', fillOpacity: 0.75 };
      }

      return { color: '#2d183f', weight: 1, fillColor: '#e9d5ff', fillOpacity: 0.65 };
    });
  }, [correctIso, hoveredIso, isCorrect, selectedIso, revealCorrect, blinkOn]);

  const handleMapClickAssist = useCallback((latlng: L.LatLng) => {
    if (!mapRef.current || answeredRef.current) return;
    const map = mapRef.current;
    const clickPoint = map.latLngToContainerPoint(latlng);
    const tolerance = isMobileRef.current ? 18 : 12;

    let best: { iso: string; dist: number } | null = null;
    for (const target of tapTargetsRef.current) {
      const dx = clickPoint.x - target.point.x;
      const dy = clickPoint.y - target.point.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= tolerance && (!best || dist < best.dist)) {
        best = { iso: target.iso, dist };
      }
    }
    if (best) {
      handleSelectIso(best.iso);
    }
  }, [handleSelectIso]);

  const zoomToSelection = useCallback((iso: string | null) => {
    if (!iso || !mapRef.current) return;
    const layer = layerByIso.current[iso];
    if (!layer || !(layer as L.Path).getBounds) return;
    mapRef.current.fitBounds((layer as L.Path).getBounds(), { padding: [24, 24] });
  }, []);

  const recenterWorld = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = L.latLngBounds(L.latLng(-60, -180), L.latLng(80, 180));
    mapRef.current.fitBounds(bounds, { padding: [16, 16] });
  }, []);

  useEffect(() => {
    answeredRef.current = answered;
  }, [answered]);

  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const dismissed = window.localStorage.getItem(HINT_STORAGE_KEY);
      setShowHint(!dismissed);
    } catch {
      setShowHint(true);
    }
  }, []);

  useEffect(() => {
    updateLayerStyles();
  }, [updateLayerStyles]);

  useEffect(() => {
    setSelectedIso(null);
    setHoveredIso(null);
    setAnswered(false);
    setIsCorrect(false);
    setIsLastQuestion(false);
    clearRevealTimers();
  }, [question.id, clearRevealTimers]);

  useEffect(() => () => clearRevealTimers(false), [clearRevealTimers]);

  useEffect(() => {
    if (answered && autoAdvance) {
      const delay = isCorrect ? 1000 : 3000;
      autoAdvanceTimer.current = window.setTimeout(() => {
        handleNext();
      }, delay);
    }
    return () => clearAutoAdvanceTimer();
  }, [answered, autoAdvance, isCorrect, handleNext, clearAutoAdvanceTimer]);

  useEffect(() => {
    if (!mapData || !mapContainerRef.current || mapRef.current) return;

    const worldBounds = L.latLngBounds(L.latLng(-60, -180), L.latLng(80, 180));
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      minZoom: 1,
      maxZoom: 6,
      maxBounds: worldBounds,
      maxBoundsViscosity: 0.9,
      worldCopyJump: true,
      attributionControl: false,
      preferCanvas: true,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);
    map.fitBounds(worldBounds, { padding: [16, 16] });

    const geoLayer = L.geoJSON(mapData.geoJson, {
      style: () => ({
        color: '#2d183f',
        weight: 1,
        fillColor: '#e9d5ff',
        fillOpacity: 0.65,
      }),
      onEachFeature: (featureItem, layer) => {
        const iso = featureItem.properties?.iso_a3;
        if (!iso) return;
        layerByIso.current[iso] = layer;

        layer.on('mouseover', () => {
          if (answeredRef.current) return;
          if (!isMobileRef.current) setHoveredIso(iso);
        });
        layer.on('mouseout', () => {
          if (answeredRef.current) return;
          if (!isMobileRef.current) setHoveredIso(null);
        });
        layer.on('click', (event) => {
          L.DomEvent.stopPropagation(event);
          handleSelectIso(iso);
        });
      },
    }).addTo(map);

    map.on('click', (event) => handleMapClickAssist(event.latlng));
    map.on('zoomend moveend', updateTapTargets);

    mapRef.current = map;
    layerRef.current = geoLayer;
    updateTapTargets();

    setTimeout(() => map.invalidateSize(), 50);

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      layerByIso.current = {};
    };
  }, [handleMapClickAssist, handleSelectIso, mapData, updateTapTargets]);

  const countryName = getLocalizedCountryName(question.correctAnswer, language);
  const capitalName = getLocalizedCapital(question.correctAnswer, language);
  const autoAdvanceDelayMs = answered ? (isCorrect ? 1000 : 3000) : 1000;
  const nextDisabled = answered && !isCorrect && revealCorrect;

  if (!mapData) {
    return (
      <div className="w-full max-w-3xl mx-auto text-center text-sm text-muted-foreground">
        {t.mapLoading}
      </div>
    );
  }

  return (
    <div className="map-immersive relative w-full h-[100dvh] min-h-[100dvh] fade-in overflow-hidden">
      <div ref={mapContainerRef} className="absolute inset-0" />

      <div className="absolute inset-0 z-[400] flex flex-col pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/80 via-background/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background/85 via-background/30 to-transparent" />

        <div className="pointer-events-auto mx-auto flex w-full max-w-[92vw] flex-col items-center gap-2 px-3 pt-[calc(env(safe-area-inset-top)+3.5rem)] sm:max-w-xl sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+4.5rem)] lg:mt-6">
          <div className="rounded-2xl border border-primary/30 bg-card/90 px-4 py-3 text-center shadow-xl backdrop-blur">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {t.mapTitle}
            </p>
            <div className="mt-2 flex flex-col items-center gap-2">
              {question.mapPromptType === 'country' ? (
                <div className="inline-flex items-center gap-3 rounded-full border border-primary/30 bg-background/85 px-4 py-2 shadow-sm">
                  <img
                    src={getAssetUrl(question.correctAnswer.flag_url)}
                    alt={countryName}
                    className="h-6 w-10 object-contain rounded-sm"
                    loading="eager"
                  />
                  <span className="text-sm sm:text-base font-semibold text-foreground">{countryName}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-3 rounded-full border border-primary/30 bg-background/85 px-4 py-2 shadow-sm">
                  <span className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">
                    {t.mapCapitalLabel}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-foreground">{capitalName}</span>
                </div>
              )}
            </div>
          </div>

          {answered && (
            <div className="rounded-full border border-primary/20 bg-background/90 px-4 py-2 shadow-lg backdrop-blur bounce-in">
              <p className={`text-sm sm:text-base font-semibold ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                {isCorrect ? t.correct : `${t.incorrect} ${t.wrongAnswer.replace('{answer}', countryName)}`}
              </p>
            </div>
          )}
        </div>

        <div className="map-side-controls pointer-events-auto absolute right-3 sm:right-[18px] flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={recenterWorld}
            className="bg-background/90 backdrop-blur border-primary/30 shadow-lg text-xs sm:text-sm"
          >
            {t.mapRecenter}
          </Button>
          {selectedIso && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => zoomToSelection(selectedIso)}
              className="bg-background/90 backdrop-blur border-primary/30 shadow-lg text-xs sm:text-sm"
            >
              {t.mapZoomToSelection}
            </Button>
          )}
        </div>

        <div className="pointer-events-auto mt-auto flex flex-col gap-3 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-6 sm:pb-6">
          {showHint && (
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-primary/20 bg-background/90 px-4 py-2 text-xs sm:text-sm text-muted-foreground shadow-md backdrop-blur">
              <span>{t.mapHint}</span>
              <button
                className="text-primary font-semibold"
                onClick={() => {
                  try {
                    window.localStorage.setItem(HINT_STORAGE_KEY, 'true');
                  } catch {
                    // Ignore storage errors
                  }
                  setShowHint(false);
                }}
              >
                {t.dismiss}
              </button>
            </div>
          )}

          <div className="rounded-3xl border border-primary/25 bg-background/90 px-4 py-3 shadow-xl backdrop-blur">
            <AutoAdvanceControls
              answered={answered}
              isLastQuestion={isLastQuestion}
              autoAdvance={autoAdvance}
              onToggleAutoAdvance={setAutoAdvance}
              onNext={handleNext}
              autoAdvanceDurationMs={autoAdvanceDelayMs}
              disableNext={nextDisabled}
              autoAdvancingLabel={t.autoAdvancing}
              autoAdvanceLabel={t.autoAdvanceLabel}
              nextLabel={t.nextQuestion}
              resultsLabel={t.seeResults}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
