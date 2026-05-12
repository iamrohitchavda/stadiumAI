/**
 * Incident Simulator
 * Simulates real-time operational incidents across the stadium
 */

const INCIDENT_TYPES = [
  { type: 'spill', icon: '💧', team: 'cleaning', severity: 'low', avgResolution: 5 },
  { type: 'medical', icon: '🏥', team: 'medical', severity: 'high', avgResolution: 12 },
  { type: 'crowd-concern', icon: '⚠️', team: 'security', severity: 'medium', avgResolution: 8 },
  { type: 'equipment', icon: '🔧', team: 'fnb', severity: 'low', avgResolution: 10 },
  { type: 'lost-child', icon: '👶', team: 'security', severity: 'high', avgResolution: 15 },
  { type: 'altercation', icon: '🛡️', team: 'security', severity: 'high', avgResolution: 10 },
  { type: 'trash-overflow', icon: '🗑️', team: 'cleaning', severity: 'low', avgResolution: 6 },
  { type: 'pos-issue', icon: '💳', team: 'fnb', severity: 'low', avgResolution: 4 }
];

const LOCATIONS = [
  'North Stand, Section A, Row 14',
  'South Concourse, Gate C area',
  'East Stand, Section D, Row 8',
  'Food Court A, Counter 3',
  'Main Concourse, near merch store',
  'Restroom North, Level 2',
  'VIP Lounge, Bay 3',
  'Family Zone, play area',
  'West Stand, Section F, Row 22',
  'South Stand, Section B, Row 5',
  'Food Court B, seating area',
  'North Concourse, stairwell 2'
];

const STAFF_NAMES = {
  security: ['Officer Patel', 'Officer Singh', 'Officer Chen', 'Officer Williams'],
  medical: ['Dr. Kumar', 'Paramedic Lee', 'Nurse Robinson', 'EMT Garcia'],
  cleaning: ['Team A Lead', 'Team B Lead', 'Team C Lead'],
  fnb: ['Supervisor Khan', 'Supervisor Jones', 'Supervisor Martinez']
};

let incidentIdCounter = 1000;

export class IncidentSimulator {
  constructor() {
    this.incidents = [];
    this.resolvedCount = 0;
    this.totalCreated = 0;
    this.medicalOverride = false;
  }

  init(engine) {
    // Seed with a couple of initial incidents
    this.createIncident(engine);
    this.createIncident(engine);
    this.updateEngine(engine);
  }

  createIncident(engine, overrideType = null) {
    const typeInfo = overrideType 
      ? INCIDENT_TYPES.find(t => t.type === overrideType) || INCIDENT_TYPES[0]
      : INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)];
    
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const staffList = STAFF_NAMES[typeInfo.team];
    const assignedStaff = staffList[Math.floor(Math.random() * staffList.length)];

    const incident = {
      id: `INC-${incidentIdCounter++}`,
      type: typeInfo.type,
      icon: typeInfo.icon,
      team: typeInfo.team,
      severity: typeInfo.severity,
      location: location,
      assignedTo: assignedStaff,
      status: 'active',
      createdAt: Date.now(),
      resolutionTime: typeInfo.avgResolution + Math.floor(Math.random() * 6 - 3),
      ticksAlive: 0
    };

    this.incidents.unshift(incident);
    this.totalCreated++;

    // Keep max 20 incidents
    if (this.incidents.length > 20) {
      this.incidents = this.incidents.slice(0, 20);
    }

    engine.emit('newIncident', incident);
    return incident;
  }

  tick(context, engine) {
    // Random incident generation based on mode
    const incidentChance = {
      'pre-match': 0.03,
      'live': 0.05,
      'halftime': 0.08,
      'exit': 0.06
    }[context.mode] || 0.04;

    if (Math.random() < incidentChance) {
      this.createIncident(engine);
    }

    // Medical override - create medical incident
    if (this.medicalOverride) {
      this.createIncident(engine, 'medical');
      this.medicalOverride = false;
    }

    // Progress/resolve incidents
    this.incidents.forEach(incident => {
      if (incident.status === 'active') {
        incident.ticksAlive++;
        if (incident.ticksAlive > incident.resolutionTime) {
          incident.status = 'resolved';
          this.resolvedCount++;
        }
      }
    });

    this.updateEngine(engine);
  }

  updateEngine(engine) {
    const activeIncidents = this.incidents.filter(i => i.status === 'active');
    
    engine.incidentData = {
      incidents: this.incidents,
      activeCount: activeIncidents.length,
      resolvedCount: this.resolvedCount,
      totalCreated: this.totalCreated,
      byTeam: {
        security: activeIncidents.filter(i => i.team === 'security').length,
        medical: activeIncidents.filter(i => i.team === 'medical').length,
        cleaning: activeIncidents.filter(i => i.team === 'cleaning').length,
        fnb: activeIncidents.filter(i => i.team === 'fnb').length
      }
    };

    engine.emit('incidentUpdate', engine.incidentData);
  }

  handleSandboxEvent(eventType, engine) {
    switch (eventType) {
      case 'medical':
        this.medicalOverride = true;
        break;
      case 'crowd-surge':
        this.createIncident(engine, 'crowd-concern');
        break;
      case 'reset':
        this.incidents = this.incidents.map(i => ({ ...i, status: 'resolved' }));
        break;
    }
  }
}
