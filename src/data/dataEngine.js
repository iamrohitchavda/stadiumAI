/**
 * StadiumAI Data Engine
 * Central simulation orchestrator — drives all live data across the platform
 */

class DataEngine {
  constructor() {
    this.listeners = new Map();
    this.mode = 'pre-match'; // pre-match | live | halftime | exit
    this.matchClock = 0; // seconds into match
    this.tickInterval = null;
    this.tickRate = 5000; // 5 seconds
    
    // Module data stores
    this.crowdData = {};
    this.queueData = {};
    this.incidentData = [];
    this.staffData = {};
    this.kpiData = {};
    
    // Simulators (injected)
    this.simulators = [];
  }

  addSimulator(simulator) {
    this.simulators.push(simulator);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  setMode(mode) {
    this.mode = mode;
    // Reset clock based on mode
    switch (mode) {
      case 'pre-match': this.matchClock = -3600; break; // T-60 min
      case 'live': this.matchClock = 2700; break; // 45:00
      case 'halftime': this.matchClock = 2700; break; // HT
      case 'exit': this.matchClock = 5700; break; // FT+5
    }
    this.emit('modeChange', { mode, clock: this.matchClock });
    // Immediately tick all simulators to reflect new mode
    this.tick();
  }

  getMatchTime() {
    if (this.matchClock < 0) {
      const min = Math.abs(Math.floor(this.matchClock / 60));
      return `T-${min}min`;
    }
    const min = Math.floor(this.matchClock / 60);
    const sec = Math.abs(this.matchClock % 60);
    if (this.mode === 'halftime') return 'HT';
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  start() {
    if (this.tickInterval) return;
    
    // Initialize all simulators
    this.simulators.forEach(sim => sim.init(this));
    
    // Initial tick
    this.tick();
    
    // Start continuous loop
    this.tickInterval = setInterval(() => {
      this.matchClock += (this.mode === 'halftime' ? 0 : 1);
      this.tick();
    }, this.tickRate);
  }

  tick() {
    const context = {
      mode: this.mode,
      clock: this.matchClock,
      matchTime: this.getMatchTime()
    };

    // Tick all simulators
    this.simulators.forEach(sim => sim.tick(context, this));

    // Emit global tick
    this.emit('tick', context);
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  // Sandbox event triggers
  triggerEvent(eventType) {
    this.emit('sandboxEvent', eventType);
    this.simulators.forEach(sim => {
      if (sim.handleSandboxEvent) {
        sim.handleSandboxEvent(eventType, this);
      }
    });
  }
}

// Singleton
export const dataEngine = new DataEngine();
export default dataEngine;
