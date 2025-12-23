const wrapLng = (lon: number) => {
  let wrapped = ((lon + 180) % 360 + 360) % 360 - 180;
  if (wrapped === -180) wrapped = 180;
  return wrapped;
};

const normalizeRing = (ring: number[][]): number[][] => {
  const cleaned = ring.filter(
    (point) =>
      Array.isArray(point)
      && point.length >= 2
      && Number.isFinite(point[0])
      && Number.isFinite(point[1]),
  );
  if (!cleaned.length) return [];

  const normalized = cleaned.map(([lon, lat]) => [wrapLng(lon), lat] as number[]);
  const first = normalized[0];
  const last = normalized[normalized.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    normalized.push([...first]);
  }
  return normalized;
};

const ringHasLongSegment = (ring: number[][]) => {
  for (let i = 1; i < ring.length; i += 1) {
    const prev = ring[i - 1];
    const next = ring[i];
    if (!prev || !next) continue;
    if (Math.abs(next[0] - prev[0]) > 180) return true;
  }
  return false;
};

const ringAreaCentroid = (ring: number[][]) => {
  if (ring.length < 4) return null;
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  if (area === 0) return null;
  const factor = 1 / (3 * area);
  return [cx * factor, cy * factor] as [number, number];
};

const pointInRing = (point: [number, number], ring: number[][]) => {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

const ringBounds = (ring: number[][]) => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  ring.forEach(([x, y]) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });
  return { minX, maxX, minY, maxY };
};

const scanlinePoint = (ring: number[][], y: number) => {
  const xs: number[] = [];
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    if ((y0 > y) !== (y1 > y)) {
      const t = (y - y0) / (y1 - y0);
      xs.push(x0 + t * (x1 - x0));
    }
  }
  xs.sort((a, b) => a - b);
  for (let i = 0; i < xs.length - 1; i += 2) {
    const midX = (xs[i] + xs[i + 1]) / 2;
    const candidate: [number, number] = [midX, y];
    if (pointInRing(candidate, ring)) return candidate;
  }
  return null;
};

const interiorPoint = (ring: number[][]) => {
  const areaCentroid = ringAreaCentroid(ring);
  if (areaCentroid && pointInRing(areaCentroid, ring)) return areaCentroid;

  const { minX, maxX, minY, maxY } = ringBounds(ring);
  const center: [number, number] = [(minX + maxX) / 2, (minY + maxY) / 2];
  if (pointInRing(center, ring)) return center;

  const span = Math.max(1e-6, Math.abs(maxY - minY));
  const epsilon = span * 0.001;
  const candidatesY = [center[1], minY + epsilon, maxY - epsilon];
  for (const y of candidatesY) {
    const candidate = scanlinePoint(ring, y);
    if (candidate) return candidate;
  }

  return ring[0] ? ([ring[0][0], ring[0][1]] as [number, number]) : [0, 0];
};

const splitRingAtDateline = (ring: number[][]): number[][][] => {
  const normalized = normalizeRing(ring);
  if (normalized.length < 4) return [];

  const rings: number[][][] = [];
  let current: number[][] = [[...normalized[0]]];
  rings.push(current);

  for (let i = 1; i < normalized.length; i += 1) {
    const prev = normalized[i - 1];
    const next = normalized[i];
    const lon0 = prev[0];
    const lon1 = next[0];
    const diff = Math.abs(lon1 - lon0);

    if (diff <= 180) {
      current.push([...next]);
      continue;
    }

    const crossesEast = lon0 > 0 && lon1 < 0;
    const crossesWest = lon0 < 0 && lon1 > 0;

    if (!crossesEast && !crossesWest) {
      current.push([...next]);
      continue;
    }

    if (crossesEast) {
      const lon1Adj = lon1 + 360;
      const denom = lon1Adj - lon0;
      const t = denom === 0 ? 0 : (180 - lon0) / denom;
      const safeT = Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : 0;
      const lat = prev[1] + safeT * (next[1] - prev[1]);
      current.push([180, lat]);
      current = [[-180, lat], [...next]];
      rings.push(current);
      continue;
    }

    if (crossesWest) {
      const lon1Adj = lon1 - 360;
      const denom = lon1Adj - lon0;
      const t = denom === 0 ? 0 : (-180 - lon0) / denom;
      const safeT = Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : 0;
      const lat = prev[1] + safeT * (next[1] - prev[1]);
      current.push([-180, lat]);
      current = [[180, lat], [...next]];
      rings.push(current);
    }
  }

  return rings
    .map((ringPart) => {
      if (ringPart.length < 2) return ringPart;
      const start = ringPart[0];
      const end = ringPart[ringPart.length - 1];
      if (start[0] !== end[0] || start[1] !== end[1]) {
        ringPart.push([...start]);
      }
      for (let i = 1; i < ringPart.length; i += 1) {
        const prev = ringPart[i - 1];
        const curr = ringPart[i];
        if (
          Math.abs(prev[0]) === 180
          && Math.abs(curr[0]) === 180
          && Math.abs(prev[1] - curr[1]) < 1e-6
        ) {
          curr[0] = prev[0];
        }
      }
      return ringPart;
    })
    .filter((ringPart) => ringPart.length >= 4);
};

export const normalizeAndSplitGeometry = (
  collection: GeoJSON.FeatureCollection<GeoJSON.Geometry, { iso_a3: string }>,
) => {
  const features = collection.features.map((feature) => {
    const { geometry } = feature;
    if (!geometry) return feature;

    const polygons = geometry.type === 'Polygon'
      ? [geometry.coordinates as number[][][]]
      : geometry.type === 'MultiPolygon'
        ? (geometry.coordinates as number[][][][])
        : null;

    if (!polygons) return feature;

    const updatedPolygons = polygons.map((polygon) => {
      const outer = normalizeRing(polygon[0] || []);
      const holes = polygon.slice(1).map((ring) => normalizeRing(ring)).filter((ring) => ring.length >= 4);
      return { outer, holes };
    });

    const normalizedPolygons = updatedPolygons.flatMap(({ outer }) => {
      const splitOuter = splitRingAtDateline(outer);
      if (!splitOuter.length) return [];
      if (splitOuter.length <= 1) return [[splitOuter[0]]];
      return splitOuter.map((ringPart) => [ringPart]);
    });

    const outerRings = normalizedPolygons.map((poly) => poly[0]);

    updatedPolygons.forEach(({ holes }) => {
      holes.forEach((hole) => {
        if (!hole.length) return;
        const splitHoles = splitRingAtDateline(hole);
        const pieces = splitHoles.length ? splitHoles : [hole];
        pieces.forEach((piece) => {
          if (piece.length < 4) return;
          const candidatePoint = interiorPoint(piece);
          const targetIndex = outerRings.findIndex((candidate) => pointInRing(candidatePoint, candidate));
          if (targetIndex >= 0) {
            normalizedPolygons[targetIndex].push(piece);
            return;
          }
          if (normalizedPolygons.length === 1) {
            normalizedPolygons[0].push(piece);
          }
        });
      });
    });

    const cleanedPolygons = normalizedPolygons
      .map((poly) => poly.filter((ring) => ring.length >= 4))
      .filter((poly) => poly.length);

    if (!cleanedPolygons.length) return feature;

    const newGeometry: GeoJSON.Geometry = cleanedPolygons.length === 1
      ? { type: 'Polygon', coordinates: cleanedPolygons[0] }
      : { type: 'MultiPolygon', coordinates: cleanedPolygons };

    return {
      ...feature,
      geometry: newGeometry,
    };
  });

  return {
    ...collection,
    features,
  } as GeoJSON.FeatureCollection<GeoJSON.Geometry, { iso_a3: string }>;
};

export const hasLongSegments = (ring: number[][]) => ringHasLongSegment(ring);
export const splitRingAtAntimeridian = (ring: number[][]) => splitRingAtDateline(ring);
