// =====================================================
// IQ-TRIVIA-RO / FAZA 3A / MODUL 6A: Pinch Zoom + Pan
// Gesture handler pentru SVG-ul hărții
// Folosește transform="matrix(...)" pentru perf max pe iPhone
// =====================================================

const MIN_SCALE = 0.8;
const MAX_SCALE = 5;

export function attachZoomPan(svgElement) {
  let scale = 1;
  let tx = 0, ty = 0;
  
  // Stare gesture
  let isPanning = false;
  let isPinching = false;
  let startX = 0, startY = 0;
  let startTx = 0, startTy = 0;
  let startDist = 0;
  let startScale = 1;
  let pinchCenterX = 0, pinchCenterY = 0;
  
  // Wrapper pentru toate path-urile + label-urile
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'zoom-pan-group');
  
  // Mută toți copiii svg-ului în <g>
  while (svgElement.firstChild) g.appendChild(svgElement.firstChild);
  svgElement.appendChild(g);
  
  function applyTransform() {
    g.setAttribute('transform', `translate(${tx} ${ty}) scale(${scale})`);
  }
  
  function getDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  }
  
  function getMidpoint(t1, t2) {
    return {
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2
    };
  }
  
  // === TOUCH START ===
  svgElement.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isPanning = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTx = tx;
      startTy = ty;
    } else if (e.touches.length === 2) {
      isPanning = false;
      isPinching = true;
      startDist = getDistance(e.touches[0], e.touches[1]);
      startScale = scale;
      const mid = getMidpoint(e.touches[0], e.touches[1]);
      pinchCenterX = mid.x;
      pinchCenterY = mid.y;
      startTx = tx;
      startTy = ty;
    }
  }, { passive: true });
  
  // === TOUCH MOVE ===
  svgElement.addEventListener('touchmove', (e) => {
    if (isPinching && e.touches.length === 2) {
      e.preventDefault();
      const newDist = getDistance(e.touches[0], e.touches[1]);
      const ratio = newDist / startDist;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, startScale * ratio));
      
      // Zoom centrat pe midpoint pinch
      const rect = svgElement.getBoundingClientRect();
      const cx = pinchCenterX - rect.left;
      const cy = pinchCenterY - rect.top;
      
      tx = cx - (cx - startTx) * (newScale / startScale);
      ty = cy - (cy - startTy) * (newScale / startScale);
      scale = newScale;
      applyTransform();
    } else if (isPanning && e.touches.length === 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      tx = startTx + dx;
      ty = startTy + dy;
      applyTransform();
    }
  }, { passive: false });
  
  // === TOUCH END ===
  svgElement.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
      isPanning = false;
      isPinching = false;
    } else if (e.touches.length === 1) {
      isPinching = false;
      isPanning = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTx = tx;
      startTy = ty;
    }
  }, { passive: true });
  
  // Funcție publică: setează zoom programatic (pentru auto-zoom la bază)
  return {
    setView(centerX, centerY, newScale = 2.5) {
      const rect = svgElement.getBoundingClientRect();
      scale = newScale;
      tx = rect.width / 2 - centerX * newScale;
      ty = rect.height / 2 - centerY * newScale;
      applyTransform();
    },
    reset() {
      scale = 1; tx = 0; ty = 0;
      applyTransform();
    }
  };
}
