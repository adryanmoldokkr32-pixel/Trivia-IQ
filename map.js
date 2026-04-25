// =====================================================
// IQ-TRIVIA-RO / FAZA 3A / MODUL 4A: Map Renderer
// Construiește SVG-ul Europei în DOM și gestionează tap-urile
// =====================================================

import { COUNTRIES_DATA, COUNTRY_CODES, getNeighbors } from './map-data.js';
import { MAP_PATHS } from './map-paths.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const VIEWBOX = '0 0 1000 800';

// Stări vizuale per țară
const STATES = {
  IDLE: 'idle',           // necucerită, nu evidențiată
  NEIGHBOR: 'neighbor',   // vecin atacabil al bazei tale
  BASE: 'base',           // baza ta (țara de plecare)
  CONQUERED: 'conquered', // cucerită de tine
  HOSTILE: 'hostile'      // cucerită de alt jucător (Duo)
};

// State global al hărții (singleton pentru sesiunea curentă)
const mapState = {
  base: null,           // codul bazei userului (ex: 'RO')
  conquered: new Set(), // coduri țări cucerite
  onCountryTap: null    // callback la tap (setat extern)
};

/**
 * Randează harta SVG într-un container HTML.
 * @param {HTMLElement} container — div unde se inserează SVG-ul
 * @param {Function} onTap — callback(countryCode, state) la tap pe țară
 */
export function renderMap(container, onTap) {
  mapState.onCountryTap = onTap;
  
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', VIEWBOX);
  svg.setAttribute('class', 'europe-map');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  
  // Generăm un <path> pentru fiecare țară
  COUNTRY_CODES.forEach(code => {
    const d = MAP_PATHS[code];
    if (!d) return; // safety: dacă lipsește un path
    
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('data-code', code);
    path.setAttribute('class', `country country--${STATES.IDLE}`);
    path.addEventListener('click', () => handleTap(code));
    svg.appendChild(path);
  });
  
  // Adăugăm label-uri (cod ISO la centroid)
  COUNTRY_CODES.forEach(code => {
    const data = COUNTRIES_DATA[code];
    if (!data) return;
    
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

/**
 * Setează baza userului și actualizează stilurile.
 */
export function setBase(code) {
  mapState.base = code;
  refreshStyles();
}

/**
 * Marchează o țară ca cucerită.
 */
export function markConquered(code) {
  mapState.conquered.add(code);
  refreshStyles();
}

/**
 * Re-aplică clasele CSS pe toate țările conform stării curente.
 */
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

/**
 * Handler intern pentru tap pe țară. Trimite la callback-ul extern.
 */
function handleTap(code) {
  if (!mapState.onCountryTap) return;
  
  let state = STATES.IDLE;
  if (code === mapState.base) state = STATES.BASE;
  else if (mapState.conquered.has(code)) state = STATES.CONQUERED;
  else if (mapState.base && getNeighbors(mapState.base).includes(code)) state = STATES.NEIGHBOR;
  
  mapState.onCountryTap(code, state);
}

// Helpers pentru debug / acces extern
export function getMapState() { return { ...mapState, conquered: [...mapState.conquered] }; }
export const COUNTRY_STATES = STATES;
