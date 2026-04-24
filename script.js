/* =========================================================
   IQ TRIVIA RO · Landing Script
   Navigație + feedback tactil + safety iOS
   ========================================================= */
(() => {
  'use strict';

  const btnPlay = document.getElementById('btnPlay');
  const btnAuth = document.getElementById('btnAuth');

  const haptic = (ms = 10) => {
    try { if ('vibrate' in navigator) navigator.vibrate(ms); } catch (_) {}
  };

  document.body.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  const showToast = (msg) => {
    const t = document.createElement('div');
    t.textContent = msg;
    t.setAttribute('role', 'status');
    t.style.cssText = [
      'position:fixed',
      'bottom:calc(24px + env(safe-area-inset-bottom, 0))',
      'left:50%',
      'transform:translateX(-50%)',
      'background:rgba(10,10,16,0.96)',
      'border:1px solid rgba(212,175,55,0.45)',
      'color:#F5F5FA',
      'padding:12px 22px',
      'border-radius:999px',
      'font:600 0.85rem/1 -apple-system,Inter,sans-serif',
      'letter-spacing:0.05em',
      'z-index:100',
      'box-shadow:0 8px 24px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.15)',
      'animation:toastIn 0.3s ease-out',
      'max-width:calc(100% - 48px)',
      'text-align:center'
    ].join(';');
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.animation = 'toastOut 0.3s ease-in forwards';
      setTimeout(() => t.remove(), 320);
    }, 2100);
  };

  const goToGame = () => {
    haptic(14);
    console.log('[nav] → Game screen');
    showToast('Ecranul Game vine la pachetul următor 🎮');
  };

  const goToAuth = () => {
    haptic(8);
    console.log('[nav] → Auth screen');
    showToast('Ecranul Auth vine la pachetul următor 🔐');
  };

  btnPlay?.addEventListener('click', goToGame);
  btnAuth?.addEventListener('click', goToAuth);

  console.log('%c[IQ Trivia RO] Landing ready.', 'color:#D4AF37;font-weight:bold');
})();
