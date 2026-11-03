// Putney — independent EMS VCS3-style engine. Not affiliated with EMS.
// Sample-accurate semi-modular voice: 3 oscillators, noise, diode-ish ladder,
// trapezoid envelope, ring modulator, spring reverb, 16×16 pin matrix.

class PutneyEngine extends AudioWorkletProcessor {
  constructor() {
    super();
    this.knobs = null;
    this.gains = new Float32Array(256);
    this.powered = false;
    this.wasPowered = false;
    this.ch1mode = "keyb";
    this.stickX = 0;
    this.stickY = 0;
    this.gate = 0;
    this.note = 60;
    this.vel = 0.8;
    this.bend = 0;
    this.mute1 = false;
    this.mute2 = false;
    this.wantTrigger = 0;
    this.trig = false;

    this.src = new Float32Array(16);
    this.phase = [0, 0, 0];
    this.drift = [0, 0, 0];
    this.pitch = 0;
    this.env = 0;
    this.stage = "idle";
    this.stageLeft = 0;
    this.masterEnv = 0;
    this.nLp = 0;
    this.fz = [0, 0, 0, 0];
    this.dcX = [0, 0];
    this.dcY = [0, 0];
    this.tone = [0, 0];
    this.spring = null;
    this.colsA = new Float32Array(16);
    this.colsB = new Float32Array(16);
    this.meterPeak = 0;
    this.envVis = 0;
    this.block = 0;

    this.port.onmessage = (event) => {
      const data = event.data;
      if (!data || data.type !== "state") return;
      this.knobs = data.knobs;
      if (data.gains && data.gains.length === 256) this.gains = data.gains;
      this.ch1mode = data.ch1mode || "keyb";
      this.stickX = data.stickX || 0;
      this.stickY = data.stickY || 0;
      this.gate = data.gate ? 1 : 0;
      this.note = data.note;
      this.vel = data.vel;
      this.bend = data.bend || 0;
      this.mute1 = !!data.mute1;
      this.mute2 = !!data.mute2;
      if (data.trigger !== this.wantTrigger) {
        this.wantTrigger = data.trigger;
        this.trig = true;
      }
      if (!!data.powered !== this.powered) {
        this.powered = !!data.powered;
        if (this.powered) this.resetVoice();
      }
    };
  }

  resetVoice() {
    this.fz = [0, 0, 0, 0];
    this.env = 0;
    this.stage = "idle";
    this.masterEnv = 0;
    this.nLp = 0;
    this.tone = [0, 0];
    this.dcX = [0, 0];
    this.dcY = [0, 0];
    this.spring = null;
  }

  knob(id, fallback = 0) {
    const value = this.knobs[id];
    return Number.isFinite(value) ? value : fallback;
  }

  fillColumns(target) {
    const gains = this.gains;
    const src = this.src;
    for (let c = 0; c < 16; c++) {
      let sum = 0;
      for (let row = 0; row < 16; row++) {
        const gain = gains[row * 16 + c];
        if (gain) sum += src[row] * gain;
      }
      target[c] = sum;
    }
  }

  tick(micL, micR) {
    const sr = sampleRate;
    const k = this.knobs;
    const dt = 1 / sr;

    if (this.masterEnv < 1) this.masterEnv = Math.min(1, this.masterEnv + dt / 0.04);

    const ch1 = this.knob("input.ch1", 10) / 10;
    const ch2 = this.knob("input.ch2", 8) / 10;
    const glide = this.knob("glide", 0);
    const targetPitch = (this.note - 60) / 12 + this.bend / 12;
    if (glide < 0.05) this.pitch = targetPitch;
    else {
      const tau = 0.004 * Math.pow(180, glide / 10);
      const coeff = 1 - Math.exp(-dt / tau);
      this.pitch += (targetPitch - this.pitch) * coeff;
    }

    if (this.ch1mode === "mic") {
      this.src[7] = micL * ch1 * 2.2;
      this.src[8] = micR * ch2 * 2.2;
    } else {
      this.src[7] = this.pitch * ch1;
      this.src[8] = this.vel * ch2;
    }
    const rangeX = (this.knob("stick.rx", 5) / 10) * 2;
    const rangeY = (this.knob("stick.ry", 5) / 10) * 2;
    this.src[14] = this.stickX * rangeX;
    this.src[15] = this.stickY * rangeY;

    const cols = this.colsA;
    this.fillColumns(cols);

    const shapes = [
      this.knob("osc1.shape", 10) / 10,
      this.knob("osc2.shape", 0) / 10,
      this.knob("osc3.shape", 0) / 10,
    ];
    const levels = [
      this.knob("osc1.level", 8) / 10,
      this.knob("osc2.level", 0) / 10,
      this.knob("osc3.level", 7) / 10,
    ];
    const ranges = [
      [20, 8000],
      [20, 8000],
      [0.05, 2000],
    ];
    for (let osc = 0; osc < 3; osc++) {
      this.drift[osc] += (Math.random() - 0.5) * 8e-7;
      this.drift[osc] *= 0.9996;
      if (this.drift[osc] > 0.004) this.drift[osc] = 0.004;
      if (this.drift[osc] < -0.004) this.drift[osc] = -0.004;
      const knobFreq = expKnob(this.knob(`osc${osc + 1}.freq`, 4), ranges[osc][0], ranges[osc][1]);
      let freq = knobFreq * Math.pow(2, cols[8 + osc] + this.drift[osc]);
      if (freq < 0.02) freq = 0.02;
      if (freq > sr * 0.45) freq = sr * 0.45;
      const step = freq / sr;
      let t = this.phase[osc] + step;
      if (t >= 1) t -= 1;
      this.phase[osc] = t;
      const sine = Math.sin(t * Math.PI * 2);
      const saw = 2 * t - 1 - polyBlep(t, step);
      const pw = osc === 0 ? 0.5 : 0.5 - shapes[osc] * 0.38;
      const pulse = bandPulse(t, step, pw);
      const tri = 4 * Math.abs(t - 0.5) - 1;
      const level = levels[osc] * 0.85;
      if (osc === 0) {
        const shape = shapes[0];
        this.src[0] = sine * level;
        this.src[1] = (sine * (1 - shape) + saw * shape) * level;
      } else {
        const shape = shapes[osc];
        const rowA = osc === 1 ? 2 : 4;
        const rowB = rowA + 1;
        this.src[rowA] = tri * level;
        this.src[rowB] = (tri * (1 - shape) + pulse * shape) * level;
      }
    }

    const colour = this.knob("noise.colour", 8) / 10;
    const noiseFreq = 160 * Math.pow(14000 / 160, colour);
    const noiseCoeff = 1 - Math.exp((-2 * Math.PI * noiseFreq) / sr);
    const white = Math.random() * 2 - 1;
    this.nLp += noiseCoeff * (white - this.nLp);
    this.src[6] = this.nLp * (0.8 + colour * 1.4) * (this.knob("noise.level", 0) / 10);

    const env = this.stepEnvelope(dt, cols[11]);
    this.envVis = env;
    const trapLevel = (this.knob("env.trap", 7) / 10) * 1.15;
    const sigLevel = (this.knob("env.signal", 8) / 10) * 1.35;
    this.src[10] = env * trapLevel;
    this.src[11] = cols[3] * env * sigLevel;

    const ring = cols[4] * cols[5] * (this.knob("ring.level", 8) / 10) * 2.4;
    this.src[12] = clamp(ring, -1.5, 1.5);

    const baseCut = expKnob(this.knob("filter.freq", 5), 28, 12000);
    const cutoff = clamp(baseCut * Math.pow(2, cols[13] * 3), 18, sr * 0.45);
    const response = clamp(this.knob("filter.response", 3) / 10, 0, 1);
    const filtered = this.ladder(cols[7] * 0.85 + (response > 0.82 ? 0.0008 : 0), cutoff, response);
    this.src[9] = filtered * (this.knob("filter.level", 8) / 10) * 2;

    if (!this.spring) this.spring = makeSpring(sr);
    const mix = clamp(this.knob("reverb.mix", 2) / 10 + cols[12] * 0.35, 0, 1);
    const wet = this.spring.process(cols[6], mix);
    this.src[13] = wet * (this.knob("reverb.level", 6) / 10) * 1.1;

    const out = this.colsB;
    this.fillColumns(out);

    const vca1 = this.mute1 ? 0 : outputVca(this.knob("out1.level", 7), out[14], this.columnHas(14));
    const vca2 = this.mute2 ? 0 : outputVca(this.knob("out2.level", 7), out[15], this.columnHas(15));
    let chA = this.toneOf(out[0] * vca1, 0, this.knob("out1.filter", 10));
    let chB = this.toneOf(out[2] * vca2, 1, this.knob("out2.filter", 10));
    const panA = panLaw(this.knob("out1.pan", 5));
    const panB = panLaw(this.knob("out2.pan", 5));
    let left = chA * panA[0] + chB * panB[0];
    let right = chA * panA[1] + chB * panB[1];
    left = this.dc(left, 0);
    right = this.dc(right, 1);
    const master = (this.knob("master", 7) / 10) * 0.5 * this.masterEnv;
    left = Math.tanh(left * 1.35) * master;
    right = Math.tanh(right * 1.35) * master;
    const meterIn = this.columnHas(1) ? out[1] : (left + right) * 0.5;
    this.meterPeak = Math.max(this.meterPeak * 0.992, Math.abs(meterIn));
    return [left, right];
  }

  columnHas(index) {
    for (let row = 0; row < 16; row++) if (this.gains[row * 16 + index]) return true;
    return false;
  }

  stepEnvelope(dt, decayCv) {
    const attack = envTime(this.knob("env.attack", 2));
    const onKnob = this.knob("env.on", 10);
    const offKnob = this.knob("env.off", 10);
    const onHold = onKnob >= 9.85;
    const looping = offKnob < 9.85;
    let decay = envTime(this.knob("env.decay", 6));
    decay *= Math.pow(2, clamp(decayCv, -2, 4));
    const onTime = envTime(Math.min(onKnob, 9.7));
    const offTime = envTime(Math.min(offKnob, 9.7));

    if (this.trig) {
      this.trig = false;
      this.stage = "attack";
    } else if (this.stage === "idle" && looping) {
      this.stage = "attack";
    }

    if (this.stage === "attack") {
      this.env += dt / Math.max(attack, 0.0004);
      if (this.env >= 1) {
        this.env = 1;
        this.stage = "on";
        this.stageLeft = onTime;
      }
    } else if (this.stage === "on") {
      if (onHold) {
        if (!this.gate) this.stage = "decay";
      } else {
        this.stageLeft -= dt;
        if (this.stageLeft <= 0) this.stage = "decay";
      }
    } else if (this.stage === "decay") {
      this.env -= dt / Math.max(decay, 0.0004);
      if (this.env <= 0) {
        this.env = 0;
        if (looping) {
          this.stage = "off";
          this.stageLeft = offTime;
        } else this.stage = "idle";
      }
    } else if (this.stage === "off") {
      this.stageLeft -= dt;
      if (this.stageLeft <= 0) this.stage = "attack";
    }
    return this.env;
  }

  ladder(input, cutoff, resonance) {
    const g = Math.tan((Math.PI * cutoff) / sampleRate);
    const k = 4.9 * resonance;
    const G = g / (1 + g);
    const G2 = G * G;
    const G3 = G2 * G;
    const G4 = G3 * G;
    const s = this.fz;
    const S = s[0] * G3 + s[1] * G2 + s[2] * G + s[3];
    let u = (input - k * Math.tanh(S)) / (1 + k * G4);
    if (!Number.isFinite(u)) u = 0;
    for (let i = 0; i < 4; i++) {
      const v = (u - s[i]) * G;
      const y = v + s[i];
      s[i] = y + v;
      u = y;
    }
    if (!Number.isFinite(u)) {
      this.fz = [0, 0, 0, 0];
      return 0;
    }
    return u;
  }

  toneOf(sample, index, knob) {
    const freq = expKnob(knob, 90, 18000);
    const a = 1 - Math.exp((-2 * Math.PI * freq) / sampleRate);
    this.tone[index] += a * (sample - this.tone[index]);
    return this.tone[index];
  }

  dc(sample, index) {
    const y = sample - this.dcX[index] + 0.995 * this.dcY[index];
    this.dcX[index] = sample;
    this.dcY[index] = y;
    return y;
  }

  process(inputs, outputs) {
    const channels = outputs[0];
    if (!channels || !channels[0]) return true;
    const left = channels[0];
    const right = channels[1];
    const micL = inputs[0] && inputs[0][0];
    const micR = inputs[0] && inputs[0][1];
    const count = left.length;
    if (!this.powered || !this.knobs) {
      for (let i = 0; i < count; i++) {
        left[i] = 0;
        if (right) right[i] = 0;
      }
      return true;
    }
    for (let i = 0; i < count; i++) {
      const mL = micL ? micL[i] || 0 : 0;
      const mR = micR ? micR[i] || mL : mL;
      const pair = this.tick(mL, mR);
      if (right) {
        left[i] = pair[0];
        right[i] = pair[1];
      } else left[i] = (pair[0] + pair[1]) * 0.5;
    }
    this.block += count;
    if (this.block >= 1024) {
      this.block = 0;
      this.port.postMessage({
        type: "vis",
        meter: this.meterPeak,
        env: this.envVis,
      });
      this.meterPeak *= 0.45;
    }
    return true;
  }
}

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function expKnob(knob, min, max) {
  const t = clamp(knob, 0, 10) / 10;
  return min * Math.pow(max / min, t);
}

function envTime(knob) {
  const t = clamp(knob, 0, 10) / 10;
  return 0.001 * Math.pow(12000, t);
}

function polyBlep(t, dt) {
  if (dt <= 0) return 0;
  if (t < dt) {
    const x = t / dt;
    return x + x - x * x - 1;
  }
  if (t > 1 - dt) {
    const x = (t - 1) / dt;
    return x * x + x + x + 1;
  }
  return 0;
}

function bandPulse(t, dt, pw) {
  let value = t < pw ? 1 : -1;
  value += polyBlep(t, dt);
  value -= polyBlep((t - pw + 1) % 1, dt);
  return value;
}

function outputVca(levelKnob, cv, hasCv) {
  const level = clamp(levelKnob, 0, 10) / 10;
  if (!hasCv) return level;
  return level * Math.max(0, cv);
}

function panLaw(knob) {
  const n = clamp(knob, 0, 10) / 10;
  const angle = n * Math.PI * 0.5;
  return [Math.cos(angle), Math.sin(angle)];
}

function makeSpring(sr) {
  const len = Math.floor(sr * 0.28);
  const buf = new Float32Array(len);
  const ap = new Float32Array(Math.floor(sr * 0.017));
  let w = 0;
  let apI = 0;
  let phase = 0;
  function read(delay) {
    let p = w - delay;
    while (p < 0) p += len;
    const i = Math.floor(p);
    const frac = p - i;
    const a = buf[i % len];
    const b = buf[(i + 1) % len];
    return a + (b - a) * frac;
  }
  return {
    process(input, mix) {
      phase += 2.7 / sr;
      const mod = Math.sin(phase * Math.PI * 2) * sr * 0.0016;
      const wet =
        read(sr * 0.029 + mod) * 0.62 +
        read(sr * 0.041 - mod) * 0.48 +
        read(sr * 0.067) * 0.36 +
        read(sr * 0.089) * 0.28;
      const delayed = ap[apI];
      const y = -wet + delayed;
      ap[apI] = wet + delayed * 0.55;
      apI = (apI + 1) % ap.length;
      const body = y * 0.75 + wet * 0.25;
      buf[w] = Math.tanh(input * 0.85 + body * 0.58);
      w = (w + 1) % len;
      return input * (1 - mix) + body * mix * 1.35;
    },
  };
}

registerProcessor("putney-engine", PutneyEngine);
