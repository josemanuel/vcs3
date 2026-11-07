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
    this.manualGate = 0;
    this.manualNote = 60;
    this.seqPlaying = false;
    this.seqTempo = 120;
    this.seqRun = 0;
    this.heardRun = 0;
    this.seqIndex = 0;
    this.seqSample = 0;
    this.seqHold = false;
    this.seqNote = 60;
    this.steps = new Int16Array(16).fill(-1);
    this.delayFx = makeFxDelay(sampleRate);
    this.chorusFx = makeFxChorus(sampleRate);
    this.poly = false;
    this.attack = 0;
    this.attackEdge = false;
    this.heardAttack = 0;
    this.manualNotes = [];
    this.voices = [makeVoice(), makeVoice(), makeVoice(), makeVoice()];
    this.ageClock = 1;
    this.seqToken = 0;
    this.sharedCols = new Float32Array(16);
    this.voiceCols = new Float32Array(16);

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
      this.manualGate = data.gate ? 1 : 0;
      this.manualNote = data.note;
      this.seqPlaying = !!data.seqPlaying;
      this.seqTempo = data.seqTempo || 120;
      if (data.seqRun !== this.heardRun) {
        this.heardRun = data.seqRun || 0;
        this.seqIndex = 0;
        this.seqSample = 0;
      }
      if (data.steps && data.steps.length === 16) {
        for (let i = 0; i < 16; i++) this.steps[i] = data.steps[i];
      }
      if (data.trigger !== this.wantTrigger) {
        this.wantTrigger = data.trigger;
        this.trig = true;
      }
      this.poly = !!data.poly;
      this.attack = data.attack ? 1 : 0;
    if (Number.isFinite(data.attackToken) && data.attackToken !== this.heardAttack) {
      this.heardAttack = data.attackToken;
      this.attackEdge = true;
    }
      if (Array.isArray(data.chord)) this.manualNotes = data.chord;
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
    for (const voice of this.voices) {
      voice.busy = false;
      voice.id = "";
      voice.token = -1;
      voice.gate = 0;
      voice.trig = false;
      voice.env = 0;
      voice.stage = "idle";
      voice.fz[0] = voice.fz[1] = voice.fz[2] = voice.fz[3] = 0;
      voice.rows.fill(0);
    }
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
    this.advanceSequencer();
    if (this.poly) return this.tickPoly(micL, micR);
    if (this.manualGate) {
      this.gate = 1;
      this.note = this.manualNote;
    } else if (this.seqPlaying) {
      this.gate = this.seqHold ? 1 : 0;
      this.note = this.seqNote;
    } else {
      this.gate = 0;
      this.note = this.manualNote;
    }

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
    const shaped = this.shapeFx(left, right);
    left = shaped[0];
    right = shaped[1];
    const master = (this.knob("master", 7) / 10) * 0.5 * this.masterEnv;
    left = Math.tanh(left * 1.35) * master;
    right = Math.tanh(right * 1.35) * master;
    const meterIn = this.columnHas(1) ? out[1] : (left + right) * 0.5;
    this.meterPeak = Math.max(this.meterPeak * 0.992, Math.abs(meterIn));
    return [left, right];
  }

  advanceSequencer() {
    if (!this.seqPlaying || !this.steps) {
      this.seqHold = false;
      return;
    }
    const tempo = clamp(this.seqTempo, 40, 240);
    const base = ((60 / tempo) * sampleRate) / 4;
    const swing = clamp(this.knob("seq.swing", 0) / 10, 0, 1) * 0.55;
    const len = (this.seqIndex % 2 === 0 ? base * (1 + swing) : base * (1 - swing));
    const note = this.steps[this.seqIndex];
    const on = note >= 0;
    const gateLen = Math.max(1, len * clamp(0.08 + (this.knob("seq.gate", 6) / 10) * 0.92, 0.05, 1));
    if (this.seqSample === 0) {
      if (on) {
        this.seqNote = note;
        this.trig = true;
        this.seqToken = (this.seqToken + 1) | 0;
      }
    }
    this.seqHold = on && this.seqSample < gateLen;
    this.seqSample += 1;
    if (this.seqSample >= len) {
      this.seqSample = 0;
      this.seqIndex = (this.seqIndex + 1) % 16;
    }
  }

  shapeFx(left, right) {
    const drive = clamp(this.knob("fx.drive", 0) / 10, 0, 1);
    if (drive > 0.004) {
      const gain = 1 + drive * 7;
      const trim = 1 - drive * 0.38;
      left = Math.tanh(left * gain) * trim;
      right = Math.tanh(right * gain) * trim;
    }
    const delayMix = clamp(this.knob("fx.delay.mix", 0) / 10, 0, 1);
    if (delayMix > 0.004) {
      const time = expKnob(this.knob("fx.delay.time", 4.2), 0.04, 1);
      const feedback = clamp(this.knob("fx.delay.fb", 3.5) / 10, 0, 0.86);
      const wet = this.delayFx.process(left, right, time, feedback);
      left = left * (1 - delayMix) + wet[0] * delayMix;
      right = right * (1 - delayMix) + wet[1] * delayMix;
    }
    const chorusMix = clamp(this.knob("fx.chorus.mix", 0) / 10, 0, 1);
    if (chorusMix > 0.004) {
      const rate = expKnob(this.knob("fx.chorus.rate", 3.2), 0.12, 5.5);
      const depth = clamp(this.knob("fx.chorus.depth", 5) / 10, 0, 1);
      const wet = this.chorusFx.process(left, right, rate, depth);
      left = left * (1 - chorusMix) + wet[0] * chorusMix;
      right = right * (1 - chorusMix) + wet[1] * chorusMix;
    }
    return [left, right];
  }

  tickPoly(micL, micR) {
    const sr = sampleRate;
    this.syncVoices();
    const sounding = [];
    for (const voice of this.voices) if (voice.busy) sounding.push(voice);
    if (!sounding.length) {
      const voice = this.voices[0];
      voice.note = this.manualNote;
      voice.vel = this.vel;
      voice.gate = this.attack ? 1 : 0;
      if (this.attackEdge) voice.trig = true;
      sounding.push(voice);
    } else if (this.attackEdge) {
      for (const voice of sounding) voice.trig = true;
    }
    this.attackEdge = false;
    this.trig = false;

    const ch1 = this.knob("input.ch1", 10) / 10;
    const ch2 = this.knob("input.ch2", 8) / 10;
    const mic = this.ch1mode === "mic";
    const rangeX = (this.knob("stick.rx", 5) / 10) * 2;
    const rangeY = (this.knob("stick.ry", 5) / 10) * 2;
    this.src[14] = this.stickX * rangeX;
    this.src[15] = this.stickY * rangeY;
    if (mic) {
      this.src[7] = micL * ch1 * 2.2;
      this.src[8] = micR * ch2 * 2.2;
    }
    for (const voice of sounding) this.glideVoice(voice);

    const lead = sounding[sounding.length - 1];
    if (!mic) {
      this.src[7] = lead.pitch * ch1;
      this.src[8] = lead.vel * ch2;
    }
    let revIn = 0;
    const gains = this.gains;
    for (let row = 0; row < 16; row++) revIn += this.src[row] * gains[row * 16 + 6];

    const shared = this.sharedCols;
    for (let c = 0; c < 16; c++) {
      let sum = this.src[4] * gains[64 + c] + this.src[5] * gains[80 + c] + this.src[6] * gains[96 + c];
      sum += this.src[13] * gains[208 + c] + this.src[14] * gains[224 + c] + this.src[15] * gains[240 + c];
      if (mic) sum += this.src[7] * gains[112 + c] + this.src[8] * gains[128 + c];
      shared[c] = sum;
    }

    const head = lead;
    let lfoCv = shared[10];
    lfoCv += head.rows[0] * gains[10] + head.rows[1] * gains[26] + head.rows[2] * gains[42] + head.rows[3] * gains[58];
    lfoCv += head.rows[9] * gains[154] + head.rows[10] * gains[170] + head.rows[11] * gains[186] + head.rows[12] * gains[202];
    if (!mic) lfoCv += head.pitch * ch1 * gains[122];
    const lfo = this.waveform(2, this.phase, this.drift, 2, lfoCv);
    this.src[4] = lfo[0];
    this.src[5] = lfo[1];

    const colour = this.knob("noise.colour", 8) / 10;
    const noiseFreq = 160 * Math.pow(14000 / 160, colour);
    const noiseCoeff = 1 - Math.exp((-2 * Math.PI * noiseFreq) / sr);
    const white = Math.random() * 2 - 1;
    this.nLp += noiseCoeff * (white - this.nLp);
    this.src[6] = this.nLp * (0.8 + colour * 1.4) * (this.knob("noise.level", 0) / 10);

    let peakEnv = 0;
    for (const voice of sounding) {
      this.renderVoice(voice, shared, ch1, ch2, mic);
      if (voice.env > peakEnv) peakEnv = voice.env;
    }
    this.envVis = peakEnv;
    const trim = 1 / Math.sqrt(sounding.length);
    this.src[0] = this.src[1] = this.src[2] = this.src[3] = 0;
    this.src[9] = this.src[10] = this.src[11] = this.src[12] = 0;
    for (const voice of sounding) {
      this.src[0] += voice.rows[0];
      this.src[1] += voice.rows[1];
      this.src[2] += voice.rows[2];
      this.src[3] += voice.rows[3];
      this.src[9] += voice.rows[9];
      this.src[10] += voice.rows[10];
      this.src[11] += voice.rows[11];
      this.src[12] += voice.rows[12];
    }
    this.src[0] *= trim;
    this.src[1] *= trim;
    this.src[2] *= trim;
    this.src[3] *= trim;
    this.src[9] *= trim;
    this.src[10] *= trim;
    this.src[11] *= trim;
    this.src[12] *= trim;

    if (!this.spring) this.spring = makeSpring(sr);
    const mix = clamp(this.knob("reverb.mix", 2) / 10 + revIn * 0.35, 0, 1);
    const wet = this.spring.process(revIn, mix);
    this.src[13] = wet * (this.knob("reverb.level", 6) / 10) * 1.1;
    const out = this.colsB;
    this.fillColumns(out);
    return this.finishOut(out);
  }

  syncVoices() {
    const desired = [];
    const list = this.manualNotes || [];
    for (let i = 0; i < list.length && i < 8; i++) desired.push(list[i]);
    if (this.seqPlaying && this.seqHold) desired.push({ id: "seq", n: this.seqNote, v: 0.9, token: this.seqToken });
    const keep = desired.slice(-4);
    const keepIds = new Set(keep.map((item) => item.id));
    const seen = new Set();
    for (const voice of this.voices) {
      if (!voice.id) continue;
      if (keepIds.has(voice.id)) {
        const found = keep.find((item) => item.id === voice.id);
        if (found.token !== voice.token) {
          voice.trig = true;
          voice.token = found.token;
        }
        voice.note = found.n;
        voice.vel = found.v;
        voice.gate = 1;
        voice.busy = true;
        seen.add(voice.id);
      } else if (voice.busy) {
        voice.gate = 0;
        if (voice.env <= 0.0008 && (voice.stage === "idle" || voice.stage === "off")) {
          voice.busy = false;
          voice.id = "";
          voice.token = -1;
        }
      }
    }
    for (const item of keep) {
      if (seen.has(item.id)) continue;
      let slot = this.voices.find((voice) => !voice.busy);
      if (!slot) {
        const releasing = this.voices.filter((voice) => voice.busy && !voice.gate);
        slot = releasing.sort((a, b) => a.age - b.age)[0];
      }
      if (!slot) slot = this.voices.reduce((a, b) => (a.age <= b.age ? a : b));
      slot.id = item.id;
      slot.token = item.token;
      slot.note = item.n;
      slot.vel = item.v;
      slot.gate = 1;
      slot.trig = true;
      slot.busy = true;
      slot.age = ++this.ageClock;
      seen.add(item.id);
    }
  }

  glideVoice(voice) {
    const glide = this.knob("glide", 0);
    const target = (voice.note - 60) / 12 + this.bend / 12;
    if (glide < 0.05) voice.pitch = target;
    else {
      const tau = 0.004 * Math.pow(180, glide / 10);
      const coeff = 1 - Math.exp(-1 / sampleRate / tau);
      voice.pitch += (target - voice.pitch) * coeff;
    }
  }

  renderVoice(voice, shared, ch1, ch2, mic) {
    const gains = this.gains;
    const cols = this.voiceCols;
    const rows = voice.rows;
    for (let c = 0; c < 16; c++) {
      let sum = shared[c];
      sum += rows[0] * gains[c] + rows[1] * gains[16 + c] + rows[2] * gains[32 + c] + rows[3] * gains[48 + c];
      sum += rows[9] * gains[144 + c] + rows[10] * gains[160 + c] + rows[11] * gains[176 + c] + rows[12] * gains[192 + c];
      if (!mic) {
        sum += voice.pitch * ch1 * gains[112 + c];
        sum += voice.vel * ch2 * gains[128 + c];
      }
      cols[c] = sum;
    }
    const a = this.waveform(0, voice.phase, voice.drift, 0, cols[8]);
    const b = this.waveform(1, voice.phase, voice.drift, 1, cols[9]);
    rows[0] = a[0];
    rows[1] = a[1];
    rows[2] = b[0];
    rows[3] = b[1];
    const env = this.stepEnvelope(1 / sampleRate, cols[11], voice);
    const trapLevel = (this.knob("env.trap", 7) / 10) * 1.15;
    const sigLevel = (this.knob("env.signal", 8) / 10) * 1.35;
    rows[10] = env * trapLevel;
    rows[11] = cols[3] * env * sigLevel;
    rows[12] = clamp(cols[4] * cols[5] * (this.knob("ring.level", 8) / 10) * 2.4, -1.5, 1.5);
    const baseCut = expKnob(this.knob("filter.freq", 5), 28, 12000);
    const cutoff = clamp(baseCut * Math.pow(2, cols[13] * 3), 18, sampleRate * 0.45);
    const response = clamp(this.knob("filter.response", 3) / 10, 0, 1);
    const filtered = this.ladder(cols[7] * 0.85 + (response > 0.82 ? 0.0008 : 0), cutoff, response, voice.fz);
    rows[9] = filtered * (this.knob("filter.level", 8) / 10) * 2;
  }

  waveform(osc, phases, drifts, index, cv) {
    const sr = sampleRate;
    drifts[index] += (Math.random() - 0.5) * 8e-7;
    drifts[index] *= 0.9996;
    if (drifts[index] > 0.004) drifts[index] = 0.004;
    if (drifts[index] < -0.004) drifts[index] = -0.004;
    const shape = this.knob(`osc${osc + 1}.shape`, osc === 0 ? 10 : 0) / 10;
    const level = this.knob(`osc${osc + 1}.level`, osc === 1 ? 0 : 8) / 10;
    const range = osc === 2 ? [0.05, 2000] : [20, 8000];
    const knobFreq = expKnob(this.knob(`osc${osc + 1}.freq`, 4), range[0], range[1]);
    let freq = knobFreq * Math.pow(2, cv + drifts[index]);
    if (freq < 0.02) freq = 0.02;
    if (freq > sr * 0.45) freq = sr * 0.45;
    const step = freq / sr;
    let t = phases[index] + step;
    if (t >= 1) t -= 1;
    phases[index] = t;
    const sine = Math.sin(t * Math.PI * 2);
    const saw = 2 * t - 1 - polyBlep(t, step);
    const pw = osc === 0 ? 0.5 : 0.5 - shape * 0.38;
    const pulse = bandPulse(t, step, pw);
    const tri = 4 * Math.abs(t - 0.5) - 1;
    const amp = level * 0.85;
    if (osc === 0) return [sine * amp, (sine * (1 - shape) + saw * shape) * amp];
    return [tri * amp, (tri * (1 - shape) + pulse * shape) * amp];
  }

  finishOut(out) {
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
    const shaped = this.shapeFx(left, right);
    left = shaped[0];
    right = shaped[1];
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

  stepEnvelope(dt, decayCv, voice = this) {
    const attack = envTime(this.knob("env.attack", 2));
    const onKnob = this.knob("env.on", 10);
    const offKnob = this.knob("env.off", 10);
    const onHold = onKnob >= 9.85;
    const looping = offKnob < 9.85;
    let decay = envTime(this.knob("env.decay", 6));
    decay *= Math.pow(2, clamp(decayCv, -2, 4));
    const onTime = envTime(Math.min(onKnob, 9.7));
    const offTime = envTime(Math.min(offKnob, 9.7));

    if (voice.trig) {
      voice.trig = false;
      voice.stage = "attack";
    } else if (voice.stage === "idle" && looping) {
      voice.stage = "attack";
    }

    if (voice.stage === "attack") {
      voice.env += dt / Math.max(attack, 0.0004);
      if (voice.env >= 1) {
        voice.env = 1;
        voice.stage = "on";
        voice.stageLeft = onTime;
      }
    } else if (voice.stage === "on") {
      if (onHold) {
        if (!voice.gate) voice.stage = "decay";
      } else {
        voice.stageLeft -= dt;
        if (voice.stageLeft <= 0) voice.stage = "decay";
      }
    } else if (voice.stage === "decay") {
      voice.env -= dt / Math.max(decay, 0.0004);
      if (voice.env <= 0) {
        voice.env = 0;
        if (looping) {
          voice.stage = "off";
          voice.stageLeft = offTime;
        } else voice.stage = "idle";
      }
    } else if (voice.stage === "off") {
      voice.stageLeft -= dt;
      if (voice.stageLeft <= 0) voice.stage = "attack";
    }
    return voice.env;
  }

  ladder(input, cutoff, resonance, fz = this.fz) {
    const g = Math.tan((Math.PI * cutoff) / sampleRate);
    const k = 4.9 * resonance;
    const G = g / (1 + g);
    const G2 = G * G;
    const G3 = G2 * G;
    const G4 = G3 * G;
    const s = fz;
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
      s[0] = s[1] = s[2] = s[3] = 0;
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
        step: this.seqPlaying ? this.seqIndex : -1,
      });
      this.meterPeak *= 0.45;
    }
    return true;
  }
}

function makeVoice() {
  return {
    id: "",
    token: -1,
    note: 60,
    vel: 0.8,
    gate: 0,
    trig: false,
    busy: false,
    age: 0,
    phase: [0, 0],
    drift: [0, 0],
    pitch: 0,
    env: 0,
    stage: "idle",
    stageLeft: 0,
    fz: [0, 0, 0, 0],
    rows: new Float32Array(16),
  };
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

function makeFxDelay(sr) {
  const len = Math.floor(sr * 1.5);
  const bufL = new Float32Array(len);
  const bufR = new Float32Array(len);
  let w = 0;
  function read(buf, delay) {
    let p = w - delay;
    while (p < 0) p += len;
    const i = Math.floor(p);
    const f = p - i;
    const a = buf[i];
    const b = buf[(i + 1) % len];
    return a + (b - a) * f;
  }
  return {
    process(left, right, time, feedback) {
      const delay = clamp(time * sr, 1, len - 2);
      const dL = read(bufL, delay);
      const dR = read(bufR, delay);
      bufL[w] = Math.tanh(left + dR * feedback);
      bufR[w] = Math.tanh(right + dL * feedback);
      w = (w + 1) % len;
      return [dL, dR];
    },
  };
}

function makeFxChorus(sr) {
  const len = Math.floor(sr * 0.05);
  const bufL = new Float32Array(len);
  const bufR = new Float32Array(len);
  let w = 0;
  let phase = 0;
  function read(buf, delay) {
    let p = w - delay;
    while (p < 0) p += len;
    const i = Math.floor(p) % len;
    const f = p - Math.floor(p);
    const a = buf[i];
    const b = buf[(i + 1) % len];
    return a + (b - a) * f;
  }
  return {
    process(left, right, rate, depth) {
      phase += rate / sr;
      if (phase >= 1) phase -= 1;
      const lfo = Math.sin(phase * Math.PI * 2);
      const lfo2 = Math.sin(phase * Math.PI * 2 + 2.2);
      const base = sr * 0.012;
      const span = depth * sr * 0.007;
      bufL[w] = left;
      bufR[w] = right;
      const cL = read(bufL, base + span + lfo * span);
      const cR = read(bufR, base + span + lfo2 * span);
      w = (w + 1) % len;
      return [(left + cL) * 0.72, (right + cR) * 0.72];
    },
  };
}

registerProcessor("putney-engine", PutneyEngine);
