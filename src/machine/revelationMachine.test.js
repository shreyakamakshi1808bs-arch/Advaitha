import test from 'node:test'
import assert from 'node:assert/strict'
import { S, initial, act, step } from './revelationMachine.js'
import { DEFAULTS as cfg } from '../config.js'
import { createProcessor } from '../processing/features.js'
import { parseLine } from '../input/parseLine.js'

const good = { hasData: true, valid: true, stability: 0 }
test('full journey with latch', () => {
  let s = act(initial(0), 'START', 0); assert.equal(s.name, S.PREPARE)
  s = step(s, good, 1, cfg); assert.equal(s.name, S.PREPARE)
  s = step(s, good, 2.5, cfg); assert.equal(s.name, S.WAITING)
  s = step(s, { ...good, stability: 0.3 }, 3, cfg); assert.equal(s.name, S.EEG_DETECTED)
  s = step(s, { ...good, stability: 1 }, 4, cfg); assert.equal(s.name, S.CONDITION_STABLE)
  s = step(s, good, 5.1, cfg); assert.equal(s.name, S.REVEAL)
  s = step(s, { ...good, stability: 0 }, 6, cfg); assert.equal(s.name, S.REVEAL) // noise ignored
  s = step(s, good, 5.1 + cfg.REVEAL_DURATION, cfg); assert.equal(s.name, S.LESSON_REVEALED)
})
test('lessons advance then reflection then intro', () => {
  let s = { name: S.LESSON_REVEALED, since: 0, lesson: 3 }
  s = step(s, good, cfg.LESSON_DURATION, cfg, 4); assert.equal(s.name, S.REFLECTION)
  s = step(s, good, cfg.LESSON_DURATION + cfg.REFLECTION_DURATION, cfg); assert.equal(s.name, S.INTRO)
})
test('stability rises only while condition holds, decays otherwise', () => {
  const p = createProcessor(); let r
  for (let i = 0; i <= 70; i++) r = p.update({ alpha: 0.8, beta: 0.3, valid: true }, i * 0.1, cfg)
  assert.ok(r.stability >= 1, 'reaches 1 after STABILITY_DURATION')
  for (let i = 71; i <= 110; i++) r = p.update({ alpha: 0.2, beta: 0.9, valid: true }, i * 0.1, cfg)
  assert.ok(r.stability < 0.5, 'decays when condition lost')
})
test('parseLine', () => {
  assert.deepEqual(parseLine('0.72,0.41,0'), { alpha: 0.72, beta: 0.41, control: 0, valid: true })
  assert.equal(parseLine('garbage'), null)
  assert.equal(parseLine('9,0.1').valid, false)
})
