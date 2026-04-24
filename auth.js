// =========================================================
// IQ TRIVIA RO · Auth Script
// Supabase client + helpers + tab switcher
// =========================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// --- CONFIG SUPABASE ---
const SUPABASE_URL = 'https://ilowliyucohvqossxqbr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kuPZcP4ccCv7KTXVA0diYw_AfgO3Ssi';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

// Export global (pentru consola de debug pe iPhone + alte pagini)
window.sb = supabase;

// --- DOM refs ---
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
const switchBtn  = document.getElementById('switchBtn');

// --- STATE ---
let mode = 'login'; // 'login' | 'register'

// --- HELPERS ---
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
  btnSubmit.disabled = isLoading;
};

// Validare email simplă
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Username auto din email + 3 cifre random
const generateUsername = (email) => {
  const base = email.split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12) || 'user';
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base}${suffix}`;
};

// --- TAB SWITCHER ---
const setMode = (newMode) => {
  mode = newMode;
  tabsWrap?.setAttribute('data-active', mode);

  tabs.forEach((t) => {
    const isActive = t.dataset.tab === mode;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  if (mode === 'login') {
    btnText.textContent = 'Conectează-mă';
    passInput.setAttribute('autocomplete', 'current-password');
    passHint.textContent = 'Introdu parola contului';
    switchText.innerHTML = 'Nu ai cont? <button type="button" class="link-switch" id="switchBtn">Creează acum</button>';
  } else {
    btnText.textContent = 'Creează cont';
    passInput.setAttribute('autocomplete', 'new-password');
    passHint.textContent = 'Minim 6 caractere';
    switchText.innerHTML = 'Ai deja cont? <button type="button" class="link-switch" id="switchBtn">Conectează-te</button>';
  }

  // Re-bind după innerHTML replace
  document.getElementById('switchBtn')?.addEventListener('click', () => {
    haptic(6);
    setMode(mode === 'login' ? 'register' : 'login');
    clearMsg();
  });

  clearMsg();
};

// --- BIND TABS ---
tabs.forEach((t) => {
  t.addEventListener('click', () => {
    haptic(8);
    setMode(t.dataset.tab);
  });
});

// Initial bind switchBtn
switchBtn?.addEventListener('click', () => {
  haptic(6);
  setMode(mode === 'login' ? 'register' : 'login');
  clearMsg();
});

// --- TOGGLE PASSWORD ---
togglePass?.addEventListener('click', () => {
  const isPass = passInput.type === 'password';
  passInput.type = isPass ? 'text' : 'password';
  togglePass.textContent = isPass ? '🙈' : '👁';
  togglePass.setAttribute('aria-label', isPass ? 'Ascunde parola' : 'Arată parola');
});

// --- AUTO-REDIRECT dacă user e deja logat ---
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    console.log('[auth] Sesiune activă, redirect modes.html');
    window.location.replace('modes.html');
  }
})();

console.log('%c[Auth] Ready', 'color:#D4AF37;font-weight:bold');
