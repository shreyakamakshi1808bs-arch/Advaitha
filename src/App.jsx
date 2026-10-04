import { useEffect, useState } from 'react'
import { useEeg } from './useEeg.js'
import { S } from './machine/revelationMachine.js'
import { LESSONS, ATTRIBUTION, CLOSING } from './content/lessons.js'
import ResolvingText from './visuals/ResolvingText.jsx'
import TattvaField from './visuals/TattvaField.jsx'

const SLIDERS = [['ALPHA_THRESHOLD', 0, 1, 0.01], ['BETA_THRESHOLD', 0, 1, 0.01], ['STABILITY_DURATION', 1, 30, 1], ['REVEAL_DURATION', 2, 20, 1]]
const LABEL = { INTRO: 'INTRO', PREPARE: 'PREPARING', WAITING: 'WAITING', EEG_DETECTED: 'EEG DETECTED', CONDITION_STABLE: 'CONDITION STABLE', REVEAL: 'REVEAL', LESSON_REVEALED: 'LESSON REVEALED', REFLECTION: 'REFLECTION' }
const Bar = ({ label, v }) => (
  <div className="meter"><span>{label}</span><i><b style={{ width: `${Math.min(100, v * 100)}%` }} /></i></div>
)

export default function App() {
  const e = useEeg()
  const { view, cfg, mode, dispatch } = e
  const { m, sig } = view
  const [open, setOpen] = useState(false)
  useEffect(() => { // operator keys: R = force reveal, X = reset to intro
    const k = (ev) => { if (ev.target.tagName === 'INPUT') return; if (ev.key === 'r') dispatch('FORCE_REVEAL'); if (ev.key === 'x') dispatch('RESET') }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [dispatch])

  // Text clarity: follows stability before the trigger, then eases up (latched).
  const el = (performance.now() / 1000) - m.since
  let textClarity = 0
  if (m.name === S.WAITING || m.name === S.EEG_DETECTED) textClarity = sig.stability * cfg.PRE_REVEAL_CLARITY
  else if (m.name === S.CONDITION_STABLE) textClarity = cfg.PRE_REVEAL_CLARITY
  else if (m.name === S.REVEAL) textClarity = cfg.PRE_REVEAL_CLARITY + (1 - cfg.PRE_REVEAL_CLARITY) * Math.min(1, el / cfg.REVEAL_DURATION)
  else if (m.name === S.LESSON_REVEALED || m.name === S.REFLECTION) textClarity = 1
  // Field follows the LIVE signal even after reveal: noise may return, knowledge stays.
  const fieldClarity = m.name === S.INTRO || m.name === S.PREPARE ? 0.05 : m.name === S.REVEAL ? Math.max(sig.stability, textClarity) : sig.stability

  let body
  if (m.name === S.INTRO) body = (
    <div className="center">
      <h1>ADVAITHA <small lang="sa">अद्वैत</small></h1>
      <p className="lead">From noise to clarity.</p>
      <p className="sub">Knowledge is revealed when what obscures it becomes still.</p>
      <button className="start" onClick={() => dispatch('START')}>Begin</button>
    </div>)
  else if (m.name === S.PREPARE) body = (
    <div className="center">
      <p className="lead">Be still.</p>
      <ul className="status">
        <li className={e.link === 'connected' || mode === 'DEMO' ? 'ok' : ''}>{mode === 'DEMO' ? 'Demo signal source' : 'BioAmp connected'}</li>
        <li className={view.hasData && sig.valid ? 'ok' : ''}>EEG signal detected</li>
      </ul>
    </div>)
  else if (m.name === S.REFLECTION) body = <div className="center"><p className="lead big">{CLOSING}</p></div>
  else {
    const li = m.name === S.LESSON_REVEALED ? m.lesson : 0
    const cap = m.name === S.WAITING ? 'Something is here. But it has not yet become clear.'
      : m.name === S.EEG_DETECTED ? 'Finding clarity…'
      : m.name === S.CONDITION_STABLE || m.name === S.REVEAL ? 'Becoming clear…' : ATTRIBUTION
    body = (
      <div className="center" key={m.name === S.LESSON_REVEALED ? `l${li}` : 'x'}>
        <ResolvingText lines={LESSONS[li]} clarity={textClarity} />
        <p className="caption">{cap}</p>
      </div>)
  }

  return (
    <main className={`stage ${m.name === S.LESSON_REVEALED || m.name === S.REFLECTION ? 'clear' : ''}`}>
      <header><span>ADVAITHA</span><span className={`badge ${mode}`}>{mode === 'DEMO' ? 'DEMO · synthetic signal' : 'LIVE · EEG'}</span></header>
      <TattvaField clarity={fieldClarity} />
      {body}
      <footer>
        <Bar label="Alpha" v={sig.alpha} /><Bar label="Beta" v={sig.beta} />
      </footer>
      <button className="sysbtn" onClick={() => setOpen(!open)}>System</button>
      {open && (
        <aside className="system">
          <h3>EEG SIGNAL</h3>
          <dl>
            <dt>Alpha Power</dt><dd>{sig.alpha.toFixed(2)}</dd>
            <dt>Beta Power</dt><dd>{sig.beta.toFixed(2)}</dd>
            <dt>Stability</dt><dd>{Math.round(sig.stability * 100)}%</dd>
            <dt>State</dt><dd>{LABEL[m.name]}</dd>
            <dt>Source</dt><dd>{mode} · {e.link}</dd>
          </dl>
          <h3>PROTOTYPE PARAMETERS</h3>
          {SLIDERS.map(([k, lo, hi, st]) => (
            <label key={k}>{k} <b>{cfg[k]}</b>
              <input type="range" min={lo} max={hi} step={st} value={cfg[k]} onChange={(ev) => e.setCfg(k, +ev.target.value)} />
            </label>))}
          <div className="row">
            <button onClick={e.connect}>Connect Arduino</button>
            <button onClick={e.startMock}>Use demo signal</button>
          </div>
          {e.error && <p className="err">{e.error}</p>}
          <p className="hint">Keys: R force reveal · X reset. Values are software control variables, not measures of mind or emotion.</p>
        </aside>
      )}
    </main>
  )
}
