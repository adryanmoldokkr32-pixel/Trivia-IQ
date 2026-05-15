// ============================================================
// TRIVIA-IQ v2.0 — UI LAYER
// ============================================================

// ── TIMER (FIX COMPLET) ──────────────────────────────────────

const Timer = {
  _interval: null,
  _left: 0,

  start(seconds, onTick, onExpire) {
    this.stop()
    this._left = seconds
    onTick(this._left)
    this._interval = setInterval(() => {
      this._left--
      onTick(this._left)
      if (this._left <= 0) {
        this.stop()
        onExpire()
      }
    }, 1000)
  },

  stop() {
    if (this._interval) {
      clearInterval(this._interval)
      this._interval = null
    }
  },

  get left() { return this._left },
}

// ── SCREEN ROUTER ────────────────────────────────────────────

const Screen = {
  _current: null,

  show(id) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('screen--active')
      s.classList.add('screen--hidden')
    })
    const target = document.getElementById(id)
    if (!target) return
    target.classList.remove('screen--hidden')
    setTimeout(() => target.classList.add('screen--active'), 10)
    this._current = id
  },

  get current() { return this._current },
}

// ── TOAST NOTIFICATIONS ──────────────────────────────────────

const Toast = {
  show(msg, type = 'info', duration = 3000) {
    const el = document.createElement('div')
    el.className = `toast toast--${type}`
    el.textContent = msg
    document.getElementById('toast-container').appendChild(el)
    setTimeout(() => el.classList.add('toast--visible'), 10)
    setTimeout(() => {
      el.classList.remove('toast--visible')
      setTimeout(() => el.remove(), 300)
    }, duration)
  },
  success: (m) => Toast.show(m, 'success'),
  error:   (m) => Toast.show(m, 'error'),
  info:    (m) => Toast.show(m, 'info'),
}

// ── RATING BAR ───────────────────────────────────────────────

function animateRatingBar(el, from, to, duration = 800) {
  const start = performance.now()
  const fromPct = getLevelProgress(from)
  const toPct = getLevelProgress(to)
  function tick(now) {
    const p = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - p, 3)
    const current = fromPct + (toPct - fromPct) * eased
    el.style.width = current + '%'
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

// ── DELTA POPUP ──────────────────────────────────────────────

function showDelta(container, delta) {
  const el = document.createElement('div')
  el.className = `delta-popup ${delta >= 0 ? 'delta-popup--up' : 'delta-popup--down'}`
  el.textContent = (delta >= 0 ? '+' : '') + delta
  container.appendChild(el)
  setTimeout(() => el.classList.add('delta-popup--visible'), 10)
  setTimeout(() => el.remove(), 1200)
}

// ── CONFETTI ─────────────────────────────────────────────────

function confetti(container, count = 30) {
  const colors = ['#00f5ff','#9d4edd','#39ff14','#ff0090','#ffd700']
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div')
    p.className = 'confetti-particle'
    p.style.cssText = `
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-delay:${Math.random()*0.5}s;
      animation-duration:${0.8 + Math.random()*0.6}s;
    `
    container.appendChild(p)
    setTimeout(() => p.remove(), 1500)
  }
}

// ── SHAKE ─────────────────────────────────────────────────────

function shake(el) {
  el.classList.add('shake')
  setTimeout(() => el.classList.remove('shake'), 500)
}

// ── OPTION REVEAL ────────────────────────────────────────────

function revealAnswer(buttons, correct, selected) {
  buttons.forEach((btn, i) => {
    const letter = ['A','B','C'][i]
    if (letter === correct) {
      btn.classList.add('option--correct')
    } else if (letter === selected && selected !== correct) {
      btn.classList.add('option--wrong')
    }
    btn.disabled = true
  })
}

// ── RENDER QUESTION ──────────────────────────────────────────

function renderQuestion(q, container) {
  container.querySelector('[data-q]').textContent = q.question
  const opts = container.querySelectorAll('[data-opt]')
  ;[q.option_a, q.option_b, q.option_c].forEach((text, i) => {
    opts[i].querySelector('.opt-text').textContent = text
    opts[i].disabled = false
    opts[i].className = 'option-btn'
    opts[i].dataset.opt = ['A','B','C'][i]
  })
}
