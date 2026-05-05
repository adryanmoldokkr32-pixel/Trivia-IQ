// IQ TRIVIA RO Landing Script v4 (double quotes anti-autocorrect)

(function () {
“use strict”;

const haptic = (ms) => {
if (ms === undefined) ms = 8;
try { if (“vibrate” in navigator) navigator.vibrate(ms); } catch (_) {}
};

function init() {
const btnPlay = document.getElementById(“btnPlay”);
const btnAuth = document.getElementById(“btnAuth”);

```
if (btnPlay) {
  btnPlay.addEventListener("click", () => {
    haptic(10);
    window.location.href = "auth.html?mode=register";
  });
} else {
  console.warn("[landing] btnPlay missing in DOM");
}

if (btnAuth) {
  btnAuth.addEventListener("click", () => {
    haptic(6);
    window.location.href = "auth.html?mode=login";
  });
} else {
  console.warn("[landing] btnAuth missing in DOM");
}

console.log("%c[Landing] Ready", "color:#D4AF37;font-weight:bold");
```

}

if (document.readyState === “loading”) {
document.addEventListener(“DOMContentLoaded”, init);
} else {
init();
}
})();
