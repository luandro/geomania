import { describe, expect, it } from 'vitest';
import { buildNumericToIsoMap } from '@/lib/mapData';

describe('buildNumericToIsoMap', () => {
  it('pads numeric codes and maps to ISO A3', () => {
    const map = buildNumericToIsoMap([
      { iso_numeric: '4', iso_a3: 'AFG', name_en: 'Afghanistan', name_pt: 'Afeganistão' },
      { iso_numeric: '40', iso_a3: 'AUT', name_en: 'Austria', name_pt: 'Austria' },
    ]);

    expect(map.get('004')).toBe('AFG');
    expect(map.get('040')).toBe('AUT');
  });
});
