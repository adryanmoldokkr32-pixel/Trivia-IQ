// ============================================================
// TRIVIA-IQ v2.0 — DATABASE LAYER
// ============================================================

let _sb = null

function sb() {
  if (!_sb) _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return _sb
}

// ── AUTH ─────────────────────────────────────────────────────

const Auth = {
  async signUp(email, password, username) {
    const { data, error } = await sb().auth.signUp({
      email, password,
      options: { data: { username } }
    })
    if (error) throw error
    return data
  },

  async signIn(email, password) {
    const { data, error } = await sb().auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signInGuest() {
    const { data, error } = await sb().auth.signInAnonymously()
    if (error) throw error
    return data
  },

  async signOut() {
    await sb().auth.signOut()
  },

  async getUser() {
    const { data: { user } } = await sb().auth.getUser()
    return user
  },

  onAuthChange(cb) {
    return sb().auth.onAuthStateChange(cb)
  }
}

// ── PROFILES ─────────────────────────────────────────────────

const Profiles = {
  async get(userId) {
    const { data, error } = await sb()
      .from('profiles').select('*').eq('id', userId).single()
    if (error) throw error
    return data
  },

  async upsert(userId, fields) {
    const { data, error } = await sb()
      .from('profiles').upsert({ id: userId, ...fields }).select().single()
    if (error) throw error
    return data
  },

  async updateRating(userId, newRating, streak) {
    const lvl = getLevel(newRating)
    const { error } = await sb().from('profiles').update({
      rating: newRating,
      level: lvl.id,
      title: lvl.title,
      streak,
      best_streak: sb().rpc('greatest', { a: streak, b: 0 }),
      last_played_at: new Date().toISOString(),
    }).eq('id', userId)
    if (error) throw error
  },

  async leaderboard(limit = 20) {
    const { data, error } = await sb()
      .from('profiles')
      .select('id, username, rating, level, title, streak, avatar_url')
      .order('rating', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },
}

// ── QUESTIONS ────────────────────────────────────────────────

const Questions = {
  async forRating(rating, count = 1) {
    const target = EloEngine.recommended(rating)
    const margin = 300
    const { data, error } = await sb()
      .from('questions')
      .select('*')
      .gte('difficulty', target - margin)
      .lte('difficulty', target + margin)
      .eq('verified', true)
      .order('times_asked', { ascending: true })
      .limit(count * 3)
    if (error) throw error
    const shuffled = (data || []).sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  },

  async iqBatch() {
    const { data, error } = await sb()
      .from('iq_questions')
      .select('*')
      .order('position', { ascending: true })
    if (error) throw error
    return data || []
  },

  async markAnswered(questionId, correct) {
    await sb().rpc('increment_question_stats', {
      qid: questionId, was_correct: correct
    }).catch(() => {})
  },
}

// ── SESSIONS ─────────────────────────────────────────────────

const Sessions = {
  async createSolo(userId) {
    const { data, error } = await sb().from('game_sessions').insert({
      mode: 'solo', host_id: userId, status: 'active', started_at: new Date().toISOString()
    }).select().single()
    if (error) throw error
    return data
  },

  async end(sessionId, winnerId = null) {
    await sb().from('game_sessions').update({
      status: 'finished', winner_id: winnerId, ended_at: new Date().toISOString()
    }).eq('id', sessionId).catch(() => {})
  },

  async logAnswer(entry) {
    await sb().from('answer_log').insert(entry).catch(() => {})
  },

  async createIQ(userId) {
    const { data, error } = await sb().from('game_sessions').insert({
      mode: 'iq_test', host_id: userId, status: 'active', started_at: new Date().toISOString()
    }).select().single()
    if (error) throw error
    return data
  },

  async saveIQResult(userId, correctCount, iqScore, duration, answers) {
    const { data, error } = await sb().from('iq_results').insert({
      user_id: userId, correct_count: correctCount,
      iq_score: iqScore, duration_seconds: duration, answers
    }).select().single()
    if (error) throw error
    return data
  },
}
