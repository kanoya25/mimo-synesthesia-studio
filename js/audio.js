/* ========================================
   Audio Synthesis Engine
   Generate music from emotion analysis
   ======================================== */

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.oscillators = [];
    this.isPlaying = false;
    this.isMuted = true;
    this.analyser = null;
    this.dataArray = null;
  }

  init() {
    if (this.audioCtx) return;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.audioCtx.destination);

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.masterGain.connect(this.analyser);
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  play(frequencies) {
    this.init();
    this.stop();

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;

    for (const freq of frequencies) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = this._getWaveType(freq.emotion);
      osc.frequency.value = freq.frequency;

      const lfoOsc = this.audioCtx.createOscillator();
      const lfoGain = this.audioCtx.createGain();
      lfoOsc.frequency.value = 0.2 + Math.random() * 0.5;
      lfoGain.gain.value = freq.frequency * 0.02;
      lfoOsc.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfoOsc.start(now);

      filter.type = 'lowpass';
      filter.frequency.value = 2000 + freq.amplitude * 3000;
      filter.Q.value = 1;

      const volume = freq.amplitude * 0.08;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 2);
      gain.gain.setValueAtTime(volume, now + 8);
      gain.gain.linearRampToValueAtTime(volume * 0.6, now + 15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);

      this.oscillators.push({ osc, gain, lfoOsc, lfoGain, filter });
    }

    this._addAmbientPad(frequencies);

    if (!this.isMuted) {
      this.masterGain.gain.linearRampToValueAtTime(0.5, now + 1);
    }

    this.isPlaying = true;
  }

  _addAmbientPad(frequencies) {
    if (frequencies.length === 0) return;
    const now = this.audioCtx.currentTime;
    const baseFreq = frequencies[0].frequency;

    const harmonics = [0.5, 1, 1.5, 2];
    for (const harmonic of harmonics) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.value = baseFreq * harmonic;

      const vol = 0.02 / harmonic;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 3);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);

      this.oscillators.push({ osc, gain });
    }
  }

  _getWaveType(emotion) {
    const types = {
      joy: 'sine',
      sadness: 'sine',
      anger: 'sawtooth',
      fear: 'triangle',
      peace: 'sine',
      energy: 'square',
      romance: 'sine',
      mystery: 'triangle'
    };
    return types[emotion] || 'sine';
  }

  stop() {
    const now = this.audioCtx ? this.audioCtx.currentTime : 0;

    for (const item of this.oscillators) {
      try {
        if (item.gain) {
          item.gain.gain.linearRampToValueAtTime(0, now + 0.5);
        }
        setTimeout(() => {
          try {
            item.osc.stop();
            if (item.lfoOsc) item.lfoOsc.stop();
          } catch (_) {}
        }, 600);
      } catch (_) {}
    }

    this.oscillators = [];
    this.isPlaying = false;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(
        this.isMuted ? 0 : 0.5,
        now + 0.3
      );
    }
    return this.isMuted;
  }

  getFrequencyData() {
    if (!this.analyser || !this.dataArray) return new Array(16).fill(0);
    this.analyser.getByteFrequencyData(this.dataArray);
    const bars = [];
    const step = Math.floor(this.dataArray.length / 16);
    for (let i = 0; i < 16; i++) {
      bars.push(this.dataArray[i * step] / 255);
    }
    return bars;
  }
}
