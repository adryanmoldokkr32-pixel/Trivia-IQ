// ============================================================
// TRIVIA-IQ v2.0 — IQ TEST MODE
// ============================================================

const IQTest = {
  questions: [],
  answers: [],
  current: 0,
  startTime: 0,
  session: null,

  async start(profile) {
    this.questions = await Questions.iqBatch()
    if (!this.questions.length) {
      Toast.error('Intrebarile IQ nu sunt disponibile!')
      return
    }
    this.answers = []
    this.current = 0
    this.startTime = Date.now()
    this.session = await Sessions.createIQ(profile.id)
    Screen.show('screen-iq')
    this._render()
    this._updateProgress()
  },

  _render() {
    const q = this.questions[this.current]
    const container = document.getElementById('screen-iq')
    container.querySelector('[data-q]').textContent = q.question

    const opts = container.querySelectorAll('.option-btn')
    ;[q.option_a, q.option_b, q.option_c].forEach((text, i) => {
      opts[i].querySelector('.opt-text').textContent = text
      opts[i].disabled = false
      opts[i].className = 'option-btn'
      opts[i].dataset.opt = ['A','B','C'][i]
    })

    const imgEl = container.querySelector('[data-iq-img]')
    if (q.image_svg) {
      imgEl.innerHTML = q.image_svg
      imgEl.style.display = 'block'
    } else {
      imgEl.innerHTML = ''
      imgEl.style.display = 'none'
    }

    const typeLabel = { logic:'🔗 Logică', math:'➕ Matematică', pattern:'🔁 Pattern', verbal:'📝 Verbal' }
    const typeEl = container.querySelector('[data-iq-type]')
    if (typeEl) typeEl.textContent = typeLabel[q.type] || q.type
  },

  _handleAnswer(selected) {
    const q = this.questions[this.current]
    const isCorrect = selected === q.correct_answer

    document.querySelectorAll('#screen-iq .option-btn').forEach(b => b.disabled = true)
    revealAnswer(
      [...document.querySelectorAll('#screen-iq .option-btn')],
      q.correct_answer, selected
    )

    this.answers.push({
      position: q.position,
      selected,
      correct: q.correct_answer,
      is_correct: isCorrect,
      type: q.type,
    })

    setTimeout(() => {
      this.current++
      if (this.current >= this.questions.length) {
        this._finish()
      } else {
        this._render()
        this._updateProgress()
      }
    }, 900)
  },

  async _finish() {
    const duration = Math.round((Date.now() - this.startTime) / 1000)
    const correctCount = this.answers.filter(a => a.is_correct).length
    const iqData = calcIQ(correctCount)

    const user = await Auth.getUser()
    if (user) {
      await Sessions.saveIQResult(
        user.id, correctCount, iqData.iq, duration, this.answers
      )
      await Sessions.end(this.session.id)
    }

    this._showResult(correctCount, iqData, duration)
  },

  _showResult(correct, iqData, duration) {
    Screen.show('screen-iq-result')
    const el = document.getElementById('screen-iq-result')

    el.querySelector('[data-iq-score]').textContent = iqData.iq
    el.querySelector('[data-iq-label]').textContent = iqData.label
    el.querySelector('[data-iq-correct]').textContent = `${correct}/33`
    el.querySelector('[data-iq-time]').textContent = `${Math.floor(duration/60)}m ${duration%60}s`

    // breakdown pe tipuri
    const types = ['logic','math','pattern','verbal']
    const typeLabels = { logic:'Logică', math:'Matematică', pattern:'Pattern', verbal:'Verbal' }
    const breakdown = el.querySelector('[data-iq-breakdown]')
    if (breakdown) {
      breakdown.innerHTML = types.map(t => {
        const total = this.answers.filter(a => a.type === t).length
        const ok = this.answers.filter(a => a.type === t && a.is_correct).length
        const pct = total ? Math.round((ok/total)*100) : 0
        return `<div class="breakdown-row">
          <span>${typeLabels[t]}</span>
          <div class="breakdown-bar"><div style="width:${pct}%"></div></div>
          <span>${ok}/${total}</span>
        </div>`
      }).join('')
    }

    // animatie scor
    this._animateIQ(el.querySelector('[data-iq-score]'), 70, iqData.iq)
    confetti(el)
  },

  _animateIQ(el, from, to) {
    const dur = 1200
    const start = performance.now()
    function tick(now) {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      el.textContent = Math.round(from + (to - from) * eased)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  },

  _updateProgress() {
    const el = document.getElementById('iq-progress')
    if (!el) return
    const pct = ((this.current) / this.questions.length) * 100
    el.style.width = pct + '%'
    const counter = document.getElementById('iq-counter')
    if (counter) counter.textContent = `${this.current + 1} / ${this.questions.length}`
  },

  bindAnswer() {
    document.querySelectorAll('#screen-iq .option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return
        document.querySelectorAll('#screen-iq .option-btn').forEach(b => b.disabled = true)
        this._handleAnswer(btn.dataset.opt)
      })
    })
  },
}
