// ALL prototype parameters live here. Values are PROTOTYPE parameters (not
// scientific constants) - tune them after real EEG calibration.
// Inputs are expected as normalized 0..1 features (alphaPower, betaPower).
export const DEFAULTS = {
  ALPHA_THRESHOLD: 0.6,     // condition needs alphaPower >= this ...
  BETA_THRESHOLD: 0.5,      // ... AND betaPower <= this
  HYSTERESIS: 0.05,         // margin to leave the condition (prevents flicker)
  STABILITY_DURATION: 6,    // seconds the condition must hold to trigger reveal
  REVEAL_DURATION: 8,       // seconds the text takes to resolve after trigger
  LESSON_DURATION: 7,       // seconds each lesson stays on screen
  REFLECTION_DURATION: 6,   // seconds before returning to INTRO
  PREPARE_HOLD: 2,          // seconds of valid data before leaving "Be still"
  SMOOTHING: 0.25,          // 0..1, higher = less smoothing
  STABILITY_DECAY: 2,       // stability falls this many times faster than it rises
  STALE_AFTER: 2,           // seconds without samples = no signal
  PRE_REVEAL_CLARITY: 0.7,  // max text clarity reachable before the trigger
}
export const BAUD = 115200
const KEY = 'advaitha.cfg.v1'
export const loadCfg = () => {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return { ...DEFAULTS } }
}
export const saveCfg = (c) => { try { localStorage.setItem(KEY, JSON.stringify(c)) } catch { /* ignore */ } }
