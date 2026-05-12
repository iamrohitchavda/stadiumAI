/**
 * Queue & Wait Time Simulator
 * Simulates concession stand, restroom, and merch point queues
 */

const SERVICE_POINTS = [
  { id: 'food-a1', name: 'Burgers & Fries A', type: 'food', maxCounters: 4, serviceRate: 2.5 },
  { id: 'food-a2', name: 'Pizza Palace', type: 'food', maxCounters: 3, serviceRate: 2.0 },
  { id: 'food-b1', name: 'Hot Dogs B', type: 'food', maxCounters: 3, serviceRate: 3.0 },
  { id: 'food-b2', name: 'Nachos & More', type: 'food', maxCounters: 2, serviceRate: 2.8 },
  { id: 'drinks-1', name: 'Drinks Stand N', type: 'drinks', maxCounters: 5, serviceRate: 4.0 },
  { id: 'drinks-2', name: 'Drinks Stand S', type: 'drinks', maxCounters: 4, serviceRate: 4.0 },
  { id: 'restroom-1', name: 'Restroom North', type: 'restroom', maxCounters: 8, serviceRate: 6.0 },
  { id: 'restroom-2', name: 'Restroom South', type: 'restroom', maxCounters: 8, serviceRate: 6.0 },
  { id: 'restroom-3', name: 'Restroom East', type: 'restroom', maxCounters: 6, serviceRate: 5.0 },
  { id: 'merch-1', name: 'Main Merch Store', type: 'merch', maxCounters: 4, serviceRate: 1.5 },
  { id: 'merch-2', name: 'Pop-Up Merch', type: 'merch', maxCounters: 2, serviceRate: 1.2 },
  { id: 'coffee-1', name: 'Café Corner', type: 'food', maxCounters: 2, serviceRate: 2.0 }
];

const MODE_DEMAND = {
  'pre-match': { food: 0.3, drinks: 0.4, restroom: 0.2, merch: 0.6 },
  'live': { food: 0.1, drinks: 0.15, restroom: 0.15, merch: 0.05 },
  'halftime': { food: 0.95, drinks: 0.9, restroom: 0.85, merch: 0.3 },
  'exit': { food: 0.05, drinks: 0.05, restroom: 0.3, merch: 0.15 }
};

export class QueueSimulator {
  constructor() {
    this.stands = SERVICE_POINTS.map(sp => ({
      ...sp,
      countersOpen: Math.ceil(sp.maxCounters * 0.5),
      queueLength: 0,
      waitMinutes: 0,
      trend: 'stable'
    }));
    
    this.virtualQueue = {
      active: false,
      standId: null,
      position: 0,
      totalInQueue: 0,
      estimatedWait: 0,
      stage: 'idle' // idle | joined | preparing | ready
    };
    
    this.halftimeRush = false;
  }

  init(engine) {
    engine.queueData = {
      stands: this.stands,
      virtualQueue: this.virtualQueue,
      avgWait: 0
    };
  }

  tick(context, engine) {
    const demand = MODE_DEMAND[context.mode] || MODE_DEMAND['live'];
    
    this.stands.forEach(stand => {
      const typeDemand = demand[stand.type] || 0.1;
      let targetDemand = typeDemand;
      
      // Apply halftime rush multiplier
      if (this.halftimeRush && (stand.type === 'food' || stand.type === 'drinks')) {
        targetDemand = Math.min(1, targetDemand * 1.5);
      }

      // Calculate queue length based on demand
      const targetQueueLength = Math.round(targetDemand * stand.maxCounters * 8 + (Math.random() - 0.5) * 4);
      const prev = stand.queueLength;
      stand.queueLength += Math.round((targetQueueLength - stand.queueLength) * 0.15);
      stand.queueLength = Math.max(0, stand.queueLength);

      // Determine trend
      if (stand.queueLength > prev + 1) stand.trend = 'rising';
      else if (stand.queueLength < prev - 1) stand.trend = 'falling';
      else stand.trend = 'stable';

      // Dynamic counter management
      if (stand.queueLength > stand.maxCounters * 5 && stand.countersOpen < stand.maxCounters) {
        stand.countersOpen = Math.min(stand.maxCounters, stand.countersOpen + 1);
      } else if (stand.queueLength < stand.maxCounters * 2 && stand.countersOpen > 1) {
        stand.countersOpen = Math.max(1, stand.countersOpen - 1);
      }

      // Calculate wait time
      if (stand.countersOpen > 0) {
        stand.waitMinutes = Math.max(0, Math.round(stand.queueLength / (stand.serviceRate * stand.countersOpen)));
      } else {
        stand.waitMinutes = 99;
      }
    });

    // Virtual queue progression
    if (this.virtualQueue.active) {
      if (this.virtualQueue.position > 0) {
        this.virtualQueue.position = Math.max(0, this.virtualQueue.position - (Math.random() > 0.3 ? 1 : 0));
        this.virtualQueue.estimatedWait = Math.max(0, this.virtualQueue.position * 0.8);
        
        if (this.virtualQueue.position <= 3 && this.virtualQueue.stage === 'joined') {
          this.virtualQueue.stage = 'preparing';
        }
        if (this.virtualQueue.position <= 0) {
          this.virtualQueue.stage = 'ready';
          this.virtualQueue.position = 0;
          this.virtualQueue.estimatedWait = 0;
        }
      }
    }

    // Calculate average wait
    const avgWait = this.stands.reduce((sum, s) => sum + s.waitMinutes, 0) / this.stands.length;

    engine.queueData = {
      stands: this.stands,
      virtualQueue: this.virtualQueue,
      avgWait: Math.round(avgWait * 10) / 10
    };

    engine.emit('queueUpdate', engine.queueData);
  }

  joinVirtualQueue(standId = 'food-a1') {
    const stand = this.stands.find(s => s.id === standId);
    this.virtualQueue = {
      active: true,
      standId: standId,
      position: stand ? Math.max(3, stand.queueLength) : 12,
      totalInQueue: stand ? stand.queueLength + 1 : 15,
      estimatedWait: stand ? stand.waitMinutes : 8,
      stage: 'joined'
    };
  }

  resetVirtualQueue() {
    this.virtualQueue = {
      active: false,
      standId: null,
      position: 0,
      totalInQueue: 0,
      estimatedWait: 0,
      stage: 'idle'
    };
  }

  handleSandboxEvent(eventType, engine) {
    switch (eventType) {
      case 'halftime-rush':
        this.halftimeRush = true;
        setTimeout(() => { this.halftimeRush = false; }, 15000);
        break;
      case 'reset':
        this.halftimeRush = false;
        this.resetVirtualQueue();
        break;
    }
  }
}
