/* ========================================
   Synesthesia Renderer
   Combines particles, audio, and analysis into a unified experience
   ======================================== */

class SynesthesiaRenderer {
  constructor(mainCanvas, audioCanvas) {
    this.mainCanvas = mainCanvas;
    this.audioCanvas = audioCanvas;
    this.audioCtx2d = audioCanvas.getContext('2d');
    this.particleSystem = new ParticleSystem(mainCanvas);
    this.audioEngine = new AudioEngine();
    this.currentAnalysis = null;
    this.isRendering = false;
    this.creations = [];

    this._resizeAudioCanvas();
    window.addEventListener('resize', () => this._resizeAudioCanvas());
  }

  _resizeAudioCanvas() {
    this.audioCanvas.width = window.innerWidth;
    this.audioCanvas.height = window.innerHeight;
  }

  async generate(text) {
    const analysis = EmotionEngine.analyzeText(text);
    this.currentAnalysis = analysis;

    this.particleSystem.generate(analysis);
    this.audioEngine.play(analysis.frequencies);

    this.isRendering = true;
    this._renderAudioVisualization();

    setTimeout(() => {
      const thumbnail = this.particleSystem.captureFrame();
      this.creations.push({
        text: text.substring(0, 60),
        thumbnail,
        analysis,
        timestamp: Date.now()
      });
    }, 2000);

    return analysis;
  }

  _renderAudioVisualization() {
    if (!this.isRendering) return;

    const ctx = this.audioCtx2d;
    const w = this.audioCanvas.width;
    const h = this.audioCanvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!this.currentAnalysis) {
      requestAnimationFrame(() => this._renderAudioVisualization());
      return;
    }

    const freqData = this.audioEngine.getFrequencyData();
    const palette = this.currentAnalysis.palette;
    const time = performance.now();

    const cx = w / 2;
    const cy = h / 2;
    const maxRadius = Math.min(w, h) * 0.35;

    ctx.globalAlpha = 0.3;
    const barCount = freqData.length;
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
      const val = freqData[i];
      const innerR = maxRadius * 0.3;
      const outerR = innerR + val * maxRadius * 0.7;

      const color = palette[i % palette.length];
      const rgb = EmotionEngine.hexToRgb(color);

      ctx.strokeStyle = EmotionEngine.rgbToString(rgb, 0.4 + val * 0.6);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(
        cx + Math.cos(angle) * innerR,
        cy + Math.sin(angle) * innerR
      );
      ctx.lineTo(
        cx + Math.cos(angle) * outerR,
        cy + Math.sin(angle) * outerR
      );
      ctx.stroke();

      ctx.fillStyle = EmotionEngine.rgbToString(rgb, 0.8);
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(angle) * outerR,
        cy + Math.sin(angle) * outerR,
        2 + val * 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    for (let ring = 0; ring < 3; ring++) {
      const ringRadius = maxRadius * (0.3 + ring * 0.15);
      const pulse = Math.sin(time * 0.001 + ring * 0.5) * 5;
      const color = palette[ring % palette.length];
      const rgb = EmotionEngine.hexToRgb(color);

      ctx.strokeStyle = EmotionEngine.rgbToString(rgb, 0.1);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius + pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    requestAnimationFrame(() => this._renderAudioVisualization());
  }

  stop() {
    this.isRendering = false;
    this.audioEngine.stop();
    this.particleSystem.clear();
    this.currentAnalysis = null;
  }

  toggleSound() {
    return this.audioEngine.toggleMute();
  }

  getCreations() {
    return this.creations;
  }

  getParticleCount() {
    return this.particleSystem.getParticleCount();
  }

  exportArtwork() {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = this.mainCanvas.width;
    exportCanvas.height = this.mainCanvas.height;
    const ctx = exportCanvas.getContext('2d');

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    ctx.drawImage(this.audioCanvas, 0, 0);
    ctx.drawImage(this.mainCanvas, 0, 0);

    if (this.currentAnalysis) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('MiMo Synesthesia Studio', 20, exportCanvas.height - 20);
    }

    return exportCanvas.toDataURL('image/png');
  }
}
