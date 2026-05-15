// ============================================================
// TRIVIA-IQ v2.0 — ELO ENGINE
// ============================================================

const EloEngine = {

  // Probabilitate de raspuns corect pentru rating vs difficulty
  expected(playerRating, questionDifficulty) {
    return 1 / (1 + Math.pow(10, (questionDifficulty - playerRating) / 400))
  },

  // Calcul delta rating dupa raspuns
  delta(playerRating, questionDifficulty, isCorrect, timeFactor = 1.0) {
    const E = this.expected(playerRating, questionDifficulty)
    const outcome = isCorrect ? 1 : 0
    const raw = Math.round(ELO.K * timeFactor * (outcome - E))
    return Math.max(-ELO.MAX_DELTA, Math.min(ELO.MAX_DELTA, raw))
  },

  // Aplica delta si returneaza noul rating
  apply(currentRating, delta) {
    return Math.max(ELO.MIN_RATING, currentRating + delta)
  },

  // Factor de timp: raspuns rapid = bonus, lent = penalizare
  timeFactor(timeLeft, totalTime) {
    if (!totalTime) return 1.0
    const ratio = timeLeft / totalTime
    if (ratio >= 0.8) return 1.3  // sub 20% timp folosit: bonus
    if (ratio >= 0.5) return 1.1  // sub 50%: mic bonus
    if (ratio >= 0.2) return 0.9  // sub 80%: mic malus
    return 0.7                    // folosit aproape tot: malus
  },

  // Dificultate recomandata pentru un rating dat (matchmaking)
  recommended(rating) {
    return Math.max(200, Math.min(2400, rating + 100))
  },

  // Streak bonus: 3+ correct la rand = K*1.2
  streakMultiplier(streak) {
    if (streak >= 7) return 1.5
    if (streak >= 5) return 1.3
    if (streak >= 3) return 1.2
    return 1.0
  },

  // Calcul complet intr-un singur apel
  calculate({ playerRating, questionDifficulty, isCorrect, timeLeft, totalTime, streak = 0 }) {
    const tf = this.timeFactor(timeLeft, totalTime)
    const sm = this.streakMultiplier(streak)
    const E = this.expected(playerRating, questionDifficulty)
    const outcome = isCorrect ? 1 : 0
    const raw = Math.round(ELO.K * tf * sm * (outcome - E))
    const delta = Math.max(-ELO.MAX_DELTA, Math.min(ELO.MAX_DELTA, raw))
    const newRating = this.apply(playerRating, delta)
    return {
      delta,
      newRating,
      expected: Math.round(E * 100),
      levelBefore: getLevel(playerRating),
      levelAfter: getLevel(newRating),
      levelUp: getLevel(newRating).id > getLevel(playerRating).id,
    }
  },
}
