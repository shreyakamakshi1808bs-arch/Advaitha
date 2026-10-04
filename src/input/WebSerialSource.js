import { parseLine } from './parseLine.js'
import { BAUD } from '../config.js'
// LIVE source: Arduino over the Web Serial API (Chrome/Edge, localhost or HTTPS).
// start() must be called from a user click (browser requirement).
export class WebSerialSource {
  async start(onSample, onStatus) {
    if (!('serial' in navigator)) throw new Error('Web Serial needs Chrome or Edge')
    this.port = await navigator.serial.requestPort()
    await this.port.open({ baudRate: BAUD })
    this.running = true
    onStatus?.('connected')
    const decoder = new TextDecoderStream()
    this.piped = this.port.readable.pipeTo(decoder.writable).catch(() => {})
    this.reader = decoder.readable.getReader()
    let buf = ''
    ;(async () => {
      try {
        while (this.running) {
          const { value, done } = await this.reader.read()
          if (done) break
          buf += value
          let i
          while ((i = buf.indexOf('\n')) >= 0) {
            const s = parseLine(buf.slice(0, i)); buf = buf.slice(i + 1)
            if (s) onSample(s)
          }
        }
      } catch { /* port unplugged */ }
      onStatus?.('disconnected')
    })()
  }
  async stop() {
    this.running = false
    try { await this.reader?.cancel() } catch { /* */ }
    try { await this.piped } catch { /* */ }
    try { await this.port?.close() } catch { /* */ }
  }
}
