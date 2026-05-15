// ============================================================
// TRIVIA-IQ v2.0 — APP CORE
// ============================================================

const App = {
  profile: null,
  user: null,

  async init() {
    Auth.onAuthChange(async (event, session) => {
      if (session?.user) {
        this.user = session.user
        try {
          this.profile = await Profiles.get(session.user.id)
        } catch {
          this.profile = await Profiles.upsert(session.user.id, {
            username: session.user.email?.split('@')[0] || 'Guest',
            rating: ELO.STARTER,
            is_guest: session.user.is_anonymous || false,
          })
        }
        this._onLoggedIn()
      } else {
        this.user = null
        this.profile = null
        Screen.show('screen-auth')
      }
    })

    this._bindAuth()
    this._bindHome()
    this._bindSolo()
    this._bindIQ()
  },

  updateLocalProfile(p) {
    this.profile = { ...this.profile, ...p }
  },

  // ── AUTH ───────────────────────────────────────────────────

  _bindAuth() {
    document.getElementById('btn-login')?.addEventListener('click', async () => {
      const email = document.getElementById('auth-email').value.trim()
      const pass  = document.getElementById('auth-pass').value
      if (!email || !pass) { Toast.error('Completeaza email si parola'); return }
      try {
        await Auth.signIn(email, pass)
      } catch (e) {
        Toast.error(e.message || 'Eroare login')
      }
    })

    document.getElementById('btn-signup')?.addEventListener('click', async () => {
      const email    = document.getElementById('auth-email').value.trim()
      const pass     = document.getElementById('auth-pass').value
      const username = document.getElementById('auth-username').value.trim()
      if (!email || !pass || !username) { Toast.error('Completeaza toate campurile'); return }
      try {
        await Auth.signUp(email, pass, username)
        Toast.success('Cont creat! Verifica email-ul.')
      } catch (e) {
        Toast.error(e.message || 'Eroare inregistrare')
      }
    })

    document.getElementById('btn-guest')?.addEventListener('click', async () => {
      try {
        await Auth.signInGuest()
      } catch (e) {
        Toast.error('Nu se poate juca ca invitat momentan')
      }
    })

    document.getElementById('btn-logout')?.addEventListener('click', async () => {
      await Auth.signOut()
    })
  },

  // ── HOME ───────────────────────────────────────────────────

  _onLoggedIn() {
    this._renderHome()
    Screen.show('screen-home')
  },

  _renderHome() {
    const p = this.profile
    if (!p) return
    const lvl = getLevel(p.rating)

    document.getElementById('home-username').textContent = p.username || 'Jucator'
    document.getElementById('home-rating').textContent = p.rating
    document.getElementById('home-title').textContent = `${lvl.icon} ${lvl.title}`
    document.getElementById('home-streak').textContent = p.streak || 0
    document.getElementById('home-level-name').textContent = lvl.name
    document.getElementById('home-bar').style.width = getLevelProgress(p.rating) + '%'

    const avatar = document.getElementById('home-avatar')
    if (avatar) {
      avatar.style.background = `linear-gradient(135deg, ${lvl.color}, ${lvl.neon})`
      avatar.textContent = (p.username || '?')[0].toUpperCase()
    }
  },

  _bindHome() {
    document.getElementById('btn-solo')?.addEventListener('click', async () => {
      if (!this.profile) return
      await Solo.start(this.profile)
      Solo.bindAnswer(this.profile)
    })

    document.getElementById('btn-iq')?.addEventListener('click', async () => {
      if (!this.profile) return
      await IQTest.start(this.profile)
      IQTest.bindAnswer()
    })

    document.getElementById('btn-leaderboard')?.addEventListener('click', async () => {
      await this._loadLeaderboard()
      Screen.show('screen-leaderboard')
    })

    document.querySelectorAll('[data-back-home]').forEach(btn => {
      btn.addEventListener('click', () => {
        Timer.stop()
        this._renderHome()
        Screen.show('screen-home')
      })
    })
  },

  async _loadLeaderboard() {
    const data = await Profiles.leaderboard(50)
    const list = document.getElementById('lb-list')
    if (!list) return
    list.innerHTML = data.map((p, i) => {
      const lvl = getLevel(p.rating)
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`
      const isMe = p.id === this.user?.id
      return `<div class="lb-row ${isMe ? 'lb-row--me' : ''}">
        <span class="lb-rank">${medal}</span>
        <span class="lb-avatar" style="background:${lvl.color}">${(p.username||'?')[0].toUpperCase()}</span>
        <span class="lb-name">${p.username || 'Anonim'}</span>
        <span class="lb-level">${lvl.icon}</span>
        <span class="lb-rating">${p.rating}</span>
      </div>`
    }).join('')
  },

  // ── SOLO RESULT ────────────────────────────────────────────

  _bindSolo() {
    document.getElementById('btn-solo-again')?.addEventListener('click', async () => {
      if (!this.profile) return
      await Solo.start(this.profile)
      Solo.bindAnswer(this.profile)
    })
  },

  // ── IQ RESULT ─────────────────────────────────────────────

  _bindIQ() {
    document.getElementById('btn-iq-again')?.addEventListener('click', async () => {
      if (!this.profile) return
      await IQTest.start(this.profile)
      IQTest.bindAnswer()
    })
  },
}

document.addEventListener('DOMContentLoaded', () => App.init())
