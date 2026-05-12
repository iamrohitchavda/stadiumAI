/**
 * Stadium Heatmap Visualization
 * Renders real-time crowd density as a heatmap overlay on the stadium layout
 */

export class StadiumHeatmap {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.zones = [];
    this.animationId = null;
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    this.canvas.width = container.offsetWidth;
    this.canvas.height = container.offsetHeight;
  }

  // Stadium zone layout positions (relative 0-1)
  getZoneLayout() {
    return {
      'north-stand': { x: 0.5, y: 0.08, w: 0.6, h: 0.15, shape: 'rect' },
      'south-stand': { x: 0.5, y: 0.82, w: 0.6, h: 0.15, shape: 'rect' },
      'east-stand': { x: 0.88, y: 0.45, w: 0.15, h: 0.4, shape: 'rect' },
      'west-stand': { x: 0.12, y: 0.45, w: 0.15, h: 0.4, shape: 'rect' },
      'north-concourse': { x: 0.5, y: 0.25, w: 0.4, h: 0.06, shape: 'rect' },
      'south-concourse': { x: 0.5, y: 0.7, w: 0.4, h: 0.06, shape: 'rect' },
      'main-concourse': { x: 0.5, y: 0.47, w: 0.12, h: 0.1, shape: 'rect' },
      'food-court-a': { x: 0.25, y: 0.25, w: 0.08, h: 0.06, shape: 'rect' },
      'food-court-b': { x: 0.75, y: 0.7, w: 0.08, h: 0.06, shape: 'rect' },
      'merch-zone': { x: 0.15, y: 0.7, w: 0.07, h: 0.06, shape: 'rect' },
      'vip-lounge': { x: 0.85, y: 0.25, w: 0.07, h: 0.06, shape: 'rect' },
      'family-zone': { x: 0.25, y: 0.7, w: 0.07, h: 0.06, shape: 'rect' }
    };
  }

  getDensityColor(density) {
    if (density < 0.3) return { r: 0, g: 255, b: 136, a: 0.3 + density };
    if (density < 0.5) return { r: 0, g: 229, b: 255, a: 0.3 + density * 0.5 };
    if (density < 0.7) return { r: 255, g: 190, b: 11, a: 0.4 + density * 0.4 };
    if (density < 0.85) return { r: 255, g: 107, b: 53, a: 0.5 + density * 0.3 };
    return { r: 255, g: 0, b: 110, a: 0.6 + density * 0.3 };
  }

  update(crowdData) {
    this.zones = crowdData.zones || [];
    this.draw();
  }

  draw() {
    if (!this.ctx) return;
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Draw stadium background
    this.drawStadiumBackground(ctx, w, h);
    
    // Draw zone overlays
    const layout = this.getZoneLayout();
    const time = Date.now() * 0.001;
    
    this.zones.forEach(zone => {
      const pos = layout[zone.id];
      if (!pos) return;
      
      const color = this.getDensityColor(zone.currentDensity);
      const px = pos.x * w;
      const py = pos.y * h;
      const pw = pos.w * w;
      const ph = pos.h * h;
      
      // Zone fill with gradient
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, Math.max(pw, ph) * 0.7);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a * 0.8})`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a * 0.2})`);
      
      ctx.beginPath();
      const radius = 6;
      ctx.roundRect(px - pw / 2, py - ph / 2, pw, ph, radius);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Zone border
      ctx.beginPath();
      ctx.roundRect(px - pw / 2, py - ph / 2, pw, ph, radius);
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Zone label
      ctx.fillStyle = `rgba(240, 244, 255, 0.9)`;
      ctx.font = `600 ${Math.max(9, w * 0.008)}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Abbreviate name for small zones
      let label = zone.name;
      if (pw < w * 0.12) {
        label = zone.name.split(' ')[0].substring(0, 4);
      }
      ctx.fillText(label, px, py - 4);
      
      // Density percentage
      ctx.font = `700 ${Math.max(10, w * 0.01)}px "JetBrains Mono", monospace`;
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
      ctx.fillText(`${Math.round(zone.currentDensity * 100)}%`, px, py + 10);
      
      // Pulse effect for high density
      if (zone.currentDensity > 0.8) {
        const pulseScale = 1 + Math.sin(time * 3) * 0.05;
        ctx.beginPath();
        ctx.roundRect(
          px - (pw * pulseScale) / 2, 
          py - (ph * pulseScale) / 2, 
          pw * pulseScale, 
          ph * pulseScale, 
          radius
        );
        ctx.strokeStyle = `rgba(255, 0, 110, ${0.3 + Math.sin(time * 3) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    
    // Draw gate indicators
    this.drawGateIndicators(ctx, w, h);
  }

  drawStadiumBackground(ctx, w, h) {
    // Hidden per user request
  }

  drawGateIndicators(ctx, w, h) {
    const gates = [
      { label: 'Gate A', x: 0.5, y: 0.0 },
      { label: 'Gate B', x: 0.97, y: 0.45 },
      { label: 'Gate C', x: 0.5, y: 0.97 },
      { label: 'Gate D', x: 0.03, y: 0.45 },
      { label: 'Gate E', x: 0.85, y: 0.05 },
      { label: 'Gate F', x: 0.85, y: 0.92 }
    ];
    
    gates.forEach(gate => {
      const gx = gate.x * w;
      const gy = gate.y * h;
      
      ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
      ctx.font = `500 ${Math.max(8, w * 0.007)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(gate.label, gx, gy);
    });
  }

  start() {
    // Heatmap updates on data tick, no need for animation loop
  }

  stop() {
    // Nothing to stop
  }
}
