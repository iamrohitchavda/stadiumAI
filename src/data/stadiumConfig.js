/**
 * Stadium Configuration Database
 * Multi-venue IPL stadium configs with zones, gates, service points, and staff
 */

export const STADIUMS = {
  'nms': {
    id: 'nms',
    name: 'Narendra Modi Stadium',
    city: 'Ahmedabad',
    state: 'Gujarat',
    capacity: 132000,
    image: '🏟️',
    teamHome: 'Gujarat Titans',
    ticketPrefix: 'NMS',
    zones: [
      { id: 'north-stand', name: 'North Pavilion', capacity: 28000, baseOccupancy: 0.3 },
      { id: 'south-stand', name: 'South Pavilion', capacity: 28000, baseOccupancy: 0.3 },
      { id: 'east-stand', name: 'East Stand (Adani)', capacity: 22000, baseOccupancy: 0.25 },
      { id: 'west-stand', name: 'West Stand (BCCI)', capacity: 22000, baseOccupancy: 0.25 },
      { id: 'club-house', name: 'Club House', capacity: 8000, baseOccupancy: 0.4 },
      { id: 'north-concourse', name: 'North Concourse', capacity: 5000, baseOccupancy: 0.15 },
      { id: 'south-concourse', name: 'South Concourse', capacity: 5000, baseOccupancy: 0.15 },
      { id: 'main-concourse', name: 'Main Concourse', capacity: 6000, baseOccupancy: 0.2 },
      { id: 'food-court-a', name: 'Food Court A (North)', capacity: 2000, baseOccupancy: 0.1 },
      { id: 'food-court-b', name: 'Food Court B (South)', capacity: 2000, baseOccupancy: 0.1 },
      { id: 'merch-zone', name: 'GT Merch Store', capacity: 1500, baseOccupancy: 0.08 },
      { id: 'vip-lounge', name: 'VIP Corporate Box', capacity: 3000, baseOccupancy: 0.35 },
      { id: 'family-zone', name: 'Family Stand', capacity: 4000, baseOccupancy: 0.2 }
    ],
    gates: [
      { id: 'gate-a', name: 'Gate 1 (North Main)', throughput: 1200 },
      { id: 'gate-b', name: 'Gate 2 (East)', throughput: 1000 },
      { id: 'gate-c', name: 'Gate 3 (South Main)', throughput: 1200 },
      { id: 'gate-d', name: 'Gate 4 (West)', throughput: 1000 },
      { id: 'gate-e', name: 'Gate 5 (NE Corner)', throughput: 800 },
      { id: 'gate-f', name: 'Gate 6 (SE Corner)', throughput: 800 },
      { id: 'gate-g', name: 'Gate 7 (NW VIP)', throughput: 500 },
      { id: 'gate-h', name: 'Gate 8 (SW)', throughput: 800 }
    ],
    servicePoints: [
      { id: 'food-a1', name: 'Gujarati Thali Corner', type: 'food', maxCounters: 6 },
      { id: 'food-a2', name: 'Pizza & Pasta', type: 'food', maxCounters: 4 },
      { id: 'food-b1', name: 'Chaat & Snacks', type: 'food', maxCounters: 5 },
      { id: 'food-b2', name: 'Biryani House', type: 'food', maxCounters: 3 },
      { id: 'drinks-1', name: 'Beverages North', type: 'drinks', maxCounters: 8 },
      { id: 'drinks-2', name: 'Beverages South', type: 'drinks', maxCounters: 6 },
      { id: 'restroom-1', name: 'Restroom Block A', type: 'restroom', maxCounters: 12 },
      { id: 'restroom-2', name: 'Restroom Block B', type: 'restroom', maxCounters: 12 },
      { id: 'restroom-3', name: 'Restroom Block C', type: 'restroom', maxCounters: 10 },
      { id: 'merch-1', name: 'GT Official Store', type: 'merch', maxCounters: 5 },
      { id: 'merch-2', name: 'IPL Souvenir Kiosk', type: 'merch', maxCounters: 3 }
    ],
    staff: { security: 50, medical: 18, fnb: 65, cleaning: 35 },
    sections: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T']
  },

  'wankhede': {
    id: 'wankhede',
    name: 'Wankhede Stadium',
    city: 'Mumbai',
    state: 'Maharashtra',
    capacity: 33000,
    image: '🏏',
    teamHome: 'Mumbai Indians',
    ticketPrefix: 'WAN',
    zones: [
      { id: 'north-stand', name: 'North Stand', capacity: 8000, baseOccupancy: 0.3 },
      { id: 'south-stand', name: 'Sachin Tendulkar Stand', capacity: 8000, baseOccupancy: 0.3 },
      { id: 'east-stand', name: 'Sunil Gavaskar Stand', capacity: 6000, baseOccupancy: 0.25 },
      { id: 'west-stand', name: 'Vijay Merchant Pavilion', capacity: 5000, baseOccupancy: 0.25 },
      { id: 'north-concourse', name: 'North Walkway', capacity: 2000, baseOccupancy: 0.15 },
      { id: 'south-concourse', name: 'South Walkway', capacity: 2000, baseOccupancy: 0.15 },
      { id: 'main-concourse', name: 'Central Corridor', capacity: 1500, baseOccupancy: 0.2 },
      { id: 'food-court-a', name: 'Food Court Ground', capacity: 800, baseOccupancy: 0.1 },
      { id: 'food-court-b', name: 'Food Court Upper', capacity: 600, baseOccupancy: 0.1 },
      { id: 'merch-zone', name: 'MI Merch Zone', capacity: 500, baseOccupancy: 0.08 },
      { id: 'vip-lounge', name: 'MCA Pavilion (VIP)', capacity: 1000, baseOccupancy: 0.4 },
      { id: 'family-zone', name: 'Family Bay', capacity: 1500, baseOccupancy: 0.2 }
    ],
    gates: [
      { id: 'gate-a', name: 'Gate A (Marine Drive)', throughput: 600 },
      { id: 'gate-b', name: 'Gate B (East)', throughput: 500 },
      { id: 'gate-c', name: 'Gate C (D Road)', throughput: 600 },
      { id: 'gate-d', name: 'Gate D (Churchgate)', throughput: 500 },
      { id: 'gate-e', name: 'Gate E (VIP)', throughput: 300 },
      { id: 'gate-f', name: 'Gate F (Media)', throughput: 200 }
    ],
    servicePoints: [
      { id: 'food-a1', name: 'Vada Pav Junction', type: 'food', maxCounters: 4 },
      { id: 'food-a2', name: 'Mumbai Bites', type: 'food', maxCounters: 3 },
      { id: 'food-b1', name: 'Grill Station', type: 'food', maxCounters: 3 },
      { id: 'drinks-1', name: 'Drinks Bar North', type: 'drinks', maxCounters: 4 },
      { id: 'drinks-2', name: 'Drinks Bar South', type: 'drinks', maxCounters: 3 },
      { id: 'restroom-1', name: 'Restroom North', type: 'restroom', maxCounters: 6 },
      { id: 'restroom-2', name: 'Restroom South', type: 'restroom', maxCounters: 6 },
      { id: 'merch-1', name: 'MI Fan Store', type: 'merch', maxCounters: 3 }
    ],
    staff: { security: 30, medical: 10, fnb: 35, cleaning: 20 },
    sections: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K']
  },

  'chinnaswamy': {
    id: 'chinnaswamy',
    name: 'M. Chinnaswamy Stadium',
    city: 'Bengaluru',
    state: 'Karnataka',
    capacity: 40000,
    image: '🏟️',
    teamHome: 'Royal Challengers Bengaluru',
    ticketPrefix: 'CHN',
    zones: [
      { id: 'north-stand', name: 'KSCA Pavilion', capacity: 10000, baseOccupancy: 0.3 },
      { id: 'south-stand', name: 'P Stand', capacity: 10000, baseOccupancy: 0.3 },
      { id: 'east-stand', name: 'N & M Stands', capacity: 7000, baseOccupancy: 0.25 },
      { id: 'west-stand', name: 'Cubbon Park End', capacity: 7000, baseOccupancy: 0.25 },
      { id: 'north-concourse', name: 'North Concourse', capacity: 2000, baseOccupancy: 0.15 },
      { id: 'south-concourse', name: 'South Concourse', capacity: 2000, baseOccupancy: 0.15 },
      { id: 'main-concourse', name: 'Ring Corridor', capacity: 2000, baseOccupancy: 0.2 },
      { id: 'food-court-a', name: 'Food Court Level 1', capacity: 1000, baseOccupancy: 0.1 },
      { id: 'food-court-b', name: 'Food Court Level 2', capacity: 800, baseOccupancy: 0.1 },
      { id: 'merch-zone', name: 'RCB Fan Store', capacity: 600, baseOccupancy: 0.08 },
      { id: 'vip-lounge', name: 'Corporate Box', capacity: 1500, baseOccupancy: 0.4 },
      { id: 'family-zone', name: 'Family Enclosure', capacity: 2000, baseOccupancy: 0.2 }
    ],
    gates: [
      { id: 'gate-a', name: 'Gate 1 (MG Road)', throughput: 700 },
      { id: 'gate-b', name: 'Gate 2 (East)', throughput: 500 },
      { id: 'gate-c', name: 'Gate 3 (Queens Road)', throughput: 700 },
      { id: 'gate-d', name: 'Gate 4 (West)', throughput: 500 },
      { id: 'gate-e', name: 'Gate 5 (VIP)', throughput: 300 },
      { id: 'gate-f', name: 'Gate 6 (Media)', throughput: 200 }
    ],
    servicePoints: [
      { id: 'food-a1', name: 'Dosa Point', type: 'food', maxCounters: 4 },
      { id: 'food-a2', name: 'BBQ Corner', type: 'food', maxCounters: 3 },
      { id: 'food-b1', name: 'North Indian Kitchen', type: 'food', maxCounters: 3 },
      { id: 'drinks-1', name: 'Beverages East', type: 'drinks', maxCounters: 5 },
      { id: 'drinks-2', name: 'Beverages West', type: 'drinks', maxCounters: 4 },
      { id: 'restroom-1', name: 'Restroom East Wing', type: 'restroom', maxCounters: 8 },
      { id: 'restroom-2', name: 'Restroom West Wing', type: 'restroom', maxCounters: 8 },
      { id: 'merch-1', name: 'RCB Official Merch', type: 'merch', maxCounters: 4 }
    ],
    staff: { security: 35, medical: 12, fnb: 42, cleaning: 25 },
    sections: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P']
  },

  'eden': {
    id: 'eden',
    name: 'Eden Gardens',
    city: 'Kolkata',
    state: 'West Bengal',
    capacity: 68000,
    image: '🏏',
    teamHome: 'Kolkata Knight Riders',
    ticketPrefix: 'EDN',
    zones: [
      { id: 'north-stand', name: 'BC Roy Club House', capacity: 15000, baseOccupancy: 0.3 },
      { id: 'south-stand', name: 'Ranji Trophy Gallery', capacity: 15000, baseOccupancy: 0.3 },
      { id: 'east-stand', name: 'Eastern Gallery', capacity: 12000, baseOccupancy: 0.25 },
      { id: 'west-stand', name: 'Western Gallery', capacity: 12000, baseOccupancy: 0.25 },
      { id: 'north-concourse', name: 'North Promenade', capacity: 3500, baseOccupancy: 0.15 },
      { id: 'south-concourse', name: 'South Promenade', capacity: 3500, baseOccupancy: 0.15 },
      { id: 'main-concourse', name: 'Central Tunnel', capacity: 3000, baseOccupancy: 0.2 },
      { id: 'food-court-a', name: 'Bengal Kitchen', capacity: 1200, baseOccupancy: 0.1 },
      { id: 'food-court-b', name: 'Street Food Zone', capacity: 1000, baseOccupancy: 0.1 },
      { id: 'merch-zone', name: 'KKR Fan Shop', capacity: 800, baseOccupancy: 0.08 },
      { id: 'vip-lounge', name: 'CAB President Box', capacity: 2000, baseOccupancy: 0.4 },
      { id: 'family-zone', name: 'Family Gallery', capacity: 3000, baseOccupancy: 0.2 }
    ],
    gates: [
      { id: 'gate-a', name: 'Gate 1 (Maidan)', throughput: 900 },
      { id: 'gate-b', name: 'Gate 2 (BBD Bagh)', throughput: 700 },
      { id: 'gate-c', name: 'Gate 3 (Fort William)', throughput: 900 },
      { id: 'gate-d', name: 'Gate 4 (West)', throughput: 700 },
      { id: 'gate-e', name: 'Gate 5 (VIP)', throughput: 400 },
      { id: 'gate-f', name: 'Gate 6 (Media)', throughput: 300 }
    ],
    servicePoints: [
      { id: 'food-a1', name: 'Kolkata Roll House', type: 'food', maxCounters: 5 },
      { id: 'food-a2', name: 'Fish Fry Counter', type: 'food', maxCounters: 3 },
      { id: 'food-b1', name: 'Mughlai Kitchen', type: 'food', maxCounters: 4 },
      { id: 'drinks-1', name: 'Drinks Stall East', type: 'drinks', maxCounters: 6 },
      { id: 'drinks-2', name: 'Drinks Stall West', type: 'drinks', maxCounters: 5 },
      { id: 'restroom-1', name: 'Restroom Block East', type: 'restroom', maxCounters: 10 },
      { id: 'restroom-2', name: 'Restroom Block West', type: 'restroom', maxCounters: 10 },
      { id: 'merch-1', name: 'KKR Merch Hub', type: 'merch', maxCounters: 4 }
    ],
    staff: { security: 45, medical: 15, fnb: 55, cleaning: 30 },
    sections: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q']
  },

  'rajiv-gandhi': {
    id: 'rajiv-gandhi',
    name: 'Rajiv Gandhi Intl Stadium',
    city: 'Hyderabad',
    state: 'Telangana',
    capacity: 55000,
    image: '🏟️',
    teamHome: 'Sunrisers Hyderabad',
    ticketPrefix: 'RGI',
    zones: [
      { id: 'north-stand', name: 'Pavilion End', capacity: 14000, baseOccupancy: 0.3 },
      { id: 'south-stand', name: 'Valley End', capacity: 14000, baseOccupancy: 0.3 },
      { id: 'east-stand', name: 'East Block', capacity: 9000, baseOccupancy: 0.25 },
      { id: 'west-stand', name: 'West Block', capacity: 9000, baseOccupancy: 0.25 },
      { id: 'north-concourse', name: 'North Arcade', capacity: 3000, baseOccupancy: 0.15 },
      { id: 'south-concourse', name: 'South Arcade', capacity: 3000, baseOccupancy: 0.15 },
      { id: 'main-concourse', name: 'Ring Road', capacity: 3000, baseOccupancy: 0.2 },
      { id: 'food-court-a', name: 'Hyderabadi Food Hub', capacity: 1000, baseOccupancy: 0.1 },
      { id: 'food-court-b', name: 'Global Bites', capacity: 800, baseOccupancy: 0.1 },
      { id: 'merch-zone', name: 'SRH Fan Zone', capacity: 700, baseOccupancy: 0.08 },
      { id: 'vip-lounge', name: 'VIP Lounge', capacity: 2000, baseOccupancy: 0.4 },
      { id: 'family-zone', name: 'Family Stand', capacity: 2500, baseOccupancy: 0.2 }
    ],
    gates: [
      { id: 'gate-a', name: 'Gate 1 (Main)', throughput: 800 },
      { id: 'gate-b', name: 'Gate 2 (East)', throughput: 600 },
      { id: 'gate-c', name: 'Gate 3 (South)', throughput: 800 },
      { id: 'gate-d', name: 'Gate 4 (West)', throughput: 600 },
      { id: 'gate-e', name: 'Gate 5 (VIP)', throughput: 400 },
      { id: 'gate-f', name: 'Gate 6 (NW)', throughput: 500 }
    ],
    servicePoints: [
      { id: 'food-a1', name: 'Biryani Express', type: 'food', maxCounters: 5 },
      { id: 'food-a2', name: 'Kebab Counter', type: 'food', maxCounters: 3 },
      { id: 'food-b1', name: 'South Indian Kitchen', type: 'food', maxCounters: 4 },
      { id: 'drinks-1', name: 'Beverages North', type: 'drinks', maxCounters: 5 },
      { id: 'drinks-2', name: 'Beverages South', type: 'drinks', maxCounters: 4 },
      { id: 'restroom-1', name: 'Restroom A Block', type: 'restroom', maxCounters: 9 },
      { id: 'restroom-2', name: 'Restroom B Block', type: 'restroom', maxCounters: 9 },
      { id: 'merch-1', name: 'SRH Official Store', type: 'merch', maxCounters: 4 }
    ],
    staff: { security: 40, medical: 14, fnb: 50, cleaning: 28 },
    sections: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P']
  }
};

// Sample events
export const EVENTS = [
  {
    id: 'ipl-2026-q1',
    name: 'GT vs MI — IPL 2026 Qualifier 1',
    date: '2026-04-24',
    time: '19:30 IST',
    venueId: 'nms',
    status: 'live',
    teams: ['Gujarat Titans', 'Mumbai Indians']
  },
  {
    id: 'ipl-2026-el',
    name: 'RCB vs CSK — IPL 2026 Eliminator',
    date: '2026-04-25',
    time: '19:30 IST',
    venueId: 'chinnaswamy',
    status: 'upcoming',
    teams: ['Royal Challengers Bengaluru', 'Chennai Super Kings']
  },
  {
    id: 'ipl-2026-q2',
    name: 'KKR vs SRH — IPL 2026 Qualifier 2',
    date: '2026-04-26',
    time: '19:30 IST',
    venueId: 'eden',
    status: 'upcoming',
    teams: ['Kolkata Knight Riders', 'Sunrisers Hyderabad']
  }
];

// Sample tickets — for demo purposes, resolves ticket to venue + seat
export const SAMPLE_TICKETS = {
  'NMS-A142-IPL2026': { venueId: 'nms', section: 'A', row: 14, seat: 2, gate: 'gate-a', eventId: 'ipl-2026-q1' },
  'NMS-B055-IPL2026': { venueId: 'nms', section: 'B', row: 5, seat: 5, gate: 'gate-a', eventId: 'ipl-2026-q1' },
  'NMS-D210-IPL2026': { venueId: 'nms', section: 'D', row: 21, seat: 10, gate: 'gate-c', eventId: 'ipl-2026-q1' },
  'NMS-K088-IPL2026': { venueId: 'nms', section: 'K', row: 8, seat: 8, gate: 'gate-b', eventId: 'ipl-2026-q1' },
  'NMS-VIP01-IPL2026': { venueId: 'nms', section: 'VIP', row: 1, seat: 1, gate: 'gate-g', eventId: 'ipl-2026-q1' },
  'WAN-C034-IPL2026': { venueId: 'wankhede', section: 'C', row: 3, seat: 4, gate: 'gate-a', eventId: 'ipl-2026-q1' },
  'CHN-E122-IPL2026': { venueId: 'chinnaswamy', section: 'E', row: 12, seat: 2, gate: 'gate-a', eventId: 'ipl-2026-el' },
  'EDN-G015-IPL2026': { venueId: 'eden', section: 'G', row: 1, seat: 5, gate: 'gate-a', eventId: 'ipl-2026-q2' },
  'RGI-B077-IPL2026': { venueId: 'rajiv-gandhi', section: 'B', row: 7, seat: 7, gate: 'gate-a', eventId: 'ipl-2026-q2' }
};

/**
 * Resolves a ticket number to venue + seat info
 * In production, this would be an API call to the ticketing system
 */
export function resolveTicket(ticketNumber) {
  const normalized = ticketNumber.toUpperCase().trim();
  
  // Direct lookup
  if (SAMPLE_TICKETS[normalized]) {
    const ticket = SAMPLE_TICKETS[normalized];
    const venue = STADIUMS[ticket.venueId];
    const event = EVENTS.find(e => e.id === ticket.eventId);
    return { ...ticket, venue, event, ticketNumber: normalized };
  }
  
  // Try to parse ticket format: PREFIX-SECTION+ROW+SEAT-EVENT
  const match = normalized.match(/^([A-Z]{2,4})-([A-Z]+)(\d{2,3})-/);
  if (match) {
    const prefix = match[1];
    const section = match[2];
    const rowSeat = match[3];
    
    // Find venue by prefix
    const venue = Object.values(STADIUMS).find(v => v.ticketPrefix === prefix);
    if (venue) {
      const row = parseInt(rowSeat.substring(0, rowSeat.length - 1)) || 1;
      const seat = parseInt(rowSeat.substring(rowSeat.length - 1)) || 1;
      const gate = venue.gates[0];
      const event = EVENTS.find(e => e.venueId === venue.id && e.status === 'live') || EVENTS.find(e => e.venueId === venue.id);
      
      return {
        venueId: venue.id,
        section, row, seat,
        gate: gate.id,
        eventId: event?.id,
        venue, event,
        ticketNumber: normalized
      };
    }
  }
  
  return null;
}

/**
 * Admin — venue management helpers
 */
export function getVenueList() {
  return Object.values(STADIUMS).map(v => ({
    id: v.id,
    name: v.name,
    city: v.city,
    capacity: v.capacity,
    teamHome: v.teamHome,
    zonesCount: v.zones.length,
    gatesCount: v.gates.length,
    servicePointsCount: v.servicePoints.length,
    totalStaff: Object.values(v.staff).reduce((s, n) => s + n, 0)
  }));
}

export function getEventList() {
  return EVENTS.map(e => {
    const venue = STADIUMS[e.venueId];
    return { ...e, venueName: venue?.name, venueCity: venue?.city, venueCapacity: venue?.capacity };
  });
}
