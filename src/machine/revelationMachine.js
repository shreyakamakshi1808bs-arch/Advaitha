// Revelation state machine: PURE functions (no React, no timers inside).
// step(state, input, now, cfg) -> next state;  act(state, action, now) -> next state
// input = { hasData, valid, stability }
export const S = {
  INTRO: 'INTRO', PREPARE: 'PREPARE', WAITING: 'WAITING', EEG_DETECTED: 'EEG_DETECTED',
  CONDITION_STABLE: 'CONDITION_STABLE', REVEAL: 'REVEAL', LESSON_REVEALED: 'LESSON_REVEALED',
  REFLECTION: 'REFLECTION',
}
export const initial = (now = 0) => ({ name: S.INTRO, since: now, lesson: 0 })
const go = (st, name, now, extra = {}) => ({ ...st, ...extra, name, since: now })

export function act(st, action, now) {
  if (action === 'START' && st.name === S.INTRO) return go(st, S.PREPARE, now, { lesson: 0 })
  if (action === 'RESET') return initial(now)
  // Operator override for stage safety: jump into the reveal.
  if (action === 'FORCE_REVEAL' && [S.PREPARE, S.WAITING, S.EEG_DETECTED, S.CONDITION_STABLE].includes(st.name)) return go(st, S.REVEAL, now)
  return st
}

export function step(st, inp, now, cfg, lessonCount = 4) {
  const t = now - st.since
  switch (st.name) {
    case S.PREPARE:
      return inp.hasData && inp.valid && t >= cfg.PREPARE_HOLD ? go(st, S.WAITING, now) : st
    case S.WAITING:
      return inp.stability > 0.05 ? go(st, S.EEG_DETECTED, now) : st
    case S.EEG_DETECTED:
      if (inp.stability >= 1) return go(st, S.CONDITION_STABLE, now)
      return inp.stability <= 0 ? go(st, S.WAITING, now) : st
    case S.CONDITION_STABLE: // brief beat, then the (latched) reveal begins
      return t >= 1 ? go(st, S.REVEAL, now) : st
    case S.REVEAL:       // LATCH: from here on the signal no longer matters
      return t >= cfg.REVEAL_DURATION ? go(st, S.LESSON_REVEALED, now, { lesson: 0 }) : st
    case S.LESSON_REVEALED:
      if (t < cfg.LESSON_DURATION) return st
      return st.lesson + 1 >= lessonCount ? go(st, S.REFLECTION, now) : go(st, S.LESSON_REVEALED, now, { lesson: st.lesson + 1 })
    case S.REFLECTION:
      return t >= cfg.REFLECTION_DURATION ? initial(now) : st
    default:
      return st
  }
}
