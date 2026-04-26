// ====================================================
// IQ TRIVIA RO · Modes Page
// Guard logged-in + salut user + navigație moduri + logout
// ====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://ilowliyucohvqossxqbr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kuPZcP4ccCv7KTXVA0diYw_AfgO3Ssi';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});
window.sb = supabase;

const $hello  = document.getElementById('userHello');
const $email  = document.getElementById('userEmail');
const $logout = document.getElementById('btnLogout');
const $cards  = document.querySelectorAll('.mode-card:not([disabled])');

const haptic = (ms = 10) => {
  try { if ('vibrate' in navigator) navigator.vibrate(ms); } catch (_) {}
};

// --- GUARD ---
const guard = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.log('[modes] Nu e logat, redirect auth.html');
    window.location.replace('auth.html');
    return null;
  }
  return session.user;
};

// --- INIT ---
(async () => {
  const user = await guard();
  if (!user) return;

  if ($email) $email.textContent = user.email || '—';

  const username =
    user.user_metadata?.username ||
    user.email?.split('@')[0] ||
    'jucător';
  if ($hello) $hello.textContent = `Bun venit, ${username}!`;

  console.log('[modes] User:', user.email, 'username:', username);
})();

// --- LOGOUT ---
$logout?.addEventListener('click', async () => {
  haptic(12);
  await supabase.auth.signOut();
  window.location.replace('index.html');
});

// --- MODURI ---
$cards.forEach((card) => {
  card.addEventListener('click', () => {
    const mode = card.dataset.mode;
    haptic(14);
    console.log('[modes] Selected:', mode);

    // Navigare reală pentru moduri active
    if (mode === 'solo') {
      window.location.href = 'game.html';
      return;
    }

    // Restul = toast până vin la Faza 3B / 3D
    showToastModes(
      mode === 'iq' ? 'Testul IQ vine la Faza 3 🧠' :
                      'Mod indisponibil momentan'
    );
  });
});

function showToastModes(msg) {
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
  }, 2200);
}

console.log('%c[Modes] Ready', 'color:#D4AF37;font-weight:bold');
