# ADVAITHA
Run (needs Node 20.19+ or 22.12+; use Chrome/Edge for Web Serial):

    npm install
    npm test
    npm run dev        # open the printed http://localhost URL

Keys: R = force reveal, X = reset. "System" (bottom-right) = live parameters, Connect Arduino.
Serial line format: alphaPower,betaPower[,controlState]  e.g. 0.72,0.41,0  (115200 baud, values 0..1)
All tunables: src/config.js. Mock (DEMO) signal is synthetic and labelled as such.
Not included yet: Arduino sketch, raw-sample band-power mode, per-person calibration.
