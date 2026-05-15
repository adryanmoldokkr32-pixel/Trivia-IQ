// ============================================================
// TRIVIA-IQ v2.0 — SOLO MODE
// ============================================================

const Solo = {
  session: null,
  question: null,
  streak: 0,
  combo: 0,
  answered: 0,
  correct: 0,
  startTime: 0,

  async start(profile) {
    this.session = await Sessions.createSolo(profile.id)
    this.streak = profile.streak || 0
    this.combo = 0
    this.answered = 0
    this.correct = 0
    this.startTime = Date.now()
    Screen.show('screen-solo')
    this._updateHUD(profile)
    await this._nextQuestion(profile)
  },

  async _nextQuestion(profile) {
    const [q] = await Questions.forRating(profile.rating, 1)
    if (!q) { Toast.error('Nu exista intrebari pentru nivelul tau!'); return }
    this.question = q
    renderQuestion(q, document.getElementById('screen-solo'))
    this._updateDifficulty(q.difficulty)

    Timer.start(TIMER.SOLO, (t) => {
      this._updateTimer(t, TIMER.SOLO)
    }, () => {
      this._handleAnswer(null, profile)
    })
  },

  async _handleAnswer(selected, profile) {
    Timer.stop()
    const q = this.question
    const isCorrect = selected !== null && selected === q.correct_answer
    const timeLeft = Timer.left

    const result = EloEngine.calculate({
      playerRating: profile.rating,
      questionDifficulty: q.difficulty,
      isCorrect,
      timeLeft,
      totalTime: TIMER.SOLO,
      streak: this.streak,
    })

    this.answered++
    if (isCorrect) {
      this.correct++
      this.streak++
      this.combo++
      confetti(document.getElementById('solo-feedback'))
    } else {
      this.streak = 0
      this.combo = 0
      shake(document.getElementById('solo-card'))
    }

    const opts = document.querySelectorAll('#screen-solo .option-btn')
    if (selected) revealAnswer([...opts], q.correct_answer, selected)

    const deltaContainer = document.getElementById('solo-delta')
    showDelta(deltaContainer, result.delta)

    if (result.levelUp) {
      Toast.success(`LEVEL UP! ${result.levelAfter.icon} ${result.levelAfter.title}`)
    }

    profile.rating = result.newRating

    await Sessions.logAnswer({
      user_id: profile.id,
      question_id: q.id,
      session_id: this.session.id,
      selected_answer: selected,
      is_correct: isCorrect,
      time_taken_ms: (TIMER.SOLO - timeLeft) * 1000,
      rating_before: result.newRating - result.delta,
      rating_after: result.newRating,
    })

    this._updateHUD(profile)
    await Questions.markAnswered(q.id, isCorrect)

    setTimeout(async () => {
      if (this.answered >= 10) {
        await this._finish(profile)
      } else {
        await this._nextQuestion(profile)
      }
    }, 1400)
  },

  async _finish(profile) {
    Timer.stop()
    await Sessions.end(this.session.id)
    await Profiles.updateRating(profile.id, profile.rating, this.streak)
    App.updateLocalProfile(profile)
    this._showResults(profile)
  },

  _showResults(profile) {
    const el = document.getElementById('screen-solo-result')
    el.querySelector('[data-rating]').textContent = profile.rating
    el.querySelector('[data-correct]').textContent = `${this.correct}/${this.answered}`
    el.querySelector('[data-streak]').textContent = this.streak
    const lvl = getLevel(profile.rating)
    el.querySelector('[data-level]').textContent = `${lvl.icon} ${lvl.title}`
    Screen.show('screen-solo-result')
  },

  bindAnswer(profile) {
    document.querySelectorAll('#screen-solo .option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return
        document.querySelectorAll('#screen-solo .option-btn').forEach(b => b.disabled = true)
        this._handleAnswer(btn.dataset.opt, profile)
      })
    })
  },

  _updateHUD(profile) {
    const lvl = getLevel(profile.rating)
    document.getElementById('solo-rating').textContent = profile.rating
    document.getElementById('solo-level').textContent = `${lvl.icon} ${lvl.name}`
    document.getElementById('solo-streak').textContent = this.streak
    document.getElementById('solo-combo').textContent = this.combo > 1 ? `x${this.combo}` : ''
    const bar = document.getElementById('solo-level-bar')
    if (bar) bar.style.width = getLevelProgress(profile.rating) + '%'
  },

  _updateTimer(t, total) {
    const el = document.getElementById('solo-timer')
    if (!el) return
    el.textContent = t
    const pct = (t / total) * 100
    el.style.setProperty('--pct', pct + '%')
    el.className = `timer ${t <= 5 ? 'timer--danger' : t <= 10 ? 'timer--warn' : ''}`
  },

  _updateDifficulty(diff) {
    const el = document.getElementById('solo-diff')
    if (el) el.textContent = `ELO ${diff}`
  },
}
