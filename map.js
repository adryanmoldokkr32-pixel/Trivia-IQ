// =====================================================
// IQ-TRIVIA-RO / FAZA 3A / MODUL 5B: Map Renderer (GeoJSON)
// Folosește paths reale dinamic încărcate via map-loader.js
// =====================================================

import { COUNTRIES_DATA, COUNTRY_CODES, getNeighbors } from './map-data.js';
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
  paths: null
};

/**
 * Async render: încarcă paths reale și construiește SVG-ul.
 */
export async function renderMap(container, onTap) {
  mapState.onCountryTap = onTap;
  
  // Loading state vizibil
  container.innerHTML = '<div class="map-loading">Se încarcă harta...</div>';
  
  try {
    mapState.paths = await loadMapPaths();
  } catch (e) {
    container.innerHTML = '<div class="map-error">Eroare încărcare hartă: ' + e.message + '</div>';
    throw e;
  }
  
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
  
  // Label-uri ISO la centroide (din map-data.js)
  COUNTRY_CODES.forEach(code => {
    const data = COUNTRIES_DATA[code];
    if (!data || !mapState.paths[code]) return;
    
    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', data.cx);
    label.setAttribute('y', data.cy);
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
