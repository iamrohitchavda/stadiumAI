/**
 * StadiumAI — Main Application Entry Point
 * Orchestrates all modules, data engine, visualizations, and interactions
 */

import { dataEngine } from './data/dataEngine.js';
import { CrowdSimulator } from './data/crowdSimulator.js';
import { QueueSimulator } from './data/queueSimulator.js';
import { IncidentSimulator } from './data/incidentSimulator.js';
import { MatchTimeline } from './data/matchTimeline.js';
import { ParticleSystem } from './visualizations/particleSystem.js';
import { StadiumHeatmap } from './visualizations/heatmap.js';
import { RouteSimulator } from './visualizations/routeSimulator.js';
import { StaffMap } from './visualizations/incidentMap.js';
import { STADIUMS, EVENTS, resolveTicket, getVenueList, getEventList } from './data/stadiumConfig.js';

// ============================================================
// INITIALIZATION
// ============================================================

const crowdSim = new CrowdSimulator();
const queueSim = new QueueSimulator();
const incidentSim = new IncidentSimulator();
const matchTimeline = new MatchTimeline();

dataEngine.addSimulator(crowdSim);
dataEngine.addSimulator(queueSim);
dataEngine.addSimulator(incidentSim);
dataEngine.addSimulator(matchTimeline);

// Visualizations
let particleSystem, heatmap, routeSimulator, staffMap;

// Current venue context
let currentVenue = STADIUMS['nms']; // Default: Narendra Modi Stadium
let currentTicket = null;

// ============================================================
// BOOT SEQUENCE
// ============================================================

window.addEventListener('DOMContentLoaded', () => {
  // Loading screen
  const loadingScreen = document.getElementById('loading-screen');
  
  setTimeout(() => {
    // Initialize visualizations
    initVisualizations();
    
    // Initialize UI interactions
    initNavigation();
    initMatchMode();
    initAccordions();
    initScrollAnimations();
    initSandbox();
    initVirtualQueue();
    initWayfinding();
    initStaffFilters();
    initPitch();
    initTicketEntry();
    initAdminPanel();
    
    // Start data engine
    dataEngine.start();
    
    // Connect data to UI
    connectDataToUI();
    
    // Hide loading screen
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      // Ticket modal stays visible until entry/skip
    }, 800);
    
  }, 1500);
});

// ============================================================
// VISUALIZATIONS INIT
// ============================================================

function initVisualizations() {
  particleSystem = new ParticleSystem('hero-particles');
  particleSystem.start();
  
  heatmap = new StadiumHeatmap('crowd-heatmap');
  
  routeSimulator = new RouteSimulator('route-map');
  // Draw initial state
  routeSimulator.setRoute('seat-a142', 'food-b');
  
  staffMap = new StaffMap('staff-map');
  staffMap.start();
}

// ============================================================
// DATA → UI CONNECTIONS
// ============================================================

function connectDataToUI() {
  // KPI Bar updates
  dataEngine.on('tick', (ctx) => {
    const crowd = dataEngine.crowdData;
    const queue = dataEngine.queueData;
    const incidents = dataEngine.incidentData;
    
    // KPI values
    animateValue('kpi-occupancy', `${Math.round((crowd.totalOccupancy || 0) * 100)}%`);
    animateValue('kpi-wait', `${queue.avgWait || 0} min`);
    animateValue('kpi-incidents', `${incidents.activeCount || 0}`);
    const totalStaff = currentVenue ? Object.values(currentVenue.staff).reduce((s,n)=>s+n,0) : 120;
    animateValue('kpi-staff', `${totalStaff - (incidents.activeCount || 0) * 2}`);
    animateValue('kpi-alerts', `${(crowd.alerts || []).length}`);
    
    // Update nav match mode display
    const modeDisplay = document.getElementById('match-mode-nav-value');
    if (modeDisplay) {
      const modeLabels = { 'pre-match': 'PRE-MATCH', 'live': 'LIVE 45:00', 'halftime': 'HALF-TIME', 'exit': 'EXIT RUSH' };
      modeDisplay.textContent = modeLabels[ctx.mode] || 'LIVE';
    }
  });

  // Crowd data → Heatmap & Zone Counters
  dataEngine.on('crowdUpdate', (data) => {
    if (heatmap) heatmap.update(data);
    updateZoneCounters(data.zones);
    updatePredictions(data.predictions, data.alerts);
    updateGateRecommendations(data.gates);
    updateCrowdAlerts(data.alerts);
    if (routeSimulator) routeSimulator.updateCrowdDensities(data.zones);
  });

  // Queue data → Queue Board
  dataEngine.on('queueUpdate', (data) => {
    updateQueueBoard(data.stands);
    updateVirtualQueueUI(data.virtualQueue);
    updateCounterManagement(data.stands);
    updateDemandChart(data.stands);
  });

  // Incident data → Staff Hub
  dataEngine.on('incidentUpdate', (data) => {
    updateIncidentFeed(data.incidents);
    updateShiftSuggestions(data);
    updateTeamStats(data);
    if (staffMap) staffMap.updateIncidents(data.incidents);
    
    const badge = document.getElementById('incident-count-badge');
    if (badge) badge.textContent = `${data.activeCount} active`;
  });
}

// ============================================================
// UI UPDATE FUNCTIONS
// ============================================================

function animateValue(elementId, value) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (el.textContent !== value) {
    el.textContent = value;
    el.style.transform = 'translateY(-2px)';
    el.style.transition = 'transform 0.15s ease';
    setTimeout(() => { el.style.transform = 'translateY(0)'; }, 150);
  }
}

function updateZoneCounters(zones) {
  const container = document.getElementById('zone-counters');
  if (!container) return;
  
  if (container.children.length === 0) {
    // Initial render
    container.innerHTML = zones.map(zone => `
      <div class="zone-counter" data-zone="${zone.id}">
        <span class="zone-name">${zone.name}</span>
        <div class="zone-bar-container">
          <div class="zone-bar" style="width: ${zone.currentDensity * 100}%; background: ${getDensityColorCSS(zone.currentDensity)}"></div>
        </div>
        <span class="zone-value" style="color: ${getDensityColorCSS(zone.currentDensity)}">${Math.round(zone.currentDensity * 100)}%</span>
      </div>
    `).join('');
  } else {
    // Update existing
    zones.forEach(zone => {
      const el = container.querySelector(`[data-zone="${zone.id}"]`);
      if (!el) return;
      const bar = el.querySelector('.zone-bar');
      const val = el.querySelector('.zone-value');
      if (bar) {
        bar.style.width = `${zone.currentDensity * 100}%`;
        bar.style.backgroundColor = getDensityColorCSS(zone.currentDensity);
      }
      if (val) {
        val.textContent = `${Math.round(zone.currentDensity * 100)}%`;
        val.style.color = getDensityColorCSS(zone.currentDensity);
      }
    });
  }
}

function getDensityColorCSS(density) {
  if (density < 0.3) return '#00ff88';
  if (density < 0.5) return '#00e5ff';
  if (density < 0.7) return '#ffbe0b';
  if (density < 0.85) return '#ff6b35';
  return '#ff006e';
}

function updatePredictions(predictions, alerts) {
  const timeline = document.getElementById('prediction-timeline');
  const alertsEl = document.getElementById('prediction-alerts');
  if (!timeline) return;
  
  timeline.innerHTML = predictions.map(p => {
    const density = Math.round(p.density * 100);
    const cls = density > 85 ? 'danger' : density > 70 ? 'warning' : '';
    return `
      <div class="prediction-point ${cls}">
        <div class="prediction-time">${p.time}</div>
        <div class="prediction-density" style="color: ${getDensityColorCSS(p.density)}">${density}%</div>
      </div>
    `;
  }).join('');
  
  if (alertsEl) {
    alertsEl.innerHTML = alerts.slice(0, 3).map(a => `
      <div class="prediction-alert">
        <span>⚠️</span>
        <span>${a.message}</span>
      </div>
    `).join('');
  }
}

function updateGateRecommendations(gates) {
  const container = document.getElementById('gate-recommendations');
  if (!container) return;
  
  container.innerHTML = gates.map(gate => {
    const cls = gate.status === 'offline' ? 'blocked' : gate.currentLoad > 0.6 ? 'busy' : '';
    const statusText = gate.status === 'offline' ? '🔴 OFFLINE' : 
                       gate.currentLoad > 0.6 ? '🟡 BUSY' : '🟢 CLEAR';
    return `
      <div class="gate-card ${cls}">
        <div>
          <div class="gate-name">${gate.name}</div>
          <div class="gate-status">${statusText}</div>
        </div>
        <div class="gate-wait">${gate.status === 'offline' ? '–' : gate.waitTime + ' min'}</div>
      </div>
    `;
  }).join('');
}

function updateCrowdAlerts(alerts) {
  const feed = document.getElementById('crowd-alert-feed');
  if (!feed) return;
  
  if (alerts.length === 0) {
    feed.innerHTML = '<div class="alert-item" style="border-left-color: var(--accent-green)"><span class="alert-msg">✅ All zones operating within normal parameters</span></div>';
    return;
  }
  
  feed.innerHTML = alerts.map(a => `
    <div class="alert-item">
      <span class="alert-time">${new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
      <span class="alert-msg">⚠️ ${a.message}</span>
    </div>
  `).join('');
}

function updateQueueBoard(stands) {
  const board = document.getElementById('queue-board');
  if (!board) return;
  
  board.innerHTML = stands.map(stand => {
    const waitClass = stand.waitMinutes < 3 ? 'low' : stand.waitMinutes < 8 ? 'medium' : 'high';
    const typeLabels = { food: 'FOOD', drinks: 'DRINKS', restroom: 'RESTROOM', merch: 'MERCH' };
    const barColor = getDensityColorCSS(stand.waitMinutes / 15);
    return `
      <div class="queue-card">
        <div class="queue-card-header">
          <span class="queue-card-name">${stand.name}</span>
          <span class="queue-card-type">${typeLabels[stand.type] || stand.type}</span>
        </div>
        <div class="queue-card-wait ${waitClass}">${stand.waitMinutes} min</div>
        <div class="queue-card-detail">${stand.queueLength} in line · ${stand.countersOpen}/${stand.maxCounters} open</div>
        <div class="queue-card-bar">
          <div class="queue-card-bar-fill" style="width: ${Math.min(100, (stand.waitMinutes / 15) * 100)}%; background: ${barColor}"></div>
        </div>
      </div>
    `;
  }).join('');
}

function updateVirtualQueueUI(vq) {
  const posEl = document.getElementById('vq-position');
  const waitEl = document.getElementById('vq-wait-display');
  const progressEl = document.getElementById('vq-progress-fill');
  const joinBtn = document.getElementById('vq-join-btn');
  const stepsEl = document.querySelector('.vq-steps');
  
  if (!posEl) return;
  
  if (vq.active) {
    posEl.textContent = vq.position <= 0 ? '✅' : `#${vq.position}`;
    waitEl.textContent = vq.position <= 0 ? 'Ready!' : `~${Math.ceil(vq.estimatedWait)} min`;
    
    const progress = vq.stage === 'ready' ? 100 : 
                     vq.stage === 'preparing' ? 75 : 
                     Math.max(15, (1 - vq.position / vq.totalInQueue) * 60);
    progressEl.style.width = `${progress}%`;
    
    joinBtn.textContent = vq.stage === 'ready' ? '🎉 Order Ready!' : 'In Queue...';
    joinBtn.disabled = true;
    
    if (stepsEl) {
      const steps = stepsEl.querySelectorAll('.vq-step');
      steps.forEach((step, i) => {
        step.classList.toggle('active', 
          (vq.stage === 'joined' && i === 0) ||
          (vq.stage === 'preparing' && i <= 1) ||
          (vq.stage === 'ready' && i <= 2)
        );
      });
    }
  } else {
    posEl.textContent = '#12';
    waitEl.textContent = '~8 min';
    progressEl.style.width = '15%';
    joinBtn.textContent = 'Join Virtual Queue';
    joinBtn.disabled = false;
  }
}

function updateCounterManagement(stands) {
  const container = document.getElementById('counter-management');
  if (!container) return;
  
  const mainStands = stands.filter(s => s.type === 'food' || s.type === 'drinks').slice(0, 6);
  
  container.innerHTML = mainStands.map(stand => {
    const dots = Array.from({ length: stand.maxCounters }, (_, i) => {
      const cls = i < stand.countersOpen ? 'active' : 'idle';
      return `<span class="counter-dot ${cls}"></span>`;
    }).join('');
    
    return `
      <div class="counter-row">
        <span class="counter-name">${stand.name}</span>
        <div class="counter-dots">${dots}</div>
        <span class="counter-status">${stand.countersOpen}/${stand.maxCounters}</span>
      </div>
    `;
  }).join('');
}

// Demand chart (simple canvas chart)
let demandHistory = [];
function updateDemandChart(stands) {
  const canvas = document.getElementById('demand-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Resize if needed
  const container = canvas.parentElement;
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;
  
  const w = canvas.width;
  const h = canvas.height;
  
  // Add current average demand to history
  const avgDemand = stands.reduce((sum, s) => sum + s.queueLength, 0) / stands.length;
  demandHistory.push(avgDemand);
  if (demandHistory.length > 60) demandHistory.shift();
  
  ctx.clearRect(0, 0, w, h);
  
  // Grid lines
  for (let i = 0; i < 5; i++) {
    const y = (h * 0.1) + (h * 0.8 / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.stroke();
  }
  
  // Labels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '9px "JetBrains Mono"';
  ctx.textAlign = 'left';
  ctx.fillText('High', 4, h * 0.15);
  ctx.fillText('Low', 4, h * 0.85);
  ctx.fillText('Now', w - 25, h * 0.95);
  ctx.fillText('-60s', 4, h * 0.95);
  
  if (demandHistory.length < 2) return;
  
  // Find max for scaling
  const maxVal = Math.max(...demandHistory, 10);
  
  // Draw fill
  ctx.beginPath();
  ctx.moveTo(0, h);
  demandHistory.forEach((val, i) => {
    const x = (i / (demandHistory.length - 1)) * w;
    const y = h * 0.9 - (val / maxVal) * h * 0.75;
    if (i === 0) ctx.moveTo(x, h * 0.9);
    ctx.lineTo(x, y);
  });
  ctx.lineTo(w, h * 0.9);
  ctx.closePath();
  
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, 'rgba(0, 229, 255, 0.15)');
  gradient.addColorStop(1, 'rgba(0, 229, 255, 0.01)');
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Draw line
  ctx.beginPath();
  demandHistory.forEach((val, i) => {
    const x = (i / (demandHistory.length - 1)) * w;
    const y = h * 0.9 - (val / maxVal) * h * 0.75;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Current value dot
  const lastVal = demandHistory[demandHistory.length - 1];
  const lastY = h * 0.9 - (lastVal / maxVal) * h * 0.75;
  ctx.beginPath();
  ctx.arc(w, lastY, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#00e5ff';
  ctx.fill();
}

function updateIncidentFeed(incidents) {
  const feed = document.getElementById('incident-feed');
  if (!feed) return;
  
  feed.innerHTML = incidents.slice(0, 10).map(inc => {
    const timeStr = new Date(inc.createdAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `
      <div class="incident-card severity-${inc.severity} ${inc.status === 'resolved' ? 'resolved' : ''}">
        <div class="incident-card-header">
          <span class="incident-type">${inc.icon} ${inc.type.charAt(0).toUpperCase() + inc.type.slice(1).replace('-', ' ')}</span>
          <span class="incident-time">${timeStr}</span>
        </div>
        <div class="incident-location">📍 ${inc.location}</div>
        <div class="incident-assigned">→ Assigned: ${inc.assignedTo} (${inc.team}) ${inc.status === 'resolved' ? '✅ Resolved' : ''}</div>
      </div>
    `;
  }).join('');
}

function updateShiftSuggestions(data) {
  const container = document.getElementById('shift-suggestions');
  if (!container) return;
  
  const suggestions = [];
  
  // Generate suggestions based on incident data
  if (data.byTeam.security > 2) {
    suggestions.push({
      icon: '🛡️',
      title: 'Deploy +2 Security to South Stand',
      detail: `${data.byTeam.security} active security incidents detected. Recommend reinforcement in 15 minutes.`,
      urgency: 'urgent'
    });
  }
  
  if (data.byTeam.cleaning > 1) {
    suggestions.push({
      icon: '🧹',
      title: 'Cleaning Team C → North Concourse',
      detail: 'Elevated foot traffic creating maintenance needs. Proactive redeployment recommended.',
      urgency: 'moderate'
    });
  }
  
  // Always show at least one predictive suggestion
  suggestions.push({
    icon: '🤖',
    title: 'Zone B: +3 F&B staff in 20 min',
    detail: 'AI predicts concession demand spike based on match phase and historical patterns.',
    urgency: 'moderate'
  });
  
  container.innerHTML = suggestions.map(s => `
    <div class="shift-card">
      <div class="shift-card-header">
        <span class="shift-icon">${s.icon}</span>
        <span class="shift-title">${s.title}</span>
      </div>
      <div class="shift-detail">${s.detail}</div>
      <span class="shift-urgency ${s.urgency}">${s.urgency}</span>
    </div>
  `).join('');
}

function updateTeamStats(data) {
  const container = document.getElementById('team-stats');
  if (!container) return;
  
  const teams = [
    { icon: '🛡️', name: 'Security', active: 35 - data.byTeam.security, total: 35, color: '#ff006e' },
    { icon: '🏥', name: 'Medical', active: 12 - data.byTeam.medical, total: 12, color: '#00ff88' },
    { icon: '🍔', name: 'F&B', active: 48 - data.byTeam.fnb, total: 48, color: '#ffbe0b' },
    { icon: '🧹', name: 'Cleaning', active: 25 - data.byTeam.cleaning, total: 25, color: '#00e5ff' }
  ];
  
  container.innerHTML = teams.map(team => {
    const pct = (team.active / team.total) * 100;
    return `
      <div class="team-stat-row">
        <span class="team-stat-icon">${team.icon}</span>
        <span class="team-stat-name">${team.name}</span>
        <div class="team-stat-bar-container">
          <div class="team-stat-bar" style="width: ${pct}%; background: ${team.color}"></div>
        </div>
        <span class="team-stat-value" style="color: ${team.color}">${team.active}/${team.total}</span>
      </div>
    `;
  }).join('');
}

// ============================================================
// UI INTERACTIONS
// ============================================================

function initNavigation() {
  const nav = document.getElementById('main-nav');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    // Show nav after scrolling past hero
    if (currentScroll > window.innerHeight * 0.5) {
      nav.classList.add('visible');
    } else {
      nav.classList.remove('visible');
    }
    
    // Active link tracking
    const sections = document.querySelectorAll('.section');
    let currentSection = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.4) {
        currentSection = section.id;
      }
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.section === currentSection);
    });
    
    lastScroll = currentScroll;
  });
  
  // Smooth scroll on nav click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  
  // Hero CTA
  document.getElementById('btn-enter-experience')?.addEventListener('click', () => {
    document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' });
  });
  
  // Mobile toggle
  document.getElementById('mobile-toggle')?.addEventListener('click', () => {
    const links = document.querySelector('.nav-links');
    links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '100%';
    links.style.left = '0';
    links.style.right = '0';
    links.style.background = 'rgba(6, 10, 20, 0.95)';
    links.style.padding = '1rem';
    links.style.borderBottom = '1px solid rgba(0, 229, 255, 0.1)';
  });
}

function initMatchMode() {
  const buttons = document.querySelectorAll('.match-mode-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const mode = btn.dataset.mode;
      dataEngine.setMode(mode);
      
      // Update particle system
      if (particleSystem) particleSystem.setMode(mode);
      
      // Visual feedback
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => { btn.style.transform = ''; }, 150);
    });
  });
}

function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      trigger.classList.toggle('open');
      const content = trigger.nextElementSibling;
      content.classList.toggle('open');
    });
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  document.querySelectorAll('.animate-fade-up, .overview-card, .sustain-card, .dash-panel, .module-header').forEach(el => {
    observer.observe(el);
  });
  
  // Add animation class to elements that should animate on scroll
  document.querySelectorAll('.overview-card, .sustain-card, .dash-panel').forEach(el => {
    el.classList.add('animate-fade-up');
  });
}

function initSandbox() {
  const sandboxLog = document.getElementById('sandbox-log');
  
  function addLogEntry(msg, type = 'system') {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.innerHTML = `<span class="log-time">${time}</span><span class="log-msg">${msg}</span>`;
    sandboxLog.prepend(entry);
    
    // Keep max 50 entries
    while (sandboxLog.children.length > 50) {
      sandboxLog.removeChild(sandboxLog.lastChild);
    }
  }
  
  function handleSandboxEvent(event) {
    // Trigger event
    dataEngine.triggerEvent(event);
    
    // Log responses
    switch (event) {
      case 'crowd-surge':
        addLogEntry('🌊 CROWD SURGE triggered in South Stand', 'alert');
        setTimeout(() => addLogEntry('📡 Density sensors detecting rapid increase in Zone B', 'warning'), 800);
        setTimeout(() => addLogEntry('🛡️ Security Team Alpha deployed to South Stand', 'success'), 1500);
        setTimeout(() => addLogEntry('🧭 Fan routes recalculated — avoiding South Concourse', 'system'), 2200);
        setTimeout(() => addLogEntry('📢 Gate C recommendation updated — redirect to Gate D', 'system'), 3000);
        break;
      case 'medical':
        addLogEntry('🚑 MEDICAL EMERGENCY raised — Section A, Row 14', 'alert');
        setTimeout(() => addLogEntry('🏥 Dr. Kumar dispatched — ETA 45 seconds', 'success'), 600);
        setTimeout(() => addLogEntry('🛡️ Security corridor cleared on Aisle 14', 'system'), 1200);
        setTimeout(() => addLogEntry('🧭 Nearby fans rerouted around Section A', 'system'), 1800);
        break;
      case 'halftime-rush':
        addLogEntry('🍔 HALF-TIME RUSH simulated — all queues surging 3×', 'alert');
        setTimeout(() => addLogEntry('🔧 Additional counters opening across all food courts', 'success'), 800);
        setTimeout(() => addLogEntry('📱 Virtual queue capacity expanded', 'system'), 1400);
        setTimeout(() => addLogEntry('🤖 AI: Predicted demand matched within 5% accuracy', 'success'), 2000);
        break;
      case 'gate-failure':
        addLogEntry('🚫 GATE C MALFUNCTION — going offline', 'alert');
        setTimeout(() => addLogEntry('🧭 All Gate C traffic redirected to Gates B and D', 'warning'), 700);
        setTimeout(() => addLogEntry('📢 Push notification sent to 8,400 affected fans', 'system'), 1400);
        setTimeout(() => addLogEntry('🔧 Maintenance team dispatched — ETA 4 minutes', 'system'), 2000);
        break;
      case 'vip-alert':
        addLogEntry('⭐ VIP ARRIVAL detected at North Gate', 'system');
        setTimeout(() => addLogEntry('🛡️ Priority escort activated — VIP corridor cleared', 'success'), 500);
        setTimeout(() => addLogEntry('🧭 VIP express route calculated — 2 min to lounge', 'system'), 1000);
        break;
      case 'reset':
        addLogEntry('↻ All systems reset to normal operations', 'success');
        break;
    }
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'admin_sandbox_event' && e.newValue) {
      const eventName = e.newValue.split('-')[0];
      handleSandboxEvent(eventName);
    }
  });
}

function initVirtualQueue() {
  const joinBtn = document.getElementById('vq-join-btn');
  if (!joinBtn) return;
  
  joinBtn.addEventListener('click', () => {
    if (!queueSim.virtualQueue.active) {
      queueSim.joinVirtualQueue('food-a1');
      joinBtn.textContent = 'In Queue...';
      joinBtn.disabled = true;
    }
  });
}

function initWayfinding() {
  const calcBtn = document.getElementById('route-calculate');
  const fromSelect = document.getElementById('route-from');
  const toSelect = document.getElementById('route-to');
  const densityToggle = document.getElementById('density-routing-toggle');
  const accessToggle = document.getElementById('accessibility-toggle');
  
  if (!calcBtn) return;
  
  function calculateRoute() {
    const from = fromSelect.value;
    const to = toSelect.value;
    const densityAware = densityToggle?.checked || false;
    const accessible = accessToggle?.checked || false;
    
    const route = routeSimulator.setRoute(from, to, densityAware, accessible);
    
    // Update route steps
    const stepsContainer = document.getElementById('route-steps');
    if (stepsContainer && route.steps) {
      stepsContainer.innerHTML = route.steps.map((step, i) => `
        <div class="route-step" style="animation-delay: ${i * 0.1}s">
          <span class="route-step-icon">${step.icon}</span>
          <span>${step.text}</span>
        </div>
      `).join('');
    }
    
    // Update meta
    document.getElementById('route-distance').textContent = route.distance || '-';
    document.getElementById('route-time').textContent = route.time || '-';
    document.getElementById('route-congestion').textContent = route.congestion || '-';
  }
  
  calcBtn.addEventListener('click', calculateRoute);
  fromSelect?.addEventListener('change', calculateRoute);
  toSelect?.addEventListener('change', calculateRoute);
  densityToggle?.addEventListener('change', calculateRoute);
  accessToggle?.addEventListener('change', calculateRoute);
}

function initStaffFilters() {
  document.querySelectorAll('.staff-filter-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.staff-filter-chips .chip').forEach(c => c.classList.remove('chip-active'));
      chip.classList.add('chip-active');
      
      if (staffMap) staffMap.setFilter(chip.dataset.team);
    });
  });
}

function initPitch() {
  const startBtn = document.getElementById('btn-start-pitch');
  const stopBtn = document.getElementById('btn-stop-pitch');
  const autoplayBtn = document.getElementById('btn-autoplay-pitch');
  const overlay = document.getElementById('pitch-overlay');
  const overlayContent = document.getElementById('pitch-overlay-content');
  const overlayProgress = document.getElementById('pitch-overlay-progress-fill');
  const overlayClose = document.getElementById('pitch-overlay-close');
  
  let pitchTimer = null;
  
  const pitchSlides = [
    {
      duration: 8000,
      html: `
        <div style="animation: fadeInUp 0.5s ease">
          <div style="font-size: 3rem; margin-bottom: 1rem">◆</div>
          <h2 style="font-size: 3rem; font-family: var(--font-display); margin-bottom: 1rem">STADIUM<span style="color: var(--accent-cyan)">AI</span></h2>
          <p style="color: var(--text-secondary); font-size: 1.2rem; max-width: 600px; margin: 0 auto">AI-powered stadium operations for 50,000 fans.<br/>Built on Google Cloud.</p>
        </div>
      `
    },
    {
      duration: 8000,
      html: `
        <div style="animation: fadeInUp 0.5s ease">
          <h3 style="font-size: 2rem; margin-bottom: 1rem">The Problem</h3>
          <p style="color: var(--text-secondary); font-size: 1.1rem; max-width: 600px; margin: 0 auto">
            50,000 fans. Dozens of chokepoints. Manual operations. Long queues.<br/>
            <span style="color: var(--accent-magenta); font-weight: 600">Fan satisfaction drops 40% due to wait times and congestion.</span>
          </p>
        </div>
      `
    },
    {
      duration: 10000,
      html: `
        <div style="animation: fadeInUp 0.5s ease">
          <h3 style="font-size: 2rem; margin-bottom: 1rem">Four Intelligent Modules</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; max-width: 600px; margin: 0 auto; text-align: left">
            <div style="background: var(--glass-bg); padding: 1rem; border-radius: 12px; border: 1px solid var(--glass-border)">
              <div style="font-size: 1.5rem">👁️</div>
              <div style="font-weight: 600; margin-top: 0.5rem">Crowd Flow Intelligence</div>
            </div>
            <div style="background: var(--glass-bg); padding: 1rem; border-radius: 12px; border: 1px solid var(--glass-border)">
              <div style="font-size: 1.5rem">⏱️</div>
              <div style="font-weight: 600; margin-top: 0.5rem">Smart Queue System</div>
            </div>
            <div style="background: var(--glass-bg); padding: 1rem; border-radius: 12px; border: 1px solid var(--glass-border)">
              <div style="font-size: 1.5rem">🧭</div>
              <div style="font-weight: 600; margin-top: 0.5rem">Indoor Wayfinding</div>
            </div>
            <div style="background: var(--glass-bg); padding: 1rem; border-radius: 12px; border: 1px solid var(--glass-border)">
              <div style="font-size: 1.5rem">📋</div>
              <div style="font-weight: 600; margin-top: 0.5rem">Staff Operations Hub</div>
            </div>
          </div>
        </div>
      `
    },
    {
      duration: 10000,
      html: `
        <div style="animation: fadeInUp 0.5s ease">
          <h3 style="font-size: 2rem; margin-bottom: 1rem">Real-Time Results</h3>
          <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap">
            <div style="text-align: center">
              <div style="font-size: 2.5rem; font-weight: 700; color: var(--accent-green); font-family: var(--font-display)">-32%</div>
              <div style="color: var(--text-secondary); font-size: 0.85rem">Staff Movement</div>
            </div>
            <div style="text-align: center">
              <div style="font-size: 2.5rem; font-weight: 700; color: var(--accent-cyan); font-family: var(--font-display)">&lt;2s</div>
              <div style="color: var(--text-secondary); font-size: 0.85rem">Response Latency</div>
            </div>
            <div style="text-align: center">
              <div style="font-size: 2.5rem; font-weight: 700; color: var(--accent-amber); font-family: var(--font-display)">+41%</div>
              <div style="color: var(--text-secondary); font-size: 0.85rem">Fan Satisfaction</div>
            </div>
            <div style="text-align: center">
              <div style="font-size: 2.5rem; font-weight: 700; color: var(--accent-purple); font-family: var(--font-display)">-24%</div>
              <div style="color: var(--text-secondary); font-size: 0.85rem">Food Waste</div>
            </div>
          </div>
        </div>
      `
    },
    {
      duration: 8000,
      html: `
        <div style="animation: fadeInUp 0.5s ease">
          <h3 style="font-size: 2rem; margin-bottom: 1rem">Built on Google Cloud</h3>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem">
            ${['Vertex AI', 'BigQuery', 'Pub/Sub', 'Cloud Run', 'Google Maps'].map(t => 
              `<span style="padding: 0.5rem 1rem; border: 1px solid var(--glass-border); border-radius: 20px; font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-cyan)">${t}</span>`
            ).join('')}
          </div>
          <p style="color: var(--text-secondary); margin-top: 1.5rem; font-size: 1rem">GDPR compliant · Offline-ready · 99.9% uptime</p>
        </div>
      `
    },
    {
      duration: 6000,
      html: `
        <div style="animation: fadeInUp 0.5s ease">
          <div style="font-size: 3rem; margin-bottom: 1rem">◆</div>
          <h2 style="font-size: 2.5rem; font-family: var(--font-display); margin-bottom: 1rem">
            The Future of <span style="color: var(--accent-cyan)">Live Events</span>
          </h2>
          <p style="color: var(--text-secondary); font-size: 1.1rem">StadiumAI — Where every fan matters.</p>
        </div>
      `
    }
  ];
  
  function startPitch() {
    overlay.style.display = 'flex';
    let currentSlide = 0;
    let elapsed = 0;
    const totalDuration = pitchSlides.reduce((sum, s) => sum + s.duration, 0);
    
    function showSlide() {
      if (currentSlide >= pitchSlides.length) {
        stopPitch();
        return;
      }
      
      overlayContent.innerHTML = pitchSlides[currentSlide].html;
      const slideDuration = pitchSlides[currentSlide].duration;
      
      pitchTimer = setTimeout(() => {
        elapsed += slideDuration;
        overlayProgress.style.width = `${(elapsed / totalDuration) * 100}%`;
        currentSlide++;
        showSlide();
      }, slideDuration);
    }
    
    showSlide();
  }
  
  function stopPitch() {
    if (pitchTimer) clearTimeout(pitchTimer);
    overlay.style.display = 'none';
    overlayProgress.style.width = '0%';
  }
  
  startBtn?.addEventListener('click', startPitch);
  autoplayBtn?.addEventListener('click', startPitch);
  stopBtn?.addEventListener('click', stopPitch);
  overlayClose?.addEventListener('click', stopPitch);
}

// ============================================================
// TICKET ENTRY & MULTI-STADIUM
// ============================================================

function initTicketEntry() {
  const modal = document.getElementById('ticket-modal');
  const input = document.getElementById('ticket-input');
  const submitBtn = document.getElementById('ticket-submit');
  const errorEl = document.getElementById('ticket-error');
  const skipBtn = document.getElementById('ticket-skip');
  const sampleChips = document.querySelectorAll('.ticket-sample-chip');
  const changeBtn = document.getElementById('venue-change-btn');
  
  function handleTicketSubmit() {
    const ticketNumber = input.value.trim();
    if (!ticketNumber) {
      input.classList.add('error');
      errorEl.classList.add('show');
      return;
    }
    
    const result = resolveTicket(ticketNumber);
    if (result) {
      currentTicket = result;
      currentVenue = result.venue;
      applyVenueContext(result);
      modal.classList.remove('active');
      // Show animations after modal closes
      setTimeout(() => {
        document.querySelectorAll('.animate-fade-up').forEach(el => el.classList.add('visible'));
      }, 300);
    } else {
      input.classList.add('error');
      errorEl.classList.add('show');
      setTimeout(() => { input.classList.remove('error'); errorEl.classList.remove('show'); }, 3000);
    }
  }
  
  submitBtn?.addEventListener('click', handleTicketSubmit);
  input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleTicketSubmit(); });
  input?.addEventListener('input', () => { input.classList.remove('error'); errorEl.classList.remove('show'); });
  
  // Sample chips
  sampleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.ticket;
      input.classList.remove('error');
      errorEl.classList.remove('show');
      handleTicketSubmit();
    });
  });
  
  // Skip → use default (NMS)
  skipBtn?.addEventListener('click', () => {
    currentVenue = STADIUMS['nms'];
    currentTicket = null;
    applyVenueContext(null);
    modal.classList.remove('active');
    setTimeout(() => {
      document.querySelectorAll('.animate-fade-up').forEach(el => el.classList.add('visible'));
    }, 300);
  });
  
  // Change venue button
  changeBtn?.addEventListener('click', () => {
    modal.classList.add('active');
  });
}

function applyVenueContext(ticketResult) {
  const venue = ticketResult?.venue || currentVenue;
  if (!venue) return;
  
  currentVenue = venue;
  
  // Update hero title with venue capacity
  const heroCapacity = document.getElementById('hero-capacity');
  if (heroCapacity) {
    heroCapacity.textContent = `${venue.capacity.toLocaleString('en-IN')} Fans.`;
  }
  
  // Update venue context bar
  const bar = document.getElementById('venue-context-bar');
  const nameDisplay = document.getElementById('venue-name-display');
  const eventDisplay = document.getElementById('venue-event-display');
  const ticketDisplay = document.getElementById('venue-ticket-display');
  
  if (bar) bar.classList.add('active');
  if (nameDisplay) nameDisplay.textContent = `${venue.name}, ${venue.city}`;
  
  if (ticketResult?.event) {
    eventDisplay.textContent = ticketResult.event.name;
    eventDisplay.style.display = '';
  } else {
    eventDisplay.textContent = `${venue.teamHome} Home`;
    eventDisplay.style.display = '';
  }
  
  if (ticketResult) {
    ticketDisplay.textContent = `Section ${ticketResult.section}, Row ${ticketResult.row}, Seat ${ticketResult.seat}`;
    ticketDisplay.style.display = '';
  } else {
    ticketDisplay.textContent = 'Demo Mode';
  }
  
  // Update overview stats
  const ovZones = document.getElementById('ov-zones');
  const ovStands = document.getElementById('ov-stands');
  const ovStaff = document.getElementById('ov-staff');
  if (ovZones) ovZones.textContent = venue.zones.length;
  if (ovStands) ovStands.textContent = venue.servicePoints.length;
  if (ovStaff) ovStaff.textContent = Object.values(venue.staff).reduce((s, n) => s + n, 0);
}

// ============================================================
// ADMIN PANEL
// ============================================================

function initAdminPanel() {
  const mainPanel = document.getElementById('admin-main');
  if (!mainPanel) return;
  
  // Tab navigation
  document.querySelectorAll('[data-admin-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-admin-tab]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAdminTab(btn.dataset.adminTab, mainPanel);
    });
  });
  
  // Initial render
  renderAdminTab('venues', mainPanel);
}

function renderAdminTab(tab, container) {
  switch (tab) {
    case 'venues':
      renderVenueTab(container);
      break;
    case 'events':
      renderEventTab(container);
      break;
    case 'sensors':
      renderSensorTab(container);
      break;
    case 'staff':
      renderStaffTab(container);
      break;
    case 'analytics':
      renderAnalyticsTab(container);
      break;
    case 'settings':
      renderSettingsTab(container);
      break;
  }
}

function renderVenueTab(container) {
  const venues = getVenueList();
  container.innerHTML = `
    <div class="admin-main-header">
      <h3>🏟️ Venue Management</h3>
      <button class="btn btn-primary btn-small" onclick="alert('In production, this opens the Add Venue form with fields for name, city, capacity, zone layout, gate config, and service points. Connected to Firestore via Cloud Run API.')">+ Add Venue</button>
    </div>
    <table class="admin-table">
      <thead>
        <tr>
          <th>Venue</th>
          <th>City</th>
          <th>Capacity</th>
          <th>Home Team</th>
          <th>Zones</th>
          <th>Gates</th>
          <th>Service Pts</th>
          <th>Staff</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${venues.map(v => `
          <tr>
            <td style="font-weight:600;color:var(--text-primary)">${v.name}</td>
            <td>${v.city}</td>
            <td style="font-family:var(--font-mono);color:var(--accent-cyan)">${v.capacity.toLocaleString('en-IN')}</td>
            <td>${v.teamHome}</td>
            <td style="font-family:var(--font-mono)">${v.zonesCount}</td>
            <td style="font-family:var(--font-mono)">${v.gatesCount}</td>
            <td style="font-family:var(--font-mono)">${v.servicePointsCount}</td>
            <td style="font-family:var(--font-mono)">${v.totalStaff}</td>
            <td>
              <button class="admin-action-btn">Edit</button>
              <button class="admin-action-btn">Zones</button>
              <button class="admin-action-btn danger">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="margin-top:var(--space-xl);padding:var(--space-lg);background:rgba(0,229,255,0.03);border:1px dashed rgba(0,229,255,0.15);border-radius:var(--radius-md)">
      <p style="font-size:0.75rem;color:var(--text-tertiary)">
        <strong style="color:var(--accent-cyan)">How venues are managed:</strong> Admin creates a venue profile in the panel → defines zone layout, gate positions, and service point locations → configures IoT sensor mapping → deploys venue to production. All data stored in <strong>Cloud Firestore</strong> with real-time sync. Changes propagate to all clients within 1 second via Pub/Sub.
      </p>
    </div>
  `;
}

function renderEventTab(container) {
  const events = getEventList();
  container.innerHTML = `
    <div class="admin-main-header">
      <h3>📅 Event Management</h3>
      <button class="btn btn-primary btn-small" onclick="alert('In production: Create IPL match event → select venue → set date/time → assign teams → auto-generate tickets → configure event-specific sensor overrides.')">+ Create Event</button>
    </div>
    <table class="admin-table">
      <thead>
        <tr>
          <th>Event</th>
          <th>Venue</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
          <th>Capacity</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${events.map(e => `
          <tr>
            <td style="font-weight:600;color:var(--text-primary)">${e.name}</td>
            <td>${e.venueName}, ${e.venueCity}</td>
            <td style="font-family:var(--font-mono)">${e.date}</td>
            <td style="font-family:var(--font-mono)">${e.time}</td>
            <td><span class="admin-status ${e.status}">${e.status === 'live' ? '🔴 LIVE' : '🔵 Upcoming'}</span></td>
            <td style="font-family:var(--font-mono);color:var(--accent-cyan)">${e.venueCapacity?.toLocaleString('en-IN')}</td>
            <td>
              <button class="admin-action-btn">Edit</button>
              <button class="admin-action-btn">Tickets</button>
              <button class="admin-action-btn">Go Live</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="margin-top:var(--space-xl);padding:var(--space-lg);background:rgba(0,229,255,0.03);border:1px dashed rgba(0,229,255,0.15);border-radius:var(--radius-md)">
      <p style="font-size:0.75rem;color:var(--text-tertiary)">
        <strong style="color:var(--accent-cyan)">Event lifecycle:</strong> Created → Ticketing synced → Pre-match (sensors activated) → <strong>Live</strong> (AI models engaged, real-time streaming) → Post-match (analytics generated) → Archived. All state transitions logged in <strong>BigQuery</strong> for historical analysis.
      </p>
    </div>
  `;
}

function renderSensorTab(container) {
  const venue = currentVenue;
  const sensorTypes = [
    { type: 'BLE Beacon', count: venue.zones.length * 8, status: 'active', freq: 'Every 1s' },
    { type: 'WiFi Probe', count: venue.zones.length * 4, status: 'active', freq: 'Every 2s' },
    { type: 'Camera Counter', count: venue.gates.length + venue.servicePoints.length, status: 'active', freq: 'Every 5s' },
    { type: 'Gate Scanner', count: venue.gates.length, status: 'active', freq: 'Real-time' },
    { type: 'POS Terminal', count: venue.servicePoints.filter(s => s.type !== 'restroom').length * 3, status: 'active', freq: 'Per transaction' },
    { type: 'Environmental', count: Math.ceil(venue.zones.length * 1.5), status: 'active', freq: 'Every 30s' }
  ];
  const totalSensors = sensorTypes.reduce((s, t) => s + t.count, 0);
  
  container.innerHTML = `
    <div class="admin-main-header">
      <h3>📡 Sensor Configuration — ${venue.name}</h3>
      <span style="font-size:0.75rem;color:var(--accent-green);font-family:var(--font-mono)">${totalSensors} sensors active</span>
    </div>
    <table class="admin-table">
      <thead>
        <tr>
          <th>Sensor Type</th>
          <th>Count</th>
          <th>Status</th>
          <th>Data Frequency</th>
          <th>Pipeline</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${sensorTypes.map(s => `
          <tr>
            <td style="font-weight:600;color:var(--text-primary)">${s.type}</td>
            <td style="font-family:var(--font-mono);color:var(--accent-cyan)">${s.count}</td>
            <td><span class="admin-status live">✅ ${s.status}</span></td>
            <td style="font-family:var(--font-mono)">${s.freq}</td>
            <td style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-tertiary)">→ Pub/Sub → Dataflow → BQ</td>
            <td><button class="admin-action-btn">Configure</button><button class="admin-action-btn">Map Zones</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="margin-top:var(--space-xl);padding:var(--space-lg);background:rgba(0,229,255,0.03);border:1px dashed rgba(0,229,255,0.15);border-radius:var(--radius-md)">
      <p style="font-size:0.75rem;color:var(--text-tertiary)">
        <strong style="color:var(--accent-cyan)">Sensor onboarding:</strong> Admin maps each sensor to a zone via drag-and-drop on the venue floor plan → sensor begins streaming to Pub/Sub topic <code>venue/{id}/sensors/{zone}</code> → Cloud Dataflow aggregates into BigQuery real-time tables. Auto-calibration runs for first 30 minutes after install.
      </p>
    </div>
  `;
}

function renderStaffTab(container) {
  const venue = currentVenue;
  const teams = [
    { icon: '🛡️', name: 'Security', count: venue.staff.security, color: '#ff006e', roles: ['Guard', 'Supervisor', 'K9 Unit', 'CCTV Ops'] },
    { icon: '🏥', name: 'Medical', count: venue.staff.medical, color: '#00ff88', roles: ['Doctor', 'Paramedic', 'Nurse', 'First Aid'] },
    { icon: '🍔', name: 'F&B', count: venue.staff.fnb, color: '#ffbe0b', roles: ['Counter', 'Kitchen', 'Runner', 'Supervisor'] },
    { icon: '🧹', name: 'Cleaning', count: venue.staff.cleaning, color: '#00e5ff', roles: ['Floor', 'Restroom', 'Waste', 'Supervisor'] }
  ];
  
  container.innerHTML = `
    <div class="admin-main-header">
      <h3>👥 Staff Management — ${venue.name}</h3>
      <button class="btn btn-primary btn-small">+ Add Staff</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-md);margin-bottom:var(--space-xl)">
      ${teams.map(t => `
        <div style="background:rgba(0,0,0,0.2);border:1px solid ${t.color}30;border-radius:var(--radius-md);padding:var(--space-lg)">
          <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-md)">
            <span style="font-size:1.5rem">${t.icon}</span>
            <span style="font-weight:700;font-size:1rem">${t.name}</span>
            <span style="margin-left:auto;font-family:var(--font-mono);color:${t.color};font-weight:700;font-size:1.2rem">${t.count}</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px">
            ${t.roles.map(r => `<span style="font-size:0.65rem;padding:2px 8px;background:${t.color}10;border:1px solid ${t.color}25;border-radius:var(--radius-full);color:${t.color};font-family:var(--font-mono)">${r}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
    <div style="padding:var(--space-lg);background:rgba(0,229,255,0.03);border:1px dashed rgba(0,229,255,0.15);border-radius:var(--radius-md)">
      <p style="font-size:0.75rem;color:var(--text-tertiary)">
        <strong style="color:var(--accent-cyan)">Staff operations:</strong> Each staff member gets a mobile app with GPS tracking, incident alerts, shift schedules, and AR wayfinding. Admin assigns staff to zones → AI optimizes positioning based on crowd density predictions → real-time redeployment suggestions sent to team supervisors.
      </p>
    </div>
  `;
}

function renderAnalyticsTab(container) {
  container.innerHTML = `
    <div class="admin-main-header">
      <h3>📊 Post-Event Analytics</h3>
      <span style="font-size:0.75rem;color:var(--text-tertiary);font-family:var(--font-mono)">Data from BigQuery</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-md);margin-bottom:var(--space-xl)">
      <div style="background:rgba(0,255,136,0.05);border:1px solid rgba(0,255,136,0.15);border-radius:var(--radius-md);padding:var(--space-lg);text-align:center">
        <div style="font-family:var(--font-display);font-size:1.8rem;font-weight:700;color:#00ff88">94%</div>
        <div style="font-size:0.7rem;color:var(--text-tertiary)">Fan Satisfaction</div>
      </div>
      <div style="background:rgba(0,229,255,0.05);border:1px solid rgba(0,229,255,0.15);border-radius:var(--radius-md);padding:var(--space-lg);text-align:center">
        <div style="font-family:var(--font-display);font-size:1.8rem;font-weight:700;color:#00e5ff">1.2s</div>
        <div style="font-size:0.7rem;color:var(--text-tertiary)">Avg Latency</div>
      </div>
      <div style="background:rgba(255,190,11,0.05);border:1px solid rgba(255,190,11,0.15);border-radius:var(--radius-md);padding:var(--space-lg);text-align:center">
        <div style="font-family:var(--font-display);font-size:1.8rem;font-weight:700;color:#ffbe0b">87%</div>
        <div style="font-size:0.7rem;color:var(--text-tertiary)">Prediction Accuracy</div>
      </div>
      <div style="background:rgba(139,92,246,0.05);border:1px solid rgba(139,92,246,0.15);border-radius:var(--radius-md);padding:var(--space-lg);text-align:center">
        <div style="font-family:var(--font-display);font-size:1.8rem;font-weight:700;color:#8b5cf6">42</div>
        <div style="font-size:0.7rem;color:var(--text-tertiary)">Incidents Resolved</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">
      <div style="background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:var(--space-lg)">
        <h4 style="font-size:0.85rem;margin-bottom:var(--space-md)">🕐 Peak Crowd Density Timeline</h4>
        <div style="display:flex;align-items:flex-end;gap:4px;height:100px">
          ${[20,35,55,80,95,88,92,60,45,75,90,85,40,25,15].map((v, i) => 
            `<div style="flex:1;background:linear-gradient(to top, ${v > 80 ? '#ff006e' : v > 60 ? '#ffbe0b' : '#00e5ff'}20, ${v > 80 ? '#ff006e' : v > 60 ? '#ffbe0b' : '#00e5ff'});height:${v}%;border-radius:2px 2px 0 0;min-width:4px" title="Time ${i}: ${v}%"></div>`
          ).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px"><span style="font-size:0.6rem;color:var(--text-tertiary)">Gate Open</span><span style="font-size:0.6rem;color:var(--text-tertiary)">Full Time</span></div>
      </div>
      <div style="background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:var(--space-lg)">
        <h4 style="font-size:0.85rem;margin-bottom:var(--space-md)">📈 Queue Wait Reduction</h4>
        <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
          <div style="display:flex;align-items:center;gap:var(--space-sm)">
            <span style="font-size:0.7rem;color:var(--text-tertiary);min-width:60px">Before AI</span>
            <div style="flex:1;background:rgba(255,107,53,0.2);height:20px;border-radius:4px;position:relative"><div style="width:85%;height:100%;background:#ff6b35;border-radius:4px"></div><span style="position:absolute;right:4px;top:2px;font-size:0.65rem;color:#fff">12.4 min</span></div>
          </div>
          <div style="display:flex;align-items:center;gap:var(--space-sm)">
            <span style="font-size:0.7rem;color:var(--text-tertiary);min-width:60px">After AI</span>
            <div style="flex:1;background:rgba(0,255,136,0.2);height:20px;border-radius:4px;position:relative"><div style="width:35%;height:100%;background:#00ff88;border-radius:4px"></div><span style="position:absolute;right:4px;top:2px;font-size:0.65rem;color:#fff">4.1 min</span></div>
          </div>
        </div>
        <div style="margin-top:var(--space-md);font-size:0.75rem;color:var(--accent-green);font-weight:600">↓ 67% reduction in average wait time</div>
      </div>
    </div>
    <div style="margin-top:var(--space-xl);padding:var(--space-lg);background:rgba(0,229,255,0.03);border:1px dashed rgba(0,229,255,0.15);border-radius:var(--radius-md)">
      <p style="font-size:0.75rem;color:var(--text-tertiary)">
        <strong style="color:var(--accent-cyan)">Analytics pipeline:</strong> All event data lands in BigQuery → Looker Studio dashboards auto-generated post-event → Vertex AI retrains prediction models weekly using historical data → Insights feed back into next event's operational plan.
      </p>
    </div>
  `;
}

function renderSettingsTab(container) {
  container.innerHTML = `
    <div class="admin-main-header">
      <h3>⚙️ Platform Settings</h3>
    </div>
    <div class="admin-form-grid">
      <div class="admin-form-field">
        <span class="admin-form-label">Default Region</span>
        <select class="admin-form-input"><option>asia-south1 (Mumbai)</option><option>asia-south2 (Delhi)</option><option>us-central1</option></select>
      </div>
      <div class="admin-form-field">
        <span class="admin-form-label">Data Retention</span>
        <select class="admin-form-input"><option>90 days (GDPR default)</option><option>30 days</option><option>180 days</option></select>
      </div>
      <div class="admin-form-field">
        <span class="admin-form-label">ML Model Version</span>
        <input class="admin-form-input" value="v2.4.1-stable" readonly />
      </div>
      <div class="admin-form-field">
        <span class="admin-form-label">Pub/Sub Topic Prefix</span>
        <input class="admin-form-input" value="stadium-ai/prod/" readonly />
      </div>
      <div class="admin-form-field">
        <span class="admin-form-label">Latency SLA</span>
        <select class="admin-form-input"><option>&lt; 2 seconds (default)</option><option>&lt; 1 second</option><option>&lt; 5 seconds</option></select>
      </div>
      <div class="admin-form-field">
        <span class="admin-form-label">Offline Mode</span>
        <select class="admin-form-input"><option>Enabled (PWA + Service Worker)</option><option>Disabled</option></select>
      </div>
      <div class="admin-form-field full-width">
        <span class="admin-form-label">API Endpoints</span>
        <input class="admin-form-input" value="https://api.stadiumai.io/v1/" readonly style="font-family:var(--font-mono)" />
      </div>
      <div class="admin-form-field full-width">
        <span class="admin-form-label">Privacy Configuration</span>
        <div style="display:flex;gap:var(--space-md);margin-top:var(--space-xs)">
          <label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--text-secondary)"><input type="checkbox" checked disabled /> No PII Collection</label>
          <label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--text-secondary)"><input type="checkbox" checked disabled /> Anonymized IDs</label>
          <label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--text-secondary)"><input type="checkbox" checked disabled /> No Facial Recognition</label>
          <label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--text-secondary)"><input type="checkbox" checked disabled /> Auto Data Purge</label>
        </div>
      </div>
    </div>
    <div style="margin-top:var(--space-xl);padding:var(--space-lg);background:rgba(0,229,255,0.03);border:1px dashed rgba(0,229,255,0.15);border-radius:var(--radius-md)">
      <p style="font-size:0.75rem;color:var(--text-tertiary)">
        <strong style="color:var(--accent-cyan)">Architecture notes:</strong> All settings stored in Cloud Firestore → propagated via Pub/Sub to all Cloud Run instances within 1 second. API gateway enforces latency SLA via Cloud Endpoints. Privacy settings are immutable in production and audited via Cloud Audit Logs.
      </p>
    </div>
  `;
}

// ============================================================
// CLEANUP
// ============================================================

window.addEventListener('beforeunload', () => {
  dataEngine.stop();
  if (particleSystem) particleSystem.stop();
  if (staffMap) staffMap.stop();
  if (routeSimulator) routeSimulator.stop();
});
