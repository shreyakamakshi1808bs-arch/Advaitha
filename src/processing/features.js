// Signal processing layer. Turns samples into a SOFTWARE CONTROL VARIABLE.
// stability (0..1): rises over STABILITY_DURATION seconds while the condition
//   (alpha >= ALPHA_THRESHOLD AND beta <= BETA_THRESHOLD) holds, falls faster
//   otherwise. It is a control value, NOT a physiological or mental measurement.
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
export function createProcessor() {
  let a = null, b = null, met = false, stability = 0, last = null
  return {
    reset() { a = b = null; met = false; stability = 0; last = null },
    // sample may be null when no/invalid data: condition counts as not met.
    update(sample, now, c) {
      const dt = last == null ? 0 : clamp(now - last, 0, 1); last = now
      const ok = sample && sample.valid
      if (ok) {
        a = a == null ? sample.alpha : a + (sample.alpha - a) * c.SMOOTHING
        b = b == null ? sample.beta : b + (sample.beta - b) * c.SMOOTHING
        const h = c.HYSTERESIS
        met = met
          ? a >= c.ALPHA_THRESHOLD - h && b <= c.BETA_THRESHOLD + h
          : a >= c.ALPHA_THRESHOLD && b <= c.BETA_THRESHOLD
      } else met = false
      const up = dt / c.STABILITY_DURATION
      stability = clamp(stability + (met ? up : -up * c.STABILITY_DECAY))
      return { alpha: a ?? 0, beta: b ?? 0, met, stability, valid: !!ok }
    },
  }
}
