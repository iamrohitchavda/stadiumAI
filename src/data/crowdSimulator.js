/**
 * Crowd Density Simulator
 * Simulates realistic crowd flow patterns across stadium zones
 */

const ZONES = [
  { id: 'north-stand', name: 'North Stand', capacity: 12000, baseOccupancy: 0.3 },
  { id: 'south-stand', name: 'South Stand', capacity: 12000, baseOccupancy: 0.3 },
  { id: 'east-stand', name: 'East Stand', capacity: 8000, baseOccupancy: 0.25 },
  { id: 'west-stand', name: 'West Stand', capacity: 8000, baseOccupancy: 0.25 },
  { id: 'north-concourse', name: 'North Concourse', capacity: 3000, baseOccupancy: 0.15 },
  { id: 'south-concourse', name: 'South Concourse', capacity: 3000, baseOccupancy: 0.15 },
  { id: 'main-concourse', name: 'Main Concourse', capacity: 4000, baseOccupancy: 0.2 },
  { id: 'food-court-a', name: 'Food Court A', capacity: 1500, baseOccupancy: 0.1 },
  { id: 'food-court-b', name: 'Food Court B', capacity: 1500, baseOccupancy: 0.1 },
  { id: 'merch-zone', name: 'Merchandise Zone', capacity: 1000, baseOccupancy: 0.08 },
  { id: 'vip-lounge', name: 'VIP Lounge', capacity: 500, baseOccupancy: 0.4 },
  { id: 'family-zone', name: 'Family Zone', capacity: 2000, baseOccupancy: 0.2 }
];

const GATES = [
  { id: 'gate-a', name: 'Gate A (North)', throughput: 800, currentLoad: 0.3 },
  { id: 'gate-b', name: 'Gate B (East)', throughput: 600, currentLoad: 0.2 },
  { id: 'gate-c', name: 'Gate C (South)', throughput: 800, currentLoad: 0.35 },
  { id: 'gate-d', name: 'Gate D (West)', throughput: 600, currentLoad: 0.25 },
  { id: 'gate-e', name: 'Gate E (NE)', throughput: 500, currentLoad: 0.15 },
  { id: 'gate-f', name: 'Gate F (SE)', throughput: 500, currentLoad: 0.2 }
];

const MODE_MULTIPLIERS = {
  'pre-match': { stands: 0.4, concourse: 0.6, food: 0.3, merch: 0.5 },
  'live': { stands: 0.95, concourse: 0.15, food: 0.1, merch: 0.05 },
  'halftime': { stands: 0.6, concourse: 0.8, food: 0.95, merch: 0.4 },
  'exit': { stands: 0.3, concourse: 0.9, food: 0.05, merch: 0.1 }
};

export class CrowdSimulator {
  constructor() {
    this.zones = ZONES.map(z => ({ ...z, currentDensity: z.baseOccupancy, trend: 'stable' }));
    this.gates = GATES.map(g => ({ ...g, status: 'open', waitTime: 0 }));
    this.predictions = [];
    this.alerts = [];
    this.totalOccupancy = 0;
    this.surgeZone = null; // For sandbox events
    this.gateFailure = null;
  }

  init(engine) {
    engine.crowdData = {
      zones: this.zones,
      gates: this.gates,
      predictions: this.predictions,
      alerts: this.alerts,
      totalOccupancy: 0
    };
  }

  tick(context, engine) {
    const mult = MODE_MULTIPLIERS[context.mode] || MODE_MULTIPLIERS['live'];
    
    // Update each zone's density with noise
    this.zones.forEach(zone => {
      let targetDensity;
      
      if (zone.id.includes('stand')) {
        targetDensity = mult.stands;
      } else if (zone.id.includes('concourse')) {
        targetDensity = mult.concourse;
      } else if (zone.id.includes('food')) {
        targetDensity = mult.food;
      } else if (zone.id === 'merch-zone') {
        targetDensity = mult.merch;
      } else if (zone.id === 'vip-lounge') {
        targetDensity = Math.min(mult.stands + 0.1, 0.85);
      } else if (zone.id === 'family-zone') {
        targetDensity = mult.stands * 0.8;
      } else {
        targetDensity = mult.concourse;
      }

      // Apply surge override
      if (this.surgeZone && zone.id === this.surgeZone) {
        targetDensity = 0.95;
      }

      // Add realistic noise
      const noise = (Math.random() - 0.5) * 0.06;
      const prev = zone.currentDensity;
      zone.currentDensity += (targetDensity - zone.currentDensity) * 0.08 + noise;
      zone.currentDensity = Math.max(0.02, Math.min(0.98, zone.currentDensity));
      
      // Determine trend
      const diff = zone.currentDensity - prev;
      if (diff > 0.01) zone.trend = 'rising';
      else if (diff < -0.01) zone.trend = 'falling';
      else zone.trend = 'stable';
    });

    // Update gates
    this.gates.forEach(gate => {
      if (this.gateFailure === gate.id) {
        gate.status = 'offline';
        gate.waitTime = 999;
        gate.currentLoad = 0;
        return;
      }
      
      gate.status = 'open';
      let baseLoad;
      if (context.mode === 'pre-match') {
        baseLoad = 0.4 + Math.random() * 0.3;
      } else if (context.mode === 'exit') {
        baseLoad = 0.6 + Math.random() * 0.35;
      } else {
        baseLoad = 0.1 + Math.random() * 0.15;
      }
      
      gate.currentLoad += (baseLoad - gate.currentLoad) * 0.1;
      gate.currentLoad = Math.max(0, Math.min(1, gate.currentLoad));
      gate.waitTime = Math.round(gate.currentLoad * 12);
      
      if (gate.currentLoad > 0.8) gate.status = 'busy';
    });

    // Calculate total occupancy
    const totalPeople = this.zones.reduce((sum, z) => sum + z.currentDensity * z.capacity, 0);
    this.totalOccupancy = totalPeople / 50000;

    // Generate predictions
    this.predictions = [
      { time: '+5min', density: Math.min(0.99, this.totalOccupancy + (Math.random() - 0.3) * 0.05) },
      { time: '+10min', density: Math.min(0.99, this.totalOccupancy + (Math.random() - 0.3) * 0.1) },
      { time: '+15min', density: Math.min(0.99, this.totalOccupancy + (Math.random() - 0.3) * 0.15) }
    ];

    // Generate alerts for high-density zones
    this.alerts = this.zones
      .filter(z => z.currentDensity > 0.8)
      .map(z => ({
        zone: z.name,
        density: z.currentDensity,
        message: `${z.name} at ${Math.round(z.currentDensity * 100)}% — staff redeployment needed`
      }));

    // Update engine data
    engine.crowdData = {
      zones: this.zones,
      gates: this.gates,
      predictions: this.predictions,
      alerts: this.alerts,
      totalOccupancy: this.totalOccupancy
    };

    engine.emit('crowdUpdate', engine.crowdData);
  }

  handleSandboxEvent(eventType, engine) {
    switch (eventType) {
      case 'crowd-surge':
        this.surgeZone = 'south-stand';
        setTimeout(() => { this.surgeZone = null; }, 15000);
        break;
      case 'gate-failure':
        this.gateFailure = 'gate-c';
        setTimeout(() => { this.gateFailure = null; }, 15000);
        break;
      case 'reset':
        this.surgeZone = null;
        this.gateFailure = null;
        break;
    }
  }
}
