/* ========================================
   Particle System Engine
   Advanced particle effects for synesthesia visualization
   ======================================== */

class Particle {
  constructor(x, y, config, palette) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.size = config.size[0] + Math.random() * (config.size[1] - config.size[0]);
    this.baseSize = this.size;
    this.color = palette[Math.floor(Math.random() * palette.length)];
    this.rgb = EmotionEngine.hexToRgb(this.color);
    this.alpha = 0.3 + Math.random() * 0.7;
    this.baseAlpha = this.alpha;
    this.speed = config.speed * (0.5 + Math.random());
    this.shape = config.shape;
    this.behavior = config.behavior;
    this.life = 1;
    this.decay = 0.0005 + Math.random() * 0.001;
    this.angle = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    this.vx = 0;
    this.vy = 0;
    this.phase = Math.random() * Math.PI * 2;
    this.orbitRadius = 50 + Math.random() * 150;
    this.orbitSpeed = 0.005 + Math.random() * 0.01;
    this.pulseSpeed = 0.02 + Math.random() * 0.03;
    this.connections = [];

    this._initBehavior();
  }

  _initBehavior() {
    switch (this.behavior) {
      case 'float':
        this.vx = (Math.random() - 0.5) * this.speed;
        this.vy = -this.speed * (0.3 + Math.random() * 0.7);
        break;
      case 'fall':
        this.vx = (Math.random() - 0.5) * this.speed * 0.3;
        this.vy = this.speed * (0.5 + Math.random() * 0.5);
        break;
      case 'explode':
        const expAngle = Math.random() * Math.PI * 2;
        const expSpeed = this.speed * (1 + Math.random() * 2);
        this.vx = Math.cos(expAngle) * expSpeed;
        this.vy = Math.sin(expAngle) * expSpeed;
        break;
      case 'flicker':
        this.vx = (Math.random() - 0.5) * this.speed * 0.5;
        this.vy = (Math.random() - 0.5) * this.speed * 0.5;
        this.flickerRate = 0.05 + Math.random() * 0.1;
        break;
      case 'orbit':
        break;
      case 'burst':
        const burstAngle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(burstAngle) * this.speed * 1.5;
        this.vy = Math.sin(burstAngle) * this.speed * 1.5;
        break;
      case 'spiral':
        this.spiralAngle = Math.random() * Math.PI * 2;
        this.spiralRadius = 10 + Math.random() * 50;
        this.spiralGrowth = 0.5 + Math.random();
        break;
      default:
        this.vx = (Math.random() - 0.5) * this.speed;
        this.vy = (Math.random() - 0.5) * this.speed;
    }
  }

  update(time, canvas, mouseX, mouseY) {
    switch (this.behavior) {
      case 'float':
        this.x += this.vx;
        this.vy += 0.005;
        this.y += this.vy;
        this.x += Math.sin(time * 0.001 + this.phase) * 0.3;
        break;

      case 'fall':
        this.x += this.vx;
        this.x += Math.sin(time * 0.002 + this.phase) * 0.5;
        this.y += this.vy;
        break;

      case 'explode':
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.vy += 0.02;
        break;

      case 'flicker':
        this.x += this.vx + Math.sin(time * this.flickerRate) * 2;
        this.y += this.vy + Math.cos(time * this.flickerRate * 0.7) * 2;
        this.alpha = this.baseAlpha * (0.3 + Math.abs(Math.sin(time * this.flickerRate)) * 0.7);
        break;

      case 'orbit':
        this.phase += this.orbitSpeed;
        this.x = this.originX + Math.cos(this.phase) * this.orbitRadius;
        this.y = this.originY + Math.sin(this.phase) * this.orbitRadius * 0.6;
        break;

      case 'burst':
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.99;
        this.vy *= 0.99;
        this.size = this.baseSize * (0.5 + Math.sin(time * this.pulseSpeed) * 0.5);
        break;

      case 'spiral':
        this.spiralAngle += 0.02;
        this.spiralRadius += this.spiralGrowth * 0.1;
        this.x = this.originX + Math.cos(this.spiralAngle) * this.spiralRadius;
        this.y = this.originY + Math.sin(this.spiralAngle) * this.spiralRadius;
        break;
    }

    this.angle += this.rotationSpeed;

    if (mouseX !== null && mouseY !== null) {
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const force = (150 - dist) / 150;
        this.x -= (dx / dist) * force * 2;
        this.y -= (dy / dist) * force * 2;
      }
    }

    this.life -= this.decay;

    if (this.x < -50) this.x = canvas.width + 50;
    if (this.x > canvas.width + 50) this.x = -50;
    if (this.y < -50) this.y = canvas.height + 50;
    if (this.y > canvas.height + 50) this.y = -50;

    return this.life > 0;
  }

  draw(ctx) {
    const currentAlpha = this.alpha * this.life;
    if (currentAlpha <= 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = currentAlpha;

    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 3);
    glow.addColorStop(0, EmotionEngine.rgbToString(this.rgb, 0.3));
    glow.addColorStop(1, EmotionEngine.rgbToString(this.rgb, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(-this.size * 3, -this.size * 3, this.size * 6, this.size * 6);

    ctx.fillStyle = EmotionEngine.rgbToString(this.rgb, 1);

    switch (this.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(-this.size * 0.866, this.size * 0.5);
        ctx.lineTo(this.size * 0.866, this.size * 0.5);
        ctx.closePath();
        ctx.fill();
        break;

      case 'star':
        this._drawStar(ctx, 5, this.size, this.size * 0.4);
        break;

      case 'heart':
        this._drawHeart(ctx, this.size);
        break;

      default:
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
  }

  _drawStar(ctx, points, outer, inner) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  _drawHeart(ctx, size) {
    ctx.beginPath();
    ctx.moveTo(0, size * 0.3);
    ctx.bezierCurveTo(-size, -size * 0.5, -size * 0.5, -size, 0, -size * 0.5);
    ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.5, 0, size * 0.3);
    ctx.fill();
  }
}

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouseX = null;
    this.mouseY = null;
    this.isActive = false;
    this.currentPalette = [];
    this.currentConfig = null;
    this.animationId = null;

    this._resize();
    window.addEventListener('resize', () => this._resize());

    canvas.style.pointerEvents = 'auto';
    canvas.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
    canvas.addEventListener('mouseleave', () => {
      this.mouseX = null;
      this.mouseY = null;
    });
    canvas.addEventListener('click', (e) => {
      if (this.isActive && this.currentPalette.length > 0) {
        this._burstAt(e.clientX, e.clientY, 20);
      }
    });
  }

  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  generate(analysis) {
    this.clear();
    this.currentPalette = analysis.palette;
    this.currentConfig = analysis.particleConfig;
    this.isActive = true;

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    for (let i = 0; i < analysis.particleConfig.count; i++) {
      const x = cx + (Math.random() - 0.5) * this.canvas.width * 0.6;
      const y = cy + (Math.random() - 0.5) * this.canvas.height * 0.6;
      this.particles.push(new Particle(x, y, analysis.particleConfig, analysis.palette));
    }

    if (!this.animationId) {
      this._animate();
    }
  }

  _burstAt(x, y, count) {
    if (!this.currentConfig || !this.currentPalette.length) return;
    const burstConfig = {
      ...this.currentConfig,
      behavior: 'explode',
      speed: this.currentConfig.speed * 2,
      size: [this.currentConfig.size[0], this.currentConfig.size[1] * 1.5]
    };
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, burstConfig, this.currentPalette));
    }
  }

  _animate() {
    const time = performance.now();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles = this.particles.filter(p => p.update(time, this.canvas, this.mouseX, this.mouseY));

    this._drawConnections();

    for (const p of this.particles) {
      p.draw(this.ctx);
    }

    if (this.isActive && this.particles.length < 50 && this.currentConfig) {
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        this.particles.push(new Particle(x, y, this.currentConfig, this.currentPalette));
      }
    }

    this.animationId = requestAnimationFrame(() => this._animate());
  }

  _drawConnections() {
    const maxDist = 120;
    const len = this.particles.length;
    if (len > 300) return;

    this.ctx.lineWidth = 0.5;

    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15 * this.particles[i].life * this.particles[j].life;
          this.ctx.strokeStyle = EmotionEngine.rgbToString(this.particles[i].rgb, alpha);
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  clear() {
    this.particles = [];
    this.isActive = false;
  }

  getParticleCount() {
    return this.particles.length;
  }

  captureFrame() {
    return this.canvas.toDataURL('image/png');
  }
}

class BackgroundParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.nebulaClouds = [];

    this._resize();
    window.addEventListener('resize', () => this._resize());

    this._initStars();
    this._initNebula();
    this._animate();
  }

  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _initStars() {
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.5,
        alpha: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 0.005 + Math.random() * 0.015,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  _initNebula() {
    const colors = [
      { r: 99, g: 102, b: 241 },
      { r: 168, g: 85, b: 247 },
      { r: 236, g: 72, b: 153 },
      { r: 6, g: 182, b: 212 }
    ];

    for (let i = 0; i < 5; i++) {
      this.nebulaClouds.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: 100 + Math.random() * 200,
        color: colors[i % colors.length],
        alpha: 0.02 + Math.random() * 0.03,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  _animate() {
    const time = performance.now();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const cloud of this.nebulaClouds) {
      cloud.x += cloud.vx;
      cloud.y += cloud.vy;

      if (cloud.x < -cloud.radius) cloud.x = this.canvas.width + cloud.radius;
      if (cloud.x > this.canvas.width + cloud.radius) cloud.x = -cloud.radius;
      if (cloud.y < -cloud.radius) cloud.y = this.canvas.height + cloud.radius;
      if (cloud.y > this.canvas.height + cloud.radius) cloud.y = -cloud.radius;

      const pulsingAlpha = cloud.alpha * (0.7 + Math.sin(time * 0.0005 + cloud.phase) * 0.3);
      const gradient = this.ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius);
      gradient.addColorStop(0, `rgba(${cloud.color.r}, ${cloud.color.g}, ${cloud.color.b}, ${pulsingAlpha})`);
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(cloud.x - cloud.radius, cloud.y - cloud.radius, cloud.radius * 2, cloud.radius * 2);
    }

    for (const star of this.stars) {
      const twinkle = 0.5 + Math.sin(time * star.twinkleSpeed + star.phase) * 0.5;
      this.ctx.globalAlpha = star.alpha * twinkle;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
    requestAnimationFrame(() => this._animate());
  }
}
