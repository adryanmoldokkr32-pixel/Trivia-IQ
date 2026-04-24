/* =========================================================
   IQ TRIVIA RO · Landing Script
   Navigație reală → auth.html
   ========================================================= */
(() => {
  'use strict';

  const btnPlay = document.getElementById('btnPlay');
  const btnAuth = document.getElementById('btnAuth');

  const haptic = (ms = 10) => {
    try { if ('vibrate' in navigator) navigator.vibrate(ms); } catch (_) {}
  };

  // Blochează pinch-zoom accidental
  document.body.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  // Butonul principal → Register (tab "Cont nou")
  btnPlay?.addEventListener('click', () => {
    haptic(14);
    window.location.href = 'auth.html?mode=register';
  });

  // Link secundar → Login (tab "Conectare")
  btnAuth?.addEventListener('click', () => {
    haptic(8);
    window.location.href = 'auth.html?mode=login';
  });

  console.log('%c[IQ Trivia RO] Landing ready.', 'color:#D4AF37;font-weight:bold');
})();
