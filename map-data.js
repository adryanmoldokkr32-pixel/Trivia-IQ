// =====================================================
// IQ-TRIVIA-RO / FAZA 3A / MODUL 3A: Map Data
// Static data pentru harta Europei — vecini + centroide
// Path-urile SVG vin în 3B, 3C, 3D (fișiere separate)
// =====================================================

// 44 țări europene cu cod ISO, vecini direcți, și centroide (x,y în viewBox 1000x800)
// Vecinii sunt folosiți pentru: highlight în Solo + atac în Duo
// Centroidele sunt folosite pentru: label-uri + tooltip-uri + animații glow

export const COUNTRIES_DATA = {
  AL: { name: 'Albania', neighbors: ['ME','XK','MK','GR'], cx: 540, cy: 540 },
  AD: { name: 'Andorra', neighbors: ['ES','FR'], cx: 280, cy: 510 },
  AT: { name: 'Austria', neighbors: ['DE','CZ','SK','HU','SI','IT','LI','CH'], cx: 470, cy: 410 },
  BY: { name: 'Belarus', neighbors: ['LV','LT','PL','UA','RU'], cx: 640, cy: 290 },
  BE: { name: 'Belgia', neighbors: ['NL','DE','LU','FR'], cx: 350, cy: 360 },
  BA: { name: 'Bosnia', neighbors: ['HR','RS','ME'], cx: 500, cy: 490 },
  BG: { name: 'Bulgaria', neighbors: ['RO','RS','MK','GR','TR'], cx: 610, cy: 510 },
  CZ: { name: 'Cehia', neighbors: ['DE','PL','SK','AT'], cx: 470, cy: 360 },
  CY: { name: 'Cipru', neighbors: ['TR'], cx: 750, cy: 620 },
  HR: { name: 'Croația', neighbors: ['SI','HU','RS','BA','ME'], cx: 480, cy: 460 },
  DK: { name: 'Danemarca', neighbors: ['DE','SE'], cx: 410, cy: 240 },
  CH: { name: 'Elveția', neighbors: ['DE','FR','IT','AT','LI'], cx: 400, cy: 410 },
  EE: { name: 'Estonia', neighbors: ['LV','RU','FI'], cx: 620, cy: 200 },
  FI: { name: 'Finlanda', neighbors: ['SE','NO','RU','EE'], cx: 600, cy: 130 },
  FR: { name: 'Franța', neighbors: ['BE','LU','DE','CH','IT','ES','AD','MC'], cx: 320, cy: 430 },
  DE: { name: 'Germania', neighbors: ['DK','PL','CZ','AT','CH','FR','LU','BE','NL'], cx: 430, cy: 340 },
  GR: { name: 'Grecia', neighbors: ['AL','MK','BG','TR'], cx: 580, cy: 580 },
  IE: { name: 'Irlanda', neighbors: ['UK'], cx: 200, cy: 290 },
  IS: { name: 'Islanda', neighbors: [], cx: 130, cy: 100 },
  IT: { name: 'Italia', neighbors: ['FR','CH','AT','SI','SM','VA','MC'], cx: 470, cy: 510 },
  XK: { name: 'Kosovo', neighbors: ['ME','RS','MK','AL'], cx: 555, cy: 510 },
  LV: { name: 'Letonia', neighbors: ['EE','LT','RU','BY'], cx: 610, cy: 240 },
  LI: { name: 'Liechtenstein', neighbors: ['CH','AT'], cx: 425, cy: 405 },
  LT: { name: 'Lituania', neighbors: ['LV','BY','PL','RU'], cx: 600, cy: 280 },
  LU: { name: 'Luxemburg', neighbors: ['BE','DE','FR'], cx: 365, cy: 380 },
  MT: { name: 'Malta', neighbors: [], cx: 470, cy: 620 },
  MD: { name: 'Moldova', neighbors: ['RO','UA'], cx: 660, cy: 410 },
  MC: { name: 'Monaco', neighbors: ['FR','IT'], cx: 380, cy: 470 },
  ME: { name: 'Muntenegru', neighbors: ['HR','BA','RS','XK','AL'], cx: 525, cy: 510 },
  NO: { name: 'Norvegia', neighbors: ['SE','FI','RU'], cx: 430, cy: 130 },
  NL: { name: 'Olanda', neighbors: ['DE','BE'], cx: 370, cy: 320 },
  PL: { name: 'Polonia', neighbors: ['DE','CZ','SK','UA','BY','LT','RU'], cx: 560, cy: 320 },
  PT: { name: 'Portugalia', neighbors: ['ES'], cx: 165, cy: 510 },
  RO: { name: 'România', neighbors: ['HU','UA','MD','BG','RS'], cx: 605, cy: 440 },
  RU: { name: 'Rusia', neighbors: ['NO','FI','EE','LV','BY','UA','PL','LT'], cx: 800, cy: 230 },
  SM: { name: 'San Marino', neighbors: ['IT'], cx: 460, cy: 480 },
  RS: { name: 'Serbia', neighbors: ['HU','RO','BG','MK','XK','ME','BA','HR'], cx: 545, cy: 470 },
  SK: { name: 'Slovacia', neighbors: ['CZ','PL','UA','HU','AT'], cx: 540, cy: 380 },
  SI: { name: 'Slovenia', neighbors: ['AT','HU','HR','IT'], cx: 460, cy: 440 },
  ES: { name: 'Spania', neighbors: ['PT','FR','AD'], cx: 230, cy: 530 },
  SE: { name: 'Suedia', neighbors: ['NO','FI','DK'], cx: 490, cy: 180 },
  TR: { name: 'Turcia', neighbors: ['BG','GR','CY'], cx: 700, cy: 560 },
  UA: { name: 'Ucraina', neighbors: ['BY','PL','SK','HU','RO','MD','RU'], cx: 670, cy: 360 },
  HU: { name: 'Ungaria', neighbors: ['AT','SK','UA','RO','RS','HR','SI'], cx: 535, cy: 420 },
  VA: { name: 'Vatican', neighbors: ['IT'], cx: 458, cy: 502 }
};

// Listă coduri în ordine (pentru iterare deterministă)
export const COUNTRY_CODES = Object.keys(COUNTRIES_DATA);

// Helper: returnează vecinii unei țări
export function getNeighbors(code) {
  return COUNTRIES_DATA[code]?.neighbors || [];
}

// Helper: verifică dacă două țări sunt vecine
export function areNeighbors(code1, code2) {
  return getNeighbors(code1).includes(code2);
}

// Helper: returnează numele românesc al țării
export function getCountryName(code) {
  return COUNTRIES_DATA[code]?.name || code;
}
