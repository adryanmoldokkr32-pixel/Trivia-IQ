// =====================================================
// IQ-TRIVIA-RO / FAZA 3A / MODUL 5A: GeoJSON Loader
// Fetch hartă reală Europa, transformă în SVG paths
// Sursă: github.com/leakyMirror/map-of-europe (open data)
// =====================================================

import { COUNTRY_CODES } from './map-data.js';

const GEOJSON_URL = 'https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson';

// Mapare coduri ISO-3 (din GeoJSON) → ISO-2 (din baza ta)
const ISO3_TO_ISO2 = {
  ALB:'AL', AND:'AD', AUT:'AT', BLR:'BY', BEL:'BE', BIH:'BA', BGR:'BG',
  CZE:'CZ', CYP:'CY', HRV:'HR', DNK:'DK', CHE:'CH', EST:'EE', FIN:'FI',
  FRA:'FR', DEU:'DE', GRC:'GR', HUN:'HU', IRL:'IE', ISL:'IS', ITA:'IT',
  XKX:'XK', LVA:'LV', LIE:'LI', LTU:'LT', LUX:'LU', MLT:'MT', MDA:'MD',
  MCO:'MC', MNE:'ME', NOR:'NO', NLD:'NL', POL:'PL', PRT:'PT', ROU:'RO',
  RUS:'RU', SMR:'SM', SRB:'RS', SVK:'SK', SVN:'SI', ESP:'ES', SWE:'SE',
  TUR:'TR', UKR:'UA', VAT:'VA'
};

// Proiecție Mercator simplificată: lon/lat → x/y în viewBox
// Europa: lon ~-25..45, lat ~35..72
function project(lon, lat, vw = 1000, vh = 800) {
  const x = ((lon + 25) / 70) * vw;
  const y = ((72 - lat) / 37) * vh;
  return [x.toFixed(1), y.toFixed(1)];
}

// Convertește un poligon GeoJSON → string path SVG
function polygonToPath(coords) {
  return coords.map(ring => {
    return ring.map((pt, i) => {
      const [x, y] = project(pt[0], pt[1]);
      return (i === 0 ? 'M' : 'L') + x + ' ' + y;
    }).join(' ') + ' Z';
  }).join(' ');
}

// Convertește feature GeoJSON → path SVG
function featureToPath(feature) {
  const g = feature.geometry;
  if (g.type === 'Polygon') return polygonToPath(g.coordinates);
  if (g.type === 'MultiPolygon') {
    return g.coordinates.map(polygonToPath).join(' ');
  }
  return '';
}

// Funcția publică: fetch + transformă + returnează obiect { ISO2: pathString }
export async function loadMapPaths() {
  const cacheKey = 'iq_trivia_map_paths_v1';
  
  // Cache local (sessionStorage) ca să nu refetch-uim în aceeași sesiune
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) { /* re-fetch */ }
  }
  
  const res = await fetch(GEOJSON_URL);
  if (!res.ok) throw new Error('GeoJSON fetch failed: ' + res.status);
  const data = await res.json();
  
  const paths = {};
  const ourCodes = new Set(COUNTRY_CODES);
  
  data.features.forEach(f => {
    const iso3 = f.properties.ISO3 || f.properties.iso_a3;
    const iso2 = ISO3_TO_ISO2[iso3];
    if (!iso2 || !ourCodes.has(iso2)) return; // sărim țările care nu ne interesează
    paths[iso2] = featureToPath(f);
  });
  
  sessionStorage.setItem(cacheKey, JSON.stringify(paths));
  return paths;
}
