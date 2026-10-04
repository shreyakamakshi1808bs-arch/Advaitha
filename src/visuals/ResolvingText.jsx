// Each word has its own deterministic clarity threshold, so text resolves
// word-by-word from blur/low-opacity/blanks into sharp type as `clarity` rises.
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }
const clamp = (x) => Math.min(1, Math.max(0, x))
export default function ResolvingText({ lines, clarity }) {
  let k = 0
  return (
    <div className="resolving">
      {lines.map((line, li) => (
        <p key={li}>
          {line.split(' ').map((w) => {
            const th = 0.08 + hash(++k) * 0.8
            const wc = clamp((clarity - th) / 0.12)
            const shown = wc <= 0 && clarity < 0.98 ? '_'.repeat(w.length) : w
            return (
              <span key={k} style={{ filter: `blur(${(1 - wc) * 7}px)`, opacity: 0.14 + 0.86 * wc }}>
                {shown}{' '}
              </span>
            )
          })}
        </p>
      ))}
    </div>
  )
}
