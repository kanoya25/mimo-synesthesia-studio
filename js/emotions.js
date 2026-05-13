/* ========================================
   Emotion Analysis Engine
   Text -> Emotion mapping with color/sound generation
   ======================================== */

const EmotionEngine = (() => {
  const EMOTION_KEYWORDS = {
    joy: {
      words: ['bahagia','senang','gembira','ceria','senyum','tertawa','indah','cantik','beautiful','happy','joy','love','cinta','sayang','hangat','warm','sunshine','matahari','cahaya','light','terang','bright','emas','gold','pelangi','rainbow','bunga','flower','manis','sweet','harapan','hope','mimpi','dream','surga','heaven','sinar'],
      color: '#FFD700',
      gradient: ['#FFD700', '#FF8C00', '#FFA500'],
      frequency: 528,
      emoji: '😊'
    },
    sadness: {
      words: ['sedih','menangis','air mata','tears','hujan','rain','gelap','dark','sendiri','alone','lonely','kesepian','hilang','lost','pergi','gone','dingin','cold','abu-abu','gray','sepi','quiet','malam','night','bayangan','shadow','rindu','miss','kenangan','memory','luka','wound','patah','broken'],
      color: '#4169E1',
      gradient: ['#4169E1', '#1E3A8A', '#312E81'],
      frequency: 396,
      emoji: '😢'
    },
    anger: {
      words: ['marah','kesal','benci','hate','amarah','anger','api','fire','panas','hot','merah','red','geram','furious','ledakan','explosion','petir','thunder','badai','storm','berkobar','burn','hancur','destroy','keras','hard','tajam','sharp'],
      color: '#DC2626',
      gradient: ['#DC2626', '#991B1B', '#7F1D1D'],
      frequency: 741,
      emoji: '😠'
    },
    fear: {
      words: ['takut','fear','gelap','dark','hantu','ghost','seram','scary','bahaya','danger','ancaman','threat','gemetar','tremble','ngeri','horror','mimpi buruk','nightmare','kabut','fog','misteri','mystery','tersembunyi','hidden','bayangan','shadow','mengerikan'],
      color: '#7C3AED',
      gradient: ['#7C3AED', '#4C1D95', '#2E1065'],
      frequency: 639,
      emoji: '😨'
    },
    peace: {
      words: ['tenang','calm','damai','peace','sejuk','cool','lembut','soft','gentle','angin','wind','awan','cloud','langit','sky','biru','blue','laut','sea','air','water','sungai','river','danau','lake','hutan','forest','alam','nature','pohon','tree','hijau','green','meditasi','meditation','napas','breath','harmoni','harmony','zen'],
      color: '#06B6D4',
      gradient: ['#06B6D4', '#0E7490', '#155E75'],
      frequency: 432,
      emoji: '🧘'
    },
    energy: {
      words: ['energi','energy','semangat','spirit','kuat','strong','power','lari','run','terbang','fly','bebas','free','petualangan','adventure','cepat','fast','kilat','lightning','listrik','electric','neon','glow','bersinar','shine','galaksi','galaxy','bintang','star','kosmik','cosmic','ruang angkasa','space','orbit'],
      color: '#10B981',
      gradient: ['#10B981', '#059669', '#047857'],
      frequency: 852,
      emoji: '⚡'
    },
    romance: {
      words: ['cinta','love','romantis','romantic','hati','heart','pelukan','hug','ciuman','kiss','kasih','affection','pasangan','couple','bulan','moon','bintang','star','malam','night','lilin','candle','mawar','rose','kelopak','petal','merah muda','pink','ungu','purple','sakura','cherry blossom'],
      color: '#EC4899',
      gradient: ['#EC4899', '#DB2777', '#9D174D'],
      frequency: 639,
      emoji: '💕'
    },
    mystery: {
      words: ['misteri','mystery','rahasia','secret','tersembunyi','hidden','labirin','labyrinth','kuno','ancient','sihir','magic','gaib','supernatural','portal','dimension','waktu','time','tak terbatas','infinite','keabadian','eternity','semesta','universe','nebula','void','kekosongan','abyss'],
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#6D28D9', '#4C1D95'],
      frequency: 963,
      emoji: '🔮'
    }
  };

  function analyzeText(text) {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);
    const scores = {};
    let totalMatches = 0;

    for (const [emotion, data] of Object.entries(EMOTION_KEYWORDS)) {
      let score = 0;
      for (const keyword of data.words) {
        if (lower.includes(keyword)) {
          score += keyword.length > 3 ? 2 : 1;
        }
      }
      scores[emotion] = score;
      totalMatches += score;
    }

    if (totalMatches === 0) {
      const hash = simpleHash(text);
      const emotionKeys = Object.keys(EMOTION_KEYWORDS);
      const primary = emotionKeys[hash % emotionKeys.length];
      const secondary = emotionKeys[(hash + 3) % emotionKeys.length];
      scores[primary] = 3;
      scores[secondary] = 2;
      totalMatches = 5;
    }

    const hash = simpleHash(text);
    const emotionKeys = Object.keys(EMOTION_KEYWORDS);
    for (const key of emotionKeys) {
      scores[key] = (scores[key] || 0) + 0.3 + (simpleHash(key + text) % 100) / 250;
      totalMatches += 0.3 + (simpleHash(key + text) % 100) / 250;
    }

    const emotions = {};
    for (const [emotion, score] of Object.entries(scores)) {
      emotions[emotion] = Math.min(score / Math.max(totalMatches, 1), 1);
    }

    const sorted = Object.entries(emotions).sort((a, b) => b[1] - a[1]);
    const dominant = sorted[0][0];
    const secondary = sorted[1] ? sorted[1][0] : dominant;

    const palette = generatePalette(dominant, secondary, emotions);
    const frequencies = generateFrequencies(emotions);
    const particleConfig = generateParticleConfig(dominant, secondary, text.length);

    return {
      emotions,
      dominant,
      secondary,
      palette,
      frequencies,
      particleConfig,
      dominantData: EMOTION_KEYWORDS[dominant],
      secondaryData: EMOTION_KEYWORDS[secondary],
      intensity: Math.min(totalMatches / 10, 1),
      wordCount: words.length
    };
  }

  function generatePalette(dominant, secondary, emotions) {
    const domData = EMOTION_KEYWORDS[dominant];
    const secData = EMOTION_KEYWORDS[secondary];
    const colors = [...domData.gradient];

    if (secondary !== dominant) {
      colors.push(secData.gradient[0]);
    }

    colors.push(adjustBrightness(domData.color, 30));
    colors.push(adjustBrightness(secData.color, -20));

    const unique = [...new Set(colors)];
    return unique.slice(0, 6);
  }

  function generateFrequencies(emotions) {
    const freqs = [];
    for (const [emotion, score] of Object.entries(emotions)) {
      if (score > 0) {
        const base = EMOTION_KEYWORDS[emotion].frequency;
        freqs.push({
          frequency: base,
          amplitude: score,
          emotion
        });
      }
    }
    return freqs.sort((a, b) => b.amplitude - a.amplitude).slice(0, 8);
  }

  function generateParticleConfig(dominant, secondary, textLength) {
    const configs = {
      joy: { count: 300, speed: 2.5, size: [2, 6], shape: 'circle', behavior: 'float' },
      sadness: { count: 150, speed: 0.8, size: [1, 4], shape: 'circle', behavior: 'fall' },
      anger: { count: 400, speed: 4, size: [2, 8], shape: 'triangle', behavior: 'explode' },
      fear: { count: 200, speed: 1.5, size: [1, 5], shape: 'circle', behavior: 'flicker' },
      peace: { count: 180, speed: 0.6, size: [2, 5], shape: 'circle', behavior: 'orbit' },
      energy: { count: 350, speed: 3.5, size: [1, 7], shape: 'star', behavior: 'burst' },
      romance: { count: 250, speed: 1.2, size: [3, 7], shape: 'heart', behavior: 'float' },
      mystery: { count: 220, speed: 1, size: [2, 6], shape: 'circle', behavior: 'spiral' }
    };

    const config = configs[dominant] || configs.peace;
    const scale = Math.min(textLength / 50, 2);
    config.count = Math.floor(config.count * scale);
    config.count = Math.max(config.count, 100);
    config.count = Math.min(config.count, 800);
    return config;
  }

  function adjustBrightness(hex, amount) {
    hex = hex.replace('#', '');
    const r = Math.min(255, Math.max(0, parseInt(hex.substring(0, 2), 16) + amount));
    const g = Math.min(255, Math.max(0, parseInt(hex.substring(2, 4), 16) + amount));
    const b = Math.min(255, Math.max(0, parseInt(hex.substring(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }

  function rgbToString(rgb, alpha = 1) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  return { analyzeText, hexToRgb, rgbToString, EMOTION_KEYWORDS };
})();
