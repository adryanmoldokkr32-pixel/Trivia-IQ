// =====================================================
// IQ TRIVIA RO · Landing Script (v2 ASCII safe)
// Routes:
//   btnPlay -> auth.html?mode=register (cont nou)
//   btnAuth -> auth.html?mode=login    (utilizator existent)
// auth.js detecteaza session activa si sare la modes.html automat
// =====================================================

(function () {
‘use strict’;

const haptic = (ms = 8) => {
try { if (‘vibrate’ in navigator) navigator.vibrate(ms); } catch (_) {}
};

function init() {
const btnPlay = document.getElementById(‘btnPlay’);
const btnAuth = document.getElementById(‘btnAuth’);

```
if (btnPlay) {
  btnPlay.addEventListener('click', () => {
    haptic(10);
    window.location.href = 'auth.html?mode=register';
  });
} else {
  console.warn('[landing] btnPlay missing in DOM');
}

if (btnAuth) {
  btnAuth.addEventListener('click', () => {
    haptic(6);
    window.location.href = 'auth.html?mode=login';
  });
} else {
  console.warn('[landing] btnAuth missing in DOM');
}

console.log('%c[Landing] Ready ✓', 'color:#D4AF37;font-weight:bold');
```

}

if (document.readyState === ‘loading’) {
document.addEventListener(‘DOMContentLoaded’, init);
} else {
init();
}
})();
