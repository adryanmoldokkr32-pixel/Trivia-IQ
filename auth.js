// =========================================================
// IQ TRIVIA RO · Auth Script (FALLBACK SAFE — autonom)
// Versiune fără dependințe pe supabase-client.js
// FIXED: Event listeners, session check, form cleanup
// =========================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://ilowliyucohvqossxqbr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kuPZcP4ccCv7KTXVA0diYw_AfgO3Ssi';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});
window.sb = supabase;

// === DOM ELEMENTS ===
const tabs       = document.querySelectorAll('.tab');
const tabsWrap   = document.querySelector('.auth-tabs');
const form       = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passInput  = document.getElementById('password');
const passHint   = document.getElementById('passHint');
const togglePass = document.getElementById('togglePass');
const btnSubmit  = document.getElementById('btnSubmit');
const btnText    = btnSubmit?.querySelector('.btn-text');
const formMsg    = document.getElementById('formMsg');
const switchText = document.getElementById('switchText');

let mode = 'login';
let isAuthProcessing = false;

// === UTILITIES ===
const haptic = (ms = 10) => {
  try { if ('vibrate' in navigator) navigator.vibrate(ms); } catch (_) {}
};

const showMsg = (text, type = 'error') => {
  if (!formMsg) return;
  formMsg.textContent = text;
  formMsg.className = `form-msg ${type}`;
};

const clearMsg = () => showMsg('', '');

const setLoading = (isLoading) => {
  btnSubmit?.classList.toggle('is-loading', isLoading);
  if (btnSubmit) btnSubmit.disabled = isLoading;
  isAuthProcessing = isLoading;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const generateUsername = (email) => {
  const base = email.split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12) || 'user';
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base}${suffix}`;
};

const translateError = (err) => {
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('invalid login credentials')) return 'Email sau parolă greșită.';
  if (msg.includes('user already registered'))   return 'Acest email are deja cont. Conectează-te.';
  if (msg.includes('email rate limit'))          return 'Prea multe încercări. Așteaptă 1 minut.';
  if (msg.includes('password should be at least')) return 'Parola trebuie să aibă minim 6 caractere.';
  if (msg.includes('unable to validate email'))  return 'Emailul nu pare valid.';
  if (msg.includes('signups not allowed'))       return 'Crearea conturilor noi este dezactivată.';
  if (msg.includes('network') || msg.includes('fetch')) return 'Fără conexiune la server.';
  return err?.message || 'A apărut o eroare. Încearcă din nou.';
};

// === MODE SWITCHING ===
function attachSwitchListener() {
  const switchBtn = document.getElementById('switchBtn');
  if (!switchBtn) return;
  
  // Cleanup old listeners by cloning
  const newBtn = switchBtn.cloneNode(true);
  switchBtn.parentNode.replaceChild(newBtn, switchBtn);
  
  newBtn.addEventListener('click', () => {
    if (isAuthProcessing) return;
    haptic(6);
    setMode(mode === 'login' ? 'register' : 'login');
    clearMsg();
  });
}

function setMode(newMode) {
  mode = newMode;
  tabsWrap?.setAttribute('data-active', mode);

  tabs.forEach((t) => {
    const isActive = t.dataset.tab === mode;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  if (mode === 'login') {
    if (btnText) btnText.textContent = 'Conectează-mă';
    passInput?.setAttribute('autocomplete', 'current-password');
    if (passHint) passHint.textContent = 'Introdu parola contului';
    if (switchText) {
      switchText.innerHTML = 'Nu ai cont? <button type="button" class="link-switch" id="switchBtn">Creează acum</button>';
    }
  } else {
    if (btnText) btnText.textContent = 'Creează cont';
    passInput?.setAttribute('autocomplete', 'new-password');
    if (passHint) passHint.textContent = 'Minim 6 caractere';
    if (switchText) {
      switchText.innerHTML = 'Ai deja cont? <button type="button" class="link-switch" id="switchBtn">Conectează-te</button>';
    }
  }

  // Attach fresh listener to dynamically created button
  attachSwitchListener();
  clearMsg();
}

// === EVENT LISTENERS INITIALIZATION ===

// Tab switching
tabs.forEach((t) => {
  t.addEventListener('click', () => {
    if (isAuthProcessing) return;
    haptic(8);
    setMode(t.dataset.tab);
  });
});

// Password toggle
togglePass?.addEventListener('click', () => {
  if (!passInput) return;
  const isPass = passInput.type === 'password';
  passInput.type = isPass ? 'text' : 'password';
  togglePass.textContent = isPass ? '🙈' : '👁';
});

// Form submission
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (isAuthProcessing) return;
  
  clearMsg();

  const email = (emailInput?.value || '').trim().toLowerCase();
  const password = passInput?.value || '';

  if (!email || !password) {
    showMsg('Completează email și parolă.', 'error');
    haptic(20);
    return;
  }
  if (!isValidEmail(email)) {
    showMsg('Emailul nu e valid. Format: nume@domeniu.ro', 'error');
    haptic(20);
    emailInput?.focus();
    return;
  }
  if (password.length < 6) {
    showMsg('Parola trebuie să aibă minim 6 caractere.', 'error');
    haptic(20);
    passInput?.focus();
    return;
  }

  setLoading(true);
  haptic(10);

  try {
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showMsg('Conectare reușită! Te redirecționez…', 'success');
      haptic(25);
      setTimeout(() => window.location.replace('modes.html'), 600);
    } else {
      const username = generateUsername(email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
      if (error) throw error;
      showMsg(`Cont creat: ${username}. Te redirecționez...`, 'success');
      haptic(25);
      setTimeout(() => window.location.replace('modes.html'), 900);
    }
  } catch (err) {
    console.error('[auth] error:', err);
    showMsg(translateError(err), 'error');
    haptic(30);
    setLoading(false);
  }
});

// === SESSION CHECK ===
(async () => {
  try {
    console.log('[auth] Checking session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('[auth] Session check error:', error);
      return;
    }
    
    if (session) {
      console.log('[auth] Active session found, redirecting to modes.html');
      document.body.style.opacity = '0.7';
      await new Promise(r => setTimeout(r, 300));
      window.location.replace('modes.html');
    }
  } catch (err) {
    console.error('[auth] Unexpected session error:', err);
  }
})();

// === URL MODE PARAMETER ===
const urlMode = new URLSearchParams(window.location.search).get('mode');
if (urlMode === 'register' || urlMode === 'login') {
  setMode(urlMode);
} else {
  // Initialize first switch listener
  setTimeout(() => attachSwitchListener(), 100);
}

console.log('%c[Auth] Ready ✓', 'color:#D4AF37;font-weight:bold');