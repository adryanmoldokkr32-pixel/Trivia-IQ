// =====================================================
// IQ-TRIVIA-RO / FAZA 3A / MODUL 8C-2: Game Logic
// State machine complet + Supabase + Timer + ELO
// =====================================================

import { supabase, requireAuth } from './supabase-client.js';
import { renderMap, setBase, markConquered, resetView, COUNTRY_STATES } from './map.js';
import { getCountryName, COUNTRY_CODES } from './map-data.js';

// === CONSTANTE ELO (psihologic) ===
const ELO_CORRECT_BASE = 15;
const ELO_STREAK_BONUS = 5;
const ELO_STREAK_MAX = 30;
const ELO_WRONG = -5;
const ELO_CONQUER_BONUS = 50;
const ELO_GIVEUP = -5;
const TIMER_SECONDS = 45;
const QUESTIONS_PER_COUNTRY = 3;
const WIN_THRESHOLD = 2; // 2/3 corecte = cucerire

// === STATE GLOBAL ===
const state = {
  user: null,
  profile: null,
  sessionId: null,
  conqueredCodes: new Set(),
  base: 'RO',
  currentTarget: null,
  questions: [],
  qIndex: 0,
  qResults: [], // [true, false, true] = răspunsuri
  timerInterval: null,
  timerLeft: TIMER_SECONDS,
  answered: false
};

// === DOM REFS ===
const $ = (id) => document.getElementById(id);
const els = {};

function cacheEls() {
  ['stat-conquered','stat-elo','stat-streak','back-btn','reset-btn','info-panel',
   'question-screen','q-close-btn','q-current','q-target','q-timer-fg','q-timer-text',
   'q-category','q-question','q-opt-a','q-opt-b','q-opt-c',
   'q-text-a','q-text-b','q-text-c','q-feedback','q-feedback-icon','q-feedback-text',
   'q-dot-1','q-dot-2','q-dot-3',
   'victory-screen','victory-country','victory-elo','victory-continue',
   'defeat-screen','defeat-message','defeat-retreat',
   'all-conquered-screen','triumph-elo','triumph-leaderboard'
  ].forEach(id => els[id] = $(id));
}

// === INIT ===
async function init() {
  cacheEls();
  
  state.user = await requireAuth();
  if (!state.user) return;
  
  await loadProfile();
  await ensureSession();
  await loadConqueredCountries();
  
  await renderMap($('map-container'), onCountryTap);
  setBase(state.base);
  state.conqueredCodes.forEach(code => markConquered(code));
  
  attachUiHandlers();
  updateStatsBar();
  checkAllConquered();
}

async function loadProfile() {
  const { data } = await supabase
    .from('profiles')
    .select('id, username, rating, streak, best_streak')
    .eq('id', state.user.id)
    .single();
  state.profile = data || { rating: 1000, streak: 0, best_streak: 0 };
}

async function ensureSession() {
  // Caută sesiune Solo activă
  const { data: existing } = await supabase
    .from('game_sessions')
    .select('id')
    .eq('host_id', state.user.id)
    .eq('mode', 'solo')
    .eq('status', 'active')
    .maybeSingle();
  
  if (existing) {
    state.sessionId = existing.id;
    return;
  }
  
  // Creează una nouă
  const { data } = await supabase
    .from('game_sessions')
    .insert({ host_id: state.user.id, mode: 'solo', status: 'active' })
    .select('id')
    .single();
  state.sessionId = data?.id;
}

async function loadConqueredCountries() {
  if (!state.sessionId) return;
  const { data } = await supabase
    .from('session_territories')
    .select('country_code')
    .eq('session_id', state.sessionId)
    .eq('owner_id', state.user.id);
  (data || []).forEach(r => state.conqueredCodes.add(r.country_code));
}

// === UI HANDLERS ===
function attachUiHandlers() {
  els['back-btn'].addEventListener('click', () => location.href = './modes.html');
  els['reset-btn'].addEventListener('click', () => {
    resetView();
    setTimeout(() => setBase(state.base), 100);
  });
  els['q-close-btn'].addEventListener('click', onGiveUp);
  ['a','b','c'].forEach(letter => {
    els['q-opt-'+letter].addEventListener('click', () => onAnswer(letter.toUpperCase()));
  });
  els['victory-continue'].addEventListener('click', () => hideOverlay('victory-screen'));
  els['defeat-retreat'].addEventListener('click', () => hideOverlay('defeat-screen'));
  els['triumph-leaderboard'].addEventListener('click', () => alert('Leaderboard la Faza 4'));
}

function updateStatsBar() {
  els['stat-conquered'].textContent = state.conqueredCodes.size;
  els['stat-elo'].textContent = state.profile.rating;
  els['stat-streak'].textContent = state.profile.streak;
}

// === CORE GAMEPLAY ===
function onCountryTap(code, mapState) {
  if (mapState !== COUNTRY_STATES.NEIGHBOR) {
    els['info-panel'].textContent = 'Tap pe un vecin (cyan) pentru a ataca';
    return;
  }
  startAttack(code);
}

async function startAttack(code) {
  state.currentTarget = code;
  state.qIndex = 0;
  state.qResults = [];
  state.answered = false;
  
  const level = computeDifficultyLevel();
  state.questions = await fetchQuestions(level);
  
  if (state.questions.length < 3) {
    els['info-panel'].textContent = 'Nu sunt suficiente întrebări în baza de date.';
    return;
  }
  
  els['q-target'].textContent = code;
  resetScoreDots();
  showQuestion(0);
  els['question-screen'].classList.remove('hidden');
}

function computeDifficultyLevel() {
  const n = state.conqueredCodes.size;
  if (n <= 5) return [1, 2];
  if (n <= 15) return [3, 4];
  return [5, 6, 7];
}

async function fetchQuestions(levelRange) {
  const { data } = await supabase
    .from('questions')
    .select('id, question, option_a, option_b, option_c, correct_answer, category_id, level, categories(name_ro)')
    .in('level', levelRange)
    .eq('verified', true)
    .limit(50);
  
  if (!data || data.length < 3) return [];
  return shuffle(data).slice(0, 3);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showQuestion(idx) {
  const q = state.questions[idx];
  els['q-current'].textContent = idx + 1;
  els['q-category'].textContent = q.categories?.name_ro || 'General';
  els['q-question'].textContent = q.question;
  els['q-text-a'].textContent = q.option_a;
  els['q-text-b'].textContent = q.option_b;
  els['q-text-c'].textContent = q.option_c;
  
  ['a','b','c'].forEach(l => {
    els['q-opt-'+l].className = 'q-option';
    els['q-opt-'+l].disabled = false;
  });
  els['q-feedback'].classList.add('hidden');
  state.answered = false;
  
  startTimer();
}

function startTimer() {
  clearInterval(state.timerInterval);
  state.timerLeft = TIMER_SECONDS;
  updateTimerUI();
  state.timerInterval = setInterval(() => {
    state.timerLeft--;
    updateTimerUI();
    if (state.timerLeft <= 0) {
      clearInterval(state.timerInterval);
      if (!state.answered) onAnswer(null); // timeout = greșit
    }
  }, 1000);
}

function updateTimerUI() {
  const pct = (state.timerLeft / TIMER_SECONDS) * 100;
  els['q-timer-fg'].style.strokeDashoffset = 100 - pct;
  els['q-timer-text'].textContent = state.timerLeft;
  els['q-timer-fg'].classList.toggle('warn', state.timerLeft <= 15 && state.timerLeft > 5);
  els['q-timer-fg'].classList.toggle('danger', state.timerLeft <= 5);
}

async function onAnswer(letter) {
  if (state.answered) return;
  state.answered = true;
  clearInterval(state.timerInterval);
  
  const q = state.questions[state.qIndex];
  const correct = (letter === q.correct_answer);
  state.qResults.push(correct);
  
  // Highlight vizual
  ['a','b','c'].forEach(l => {
    els['q-opt-'+l].disabled = true;
    if (l.toUpperCase() === q.correct_answer) els['q-opt-'+l].classList.add('q-option--correct');
    if (l.toUpperCase() === letter && !correct) els['q-opt-'+l].classList.add('q-option--wrong');
  });
  
  // Update score dot
  const dot = els['q-dot-' + (state.qIndex + 1)];
  dot.classList.add(correct ? 'q-score-dot--ok' : 'q-score-dot--ko');
  
  // Update ELO + streak local
  if (correct) {
    state.profile.streak++;
    const bonus = Math.min(state.profile.streak * ELO_STREAK_BONUS, ELO_STREAK_MAX);
    state.profile.rating += ELO_CORRECT_BASE + bonus;
    if (state.profile.streak > state.profile.best_streak) state.profile.best_streak = state.profile.streak;
  } else {
    state.profile.streak = 0;
    state.profile.rating += ELO_WRONG;
  }
  updateStatsBar();
  
  // Verifică dacă trebuie oprit (2 greșeli sau am terminat)
  const wrongs = state.qResults.filter(r => !r).length;
  const corrects = state.qResults.filter(r => r).length;
  
  setTimeout(async () => {
    if (corrects >= WIN_THRESHOLD) {
      await onConquer();
    } else if (wrongs >= 2) {
      await onDefeat();
    } else if (state.qIndex < QUESTIONS_PER_COUNTRY - 1) {
      state.qIndex++;
      showQuestion(state.qIndex);
    } else {
      // 3 întrebări terminate, dar < 2 corecte → defeat
      await onDefeat();
    }
  }, 1500);
}

async function onConquer() {
  const code = state.currentTarget;
  state.conqueredCodes.add(code);
  state.profile.rating += ELO_CONQUER_BONUS;
  
  // Persist DB
  await supabase.from('session_territories').insert({
    session_id: state.sessionId,
    country_code: code,
    owner_id: state.user.id
  });
  await persistProfile();
  
  // Update map vizual
  markConquered(code);
  updateStatsBar();
  
  // Fetch curiozitate random pentru victory
  const { data: facts } = await supabase
    .from('country_facts')
    .select('fact_text')
    .eq('country_code', code)
    .limit(10);
  const fact = facts && facts.length ? facts[Math.floor(Math.random() * facts.length)].fact_text : '';
  
  els['question-screen'].classList.add('hidden');
  els['victory-country'].textContent = getCountryName(code);
  els['victory-elo'].textContent = `+${ELO_CONQUER_BONUS} ELO · streak ${state.profile.streak} 🔥` + (fact ? `\n\n${fact}` : '');
  els['victory-screen'].classList.remove('hidden');
  
  if (state.conqueredCodes.size >= COUNTRY_CODES.length - 1) {
    setTimeout(() => showTriumph(), 2000);
  }
}

async function onDefeat() {
  const code = state.currentTarget;
  await persistProfile();
  
  const { data } = await supabase
    .from('country_defeat_messages')
    .select('message')
    .eq('country_code', code)
    .single();
  
  els['question-screen'].classList.add('hidden');
  els['defeat-message'].textContent = data?.message || `Nu ai reușit să cucerești ${getCountryName(code)}.`;
  els['defeat-screen'].classList.remove('hidden');
}

async function onGiveUp() {
  state.profile.rating += ELO_GIVEUP;
  state.profile.streak = 0;
  await persistProfile();
  updateStatsBar();
  clearInterval(state.timerInterval);
  els['question-screen'].classList.add('hidden');
  els['info-panel'].textContent = 'Ai renunțat. -5 ELO.';
}

async function persistProfile() {
  await supabase
    .from('profiles')
    .update({
      rating: state.profile.rating,
      streak: state.profile.streak,
      best_streak: state.profile.best_streak
    })
    .eq('id', state.user.id);
}

function showTriumph() {
  els['triumph-elo'].textContent = `ELO final: ${state.profile.rating}`;
  els['all-conquered-screen'].classList.remove('hidden');
}

function checkAllConquered() {
  if (state.conqueredCodes.size >= COUNTRY_CODES.length - 1) showTriumph();
}

function hideOverlay(id) { els[id].classList.add('hidden'); }
function resetScoreDots() {
  ['q-dot-1','q-dot-2','q-dot-3'].forEach(id => {
    els[id].className = 'q-score-dot';
  });
}

// === START ===
init();
