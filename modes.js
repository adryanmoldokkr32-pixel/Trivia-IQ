// IQ TRIVIA RO Modes Page v4 (double quotes anti-autocorrect)

import { supabase, requireAuth } from “./supabase-client.js”;

window.sb = supabase;

const $hello  = document.getElementById(“userHello”);
const $email  = document.getElementById(“userEmail”);
const $logout = document.getElementById(“btnLogout”);
const $cards  = document.querySelectorAll(”.mode-card:not([disabled])”);

const haptic = (ms) => {
if (ms === undefined) ms = 10;
try { if (“vibrate” in navigator) navigator.vibrate(ms); } catch (_) {}
};

(async () => {
const user = await requireAuth();
if (!user) return;

if ($email) $email.textContent = user.email || “”;

let username = “jucator”;
if (user.user_metadata && user.user_metadata.username) {
username = user.user_metadata.username;
} else if (user.email) {
username = user.email.split(”@”)[0];
}
if ($hello) $hello.textContent = “Bun venit, “ + username + “!”;

console.log(”[modes] User:”, user.email, “username:”, username);
})();

if ($logout) {
$logout.addEventListener(“click”, async () => {
haptic(12);
await supabase.auth.signOut();
window.location.replace(“index.html”);
});
}

$cards.forEach((card) => {
card.addEventListener(“click”, () => {
const mode = card.dataset.mode;
haptic(14);
console.log(”[modes] Selected:”, mode);

```
if (mode === "solo") {
  window.location.href = "game.html";
  return;
}

showToastModes(
  mode === "iq" ? "Testul IQ vine la Faza 3B" : "Mod indisponibil momentan"
);
```

});
});

function showToastModes(msg) {
const t = document.createElement(“div”);
t.textContent = msg;
t.setAttribute(“role”, “status”);
t.style.cssText = [
“position:fixed”,
“bottom:calc(24px + env(safe-area-inset-bottom, 0))”,
“left:50%”,
“transform:translateX(-50%)”,
“background:rgba(10,10,16,0.96)”,
“border:1px solid rgba(212,175,55,0.45)”,
“color:#F5F5FA”,
“padding:12px 22px”,
“border-radius:999px”,
“font:600 0.85rem/1 -apple-system,Inter,sans-serif”,
“letter-spacing:0.05em”,
“z-index:100”,
“box-shadow:0 8px 24px rgba(0,0,0,0.5)”,
“max-width:calc(100% - 48px)”,
“text-align:center”
].join(”;”);
document.body.appendChild(t);
setTimeout(() => {
t.style.opacity = “0”;
t.style.transition = “opacity 0.3s”;
setTimeout(() => t.remove(), 320);
}, 2200);
}

console.log(”%c[Modes] Ready v4”, “color:#D4AF37;font-weight:bold”);
