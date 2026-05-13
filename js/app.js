/* ========================================
   MiMo Synesthesia Studio - Main Application
   ======================================== */

(function () {
  'use strict';

  const bgCanvas = document.getElementById('bgCanvas');
  const mainCanvas = document.getElementById('mainCanvas');
  const audioCanvas = document.getElementById('audioCanvas');
  const hero = document.getElementById('hero');
  const studio = document.getElementById('studio');
  const btnStart = document.getElementById('btnStart');
  const btnBack = document.getElementById('btnBack');
  const btnSound = document.getElementById('btnSound');
  const btnExport = document.getElementById('btnExport');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const textInput = document.getElementById('textInput');
  const charCount = document.getElementById('charCount');
  const btnGenerate = document.getElementById('btnGenerate');
  const inputContainer = document.getElementById('inputContainer');
  const analysisPanel = document.getElementById('analysisPanel');
  const emotionBars = document.getElementById('emotionBars');
  const colorPalette = document.getElementById('colorPalette');
  const freqDisplay = document.getElementById('freqDisplay');
  const gallerySection = document.getElementById('gallerySection');
  const galleryGrid = document.getElementById('galleryGrid');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const loadingText = document.getElementById('loadingText');
  const toast = document.getElementById('toast');
  const statCreations = document.getElementById('statCreations');
  const statParticles = document.getElementById('statParticles');
  const statColors = document.getElementById('statColors');

  let bgSystem;
  let renderer;
  let creationCount = 0;
  let statsInterval;

  function init() {
    bgSystem = new BackgroundParticleSystem(bgCanvas);
    renderer = new SynesthesiaRenderer(mainCanvas, audioCanvas);

    btnSound.classList.add('muted');

    setupEventListeners();
    animateStats();
    initFreqBars();
  }

  function setupEventListeners() {
    btnStart.addEventListener('click', () => showStudio());
    btnBack.addEventListener('click', () => showHero());
    btnSound.addEventListener('click', toggleSound);
    btnExport.addEventListener('click', exportArtwork);
    btnFullscreen.addEventListener('click', toggleFullscreen);
    btnGenerate.addEventListener('click', handleGenerate);

    textInput.addEventListener('input', () => {
      charCount.textContent = textInput.value.length;
      btnGenerate.disabled = textInput.value.trim().length === 0;
    });

    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (textInput.value.trim()) handleGenerate();
      }
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        textInput.value = btn.dataset.text;
        charCount.textContent = textInput.value.length;
        btnGenerate.disabled = false;
        textInput.focus();
      });
    });

    btnGenerate.disabled = true;
  }

  function showStudio() {
    hero.classList.remove('active');
    setTimeout(() => {
      studio.classList.add('active');
      textInput.focus();
    }, 300);
  }

  function showHero() {
    studio.classList.remove('active');
    renderer.stop();
    analysisPanel.classList.remove('visible');
    gallerySection.classList.remove('visible');
    setTimeout(() => {
      hero.classList.add('active');
    }, 300);
  }

  async function handleGenerate() {
    const text = textInput.value.trim();
    if (!text) return;

    showLoading();

    const steps = [
      'Menganalisis emosi teks...',
      'Menghasilkan palet warna...',
      'Menyusun frekuensi audio...',
      'Membuat partikel visual...',
      'Merender synesthesia...'
    ];

    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < steps.length) {
        loadingText.textContent = steps[step];
      }
    }, 400);

    await new Promise(resolve => setTimeout(resolve, 2000));
    clearInterval(stepInterval);

    const analysis = await renderer.generate(text);

    hideLoading();
    updateAnalysisPanel(analysis);
    updateGallery();

    creationCount++;

    analysisPanel.classList.add('visible');
    if (renderer.getCreations().length > 0) {
      gallerySection.classList.add('visible');
    }

    showToast(`Synesthesia "${analysis.dominantData.emoji} ${analysis.dominant}" berhasil dibuat!`);
  }

  function updateAnalysisPanel(analysis) {
    emotionBars.innerHTML = '';

    const emotionNames = {
      joy: 'Kebahagiaan',
      sadness: 'Kesedihan',
      anger: 'Kemarahan',
      fear: 'Ketakutan',
      peace: 'Ketenangan',
      energy: 'Energi',
      romance: 'Romantis',
      mystery: 'Misteri'
    };

    const gradients = {
      joy: 'linear-gradient(90deg, #FFD700, #FF8C00)',
      sadness: 'linear-gradient(90deg, #4169E1, #1E3A8A)',
      anger: 'linear-gradient(90deg, #DC2626, #991B1B)',
      fear: 'linear-gradient(90deg, #7C3AED, #4C1D95)',
      peace: 'linear-gradient(90deg, #06B6D4, #0E7490)',
      energy: 'linear-gradient(90deg, #10B981, #059669)',
      romance: 'linear-gradient(90deg, #EC4899, #DB2777)',
      mystery: 'linear-gradient(90deg, #8B5CF6, #6D28D9)'
    };

    const sorted = Object.entries(analysis.emotions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    for (const [emotion, score] of sorted) {
      const pct = Math.round(score * 100);
      const bar = document.createElement('div');
      bar.className = 'emotion-bar';
      bar.innerHTML = `
        <div class="emotion-bar-header">
          <span class="emotion-bar-name">${EmotionEngine.EMOTION_KEYWORDS[emotion].emoji} ${emotionNames[emotion] || emotion}</span>
          <span class="emotion-bar-value">${pct}%</span>
        </div>
        <div class="emotion-bar-track">
          <div class="emotion-bar-fill" style="background: ${gradients[emotion]}"></div>
        </div>
      `;
      emotionBars.appendChild(bar);

      requestAnimationFrame(() => {
        const fill = bar.querySelector('.emotion-bar-fill');
        fill.style.width = pct + '%';
      });
    }

    colorPalette.innerHTML = '';
    for (const color of analysis.palette) {
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = color;
      swatch.dataset.hex = color;
      swatch.addEventListener('click', () => {
        navigator.clipboard.writeText(color).then(() => {
          showToast(`Warna ${color} disalin!`);
        });
      });
      colorPalette.appendChild(swatch);
    }

    updateFreqBars(analysis.frequencies);
  }

  function initFreqBars() {
    freqDisplay.innerHTML = '';
    for (let i = 0; i < 16; i++) {
      const bar = document.createElement('div');
      bar.className = 'freq-bar';
      bar.style.height = '4px';
      freqDisplay.appendChild(bar);
    }
  }

  function updateFreqBars(frequencies) {
    const bars = freqDisplay.querySelectorAll('.freq-bar');
    const data = renderer.audioEngine.getFrequencyData();

    const update = () => {
      if (!renderer.isRendering) return;
      const data = renderer.audioEngine.getFrequencyData();
      bars.forEach((bar, i) => {
        const h = 4 + data[i] * 56;
        bar.style.height = h + 'px';
      });
      requestAnimationFrame(update);
    };
    update();
  }

  function updateGallery() {
    const creations = renderer.getCreations();
    galleryGrid.innerHTML = '';

    for (let i = creations.length - 1; i >= 0; i--) {
      const creation = creations[i];
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = `
        <img src="${creation.thumbnail}" alt="${creation.text}" />
        <div class="gallery-item-label">${creation.text}</div>
      `;
      item.addEventListener('click', () => {
        textInput.value = creation.text;
        charCount.textContent = creation.text.length;
        btnGenerate.disabled = false;
        handleGenerate();
      });
      galleryGrid.appendChild(item);
    }
  }

  function toggleSound() {
    const isMuted = renderer.toggleSound();
    btnSound.classList.toggle('muted', isMuted);
    btnSound.classList.toggle('active', !isMuted);
    showToast(isMuted ? 'Audio dimatikan' : 'Audio dinyalakan');
  }

  function exportArtwork() {
    if (!renderer.currentAnalysis) {
      showToast('Buat synesthesia dulu sebelum mengekspor!');
      return;
    }

    const dataUrl = renderer.exportArtwork();
    const link = document.createElement('a');
    link.download = `synesthesia-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    showToast('Artwork berhasil diunduh!');
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  function showLoading() {
    loadingOverlay.classList.add('visible');
    loadingText.textContent = 'Menganalisis emosi teks...';
  }

  function hideLoading() {
    loadingOverlay.classList.remove('visible');
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
  }

  function animateStats() {
    let c = 0, p = 0, col = 0;
    const targetC = 1247;
    const targetP = 89420;
    const targetCol = 2048;
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      statCreations.textContent = Math.floor(targetC * ease).toLocaleString();
      statParticles.textContent = Math.floor(targetP * ease).toLocaleString();
      statColors.textContent = Math.floor(targetCol * ease).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
