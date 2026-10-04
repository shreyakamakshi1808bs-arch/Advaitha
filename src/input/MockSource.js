// MOCK EEG source: synthetic alphaPower/betaPower so the app runs without hardware.
// Scenario (loops every 45 s): 10 s unstable -> settled. Clearly DEMO data.
export class MockSource {
  constructor(hz = 10) { this.hz = hz; this.id = null }
  start(onSample) {
    const t0 = performance.now(), r = () => (Math.random() - 0.5)
    this.id = setInterval(() => {
      const t = ((performance.now() - t0) / 1000) % 45
      const noisy = t < 10
      const alpha = noisy ? 0.35 + r() * 0.35 : 0.78 + r() * 0.08
      const beta = noisy ? 0.65 + r() * 0.35 : 0.3 + r() * 0.08
      onSample({ alpha: Math.max(0, alpha), beta: Math.max(0, beta), control: null, valid: true })
    }, 1000 / this.hz)
  }
  stop() { clearInterval(this.id); this.id = null }
}
