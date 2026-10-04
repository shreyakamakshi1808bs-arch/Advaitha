import { useEffect, useRef } from 'react'
// NOISE -> SILENCE -> REVELATION. Particles jitter around a ring; jitter shrinks
// as `clarity` (0..1) rises, and faint geometry (circles + interlocked triangles)
// fades in. clarity is read from a ref each frame so React re-renders aren't needed.
const N = 260
export default function TattvaField({ clarity }) {
  const ref = useRef(null), cl = useRef(clarity)
  cl.current = clarity
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d')
    const ps = Array.from({ length: N }, (_, i) => ({ a: (i / N) * Math.PI * 2, p: Math.random() * 6.28, s: 0.4 + Math.random() * 1.2 }))
    let raf, shown = 0
    const fit = () => { const d = devicePixelRatio || 1, w = cv.clientWidth; cv.width = w * d; cv.height = w * d; ctx.setTransform(d, 0, 0, d, 0, 0) }
    fit(); addEventListener('resize', fit)
    const draw = (ms) => {
      const w = cv.clientWidth, c = w / 2, R = w * 0.32, t = ms / 1000
      shown += (cl.current - shown) * 0.03          // slow easing
      const u = 1 - shown
      ctx.clearRect(0, 0, w, w)
      ctx.strokeStyle = `rgba(150,110,60,${0.05 + shown * shown * 0.3})`; ctx.lineWidth = 1
      for (const r of [R, R * 0.66, R * 0.33]) { ctx.beginPath(); ctx.arc(c, c, r, 0, 6.283); ctx.stroke() }
      for (const dir of [-1, 1]) {
        ctx.beginPath()
        for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 * dir + (i * 2 * Math.PI) / 3; const x = c + Math.cos(a) * R, y = c + Math.sin(a) * R; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y) }
        ctx.closePath(); ctx.stroke()
      }
      for (const q of ps) {
        const j = Math.pow(u, 1.3) * R * 0.9
        const x = c + Math.cos(q.a) * R + Math.sin(t * q.s + q.p) * j
        const y = c + Math.sin(q.a) * R + Math.cos(t * q.s * 1.3 + q.p) * j
        ctx.fillStyle = `rgba(60,48,36,${0.25 + shown * 0.5})`
        ctx.beginPath(); ctx.arc(x, y, 1.6 + shown * 0.8, 0, 6.283); ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', fit) }
  }, [])
  return <canvas ref={ref} className="field" aria-hidden="true" />
}
