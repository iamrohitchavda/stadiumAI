/**
 * Particle System
 * Creates cinematic crowd-flow particles for the hero background
 */

export class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.animationId = null;
    this.mode = 'pre-match';
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.canvas.parentElement.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.parentElement.offsetWidth;
    this.canvas.height = this.canvas.parentElement.offsetHeight;
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    const count = Math.min(200, Math.floor((this.canvas.width * this.canvas.height) / 8000));
    
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Stadium bowl distribution - concentrate particles in a bowl shape
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.2 + Math.random() * 0.35;
    const centerX = w * 0.5;
    const centerY = h * 0.55;
    
    return {
      x: centerX + Math.cos(angle) * radius * w,
      y: centerY + Math.sin(angle) * radius * h * 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      radius: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
      color: this.getParticleColor(),
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulseOffset: Math.random() * Math.PI * 2
    };
  }

  getParticleColor() {
    const colors = {
      'pre-match': ['0, 229, 255', '139, 92, 246', '0, 255, 136'],
      'live': ['0, 229, 255', '255, 190, 11', '0, 255, 136'],
      'halftime': ['255, 190, 11', '255, 107, 53', '0, 229, 255'],
      'exit': ['255, 0, 110', '255, 190, 11', '0, 229, 255']
    };
    const palette = colors[this.mode] || colors['pre-match'];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  setMode(mode) {
    this.mode = mode;
    // Update particle colors gradually
    this.particles.forEach(p => {
      if (Math.random() > 0.5) p.color = this.getParticleColor();
    });
  }

  draw() {
    if (!this.ctx) return;
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    const time = Date.now() * 0.001;
    
    // Draw connections between nearby particles
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          const alpha = (1 - dist / 100) * 0.08;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(this.particles[i].x, this.particles[i].y);
          ctx.lineTo(this.particles[j].x, this.particles[j].y);
          ctx.stroke();
        }
      }
    }
    
    // Draw and update particles
    this.particles.forEach(p => {
      // Animate
      const pulse = Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset) * 0.3 + 0.7;
      
      // Mouse interaction
      const mdx = this.mouseX - p.x;
      const mdy = this.mouseY - p.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mDist < 150) {
        p.vx -= mdx * 0.00003;
        p.vy -= mdy * 0.00003;
      }
      
      // Movement
      p.x += p.vx;
      p.y += p.vy;
      
      // Dampening
      p.vx *= 0.998;
      p.vy *= 0.998;
      
      // Wrap around
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha * pulse})`;
      ctx.fill();
      
      // Glow effect for larger particles
      if (p.radius > 1.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha * 0.1 * pulse})`;
        ctx.fill();
      }
    });
    
    // Draw stadium outline hint
    this.drawStadiumOutline(ctx, w, h, time);
    
    this.animationId = requestAnimationFrame(() => this.draw());
  }

  drawStadiumOutline(ctx, w, h, time) {
    const cx = w / 2;
    const cy = h * 0.55;
    const rx = w * 0.35;
    const ry = h * 0.25;
    
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 229, 255, ${0.03 + Math.sin(time) * 0.01})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 15]);
    ctx.stroke();
    ctx.restore();
    
    // Inner field
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.5, ry * 0.5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 255, 136, ${0.02 + Math.sin(time * 0.5) * 0.01})`;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 10]);
    ctx.stroke();
    ctx.restore();
  }

  start() {
    if (!this.animationId) {
      this.draw();
    }
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
