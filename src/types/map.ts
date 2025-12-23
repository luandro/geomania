export interface MapCapitalRecord {
  capital: string;
  country: string;
  iso_a2?: string;
  iso_a3: string;
}

export interface MapCountryMeta {
  iso_a2?: string;
  iso_a3: string;
  iso_numeric?: string;
  name_en: string;
  name_pt: string;
}

export interface MapData {
  geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry, { iso_a3: string }>;
  isoSet: Set<string>;
  featureByIso: Record<string, GeoJSON.Feature<GeoJSON.Geometry, { iso_a3: string }>>;
}
