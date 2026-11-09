// Putney — independent VCS3-style synthesizer. Not affiliated with EMS.

const PIN_GAIN = [0, 1, 0.33, 1];
const STORAGE = "putney.vcs3.bank.v1";
const WHITE = 1;
const GREEN = 2;

const ROWS = [
  "OSC 1 SINE",
  "OSC 1 SAW",
  "OSC 2 TRI",
  "OSC 2 PULSE",
  "OSC 3 TRI",
  "OSC 3 PULSE",
  "NOISE",
  "IN 1 / KYBD",
  "IN 2 / DYN",
  "FILTER",
  "TRAPEZOID",
  "ENV SIGNAL",
  "RING MOD",
  "REVERB",
  "STICK L/R",
  "STICK U/D",
];

const COLS = [
  "OUT CH 1",
  "METER",
  "OUT CH 2",
  "ENV IN",
  "RING A",
  "RING B",
  "REV IN",
  "FLT IN",
  "OSC1 FREQ",
  "OSC2 FREQ",
  "OSC3 FREQ",
  "DECAY",
  "REV MIX",
  "FLT FREQ",
  "LVL CH 1",
  "LVL CH 2",
];

const DEFAULTS = {
  "osc1.freq": 4.4,
  "osc1.shape": 10,
  "osc1.level": 8,
  "osc2.freq": 4.7,
  "osc2.shape": 0,
  "osc2.level": 0,
  "osc3.freq": 2.2,
  "osc3.shape": 0,
  "osc3.level": 6,
  "noise.colour": 6,
  "noise.level": 0,
  "ring.level": 8,
  "filter.freq": 4.6,
  "filter.response": 4.2,
  "filter.level": 8.5,
  "env.attack": 2.2,
  "env.on": 10,
  "env.decay": 6.4,
  "env.off": 10,
  "env.trap": 7.2,
  "env.signal": 8,
  "reverb.mix": 2.4,
  "reverb.level": 5,
  "input.ch1": 10,
  "input.ch2": 8,
  "out1.filter": 10,
  "out1.pan": 4.2,
  "out1.level": 7.5,
  "out2.filter": 10,
  "out2.pan": 5.8,
  "out2.level": 7.5,
  "stick.rx": 5,
  "stick.ry": 5,
  "master": 7.2,
  "glide": 0,
  "fx.drive": 0,
  "fx.delay.time": 4.2,
  "fx.delay.fb": 3.6,
  "fx.delay.mix": 0,
  "fx.chorus.rate": 3.2,
  "fx.chorus.depth": 5,
  "fx.chorus.mix": 0,
  "seq.gate": 6,
  "seq.swing": 0,
};

const DEFAULT_MIDI = {
  74: "filter.freq",
  71: "filter.response",
  73: "env.attack",
  75: "env.decay",
  79: "env.on",
  72: "env.off",
  70: "reverb.mix",
  7: "master",
  1: "stick.y",
  91: "fx.delay.mix",
  93: "fx.drive",
  94: "fx.delay.time",
  95: "fx.chorus.mix",
};

const KEY_INDEX = {
  KeyA: 0,
  KeyW: 1,
  KeyS: 2,
  KeyE: 3,
  KeyD: 4,
  KeyF: 5,
  KeyT: 6,
  KeyG: 7,
  KeyY: 8,
  KeyH: 9,
  KeyU: 10,
  KeyJ: 11,
  KeyK: 12,
  KeyO: 13,
  KeyL: 14,
  KeyP: 15,
  Semicolon: 16,
  Quote: 17,
  KeyZ: 18,
  KeyX: 19,
  KeyC: 20,
  KeyV: 21,
  KeyB: 22,
  KeyN: 23,
  KeyM: 24,
};

const LETTERS = {
  0: "A",
  1: "W",
  2: "S",
  3: "E",
  4: "D",
  5: "F",
  6: "T",
  7: "G",
  8: "Y",
  9: "H",
  10: "U",
  11: "J",
  12: "K",
  13: "O",
  14: "L",
  15: "P",
  16: ";",
  17: "'",
  18: "Z",
  19: "X",
  20: "C",
  21: "V",
  22: "B",
  23: "N",
  24: "M",
};

function blankPins() {
  return Array(256).fill(0);
}

function place(entries) {
  const pins = blankPins();
  for (const [row, col, value] of entries) pins[row * 16 + col] = value;
  return pins;
}

const FACTORY = [
  {
    id: "lead",
    name: "Lead filtrado",
    knobs: {},
    pins: place([
      [1, 3, WHITE],
      [11, 7, WHITE],
      [9, 0, WHITE],
      [9, 2, WHITE],
      [9, 1, WHITE],
      [9, 6, GREEN],
      [13, 0, GREEN],
      [13, 2, GREEN],
      [7, 8, WHITE],
      [10, 13, WHITE],
    ]),
  },
  {
    id: "drone",
    name: "Dron",
    knobs: {
      "osc1.freq": 3.6,
      "osc1.shape": 0,
      "osc1.level": 7,
      "osc2.freq": 3.9,
      "osc2.shape": 2,
      "osc2.level": 5.5,
      "osc3.freq": 1.15,
      "osc3.shape": 0,
      "osc3.level": 6,
      "filter.level": 0,
      "reverb.mix": 4.2,
      "reverb.level": 7,
      "env.signal": 0,
    },
    pins: place([
      [0, 0, WHITE],
      [0, 2, WHITE],
      [2, 0, GREEN],
      [2, 2, GREEN],
      [0, 6, WHITE],
      [13, 0, WHITE],
      [13, 2, WHITE],
      [4, 8, WHITE],
      [7, 8, WHITE],
      [7, 9, WHITE],
      [0, 1, WHITE],
    ]),
  },
  {
    id: "bell",
    name: "Campana",
    knobs: {
      "osc1.freq": 5.55,
      "osc1.shape": 0,
      "osc1.level": 8,
      "osc2.freq": 6.4,
      "osc2.shape": 1.2,
      "osc2.level": 7.4,
      "env.attack": 0.3,
      "env.on": 1.2,
      "env.decay": 7.3,
      "env.off": 10,
      "env.signal": 8.6,
      "env.trap": 1,
      "filter.level": 0,
      "reverb.mix": 5.6,
      "reverb.level": 7.2,
    },
    pins: place([
      [0, 4, WHITE],
      [2, 5, WHITE],
      [12, 3, WHITE],
      [11, 0, WHITE],
      [11, 2, WHITE],
      [11, 6, WHITE],
      [13, 0, WHITE],
      [13, 2, WHITE],
      [7, 8, WHITE],
      [7, 9, WHITE],
      [11, 1, WHITE],
    ]),
  },
  {
    id: "wind",
    name: "Viento",
    knobs: {
      "osc1.level": 0,
      "osc2.level": 0,
      "osc3.freq": 0.9,
      "osc3.shape": 0,
      "osc3.level": 8,
      "noise.colour": 3,
      "noise.level": 8.2,
      "filter.freq": 5.1,
      "filter.response": 5.6,
      "filter.level": 8,
      "reverb.mix": 6.2,
      "reverb.level": 8,
      "env.signal": 0,
    },
    pins: place([
      [6, 7, WHITE],
      [4, 13, WHITE],
      [9, 6, WHITE],
      [13, 0, WHITE],
      [13, 2, WHITE],
      [13, 1, WHITE],
      [7, 13, GREEN],
    ]),
  },
  {
    id: "ping",
    name: "Filtro que canta",
    knobs: {
      "osc1.level": 0,
      "osc2.level": 0,
      "noise.level": 0,
      "filter.freq": 6.1,
      "filter.response": 10,
      "filter.level": 8,
      "env.attack": 0.2,
      "env.on": 0.6,
      "env.decay": 6.6,
      "env.off": 6.1,
      "env.trap": 8.2,
      "env.signal": 0,
      "reverb.mix": 3.4,
      "reverb.level": 6,
    },
    pins: place([
      [9, 0, WHITE],
      [9, 2, WHITE],
      [9, 1, WHITE],
      [9, 6, GREEN],
      [13, 0, GREEN],
      [13, 2, GREEN],
      [10, 13, WHITE],
    ]),
  },
  {
    id: "bass",
    name: "Bajo con LFO",
    knobs: {
      "osc1.freq": 3.25,
      "osc1.shape": 10,
      "osc1.level": 8.5,
      "osc3.freq": 2.7,
      "osc3.shape": 8,
      "osc3.level": 5.2,
      "filter.freq": 3.7,
      "filter.response": 6.4,
      "filter.level": 8,
      "env.attack": 0.8,
      "env.on": 10,
      "env.decay": 5.6,
      "env.off": 10,
      "env.trap": 6.6,
      "env.signal": 8,
    },
    pins: place([
      [1, 7, WHITE],
      [9, 3, WHITE],
      [11, 0, WHITE],
      [11, 2, WHITE],
      [11, 1, WHITE],
      [5, 13, GREEN],
      [10, 13, WHITE],
      [7, 8, WHITE],
    ]),
  },
];

function defaultSteps() {
  const notes = [60, 60, 64, 67, 72, 67, 64, 60, 62, 65, 69, 65, 60, 64, 67, 72];
  const on = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1];
  return notes.map((note, index) => ({ on: !!on[index], note }));
}

function mountPutney(target) {
  const root = target || document.getElementById("vcs3-root");
  if (!root || root.querySelector(".putney")) return;
  boot(root);
}

globalThis.__bootPutney = mountPutney;
mountPutney();

function boot(mount) {
  let knobs = { ...DEFAULTS };
  let pins = FACTORY[0].pins.slice();
  let bank = readBank();
  let userMidi = {};
  let ch1mode = "keyb";
  let mute1 = false;
  let mute2 = false;
  let powered = false;
  let ctx = null;
  let node = null;
  let bootAudio = null;
  let micStream = null;
  let micSource = null;
  let stickX = 0;
  let stickY = 0;
  let stickDrag = false;
  let attackHeld = false;
  let gate = false;
  let currentNote = 60;
  let currentVel = 0.8;
  let bend = 0;
  let trigger = 0;
  let baseNote = 48;
  let sustain = false;
  let learning = false;
  let lastTouched = "filter.freq";
  let lastEnv = 0;
  let lastMeter = 0;
  let pinColor = 1;
  const notes = new Map();
  const order = [];
  const sustained = new Set();
  const painters = new Map();
  let glidePointer = null;
  let phraseToken = 0;
  const phraseTimers = [];
  let dirty = false;
  let frame = 0;
  let poly = false;
  let noteSerial = 1;
  let attackToken = 0;
  let bayOn = false;
  let bayDraw = () => {};
  let bayCap = null;
  let baySel = null;
  let seqPlaying = false;
  let seqTempo = 120;
  let seqRun = 0;
  let seqIndex = -1;
  let steps = defaultSteps();

  mount.innerHTML = shell();
  const status = mount.querySelector("#status");
  const patchSelect = mount.querySelector("#patch-select");
  const nameInput = mount.querySelector("#patch-name");
  const deleteBtn = mount.querySelector("#delete-patch");
  const matrix = mount.querySelector("#matrix");
  const stickWell = mount.querySelector("#stick-well");
  const stickCap = mount.querySelector("#stick-cap");
  const keysEl = mount.querySelector("#keys");
  const rangeEl = mount.querySelector("#range-label");
  const lamp = mount.querySelector("#env-lamp");
  const needle = mount.querySelector("#needle");
  const midiDialog = mount.querySelector("#midi-dialog");
  const helpDialog = mount.querySelector("#help-dialog");
  const mapList = mount.querySelector("#map-list");
  const learnBtn = mount.querySelector("#learn-midi");
  const midiState = mount.querySelector("#midi-state");

  buildMatrix();
  buildKeys();
  buildSteps();
  mount.querySelectorAll(".knob").forEach(bindKnob);
  buildBay();
  refreshSelect("lead");
  applyPatch(FACTORY[0], false);
  setStatus("Pulsa Probar o una tecla para oír el patch.");

  mount.querySelector("#power-btn").addEventListener("click", () => ensureAudio());
  mount.addEventListener("pointerdown", () => ensureAudio(), { capture: true });
  mount.querySelector("#save-patch").addEventListener("click", savePatch);
  deleteBtn.addEventListener("click", deletePatch);
  mount.querySelector("#export-patch").addEventListener("click", exportPatch);
  mount.querySelector("#import-file").addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (file) importPatch(file);
  });
  patchSelect.addEventListener("change", () => {
    const id = patchSelect.value;
    const saved = bank.find((item) => item.id === id);
    if (saved) applyPatch(saved, true);
    else applyPatch(FACTORY.find((item) => item.id === id), false);
  });
  mount.querySelector("#help-btn").addEventListener("click", () => helpDialog.showModal());
  mount.querySelector("#midi-btn").addEventListener("click", () => {
    midiDialog.showModal();
    connectMidi();
  });
  mount.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });
  learnBtn.addEventListener("click", () => {
    learning = !learning;
    learnBtn.classList.toggle("primary", learning);
    setStatus(learning ? `Aprender: mueve un CC para «${labelOf(lastTouched)}».` : "Aprendizaje MIDI cancelado.");
    renderMap();
  });
  mount.querySelector("#clear-midi").addEventListener("click", () => {
    userMidi = {};
    learning = false;
    learnBtn.classList.remove("primary");
    renderMap();
    setStatus("Asignaciones propias borradas. Siguen los CC de fábrica.");
  });
  mount.querySelector("#clear-matrix").addEventListener("click", clearRouting);
  mount.querySelector("#bay-clear").addEventListener("click", clearRouting);
  mount.querySelector("#show-matrix").addEventListener("click", () => showRouting(false));
  mount.querySelector("#show-bay").addEventListener("click", () => showRouting(true));
  mount.querySelectorAll(".pin-choice").forEach((button) => {
    button.addEventListener("click", () => setCable(Number(button.dataset.pin)));
  });
  mount.querySelectorAll("[data-cable]").forEach((button) => {
    button.addEventListener("click", () => setCable(Number(button.dataset.cable)));
  });
  mount.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });
  mount.querySelector("#mic-btn").addEventListener("click", () => setMode("mic"));
  bindAttack(mount.querySelector("#attack"));
  bindStick();
  mount.querySelector("#try-patch").addEventListener("click", () => {
    playPhrase();
  });
  mount.querySelector("#seq-play").addEventListener("click", () => {
    ensureAudio();
    seqPlaying = !seqPlaying;
    if (seqPlaying) {
      seqRun += 1;
      seqIndex = 0;
    } else seqIndex = -1;
    paintSeq();
    sendNow();
    setStatus(seqPlaying ? `Secuenciador a ${seqTempo} BPM.` : "Secuenciador parado.");
  });
  mount.querySelector("#seq-bpm").addEventListener("input", (event) => {
    seqTempo = clamp(Math.round(Number(event.target.value) || 120), 40, 240);
    markDirty();
  });
  mount.querySelector("#mode-mono").addEventListener("click", () => setPoly(false));
  mount.querySelector("#mode-poly").addEventListener("click", () => setPoly(true));
  mount.querySelector("#oct-down").addEventListener("click", () => shiftOctave(-12));
  mount.querySelector("#oct-up").addEventListener("click", () => shiftOctave(12));
  mount.querySelector("#mute1").addEventListener("click", () => toggleMute(1));
  mount.querySelector("#mute2").addEventListener("click", () => toggleMute(2));
  globalThis.__putneyKeyDown = onKeyDown;
  globalThis.__putneyKeyUp = onKeyUp;
  if (!globalThis.__putneyKeysBound) {
    window.addEventListener("keydown", (event) => globalThis.__putneyKeyDown?.(event));
    window.addEventListener("keyup", (event) => globalThis.__putneyKeyUp?.(event));
    globalThis.__putneyKeysBound = true;
  }

  globalThis.__putney = {
    get env() {
      return lastEnv;
    },
    get meter() {
      return lastMeter;
    },
    get powered() {
      return powered;
    },
    get note() {
      return currentNote;
    },
    get gate() {
      return gate;
    },
  };

  function shell() {
    const k = knobHtml;
    return `
      <div class="putney">
        <header class="topbar">
          <div class="brand"><b>PUTNEY</b><span>VCS 3 · matriz</span></div>
          <div class="top-controls">
            <button class="btn primary" id="power-btn" type="button">Encender</button>
            <select id="patch-select" aria-label="Patches"></select>
            <input id="patch-name" type="text" maxlength="48" aria-label="Nombre del patch" placeholder="Nombre" />
            <button class="btn" id="save-patch" type="button">Guardar</button>
            <button class="btn" id="delete-patch" type="button">Borrar</button>
            <button class="btn" id="export-patch" type="button">Exportar</button>
            <label class="btn file-btn">Importar<input id="import-file" type="file" accept="application/json" /></label>
            <button class="btn" id="midi-btn" type="button">MIDI</button>
            <button class="btn" id="help-btn" type="button">Ayuda</button>
          </div>
          <div class="status" id="status" role="status"></div>
        </header>
        <div class="bench">
          <div class="case">
            <div class="screws"><i></i><i></i><i></i><i></i></div>
            <div class="case-grid">
              <section class="panel matrix-wrap">
                <div class="matrix-head">
                  <div>
                    <h2 id="route-title">PIN MATRIX</h2>
                    <p id="route-note">Fila = salida. Columna = entrada. Blanco y rojo a fondo; verde atenúa.</p>
                  </div>
                  <div class="route-switch" role="group" aria-label="Vista de conexiones">
                    <button class="btn primary" id="show-matrix" type="button">Matriz</button>
                    <button class="btn" id="show-bay" type="button">Patchbay</button>
                  </div>
                </div>
                <div id="matrix-view">
                  <div class="pin-tray">
                    <button class="pin-choice white on" data-pin="1" type="button" aria-label="Pin blanco"></button>
                    <button class="pin-choice green" data-pin="2" type="button" aria-label="Pin verde"></button>
                    <button class="pin-choice red" data-pin="3" type="button" aria-label="Pin rojo"></button>
                    <button class="btn" id="clear-matrix" type="button">Vaciar</button>
                  </div>
                  <div class="matrix-scroll"><div class="matrix" id="matrix"></div></div>
                </div>
                <div id="bay-view" class="bay" hidden>
                  <div class="bay-bar">
                    <span>Cable</span>
                    <button class="btn primary" type="button" data-cable="1">Blanco</button>
                    <button class="btn" type="button" data-cable="2">Verde</button>
                    <button class="btn" type="button" data-cable="3">Rojo</button>
                    <button class="btn" id="bay-clear" type="button">Vaciar</button>
                    <button class="btn" id="bay-zo" type="button" aria-label="Alejar">−</button>
                    <button class="btn" id="bay-zi" type="button" aria-label="Acercar">+</button>
                    <button class="btn" id="bay-zf" type="button">Ajustar</button>
                  </div>
                  <div class="bay-vp" id="bay-vp">
                    <div class="bay-stage" id="bay-stage">
                      <div class="bay-board" id="bay-board">
                        <svg class="bay-cab" id="bay-cab"><g id="bay-cg"></g><g id="bay-pv"><path stroke="#140e09" stroke-width="9"/><path stroke="#f6f1e3" stroke-width="5"/></g></svg>
                      </div>
                    </div>
                  </div>
                  <div class="bay-hud" id="bay-hud"></div>
                </div>
              </section>
              <div>
                <div class="panel mods">
                  <section class="mod"><h2>Oscillator 1 <em>sine → saw</em></h2><div class="knobs">${k("osc1.freq", "Frequency", true)}${k("osc1.shape", "Shape")}${k("osc1.level", "Level")}</div></section>
                  <section class="mod"><h2>Oscillator 2 <em>tri → pulse</em></h2><div class="knobs">${k("osc2.freq", "Frequency", true)}${k("osc2.shape", "Shape")}${k("osc2.level", "Level")}</div></section>
                  <section class="mod"><h2>Oscillator 3 <em>LFO / audio</em></h2><div class="knobs">${k("osc3.freq", "Frequency", true)}${k("osc3.shape", "Shape")}${k("osc3.level", "Level")}</div></section>
                  <section class="mod"><h2>Noise</h2><div class="knobs">${k("noise.colour", "Colour")}${k("noise.level", "Level")}</div></section>
                  <section class="mod"><h2>Filter <em>24 dB low pass</em></h2><div class="knobs">${k("filter.freq", "Frequency", true)}${k("filter.response", "Response")}${k("filter.level", "Level")}</div></section>
                  <section class="mod"><h2>Ring modulator</h2><div class="knobs">${k("ring.level", "Level")}</div><p class="tiny">Multiplica Ring A × Ring B.</p></section>
                  <section class="mod wide">
                    <h2>Envelope shaper <em>trapezoid</em> <i class="lamp" id="env-lamp"></i></h2>
                    <div class="mod-row">
                      <div class="knobs">${k("env.attack", "Attack")}${k("env.on", "On")}${k("env.decay", "Decay")}${k("env.off", "Off")}${k("env.trap", "Trapezoid")}${k("env.signal", "Signal")}</div>
                      <div>
                        <button class="attack" id="attack" type="button" aria-label="Attack"></button>
                        <div class="attack-label">ATTACK</div>
                      </div>
                    </div>
                    <p class="tiny">ON al máximo sostiene con la tecla. OFF por debajo de ∞ repite el trapecio.</p>
                  </section>
                  <section class="mod"><h2>Reverberation</h2><div class="knobs">${k("reverb.mix", "Mix")}${k("reverb.level", "Level")}</div></section>
                  <section class="mod">
                    <h2>Inputs</h2>
                    <div class="knobs">${k("input.ch1", "Channel 1")}${k("input.ch2", "Channel 2")}</div>
                    <div class="mod-row">
                      <div class="seg" role="group" aria-label="Fuente del canal 1">
                        <button type="button" data-mode="keyb" class="on">KYBD</button>
                        <button type="button" data-mode="mic">MIC</button>
                      </div>
                      <button class="btn" id="mic-btn" type="button">Activar micro</button>
                    </div>
                    <p class="tiny">Ch 1 al máximo = 1 V/oct en la fila del teclado.</p>
                  </section>
                </div>
                <div class="panel perf">
                  <div class="stick-box">
                    <h2 style="margin:0;font-family:var(--narrow);letter-spacing:.14em;font-size:13px">JOYSTICK</h2>
                    <div class="stick-well" id="stick-well"><div class="stick-cap" id="stick-cap"></div></div>
                    <div class="knobs">${k("stick.rx", "Horiz.")}${k("stick.ry", "Vert.")}</div>
                  </div>
                  <div class="outs">
                    <div class="mod-row" style="align-items:flex-start">
                      <div>
                        <h2 style="margin:0 0 6px;font-family:var(--narrow);letter-spacing:.12em;font-size:13px">OUTPUT CH 1</h2>
                        <div class="knobs">${k("out1.filter", "Filter")}${k("out1.pan", "Pan")}${k("out1.level", "Level")}</div>
                        <button class="btn" id="mute1" type="button">Mute</button>
                      </div>
                      <div>
                        <h2 style="margin:0 0 6px;font-family:var(--narrow);letter-spacing:.12em;font-size:13px">OUTPUT CH 2</h2>
                        <div class="knobs">${k("out2.filter", "Filter")}${k("out2.pan", "Pan")}${k("out2.level", "Level")}</div>
                        <button class="btn" id="mute2" type="button">Mute</button>
                      </div>
                      <div>
                        <h2 style="margin:0 0 6px;font-family:var(--narrow);letter-spacing:.12em;font-size:13px">METER</h2>
                        <div class="meter-face" aria-hidden="true"><div class="meter-scale"></div><div class="needle" id="needle"></div></div>
                        <div class="knobs" style="margin-top:8px">${k("master", "Monitor")}${k("glide", "Slew")}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <section class="addon panel">
          <div class="fx-row">
            <section class="mod"><h2>Drive</h2><div class="knobs">${k("fx.drive", "Amount")}</div></section>
            <section class="mod"><h2>Delay <em>echo</em></h2><div class="knobs">${k("fx.delay.time", "Time")}${k("fx.delay.fb", "Feedback")}${k("fx.delay.mix", "Mix")}</div></section>
            <section class="mod"><h2>Chorus</h2><div class="knobs">${k("fx.chorus.rate", "Rate")}${k("fx.chorus.depth", "Depth")}${k("fx.chorus.mix", "Mix")}</div></section>
          </div>
          <div class="seq-head">
            <h2>Secuenciador <em>16 pasos</em></h2>
            <div class="mod-row">
              <button class="btn primary" id="seq-play" type="button">Play</button>
              <label class="bpm">BPM <input id="seq-bpm" type="number" min="40" max="240" step="1" value="120" aria-label="Tempo" /></label>
            </div>
            <div class="knobs">${k("seq.gate", "Gate")}${k("seq.swing", "Swing")}</div>
          </div>
          <div class="steps" id="steps"></div>
          <p class="tiny">Clic enciende el paso. Arrastra arriba o abajo para la nota. El secuenciador usa la misma afinación que el teclado.</p>
        </section>
        <section class="dk">
          <div class="dk-bar">
            <h2>DK KEYBOARD</h2>
            <div class="mod-row">
              <button class="btn" id="oct-down" type="button">Oct −</button>
              <strong id="range-label">C3 – C5</strong>
              <button class="btn" id="oct-up" type="button">Oct +</button>
              <button class="btn primary" id="mode-mono" type="button">Mono</button>
              <button class="btn" id="mode-poly" type="button">Poly</button>
              <button class="btn primary" id="try-patch" type="button">Probar</button>
            </div>
            <span id="voice-hint">Última nota</span>
          </div>
          <div class="keys" id="keys"></div>
        </section>
        <p class="legend">Emulador independiente. EMS y VCS3 son marcas de sus titulares. <span><kbd>A</kbd> Do · flechas cambian de octava</span></p>
      </div>
      <dialog id="midi-dialog">
        <h3>MIDI</h3>
        <p id="midi-state">Sin conectar.</p>
        <p>Toca un mando del panel y pulsa Aprender. El siguiente CC queda asignado. La rueda de modulación mueve el joystick en vertical.</p>
        <div class="map-list" id="map-list"></div>
        <menu>
          <button class="btn" id="learn-midi" type="button">Aprender</button>
          <button class="btn" id="clear-midi" type="button">Borrar asignaciones</button>
          <button class="btn" data-close type="button">Cerrar</button>
        </menu>
      </dialog>
      <dialog id="help-dialog">
        <h3>CÓMO SE PARCHEA</h3>
        <ul>
          <li>Elige un pin y pulsa un agujero. Otro clic con el mismo color lo quita. Patchbay dibuja los mismos pines como cables.</li>
          <li>Para oír el teclado, la fila IN 1 / KYBD tiene que llegar a OSC 1 FREQ (el lead ya lo trae).</li>
          <li>Arrastra el dedo por el teclado para ligar. Mono es la última nota. Poly tiene 4 voces, cada una con su filtro y su envolvente; el oscilador 3 y la reverberación son comunes.</li>
          <li>La envolvente no es un ADSR: Attack, On (tiempo), Decay y Off. ON = 10 sostiene la tecla.</li>
          <li>Sube Response a tope y el filtro canta solo. El patch «Filtro que canta» lo hace en bucle.</li>
          <li>Los patches viven en este navegador. Exportar guarda un JSON, incluidos los pasos del secuenciador.</li>
          <li>Drive, delay y chorus suenan después de la matriz. Con Mix o Amount a cero no alteran el patch.</li>
        </ul>
        <menu><button class="btn" data-close type="button">Cerrar</button></menu>
      </dialog>`;
  }

  function knobHtml(id, label, large) {
    return `<button class="knob${large ? " lg" : ""}" data-k="${id}" type="button" role="slider" aria-valuemin="0" aria-valuemax="10" aria-label="${label}"><span class="rotor"><span class="cap"><i></i></span></span><span class="k-name">${label}</span><span class="k-read read"></span></button>`;
  }

  function bindKnob(el) {
    const id = el.dataset.k;
    const rotor = el.querySelector(".rotor");
    const read = el.querySelector(".read");
    const paint = () => {
      const value = knobs[id] ?? 0;
      rotor.style.transform = `rotate(${-140 + (value / 10) * 280}deg)`;
      read.textContent = readout(id, value);
      el.setAttribute("aria-valuenow", value.toFixed(2));
    };
    painters.set(id, paint);
    let originY = 0;
    let origin = 0;
    el.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      el.setPointerCapture(event.pointerId);
      originY = event.clientY;
      origin = knobs[id];
      lastTouched = id;
      if (learning) setStatus(`Aprender: mueve un CC para «${labelOf(id)}».`);
    });
    el.addEventListener("pointermove", (event) => {
      if (!el.hasPointerCapture(event.pointerId)) return;
      const step = event.shiftKey ? 0.012 : 0.04;
      knobs[id] = clamp(origin + (originY - event.clientY) * step, 0, 10);
      paint();
      markDirty();
    });
    el.addEventListener("dblclick", () => {
      knobs[id] = DEFAULTS[id];
      paint();
      markDirty();
    });
    el.addEventListener("keydown", (event) => {
      const delta = event.shiftKey ? 0.1 : 0.4;
      if (event.key === "ArrowUp" || event.key === "ArrowRight") nudge(delta, event);
      if (event.key === "ArrowDown" || event.key === "ArrowLeft") nudge(-delta, event);
      function nudge(amount, ev) {
        knobs[id] = clamp(knobs[id] + amount, 0, 10);
        lastTouched = id;
        paint();
        markDirty();
        ev.preventDefault();
      }
    });
  }

  function paintAll() {
    painters.forEach((paint) => paint());
    paintPins();
    paintStick();
    paintMutes();
    paintMode();
    paintKeys();
    paintSeq();
    paintVoices();
    rangeEl.textContent = `${noteName(baseNote)} – ${noteName(baseNote + 24)}`;
  }

  function buildMatrix() {
    const corner = document.createElement("div");
    corner.className = "mx-corner";
    corner.textContent = "SRC \\ IN";
    matrix.append(corner);
    COLS.forEach((label, index) => {
      const cell = document.createElement("div");
      cell.className = "mx-col" + (index === 8 ? " ctrl" : "");
      cell.textContent = label;
      matrix.append(cell);
    });
    ROWS.forEach((label, row) => {
      const name = document.createElement("div");
      name.className = "mx-row";
      name.textContent = label;
      matrix.append(name);
      for (let col = 0; col < 16; col++) {
        const hole = document.createElement("button");
        hole.type = "button";
        hole.className = "hole" + (col === 8 ? " ctrl" : "");
        hole.dataset.i = String(row * 16 + col);
        hole.innerHTML = "<i></i>";
        hole.setAttribute("aria-label", `${label} hacia ${COLS[col]}`);
        hole.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          const index = row * 16 + col;
          if (event.altKey || event.button === 2) pins[index] = (pins[index] + 1) % 4;
          else if (pins[index] === pinColor) pins[index] = 0;
          else pins[index] = pinColor;
          paintHole(hole, pins[index]);
          markDirty();
        });
        hole.addEventListener("contextmenu", (event) => event.preventDefault());
        matrix.append(hole);
      }
    });
  }

  function paintPins() {
    matrix.querySelectorAll(".hole").forEach((hole) => paintHole(hole, pins[Number(hole.dataset.i)]));
    if (bayOn) bayDraw();
  }

  function setCable(color) {
    pinColor = color;
    mount.querySelectorAll(".pin-choice").forEach((item) => item.classList.toggle("on", Number(item.dataset.pin) === color));
    mount.querySelectorAll("[data-cable]").forEach((item) => item.classList.toggle("primary", Number(item.dataset.cable) === color));
  }

  function clearRouting() {
    pins = blankPins();
    baySel = null;
    paintPins();
    markDirty();
    setStatus("Conexiones vacías.");
  }

  function showRouting(next) {
    bayOn = next;
    mount.querySelector("#matrix-view").hidden = next;
    mount.querySelector("#bay-view").hidden = !next;
    mount.querySelector(".putney").classList.toggle("routing-bay", next);
    mount.querySelector("#show-matrix").classList.toggle("primary", !next);
    mount.querySelector("#show-bay").classList.toggle("primary", next);
    mount.querySelector("#route-title").textContent = next ? "PATCHBAY" : "PIN MATRIX";
    mount.querySelector("#route-note").textContent = next
      ? "Mismos pines que la matriz. Salida ámbar hacia una entrada."
      : "Fila = salida. Columna = entrada. Blanco y rojo a fondo; verde atenúa.";
    if (next) requestAnimationFrame(() => bayFit());
  }

  function buildBay() {
    const board = mount.querySelector("#bay-board");
    const vp = mount.querySelector("#bay-vp");
    const stage = mount.querySelector("#bay-stage");
    const cg = mount.querySelector("#bay-cg");
    const pv = mount.querySelector("#bay-pv");
    const hudEl = mount.querySelector("#bay-hud");
    const cables = { 1: "#f4f1ea", 2: "#1c7a42", 3: "#d01818" };
    const jacks = {};
    let arm = null;
    let drag = null;
    let zoom = 1;
    let hintTimer = 0;
    const el = (tag, className, html) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (html != null) node.innerHTML = html;
      return node;
    };
    const svg = (tag, attrs) => {
      const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
      for (const key in attrs) node.setAttribute(key, attrs[key]);
      return node;
    };
    const writeKnob = (id, value) => {
      knobs[id] = clamp(Math.round(value * 10) / 10, 0, 10);
      lastTouched = id;
      painters.get(id)?.();
      markDirty();
    };
    const dialOf = (id, label) => {
      const node = el("div", "bkn", `<div class="dial"><u></u></div><span>${label}</span><em></em>`);
      node.tabIndex = 0;
      node.setAttribute("role", "slider");
      node.setAttribute("aria-label", label);
      const mark = node.querySelector("u");
      const read = node.querySelector("em");
      const paintDial = (value) => {
        mark.style.transform = `rotate(${-135 + value * 27}deg)`;
        read.textContent = readout(id, value);
        node.setAttribute("aria-valuenow", value.toFixed(1));
      };
      const base = painters.get(id);
      if (base) {
        painters.set(id, () => {
          base();
          paintDial(knobs[id] ?? 0);
        });
      }
      let y0 = null;
      let v0 = 0;
      node.addEventListener("pointerdown", (event) => {
        node.setPointerCapture(event.pointerId);
        y0 = event.clientY;
        v0 = knobs[id];
        event.preventDefault();
        event.stopPropagation();
      });
      node.addEventListener("pointermove", (event) => {
        if (y0 == null || !node.hasPointerCapture(event.pointerId)) return;
        writeKnob(id, v0 + (y0 - event.clientY) / (event.shiftKey ? 60 : 15));
      });
      node.addEventListener("pointerup", () => {
        y0 = null;
      });
      node.addEventListener("pointercancel", () => {
        y0 = null;
      });
      node.addEventListener("dblclick", (event) => {
        event.stopPropagation();
        writeKnob(id, DEFAULTS[id] ?? 0);
      });
      node.addEventListener("keydown", (event) => {
        const delta = { ArrowUp: 0.1, ArrowRight: 0.1, ArrowDown: -0.1, ArrowLeft: -0.1, PageUp: 1, PageDown: -1 }[event.key];
        if (delta == null) return;
        event.preventDefault();
        event.stopPropagation();
        writeKnob(id, knobs[id] + delta);
      });
      return node;
    };
    const jack = (kind, index, label) => {
      const node = el("div", `jack ${kind}`, `<i></i><b>${label}</b>`);
      node.dataset.k = kind;
      node.dataset.i = String(index);
      node.title = `${kind === "s" ? "Salida" : "Entrada"}: ${(kind === "s" ? ROWS : COLS)[index]}`;
      jacks[kind + index] = node;
      return node;
    };
    const modules = [
      ["Oscillator 1", "sine → saw", ["osc1.freq:Frequency", "osc1.shape:Shape", "osc1.level:Level"], [[0, "Sine"], [1, "Saw"]], [[8, "Freq"]]],
      ["Oscillator 2", "tri → pulse", ["osc2.freq:Frequency", "osc2.shape:Shape", "osc2.level:Level"], [[2, "Tri"], [3, "Pulse"]], [[9, "Freq"]]],
      ["Oscillator 3", "lfo / audio", ["osc3.freq:Frequency", "osc3.shape:Shape", "osc3.level:Level"], [[4, "Tri"], [5, "Pulse"]], [[10, "Freq"]]],
      ["Noise", "", ["noise.colour:Colour", "noise.level:Level"], [[6, "Noise"]], []],
      ["Inputs", "", ["input.ch1:Channel 1", "input.ch2:Channel 2"], [[7, "In 1 / Kybd"], [8, "In 2 / Dyn"]], [], "in"],
      ["Filter", "24 dB low pass", ["filter.freq:Frequency", "filter.response:Response", "filter.level:Level"], [[9, "Filter"]], [[7, "Input"], [13, "Freq"]]],
      ["Ring modulator", "", ["ring.level:Level"], [[12, "Ring"]], [[4, "A"], [5, "B"]]],
      ["Envelope shaper", "trapezoid", ["env.attack:Attack", "env.on:On", "env.decay:Decay", "env.off:Off", "env.trap:Trapezoid", "env.signal:Signal"], [[10, "Trapez."], [11, "Signal"]], [[3, "In"], [11, "Decay"]], "w2"],
      ["Reverberation", "", ["reverb.mix:Mix", "reverb.level:Level"], [[13, "Reverb"]], [[6, "In"], [12, "Mix"]]],
      ["Joystick", "", ["stick.rx:Horiz.", "stick.ry:Vert."], [[14, "L / R"], [15, "U / D"]], [], "joy"],
      ["Output ch 1", "", ["out1.filter:Filter", "out1.pan:Pan", "out1.level:Level"], [], [[0, "Out"], [14, "Level"]], "m1"],
      ["Output ch 2", "", ["out2.filter:Filter", "out2.pan:Pan", "out2.level:Level"], [], [[2, "Out"], [15, "Level"]], "m2"],
      ["Meter", "", ["master:Monitor", "glide:Slew"], [], [[1, "Meter"]]],
      ["Conexiones", '<span id="bay-count">0</span>', [], [], [], "help"],
    ];
    for (const [title, sub, knobsSpec, outputs, inputs, extra] of modules) {
      const card = el("section", `bmod${extra === "w2" ? " w2" : ""}${extra === "help" ? " help" : ""}`, `<h2>${title}<small>${sub}</small></h2>`);
      if (extra === "joy") {
        const pad = el("div", "bpad", "<u></u>");
        bayCap = pad.firstChild;
        const move = (event) => {
          const rect = pad.getBoundingClientRect();
          stickX = clamp((event.clientX - rect.left) / rect.width, 0, 1) * 2 - 1;
          stickY = clamp(1 - ((event.clientY - rect.top) / rect.height) * 2, -1, 1);
          stickDrag = true;
          paintStick();
          markDirty();
        };
        pad.addEventListener("pointerdown", (event) => {
          pad.setPointerCapture(event.pointerId);
          move(event);
          event.preventDefault();
          event.stopPropagation();
        });
        pad.addEventListener("pointermove", (event) => {
          if (pad.hasPointerCapture(event.pointerId)) move(event);
        });
        const release = () => {
          if (!stickDrag) return;
          stickDrag = false;
          springStick();
        };
        pad.addEventListener("pointerup", release);
        pad.addEventListener("pointercancel", release);
        card.append(pad);
      }
      if (knobsSpec.length) {
        const row = el("div", "bks");
        knobsSpec.forEach((spec) => {
          const [id, label] = spec.split(":");
          row.append(dialOf(id, label));
        });
        card.append(row);
      }
      if (extra === "in") {
        const toggle = el("div", "tg", '<button type="button" data-mode="keyb">KYBD</button><button type="button" data-mode="mic">MIC</button>');
        card.append(toggle);
      }
      if (extra === "m1" || extra === "m2") {
        const button = el("button", "mu", "Mute");
        button.type = "button";
        button.dataset.mute = extra[1];
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          toggleMute(Number(extra[1]));
        });
        card.append(button);
      }
      if (extra === "help") {
        card.append(el("p", "", "Arrastra de una salida ámbar a una entrada, o toca una y luego la otra. El parche es el de la matriz."));
        const list = el("ul", "blst");
        list.id = "bay-list";
        list.addEventListener("click", (event) => {
          const item = event.target.closest("li");
          if (!item) return;
          baySel = Number(item.dataset.i);
          bayDraw();
          bayHud();
        });
        card.append(list);
      }
      if (outputs.length || inputs.length) {
        const row = el("div", "bjk");
        const dest = el("div");
        const src = el("div");
        inputs.forEach(([index, label]) => dest.append(jack("d", index, label)));
        outputs.forEach(([index, label]) => src.append(jack("s", index, label)));
        row.append(dest, src);
        card.append(row);
      }
      board.append(card);
    }
    const pos = (node) => {
      const rect = node.getBoundingClientRect();
      const base = board.getBoundingClientRect();
      return { x: (rect.left + rect.width / 2 - base.left) / zoom, y: (rect.top + rect.height / 2 - base.top) / zoom };
    };
    const curve = (a, b) => {
      const drop = 40 + Math.min(170, Math.hypot(b.x - a.x, b.y - a.y) * 0.3);
      return `M${a.x} ${a.y}C${a.x} ${a.y + drop} ${b.x} ${b.y + drop} ${b.x} ${b.y}`;
    };
    const bayHud = (text) => {
      if (text) {
        hudEl.textContent = text;
        return;
      }
      if (baySel != null && pins[baySel]) {
        const value = pins[baySel];
        hudEl.innerHTML = `<b>${ROWS[baySel >> 4]} → ${COLS[baySel & 15]}</b><button type="button" data-set="1"${value === 1 ? ' class="primary"' : ""}>Blanco</button><button type="button" data-set="2"${value === 2 ? ' class="primary"' : ""}>Verde</button><button type="button" data-set="3"${value === 3 ? ' class="primary"' : ""}>Rojo</button><button type="button" data-set="0">Borrar</button>`;
      } else hudEl.textContent = arm ? "Toca ahora la otra clavija." : "Arrastra de una salida (ámbar) a una entrada.";
    };
    const hint = () => {
      const kind = drag ? drag.j.dataset.k : arm ? arm.dataset.k : "";
      if (kind) board.dataset.drag = kind;
      else delete board.dataset.drag;
    };
    bayDraw = () => {
      cg.replaceChildren();
      const used = {};
      const ids = [];
      pins.forEach((value, index) => {
        if (value) ids.push(index);
      });
      if (baySel != null && pins[baySel]) ids.push(ids.splice(ids.indexOf(baySel), 1)[0]);
      else baySel = null;
      ids.forEach((index) => {
        const src = jacks[`s${index >> 4}`];
        const dest = jacks[`d${index & 15}`];
        if (!src || !dest) return;
        const a = pos(src.firstChild);
        const b = pos(dest.firstChild);
        const d = curve(a, b);
        const color = cables[pins[index]] || "#d01818";
        const on = index === baySel;
        const group = svg("g");
        used[`s${index >> 4}`] = 1;
        used[`d${index & 15}`] = 1;
        const hit = svg("path", { d, class: "hit" });
        group.append(svg("path", { d, stroke: on ? "#ffd36a" : "#140e09", "stroke-width": on ? 12 : 9 }));
        group.append(svg("path", { d, stroke: color, "stroke-width": 5 }));
        [a, b].forEach((point) => group.append(svg("circle", { cx: point.x, cy: point.y, r: 7, fill: color, stroke: "#140e09", "stroke-width": 2.5 })));
        group.append(hit);
        cg.append(group);
        const length = hit.getTotalLength();
        const gap = 18;
        if (length > gap * 2 + 12) hit.style.strokeDasharray = `0 ${gap} ${length - gap * 2} ${gap}`;
        else hit.style.display = "none";
        hit.addEventListener("pointerdown", (event) => {
          event.stopPropagation();
          baySel = index;
          arm = null;
          bayDraw();
          bayHud();
        });
      });
      for (const key in jacks) jacks[key].classList.toggle("con", !!used[key]);
      const count = mount.querySelector("#bay-count");
      if (count) count.textContent = String(ids.length);
      const list = mount.querySelector("#bay-list");
      if (list) {
        list.innerHTML = pins.map((value, index) => value ? `<li data-i="${index}"${index === baySel ? ' class="sel"' : ""}><i style="background:${cables[value] || "#d01818"}"></i>${ROWS[index >> 4]} → ${COLS[index & 15]}</li>` : "").join("");
      }
      if (!hintTimer) bayHud();
    };
    const connect = (a, b) => {
      const src = a.dataset.k === "s" ? a : b;
      const dest = src === a ? b : a;
      const index = Number(src.dataset.i) * 16 + Number(dest.dataset.i);
      const exists = pins[index];
      if (!exists) pins[index] = pinColor;
      baySel = index;
      paintPins();
      markDirty();
      if (exists) {
        bayHud("Esa conexión ya existe.");
        clearTimeout(hintTimer);
        hintTimer = setTimeout(() => {
          hintTimer = 0;
          bayHud();
        }, 2200);
      }
    };
    const preview = (x, y) => {
      const base = board.getBoundingClientRect();
      const a = pos(drag.j.firstChild);
      const b = { x: (x - base.left) / zoom, y: (y - base.top) / zoom };
      const d = curve(a, b);
      pv.firstChild.setAttribute("d", d);
      pv.lastChild.setAttribute("d", d);
    };
    vp.addEventListener("pointerdown", (event) => {
      const hit = event.target.closest(".jack");
      if (hit && board.contains(hit)) {
        event.preventDefault();
        drag = { j: hit, x: event.clientX, y: event.clientY, moved: false };
        vp.setPointerCapture(event.pointerId);
        hint();
        return;
      }
      if (event.target.closest(".bkn, .bpad, button, .blst")) return;
      baySel = null;
      if (arm) {
        arm.classList.remove("arm");
        arm = null;
      }
      hint();
      bayDraw();
    });
    vp.addEventListener("pointermove", (event) => {
      if (!drag || !vp.hasPointerCapture(event.pointerId)) return;
      if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6) return;
      drag.moved = true;
      const rect = vp.getBoundingClientRect();
      if (event.clientX < rect.left + 36) vp.scrollLeft -= 14;
      else if (event.clientX > rect.right - 36) vp.scrollLeft += 14;
      if (event.clientY < rect.top + 36) vp.scrollTop -= 14;
      else if (event.clientY > rect.bottom - 36) vp.scrollTop += 14;
      preview(event.clientX, event.clientY);
    });
    const endDrag = (event) => {
      if (!drag) return;
      const current = drag;
      drag = null;
      pv.firstChild.setAttribute("d", "");
      pv.lastChild.setAttribute("d", "");
      if (event.type === "pointerup") {
        const found = document.elementsFromPoint(event.clientX, event.clientY).map((node) => node.closest && node.closest(".bay .jack")).find(Boolean);
        if (current.moved) {
          if (found && found.dataset.k !== current.j.dataset.k) connect(current.j, found);
          if (arm) arm.classList.remove("arm");
          arm = null;
        } else if (arm && arm.dataset.k !== current.j.dataset.k) {
          connect(arm, current.j);
          arm.classList.remove("arm");
          arm = null;
        } else if (arm === current.j) {
          arm.classList.remove("arm");
          arm = null;
        } else {
          if (arm) arm.classList.remove("arm");
          arm = current.j;
          arm.classList.add("arm");
        }
      }
      hint();
      if (!hintTimer) bayHud();
    };
    vp.addEventListener("pointerup", endDrag);
    vp.addEventListener("pointercancel", endDrag);
    hudEl.addEventListener("click", (event) => {
      const action = event.target.dataset.set;
      if (action == null || baySel == null) return;
      if (action === "0") {
        pins[baySel] = 0;
        baySel = null;
      } else pins[baySel] = Number(action);
      paintPins();
      markDirty();
    });
    const setZoom = (value) => {
      zoom = clamp(value, 0.3, 1.5);
      stage.style.width = `${board.offsetWidth * zoom}px`;
      stage.style.height = `${board.offsetHeight * zoom}px`;
      board.style.transform = `scale(${zoom})`;
      if (bayOn) bayDraw();
    };
    bayFit = () => setZoom(Math.min(1, vp.clientWidth / board.offsetWidth));
    mount.querySelector("#bay-zi").addEventListener("click", () => setZoom(zoom * 1.2));
    mount.querySelector("#bay-zo").addEventListener("click", () => setZoom(zoom / 1.2));
    mount.querySelector("#bay-zf").addEventListener("click", () => bayFit());
    board.addEventListener("contextmenu", (event) => event.preventDefault());
    setCable(pinColor);
  }

  function bayFit() {}

  function paintHole(hole, value) {
    hole.classList.remove("p1", "p2", "p3");
    if (value) hole.classList.add(`p${value}`);
  }

  function buildKeys() {
    const whites = [];
    for (let i = 0; i < 25; i++) if (!isBlack(i)) whites.push(i);
    const width = 100 / whites.length;
    whites.forEach((index, orderIndex) => {
      const key = keyButton(index, "white");
      key.style.left = `${orderIndex * width}%`;
      key.style.width = `calc(${width}% - 1px)`;
      keysEl.append(key);
    });
    whites.forEach((index, orderIndex) => {
      const next = index + 1;
      if (next < 25 && isBlack(next)) {
        const key = keyButton(next, "black");
        key.style.left = `calc(${(orderIndex + 1) * width}% - ${width * 0.32}%)`;
        key.style.width = `${width * 0.62}%`;
        keysEl.append(key);
      }
    });
    keysEl.addEventListener("pointerdown", (event) => {
      const key = event.target.closest("button");
      if (!key || !keysEl.contains(key)) return;
      event.preventDefault();
      glidePointer = event.pointerId;
      keysEl.setPointerCapture(event.pointerId);
      soundKey(key, false);
    });
    keysEl.addEventListener("pointermove", (event) => {
      if (event.pointerId !== glidePointer) return;
      const hit = document.elementFromPoint(event.clientX, event.clientY);
      const key = hit && hit.closest ? hit.closest("#keys button") : null;
      if (key && keysEl.contains(key)) soundKey(key, true);
    });
    const endGlide = (event) => {
      if (event.pointerId !== glidePointer) return;
      glidePointer = null;
      noteOff("k:board");
    };
    keysEl.addEventListener("pointerup", endGlide);
    keysEl.addEventListener("pointercancel", endGlide);
  }

  function soundKey(key, legato) {
    const midi = baseNote + Number(key.dataset.index);
    if (legato && notes.get("k:board")?.midi === midi) return;
    noteOn(midi, 0.9, "k:board", legato);
  }

  function keyButton(index, kind) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = kind;
    button.dataset.index = String(index);
    button.textContent = LETTERS[index] || "";
    return button;
  }

  function paintKeys() {
    keysEl.querySelectorAll("button").forEach((button) => {
      const midi = baseNote + Number(button.dataset.index);
      const down = order.some((id) => notes.get(id)?.midi === midi);
      button.classList.toggle("down", down);
    });
  }

  function buildSteps() {
    const host = mount.querySelector("#steps");
    for (let index = 0; index < 16; index++) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "step";
      button.dataset.index = String(index);
      button.innerHTML = `<b></b><small>${index + 1}</small>`;
      bindStep(button, index);
      host.append(button);
    }
    paintSeq();
  }

  function bindStep(button, index) {
    let originY = 0;
    let originNote = 60;
    let dragged = false;
    button.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      originY = event.clientY;
      originNote = steps[index].note;
      dragged = false;
    });
    button.addEventListener("pointermove", (event) => {
      if (!button.hasPointerCapture(event.pointerId)) return;
      const delta = originY - event.clientY;
      if (Math.abs(delta) > 6) dragged = true;
      const next = clamp(originNote + Math.round(delta / 8), 36, 84);
      if (next !== steps[index].note) {
        steps[index].note = next;
        paintSeq();
        markDirty();
      }
    });
    button.addEventListener("pointerup", () => {
      if (dragged) return;
      steps[index].on = !steps[index].on;
      paintSeq();
      markDirty();
    });
  }

  function paintSeq() {
    const host = mount.querySelector("#steps");
    const play = mount.querySelector("#seq-play");
    const bpm = mount.querySelector("#seq-bpm");
    if (play) {
      play.textContent = seqPlaying ? "Stop" : "Play";
      play.classList.toggle("primary", !seqPlaying);
    }
    if (bpm && document.activeElement !== bpm) bpm.value = String(seqTempo);
    host.querySelectorAll(".step").forEach((button) => {
      const index = Number(button.dataset.index);
      const step = steps[index];
      button.classList.toggle("on", step.on);
      button.classList.toggle("now", seqPlaying && index === seqIndex);
      button.querySelector("b").textContent = noteName(step.note);
      button.setAttribute("aria-pressed", step.on ? "true" : "false");
      button.setAttribute("aria-label", `Paso ${index + 1}, ${noteName(step.note)}, ${step.on ? "activo" : "mudo"}`);
    });
  }

  function bindAttack(button) {
    const down = (event) => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      attackHeld = true;
      button.classList.add("down");
      attackToken += 1;
      trigger += 1;
      syncGate(true);
    };
    const up = () => {
      attackHeld = false;
      button.classList.remove("down");
      syncGate(false);
    };
    button.addEventListener("pointerdown", down);
    button.addEventListener("pointerup", up);
    button.addEventListener("pointercancel", up);
  }

  function bindStick() {
    const move = (event) => {
      const rect = stickWell.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width, 0, 1) * 2 - 1;
      const y = 1 - clamp((event.clientY - rect.top) / rect.height, 0, 1) * 2;
      stickX = clamp(x, -1, 1);
      stickY = clamp(y, -1, 1);
      paintStick();
      markDirty();
    };
    stickWell.addEventListener("pointerdown", (event) => {
      stickDrag = true;
      stickWell.setPointerCapture(event.pointerId);
      move(event);
    });
    stickWell.addEventListener("pointermove", (event) => {
      if (stickDrag) move(event);
    });
    const release = () => {
      if (!stickDrag) return;
      stickDrag = false;
      springStick();
    };
    stickWell.addEventListener("pointerup", release);
    stickWell.addEventListener("pointercancel", release);
  }

  function springStick() {
    const step = () => {
      if (stickDrag) return;
      stickX *= 0.78;
      stickY *= 0.78;
      if (Math.abs(stickX) < 0.02 && Math.abs(stickY) < 0.02) {
        stickX = 0;
        stickY = 0;
        paintStick();
        markDirty();
        return;
      }
      paintStick();
      markDirty();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function paintStick() {
    stickCap.style.left = `${((stickX + 1) / 2) * 100}%`;
    stickCap.style.top = `${((1 - stickY) / 2) * 100}%`;
    if (bayCap) {
      bayCap.style.left = `${((stickX + 1) / 2) * 100}%`;
      bayCap.style.top = `${((1 - stickY) / 2) * 100}%`;
    }
  }

  function noteOn(midi, vel, id, legato = false) {
    if (!String(id).startsWith("p:")) cancelPhrase();
    const prev = notes.get(id);
    const token = legato && prev ? prev.token : ++noteSerial;
    if (notes.has(id)) noteOff(id, true);
    if (sustained.has(id)) sustained.delete(id);
    notes.set(id, { midi, vel, token });
    order.push(id);
    currentNote = midi;
    currentVel = vel;
    if (!legato) trigger += 1;
    syncGate(true);
    paintKeys();
  }

  function noteOff(id, silent) {
    if (sustain && String(id).startsWith("m:")) {
      sustained.add(id);
      return;
    }
    const index = order.indexOf(id);
    if (index >= 0) order.splice(index, 1);
    notes.delete(id);
    if (silent) return;
    if (order.length) {
      const top = notes.get(order[order.length - 1]);
      currentNote = top.midi;
      currentVel = top.vel;
      syncGate(false);
    } else syncGate(false);
    paintKeys();
  }

  function releaseSustained() {
    [...sustained].forEach((id) => {
      sustained.delete(id);
      noteOff(id);
    });
  }

  function syncGate(retrigger) {
    gate = attackHeld || order.length > 0;
    if (retrigger) trigger += 0;
    sendNow();
  }

  function paintVoices() {
    mount.querySelector("#mode-mono").classList.toggle("primary", !poly);
    mount.querySelector("#mode-poly").classList.toggle("primary", poly);
    mount.querySelector("#voice-hint").textContent = poly ? "4 voces" : "Última nota";
  }

  function setPoly(next) {
    poly = next;
    paintVoices();
    sendNow();
    setStatus(poly ? "Poly: 4 voces, filtro y envolvente por nota." : "Mono: última nota.");
  }

  function onKeyDown(event) {
    if (event.repeat) return;
    if (typingTarget(event.target)) return;
    const onKnob = event.target.closest?.(".knob, .bkn");
    if (bayOn && baySel != null && (event.key === "Delete" || event.key === "Backspace")) {
      pins[baySel] = 0;
      baySel = null;
      paintPins();
      markDirty();
      event.preventDefault();
      return;
    }
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      if (onKnob) return;
      shiftOctave(event.code === "ArrowLeft" ? -12 : 12);
      event.preventDefault();
      return;
    }
    if (KEY_INDEX[event.code] == null) return;
    event.preventDefault();
    ensureAudio();
    noteOn(baseNote + KEY_INDEX[event.code], 0.85, `c:${event.code}`);
  }

  function onKeyUp(event) {
    if (KEY_INDEX[event.code] == null) return;
    noteOff(`c:${event.code}`);
  }

  function shiftOctave(delta) {
    baseNote = clamp(baseNote + delta, 24, 84);
    rangeEl.textContent = `${noteName(baseNote)} – ${noteName(baseNote + 24)}`;
    paintKeys();
  }

  function cancelPhrase() {
    phraseToken += 1;
    while (phraseTimers.length) clearTimeout(phraseTimers.pop());
    for (const id of [...order]) if (String(id).startsWith("p:")) noteOff(id);
  }

  async function playPhrase() {
    const token = ++phraseToken;
    while (phraseTimers.length) clearTimeout(phraseTimers.pop());
    for (const id of [...order]) if (String(id).startsWith("p:")) noteOff(id);
    await ensureAudio();
    if (token !== phraseToken) return;
    const seq = [0, 4, 7, 12, 7, 4, 0];
    const start = baseNote + 12;
    setStatus("Probando el patch…");
    seq.forEach((semi, index) => {
      phraseTimers.push(
        setTimeout(() => {
          if (token !== phraseToken) return;
          if (index > 0) noteOff(`p:${index - 1}`);
          noteOn(start + semi, 0.9, `p:${index}`);
        }, index * 260),
      );
    });
    phraseTimers.push(
      setTimeout(() => {
        if (token !== phraseToken) return;
        noteOff(`p:${seq.length - 1}`);
        setStatus("Frase terminada. El patch sigue en el panel.");
      }, seq.length * 260 + 480),
    );
  }

  function setMode(mode) {
    if (mode === "mic") {
      ensureAudio();
      enableMic();
      return;
    }
    ch1mode = "keyb";
    stopMic();
    paintMode();
    markDirty();
    setStatus("Canal 1: teclado (voltaje de nota).");
  }

  async function enableMic() {
    try {
      await ensureAudio();
      if (!micStream) {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });
        micSource = ctx.createMediaStreamSource(micStream);
        micSource.connect(node);
      }
      ch1mode = "mic";
      paintMode();
      markDirty();
      setStatus("Canal 1: micrófono. El teclado ya no entra por esa fila.");
    } catch (error) {
      setStatus(`Micro no disponible: ${error.message || error}`);
    }
  }

  function stopMic() {
    if (micSource) micSource.disconnect();
    if (micStream) micStream.getTracks().forEach((track) => track.stop());
    micSource = null;
    micStream = null;
  }

  function paintMode() {
    mount.querySelectorAll("[data-mode]").forEach((button) => {
      button.classList.toggle("on", button.dataset.mode === ch1mode);
    });
  }

  function toggleMute(channel) {
    if (channel === 1) mute1 = !mute1;
    else mute2 = !mute2;
    paintMutes();
    markDirty();
  }

  function paintMutes() {
    mount.querySelector("#mute1").classList.toggle("primary", mute1);
    mount.querySelector("#mute2").classList.toggle("primary", mute2);
    mount.querySelector("#mute1").textContent = mute1 ? "Muted" : "Mute";
    mount.querySelector("#mute2").textContent = mute2 ? "Muted" : "Mute";
    mount.querySelectorAll(".bay [data-mute]").forEach((button) => {
      const on = button.dataset.mute === "1" ? mute1 : mute2;
      button.classList.toggle("on", on);
      button.textContent = on ? "Muted" : "Mute";
    });
  }

  function ensureAudio() {
    if (!ctx) ctx = new AudioContext();
    const resumed = ctx.resume();
    if (node) {
      powered = true;
      hidePower();
      sendNow();
      return resumed;
    }
    if (bootAudio) return bootAudio;
    bootAudio = resumed
      .then(() => setupGraph())
      .catch((error) => {
        bootAudio = null;
        setStatus(`No se pudo abrir el audio: ${error.message || error}`);
      });
    return bootAudio;
  }

  async function setupGraph() {
    await ctx.audioWorklet.addModule(new URL("./worklet.js", import.meta.url));
    try {
      node = new AudioWorkletNode(ctx, "putney-engine", {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [2],
      });
    } catch {
      node = new AudioWorkletNode(ctx, "putney-engine");
    }
    node.port.onmessage = (event) => {
      if (event.data?.type !== "vis") return;
      lastEnv = event.data.env;
      lastMeter = event.data.meter;
      if (event.data.step !== seqIndex) {
        seqIndex = event.data.step;
        paintSeq();
      }
      lamp.classList.toggle("lit", lastEnv > 0.04);
      const angle = -42 + Math.min(1, lastMeter * 1.6) * 84;
      needle.style.transform = `rotate(${angle}deg)`;
    };
    node.connect(ctx.destination);
    powered = true;
    hidePower();
    sendNow();
    setStatus("Putney encendido. Toca el teclado.");
  }

  function hidePower() {
    const button = mount.querySelector("#power-btn");
    if (button) {
      button.textContent = "On";
      button.disabled = true;
    }
  }

  function markDirty() {
    dirty = true;
    if (!frame) frame = requestAnimationFrame(flush);
  }
  function flush() {
    frame = 0;
    if (!dirty) return;
    dirty = false;
    sendNow();
  }
  function sendNow() {
    dirty = false;
    if (!node) return;
    node.port.postMessage({
      type: "state",
      knobs: { ...knobs },
      gains: gainsFrom(pins),
      powered,
      ch1mode,
      stickX,
      stickY,
      gate: gate ? 1 : 0,
      note: currentNote,
      vel: currentVel,
      bend,
      mute1,
      mute2,
      trigger,
      poly: poly ? 1 : 0,
      attack: attackHeld ? 1 : 0,
      attackToken,
      chord: order.map((id) => {
        const item = notes.get(id);
        return { id, n: item.midi, v: item.vel, token: item.token };
      }),
      seqPlaying,
      seqTempo,
      seqRun,
      steps: steps.map((step) => (step.on ? step.note : -1)),
    });
  }

  function applyPatch(patch, fromUser) {
    knobs = { ...DEFAULTS, ...(patch.knobs || {}) };
    pins = (patch.pins || blankPins()).slice(0, 256);
    while (pins.length < 256) pins.push(0);
    userMidi = { ...(patch.midi || {}) };
    ch1mode = patch.ch1mode === "mic" ? "keyb" : patch.ch1mode || "keyb";
    mute1 = !!patch.mute1;
    mute2 = !!patch.mute2;
    const seq = readSeq(patch);
    seqTempo = seq.tempo;
    steps = seq.steps;
    seqPlaying = false;
    seqIndex = -1;
    nameInput.value = patch.name || "";
    deleteBtn.disabled = !fromUser;
    paintAll();
    renderMap();
    markDirty();
    sendNow();
  }

  function writeBank() {
    localStorage.setItem(STORAGE, JSON.stringify(bank));
  }

  function currentData(name) {
    return {
      name,
      knobs: { ...knobs },
      pins: pins.slice(),
      midi: { ...userMidi },
      ch1mode,
      mute1,
      mute2,
      seq: { tempo: seqTempo, steps: steps.map((step) => ({ on: step.on, note: step.note })) },
    };
  }

  function savePatch() {
    const name = nameInput.value.trim() || "Sin nombre";
    const data = currentData(name);
    const selected = patchSelect.value;
    const index = bank.findIndex((item) => item.id === selected);
    if (index >= 0) {
      data.id = selected;
      bank[index] = data;
    } else {
      data.id = `u${Date.now()}`;
      bank.push(data);
    }
    writeBank();
    refreshSelect(data.id);
    deleteBtn.disabled = false;
    setStatus(`Patch «${name}» guardado en este navegador.`);
  }

  function deletePatch() {
    const index = bank.findIndex((item) => item.id === patchSelect.value);
    if (index < 0) return;
    const [removed] = bank.splice(index, 1);
    writeBank();
    refreshSelect("lead");
    applyPatch(FACTORY[0], false);
    setStatus(`Patch «${removed.name}» borrado.`);
  }

  function exportPatch() {
    const name = nameInput.value.trim() || "putney";
    const blob = new Blob([JSON.stringify(currentData(name), null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${name.toLowerCase().replace(/[^a-z0-9]+/gi, "-") || "putney"}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    setStatus("JSON descargado.");
  }

  async function importPatch(file) {
    try {
      const data = JSON.parse(await file.text());
      const list = Array.isArray(data) ? data : [data];
      let last = null;
      list.forEach((item) => {
        if (!item || !item.pins) return;
        last = {
          ...item,
          id: `u${Date.now()}${Math.floor(Math.random() * 999)}`,
          name: item.name || file.name.replace(/\.json$/i, ""),
        };
        bank.push(last);
      });
      if (!last) throw new Error("el archivo no tiene pins");
      writeBank();
      refreshSelect(last.id);
      applyPatch(last, true);
      setStatus(`Importado «${last.name}».`);
    } catch (error) {
      setStatus(`No se pudo importar: ${error.message || error}`);
    }
  }

  function refreshSelect(selected) {
    patchSelect.replaceChildren();
    const factory = document.createElement("optgroup");
    factory.label = "Fábrica";
    FACTORY.forEach((patch) => factory.append(option(patch.id, patch.name)));
    const saved = document.createElement("optgroup");
    saved.label = "Guardados";
    bank.forEach((patch) => saved.append(option(patch.id, patch.name)));
    patchSelect.append(factory, saved);
    patchSelect.value = selected;
  }

  function connectMidi() {
    if (!navigator.requestMIDIAccess) {
      midiState.textContent = "Este navegador no tiene Web MIDI. Chrome y Edge sí.";
      return;
    }
    navigator
      .requestMIDIAccess({ sysex: false })
      .then((access) => {
        const bind = (input) => {
          input.onmidimessage = onMidi;
        };
        access.inputs.forEach(bind);
        access.onstatechange = () => {
          access.inputs.forEach(bind);
          const names = [...access.inputs.values()].map((input) => input.name).filter(Boolean);
          midiState.textContent = names.length ? `Conectado: ${names.join(", ")}` : "Esperando un dispositivo MIDI…";
        };
        const names = [...access.inputs.values()].map((input) => input.name).filter(Boolean);
        midiState.textContent = names.length ? `Conectado: ${names.join(", ")}` : "Ningún dispositivo todavía. Conéctalo y vuelve a abrir.";
        renderMap();
      })
      .catch((error) => {
        midiState.textContent = `Permiso MIDI denegado: ${error.message || error}`;
      });
  }

  function onMidi(event) {
    const [status, data1, data2] = event.data;
    const command = status & 0xf0;
    if (command === 0x90 && data2 > 0) noteOn(data1, data2 / 127, `m:${data1}`);
    else if (command === 0x80 || (command === 0x90 && data2 === 0)) noteOff(`m:${data1}`);
    else if (command === 0xe0) {
      const value = (data2 << 7) | data1;
      bend = ((value - 8192) / 8192) * 2;
      markDirty();
    } else if (command === 0xb0) {
      if (data1 === 64) {
        sustain = data2 >= 64;
        if (!sustain) releaseSustained();
        return;
      }
      if (data1 === 123 || data1 === 120) {
        panic();
        return;
      }
      handleCc(data1, data2);
    }
  }

  function handleCc(cc, value) {
    if (learning && lastTouched && lastTouched !== "stick.y") {
      userMidi[cc] = lastTouched;
      learning = false;
      learnBtn.classList.remove("primary");
      renderMap();
      setStatus(`CC ${cc} asignado a ${labelOf(lastTouched)}.`);
      return;
    }
    const target = userMidi[cc] || DEFAULT_MIDI[cc];
    if (!target) return;
    if (target === "stick.y") {
      if (!stickDrag) {
        stickY = (value / 127) * 2 - 1;
        paintStick();
        markDirty();
      }
      return;
    }
    if (DEFAULTS[target] == null && knobs[target] == null) return;
    knobs[target] = (value / 127) * 10;
    painters.get(target)?.();
    markDirty();
  }

  function panic() {
    order.splice(0, order.length);
    notes.clear();
    sustained.clear();
    gate = attackHeld;
    paintKeys();
    sendNow();
  }

  function renderMap() {
    const lines = Object.entries({ ...DEFAULT_MIDI, ...userMidi }).map(([cc, target]) => {
      const own = userMidi[cc] ? " · propio" : "";
      return `CC ${cc} → ${labelOf(target)}${own}`;
    });
    mapList.textContent = lines.join("\n");
  }

  function setStatus(text) {
    status.textContent = text;
  }
}

function option(value, label) {
  const node = document.createElement("option");
  node.value = value;
  node.textContent = label;
  return node;
}

function readBank() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE) || "[]");
    return Array.isArray(raw) ? raw.filter((item) => item && item.id && item.pins) : [];
  } catch {
    return [];
  }
}

function gainsFrom(pins) {
  const gains = new Float32Array(256);
  for (let i = 0; i < 256; i++) gains[i] = PIN_GAIN[pins[i]] || 0;
  return gains;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isBlack(index) {
  return [1, 3, 6, 8, 10].includes(index % 12);
}

function typingTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
}

function readSeq(patch) {
  const src = patch && patch.seq;
  if (!src || !Array.isArray(src.steps) || src.steps.length < 16) return { tempo: 120, steps: defaultSteps() };
  return {
    tempo: clamp(Math.round(src.tempo || 120), 40, 240),
    steps: src.steps.slice(0, 16).map((step) => ({
      on: !!(step && step.on),
      note: clamp((step && step.note) || 60, 24, 96),
    })),
  };
}

function noteName(midi) {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const name = names[((midi % 12) + 12) % 12];
  return name + (Math.floor(midi / 12) - 1);
}

function readout(id, value) {
  if (id === "osc1.freq" || id === "osc2.freq") return formatHz(expRange(value, 20, 8000));
  if (id === "osc3.freq") return formatHz(expRange(value, 0.05, 2000));
  if (id === "filter.freq") return formatHz(expRange(value, 28, 12000));
  if (id === "env.attack" || id === "env.decay") return formatTime(value);
  if (id === "env.on") return value >= 9.85 ? "HOLD" : formatTime(value);
  if (id === "env.off") return value >= 9.85 ? "∞" : formatTime(value);
  if (id === "fx.delay.time") {
    const ms = expRange(value, 40, 1000);
    return ms < 100 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;
  }
  if (id === "fx.chorus.rate") return `${expRange(value, 0.12, 5.5).toFixed(2)} Hz`;
  if (id === "fx.drive" || id === "fx.delay.mix" || id === "fx.delay.fb" || id === "fx.chorus.depth" || id === "fx.chorus.mix" || id === "seq.swing") {
    return `${Math.round(value * 10)}%`;
  }
  if (id === "seq.gate") return `${Math.round(8 + value * 9.2)}%`;
  return value.toFixed(1);
}

function expRange(knob, min, max) {
  return min * Math.pow(max / min, clamp(knob, 0, 10) / 10);
}

function formatHz(freq) {
  if (freq < 10) return `${freq.toFixed(2)} Hz`;
  if (freq < 1000) return `${Math.round(freq)} Hz`;
  return `${(freq / 1000).toFixed(2)} kHz`;
}

function formatTime(knob) {
  const seconds = 0.001 * Math.pow(12000, clamp(knob, 0, 10) / 10);
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
  return `${seconds.toFixed(1)} s`;
}

function labelOf(id) {
  const names = {
    "osc1.freq": "Osc 1 frecuencia",
    "osc1.shape": "Osc 1 forma",
    "osc1.level": "Osc 1 nivel",
    "osc2.freq": "Osc 2 frecuencia",
    "osc2.shape": "Osc 2 forma",
    "osc2.level": "Osc 2 nivel",
    "osc3.freq": "Osc 3 frecuencia",
    "osc3.shape": "Osc 3 forma",
    "osc3.level": "Osc 3 nivel",
    "noise.colour": "Ruido color",
    "noise.level": "Ruido nivel",
    "ring.level": "Ring nivel",
    "filter.freq": "Filtro frecuencia",
    "filter.response": "Filtro response",
    "filter.level": "Filtro nivel",
    "env.attack": "Attack",
    "env.on": "On",
    "env.decay": "Decay",
    "env.off": "Off",
    "env.trap": "Trapecio",
    "env.signal": "Señal de envolvente",
    "reverb.mix": "Reverb mezcla",
    "reverb.level": "Reverb nivel",
    "input.ch1": "Entrada 1",
    "input.ch2": "Entrada 2",
    "out1.filter": "Salida 1 filtro",
    "out1.pan": "Salida 1 panorama",
    "out1.level": "Salida 1 nivel",
    "out2.filter": "Salida 2 filtro",
    "out2.pan": "Salida 2 panorama",
    "out2.level": "Salida 2 nivel",
    "stick.rx": "Joystick horizontal",
    "stick.ry": "Joystick vertical (rango)",
    "stick.y": "Joystick vertical",
    master: "Monitor",
    glide: "Slew",
    "fx.drive": "Drive",
    "fx.delay.time": "Delay tiempo",
    "fx.delay.fb": "Delay feedback",
    "fx.delay.mix": "Delay mezcla",
    "fx.chorus.rate": "Chorus velocidad",
    "fx.chorus.depth": "Chorus profundidad",
    "fx.chorus.mix": "Chorus mezcla",
    "seq.gate": "Gate del secuenciador",
    "seq.swing": "Swing",
  };
  return names[id] || id;
}
