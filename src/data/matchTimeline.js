/**
 * Match Timeline
 * Manages match-day events that trigger simulation changes
 */

const MATCH_EVENTS = [
  { time: -3600, type: 'gate-open', message: 'Gates open — fans entering' },
  { time: -1800, type: 'warmup', message: 'Teams warming up — crowd building' },
  { time: -600, type: 'rush', message: 'Pre-match rush — peak entry flow' },
  { time: 0, type: 'kickoff', message: 'KICKOFF! Match underway' },
  { time: 900, type: 'goal', message: '⚽ GOAL! Crowd surge detected' },
  { time: 2100, type: 'yellow-card', message: '🟨 Yellow card — crowd tension rising' },
  { time: 2700, type: 'halftime', message: '⏸️ HALF-TIME — concession rush begins' },
  { time: 3600, type: 'second-half', message: 'Second half begins' },
  { time: 4200, type: 'goal', message: '⚽ GOAL! Equalizer — crowd erupts' },
  { time: 4800, type: 'red-card', message: '🟥 Red card — security alert raised' },
  { time: 5400, type: 'fulltime', message: '🏁 FULL TIME — exit rush begins' },
  { time: 5700, type: 'exit-peak', message: 'Peak exit flow — all gates at capacity' }
];

export class MatchTimeline {
  constructor() {
    this.events = MATCH_EVENTS;
    this.triggeredEvents = new Set();
    this.currentEvents = [];
  }

  init(engine) {
    engine.on('modeChange', () => {
      this.triggeredEvents.clear();
    });
  }

  tick(context, engine) {
    // Check for events that should trigger
    this.events.forEach(event => {
      if (context.clock >= event.time && !this.triggeredEvents.has(event.time)) {
        this.triggeredEvents.add(event.time);
        this.currentEvents.push({
          ...event,
          timestamp: Date.now()
        });
        engine.emit('matchEvent', event);

        // Keep last 5 events
        if (this.currentEvents.length > 5) {
          this.currentEvents = this.currentEvents.slice(-5);
        }
      }
    });
  }
}
