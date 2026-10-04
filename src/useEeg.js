import { useCallback, useEffect, useRef, useState } from 'react'
import { loadCfg, saveCfg } from './config.js'
import { MockSource } from './input/MockSource.js'
import { WebSerialSource } from './input/WebSerialSource.js'
import { createProcessor } from './processing/features.js'
import { initial, act, step } from './machine/revelationMachine.js'
import { LESSONS } from './content/lessons.js'
// Glue: input layer -> processing -> state machine -> React state (ticks at 10 Hz).
const now = () => performance.now() / 1000
export function useEeg() {
  const [cfg, setCfgState] = useState(loadCfg)
  const cfgRef = useRef(cfg); cfgRef.current = cfg
  const [mode, setMode] = useState('DEMO')           // DEMO (mock) | LIVE (serial)
  const [link, setLink] = useState('mock')           // connection status text
  const [error, setError] = useState('')
  const [view, setView] = useState(() => ({ m: initial(now()), sig: { alpha: 0, beta: 0, stability: 0, met: false, valid: false }, hasData: false }))
  const latest = useRef({ s: null, t: 0 }), proc = useRef(createProcessor()), mach = useRef(view.m), src = useRef(null)

  const onSample = useCallback((s) => { latest.current = { s, t: now() } }, [])
  const startMock = useCallback(() => { src.current?.stop(); proc.current.reset(); const m = new MockSource(); m.start(onSample); src.current = m; setMode('DEMO'); setLink('mock'); setError('') }, [onSample])
  useEffect(() => { startMock(); return () => src.current?.stop() }, [startMock])

  const connect = useCallback(async () => {   // must be triggered by a click
    try {
      const s = new WebSerialSource(); await src.current?.stop(); proc.current.reset()
      await s.start(onSample, setLink); src.current = s; setMode('LIVE'); setError('')
    } catch (e) { setError(e.message || String(e)); startMock() }
  }, [onSample, startMock])

  useEffect(() => {
    const id = setInterval(() => {
      const t = now(), c = cfgRef.current, { s, t: ts } = latest.current
      const hasData = !!s && t - ts < c.STALE_AFTER
      const sig = proc.current.update(hasData ? s : null, t, c)
      const m = step(mach.current, { hasData, valid: sig.valid, stability: sig.stability }, t, c, LESSONS.length)
      mach.current = m
      setView({ m, sig, hasData })
    }, 100)
    return () => clearInterval(id)
  }, [])

  const dispatch = useCallback((a) => { mach.current = act(mach.current, a, now()); if (a === 'RESET') proc.current.reset(); setView((v) => ({ ...v, m: mach.current })) }, [])
  const setCfg = useCallback((k, v) => setCfgState((p) => { const n = { ...p, [k]: v }; saveCfg(n); return n }), [])
  return { cfg, setCfg, mode, link, error, view, dispatch, connect, startMock }
}
