// Parses one serial line "alphaPower,betaPower[,controlState]" e.g. "0.72,0.41,0".
// Returns {alpha, beta, control, valid} or null for garbage lines.
export function parseLine(line) {
  const p = String(line).trim().split(',')
  if (p.length < 2) return null
  const alpha = parseFloat(p[0]), beta = parseFloat(p[1])
  if (!Number.isFinite(alpha) || !Number.isFinite(beta)) return null
  const control = p[2] !== undefined ? parseInt(p[2], 10) : null
  const valid = alpha >= 0 && alpha <= 1.5 && beta >= 0 && beta <= 1.5 // out-of-range = unusable
  return { alpha, beta, control: Number.isNaN(control) ? null : control, valid }
}
