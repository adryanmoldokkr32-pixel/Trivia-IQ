// =====================================================
// IQ-TRIVIA-RO / FAZA 3A / MAP.JS — auto-centroids
// Centroidele se calculează din paths reale (nu hardcodate)
// =====================================================

import { COUNTRY_CODES, getNeighbors, getCountryName } from './map-data.js';
import { loadMapPaths } from './map-loader.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const VIEWBOX = '0 0 1000 800';

const STATES = {
  IDLE: 'idle',
  NEIGHBOR: 'neighbor',
  BASE: 'base',
  CONQUERED: 'conquered',
  HOSTILE: 'hostile'
};

const mapState = {
  base: null,
  conquered: new Set(),
  onCountryTap: null,
  paths: null,
  centroids: {}
};

/**
 * Calculează centroidul unui path SVG (medie aritmetică a punctelor M/L).
 * Pentru MultiPolygon, ia poligonul cel mai mare.
 */
function computeCentroid(pathString) {
  // Sparge la 'M' = început de subpoligon
  const subPaths = pathString.split(/(?=M)/).filter(s => s.trim());
  
  let bestPoints = [];
  let maxLen = 0;
  
  // Alegem subpath-ul cu cele mai multe puncte (țara principală, nu insula)
  subPaths.forEach(sub => {
    const points = [...sub.matchAll(/[ML]\s*([\d.]+)\s+([\d.]+)/g)]
      .map(m => [parseFloat(m[1]), parseFloat(m[2])]);
    if (points.length > maxLen) {
      maxLen = points.length;
      bestPoints = points;
    }
  });
  
  if (bestPoints.length === 0) return [500, 400];
  
  let sumX = 0, sumY = 0;
  bestPoints.forEach(([x, y]) => { sumX += x; sumY += y; });
  return [sumX / bestPoints.length, sumY / bestPoints.length];
}

export async function renderMap(container, onTap) {
  mapState.onCountryTap = onTap;
  container.innerHTML = '<div class="map-loading">Se încarcă harta...</div>';
  
  try {
    mapState.paths = await loadMapPaths();
  } catch (e) {
    container.innerHTML = '<div class="map-error">Eroare: ' + e.message + '</div>';
    throw e;
  }
  
  // Calculăm centroidele din paths reale
  Object.keys(mapState.paths).forEach(code => {
    mapState.centroids[code] = computeCentroid(mapState.paths[code]);
  });
  
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', VIEWBOX);
  svg.setAttribute('class', 'europe-map');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  
  // Paths țări
  COUNTRY_CODES.forEach(code => {
    const d = mapState.paths[code];
    if (!d) return;
    
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('data-code', code);
    path.setAttribute('class', `country country--${STATES.IDLE}`);
    path.addEventListener('click', () => handleTap(code));
    svg.appendChild(path);
  });
  
  // Label-uri ISO la centroide reale
  COUNTRY_CODES.forEach(code => {
    if (!mapState.paths[code]) return;
    const [cx, cy] = mapState.centroids[code];
    
    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', cx);
    label.setAttribute('y', cy);
    label.setAttribute('class', 'country-label');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('pointer-events', 'none');
    label.textContent = code;
    svg.appendChild(label);
  });
  
  container.innerHTML = '';
  container.appendChild(svg);
}

export function setBase(code) {
  mapState.base = code;
  refreshStyles();
}

export function markConquered(code) {
  mapState.conquered.add(code);
  refreshStyles();
}

function refreshStyles() {
  const paths = document.querySelectorAll('.country');
  const neighbors = mapState.base ? new Set(getNeighbors(mapState.base)) : new Set();
  
  paths.forEach(p => {
    const code = p.getAttribute('data-code');
    let state = STATES.IDLE;
    
    if (code === mapState.base) state = STATES.BASE;
    else if (mapState.conquered.has(code)) state = STATES.CONQUERED;
    else if (neighbors.has(code)) state = STATES.NEIGHBOR;
    
    p.setAttribute('class', `country country--${state}`);
  });
}

function handleTap(code) {
  if (!mapState.onCountryTap) return;
  
  let state = STATES.IDLE;
  if (code === mapState.base) state = STATES.BASE;
  else if (mapState.conquered.has(code)) state = STATES.CONQUERED;
  else if (mapState.base && getNeighbors(mapState.base).includes(code)) state = STATES.NEIGHBOR;
  
  mapState.onCountryTap(code, state);
}

export function getMapState() {
  return { ...mapState, conquered: [...mapState.conquered] };
}

export const COUNTRY_STATES = STATES;
