// ============================================================
// TRIVIA-IQ v2.0 — CONFIG
// ============================================================

const SUPABASE_URL = 'https://ilowliyucohvqossxqbr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb3dsaXl1Y29odnFvc3N4cWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTY2ODIsImV4cCI6MjA5MjMzMjY4Mn0.Fyss-AQZDiEpDoSWTgcPVFhWdnvWSKDwkX9TFIxBNQc'

const ELO = {
  STARTER: 1000,
  K: 32,
  MAX_DELTA: 250,
  MIN_RATING: 100,
}

const LEVELS = [
  { id:1, name:'NOVICE',      title:'Incepator',    min:0,    max:799,  color:'#607d8b', neon:'#78909c', icon:'🔰' },
  { id:2, name:'APPRENTICE',  title:'Ucenic',       min:800,  max:999,  color:'#4caf50', neon:'#66bb6a', icon:'⚡' },
  { id:3, name:'SCHOLAR',     title:'Savant',       min:1000, max:1199, color:'#2196f3', neon:'#42a5f5', icon:'📚' },
  { id:4, name:'EXPERT',      title:'Expert',       min:1200, max:1399, color:'#9c27b0', neon:'#ab47bc', icon:'🎯' },
  { id:5, name:'MASTER',      title:'Maestru',      min:1400, max:1599, color:'#ff9800', neon:'#ffa726', icon:'🏆' },
  { id:6, name:'GRANDMASTER', title:'Mare Maestru', min:1600, max:1799, color:'#f44336', neon:'#ef5350', icon:'💎' },
  { id:7, name:'LEGEND',      title:'Legenda',      min:1800, max:9999, color:'#00f5ff', neon:'#00f5ff', icon:'👑' },
]

const IQ_THRESHOLDS = [
  { min:32, iq:160, label:'Genial' },
  { min:28, iq:145, label:'Superior' },
  { min:23, iq:130, label:'Foarte Inalt' },
  { min:17, iq:115, label:'Inalt' },
  { min:10, iq:100, label:'Mediu' },
  { min:5,  iq:85,  label:'Sub Mediu' },
  { min:0,  iq:70,  label:'Liminar' },
]

const TIMER = {
  SOLO: 25,
  MULTI: 20,
  IQ: null,
}

const MODES = {
  SOLO:  { id:'solo',    label:'Solo',        icon:'⚔️',  players:1 },
  DUO:   { id:'duo',     label:'Duel',        icon:'🤺',  players:2 },
  TRIO:  { id:'trio',    label:'Trio',        icon:'🏟️', players:3 },
  IQ:    { id:'iq_test', label:'Test IQ',     icon:'🧠',  players:1 },
}

function getLevel(rating) {
  return LEVELS.find(l => rating >= l.min && rating <= l.max) || LEVELS[0]
}

function calcIQ(correct) {
  const t = IQ_THRESHOLDS.find(t => correct >= t.min)
  return t ? t : IQ_THRESHOLDS[IQ_THRESHOLDS.length - 1]
}

function getLevelProgress(rating) {
  const lvl = getLevel(rating)
  const range = lvl.max - lvl.min
  const progress = rating - lvl.min
  return Math.min(100, Math.round((progress / range) * 100))
}
