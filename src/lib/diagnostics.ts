import { hasLongSegments } from './normalizeGeometry';

type DiagnosticIssue = {
  iso: string;
  ringType: 'outer' | 'hole';
  ringIndex: number;
};

export const findLongSegments = (
  collection: GeoJSON.FeatureCollection<GeoJSON.Geometry, { iso_a3: string }>,
) => {
  const problematicFeatures: DiagnosticIssue[] = [];

  collection.features.forEach((feature) => {
    const iso = feature.properties?.iso_a3;
    if (!iso || !feature.geometry) return;

    const polygons = feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates as number[][][]]
      : feature.geometry.type === 'MultiPolygon'
        ? (feature.geometry.coordinates as number[][][][])
        : [];

    polygons.forEach((polygon) => {
      polygon.forEach((ring, ringIndex) => {
        if (hasLongSegments(ring)) {
          problematicFeatures.push({
            iso,
            ringType: ringIndex === 0 ? 'outer' : 'hole',
            ringIndex,
          });
        }
      });
    });
  });

  return {
    problematicFeatures,
    count: problematicFeatures.length,
  };
};

export const printDiagnostics = (diagnostic: ReturnType<typeof findLongSegments>) => {
  if (!diagnostic.count) return;
  console.warn('Dateline diagnostics:', diagnostic.problematicFeatures);
};
