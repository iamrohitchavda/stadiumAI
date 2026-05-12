/**
 * Staff Map / Incident Map
 * Renders staff positions and incident markers on the stadium layout
 */

const STAFF_POSITIONS = {
  security: [
    { id: 's1', x: 0.5, y: 0.05, name: 'Officer Patel' },
    { id: 's2', x: 0.15, y: 0.5, name: 'Officer Singh' },
    { id: 's3', x: 0.85, y: 0.5, name: 'Officer Chen' },
    { id: 's4', x: 0.5, y: 0.9, name: 'Officer Williams' },
    { id: 's5', x: 0.3, y: 0.3, name: 'Officer Brown' },
    { id: 's6', x: 0.7, y: 0.7, name: 'Officer Davis' }
  ],
  medical: [
    { id: 'm1', x: 0.5, y: 0.45, name: 'Dr. Kumar' },
    { id: 'm2', x: 0.25, y: 0.35, name: 'Paramedic Lee' },
    { id: 'm3', x: 0.75, y: 0.65, name: 'Nurse Robinson' }
  ],
  fnb: [
    { id: 'f1', x: 0.25, y: 0.25, name: 'Sup. Khan' },
    { id: 'f2', x: 0.75, y: 0.6, name: 'Sup. Jones' },
    { id: 'f3', x: 0.4, y: 0.6, name: 'Sup. Martinez' },
    { id: 'f4', x: 0.6, y: 0.3, name: 'Sup. Park' }
  ],
  cleaning: [
    { id: 'c1', x: 0.3, y: 0.55, name: 'Team A' },
    { id: 'c2', x: 0.6, y: 0.4, name: 'Team B' },
    { id: 'c3', x: 0.45, y: 0.75, name: 'Team C' }
  ]
};

const TEAM_COLORS = {
  security: '#ff006e',
  medical: '#00ff88',
  fnb: '#ffbe0b',
  cleaning: '#00e5ff'
};

const TEAM_ICONS = {
  security: '🛡️',
  medical: '🏥',
  fnb: '🍔',
  cleaning: '🧹'
};

export class StaffMap {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.filter = 'all';
    this.incidents = [];
    this.animTime = 0;
    this.animationId = null;
    
    // Add movement to staff positions
    this.staffPositions = JSON.parse(JSON.stringify(STAFF_POSITIONS));
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    this.canvas.width = container.offsetWidth;
    this.canvas.height = container.offsetWidth * 0.625;
    this.canvas.style.height = this.canvas.height + 'px';
  }

  setFilter(team) {
    this.filter = team;
  }

  updateIncidents(incidents) {
    this.incidents = incidents.filter(i => i.status === 'active').slice(0, 8);
  }

  start() {
    this.animate();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  animate() {
    this.animTime += 0.016;
    
    // Slightly move staff positions
    Object.keys(this.staffPositions).forEach(team => {
      this.staffPositions[team].forEach(staff => {
        staff.x += (Math.random() - 0.5) * 0.003;
        staff.y += (Math.random() - 0.5) * 0.003;
        staff.x = Math.max(0.05, Math.min(0.95, staff.x));
        staff.y = Math.max(0.05, Math.min(0.95, staff.y));
      });
    });
    
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  draw() {
    if (!this.ctx) return;
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Draw venue background
    this.drawVenueBackground(ctx, w, h);
    
    // Draw incident markers
    this.drawIncidents(ctx, w, h);
    
    // Draw staff markers
    Object.entries(this.staffPositions).forEach(([team, staff]) => {
      if (this.filter !== 'all' && this.filter !== team) return;
      
      const color = TEAM_COLORS[team];
      
      staff.forEach(member => {
        const px = member.x * w;
        const py = member.y * h;
        
        // Outer glow
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fillStyle = color + '20';
        ctx.fill();
        
        // Main dot
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Border
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Label on hover area (always show for now)
        if (w > 500) {
          ctx.fillStyle = 'rgba(240, 244, 255, 0.6)';
          ctx.font = `500 ${Math.max(8, w * 0.007)}px "Inter", sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(member.name, px, py + 18);
        }
      });
    });
    
    // Legend
    this.drawLegend(ctx, w, h);
  }

  drawVenueBackground(ctx, w, h) {
    // Hidden per user request
  }

  drawIncidents(ctx, w, h) {
    const time = this.animTime;
    
    this.incidents.forEach((incident, i) => {
      // Random position based on incident id
      const hash = incident.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const ix = (0.15 + (hash % 70) / 100) * w;
      const iy = (0.1 + ((hash * 7) % 80) / 100) * h;
      
      const pulseSize = 15 + Math.sin(time * 3 + i) * 5;
      
      // Pulse ring
      ctx.beginPath();
      ctx.arc(ix, iy, pulseSize, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 0, 110, ${0.2 + Math.sin(time * 3 + i) * 0.15})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Center dot
      ctx.beginPath();
      ctx.arc(ix, iy, 5, 0, Math.PI * 2);
      ctx.fillStyle = incident.severity === 'high' ? '#ff006e' : '#ffbe0b';
      ctx.fill();
      
      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = `600 ${Math.max(8, w * 0.007)}px "Space Grotesk"`;
      ctx.textAlign = 'center';
      ctx.fillText(incident.icon + ' ' + incident.type, ix, iy - 14);
    });
  }

  drawLegend(ctx, w, h) {
    const legendX = w * 0.06;
    const legendY = h * 0.88;
    
    ctx.fillStyle = 'rgba(13, 19, 33, 0.8)';
    ctx.roundRect(legendX, legendY, 200, 45, 6);
    ctx.fill();
    
    let x = legendX + 10;
    Object.entries(TEAM_COLORS).forEach(([team, color]) => {
      ctx.beginPath();
      ctx.arc(x, legendY + 22, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      ctx.fillStyle = 'rgba(240, 244, 255, 0.6)';
      ctx.font = '9px "Inter"';
      ctx.textAlign = 'left';
      ctx.fillText(team.charAt(0).toUpperCase() + team.slice(1), x + 8, legendY + 25);
      x += 48;
    });
  }
}
