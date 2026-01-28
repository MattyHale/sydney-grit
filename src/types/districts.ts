// District types for Sydney 1991 - 9 districts looping
export type District = 
  | 'cross' 
  | 'oxford' 
  | 'cbd' 
  | 'chinatown' 
  | 'central' 
  | 'surryHills'
  | 'cabramatta'
  | 'parramatta'
  | 'mountDruitt';

// District sequence for belt looping (as specified in patch)
export const DISTRICT_SEQUENCE: District[] = [
  'cross',
  'oxford', 
  'cbd',
  'chinatown',
  'central',
  'surryHills',
  'cabramatta',
  'parramatta',
  'mountDruitt',
];

// Human-readable district names
export const DISTRICT_NAMES: Record<District, string> = {
  cross: "Kings Cross",
  oxford: "Oxford St",
  cbd: "CBD",
  chinatown: "Chinatown",
  central: "Central",
  surryHills: "Surry Hills",
  cabramatta: "Cabramatta",
  parramatta: "Parramatta",
  mountDruitt: "Mount Druitt",
};

// Block type to signage mapping
export interface BlockSignage {
  type: 'bar' | 'food' | 'cafe' | 'vc' | 'hub' | 'club' | 'pawn' | 'shelter' | 'alley' | 'hostel' | 'shop' | 'derelict' | 'servo' | 'rsl' | 'station' | 'arcade';
  name: string;
}

// District-specific venue lists with accurate 1991 Sydney names
export const DISTRICT_VENUES: Record<District, BlockSignage[]> = {
  cross: [
    // Neon strip fronts, hostels, clubs, late-night food
    { type: 'bar', name: 'THE BOURBON' },
    { type: 'club', name: "PORKY'S" },
    { type: 'club', name: 'LES GIRLS' },
    { type: 'hostel', name: 'EVAS BACKPACKERS' },
    { type: 'food', name: 'HARRYS CAFE' },
    { type: 'club', name: 'CAROUSEL' },
    { type: 'bar', name: 'TEXAS TAVERN' },
    { type: 'vc', name: 'KINGS SEED' },
    { type: 'vc', name: 'CROSS ANGELS' },
    { type: 'alley', name: 'ALLEY' },
    { type: 'club', name: 'KINSELAS' },
    { type: 'hostel', name: 'JOLLY SWAGMAN' },
    { type: 'pawn', name: 'CROSS PAWN' },
    { type: 'vc', name: 'NEON CAPITAL' },
  ],
  oxford: [
    // Pubs, rainbow clubs, kebab vans, charity shops
    { type: 'bar', name: 'THE ALBURY' },
    { type: 'bar', name: 'MIDNIGHT SHIFT' },
    { type: 'club', name: 'DCM' },
    { type: 'club', name: 'EXCHANGE' },
    { type: 'vc', name: 'OXFORD ANGELS' },
    { type: 'bar', name: 'BERESFORD' },
    { type: 'club', name: 'TAXI CLUB' },
    { type: 'hub', name: 'RAINBOW CO-OP' },
    { type: 'shop', name: 'VINNIES' },
    { type: 'cafe', name: 'TROPICANA' },
    { type: 'alley', name: 'ALLEY' },
    { type: 'bar', name: 'FLINDERS' },
    { type: 'vc', name: 'PRIDE CAPITAL' },
  ],
  cbd: [
    // Sandstone facades, milk bars, TAB/pubs, pawn shops
    { type: 'vc', name: 'ALLEN & BUCKERIDGE' },
    { type: 'hub', name: 'ATP INNOVATIONS' },
    { type: 'bar', name: 'MARBLE BAR' },
    { type: 'shop', name: 'DAVID JONES' },
    { type: 'vc', name: 'PLATINUM VENTURES' },
    { type: 'vc', name: 'BLACKBIRD CAPITAL' },
    { type: 'cafe', name: 'LINDT' },
    { type: 'hub', name: 'AGSM' },
    { type: 'bar', name: 'REGENT' },
    { type: 'food', name: 'ROCKPOOL' },
    { type: 'pawn', name: 'TAB' },
    { type: 'pawn', name: 'CASH CONVERTERS' },
    { type: 'station', name: 'TOWN HALL' },
    { type: 'shelter', name: 'QVB' },
    { type: 'vc', name: 'SQUARE PEG' },
    { type: 'vc', name: 'AIR TREE' },
    { type: 'vc', name: 'HARBOUR PARTNERS' },
  ],
  chinatown: [
    // BBQ duck windows, noodle shops, arcades, lanterns
    { type: 'food', name: 'GOLDEN CENTURY' },
    { type: 'food', name: 'BBQ KING' },
    { type: 'shop', name: 'EAST OCEAN MART' },
    { type: 'arcade', name: 'CAPITOL ARCADE' },
    { type: 'food', name: 'MARIGOLD' },
    { type: 'food', name: 'EMPERORS GARDEN' },
    { type: 'shop', name: 'PADDY MARKETS' },
    { type: 'shop', name: 'NIGHT MARKET' },
    { type: 'vc', name: 'DRAGON VENTURES' },
    { type: 'cafe', name: 'EMPEROR' },
    { type: 'alley', name: 'ALLEY' },
    { type: 'pawn', name: 'GOLD SHOP' },
    { type: 'vc', name: 'LANTERN CAPITAL' },
  ],
  central: [
    // Station entrance, underpass, bus stands, fast-food
    { type: 'station', name: 'CENTRAL STATION' },
    { type: 'bar', name: 'RAILWAY HOTEL' },
    { type: 'vc', name: 'PLATFORM VC' },
    { type: 'shelter', name: 'SALVATION ARMY' },
    { type: 'vc', name: 'CENTRAL SEED' },
    { type: 'bar', name: 'CLOCK HOTEL' },
    { type: 'derelict', name: 'EDDY AVE' },
    { type: 'food', name: 'RAILWAY BUFFET' },
    { type: 'shelter', name: 'CITY MISSION' },
    { type: 'pawn', name: 'BOTTLE-O' },
    { type: 'cafe', name: 'CENTRAL CAFE' },
    { type: 'alley', name: 'ALLEY' },
    { type: 'bar', name: 'TERMINUS' },
    { type: 'vc', name: 'RED LINE VENTURES' },
  ],
  surryHills: [
    // Terraces, indie cafes, vintage stores, small bars, bookshops
    { type: 'cafe', name: 'BILLS' },
    { type: 'bar', name: 'HOPETOUN' },
    { type: 'shop', name: 'BERKELOUW' },
    { type: 'cafe', name: 'BOURKE ST BAKERY' },
    { type: 'bar', name: 'CLOCK HOTEL' },
    { type: 'shop', name: 'VINTAGE' },
    { type: 'hub', name: 'TECH SYDNEY' },
    { type: 'vc', name: 'SURRY SEED' },
    { type: 'cafe', name: 'REUBEN HILLS' },
    { type: 'bar', name: 'SHAKESPEARE' },
    { type: 'alley', name: 'ALLEY' },
    { type: 'shop', name: 'RECORD STORE' },
    { type: 'vc', name: 'BOURKE CAPITAL' },
  ],
  cabramatta: [
    // Pho shops, butchers, fruit stalls, night-market tarps
    { type: 'food', name: 'PHO TAU BAY' },
    { type: 'food', name: 'THANH BINH' },
    { type: 'shop', name: 'FRUIT STALLS' },
    { type: 'vc', name: 'CABRA CAPITAL' },
    { type: 'shop', name: 'FREEDOM PLAZA' },
    { type: 'food', name: 'PHO AN' },
    { type: 'shop', name: 'HERB MART' },
    { type: 'cafe', name: 'CA PHE' },
    { type: 'shop', name: 'CABRA MALL' },
    { type: 'food', name: 'BANH MI' },
    { type: 'alley', name: 'ALLEY' },
    { type: 'pawn', name: 'VANG 24K' },
    { type: 'vc', name: 'PHO VENTURES' },
  ],
  parramatta: [
    // Strip pubs with TAB, strip mall, kebab shops, mall entrance
    { type: 'rsl', name: 'PARRAMATTA RSL' },
    { type: 'bar', name: 'ALBION HOTEL' },
    { type: 'shop', name: 'WESTFIELD' },
    { type: 'vc', name: 'PARRA FOUNDERS' },
    { type: 'vc', name: 'WESTERN VENTURES' },
    { type: 'bar', name: 'COMMERCIAL' },
    { type: 'pawn', name: 'TAB' },
    { type: 'hub', name: 'PARRA WORKS' },
    { type: 'cafe', name: 'MUFFIN BREAK' },
    { type: 'bar', name: 'WOOLPACK' },
    { type: 'pawn', name: 'CASH CONVERTERS' },
    { type: 'alley', name: 'ALLEY' },
    { type: 'rsl', name: 'LEAGUES CLUB' },
    { type: 'vc', name: 'RIVER CITY VC' },
  ],
  mountDruitt: [
    // Servo, carpark, Centrelink, pokies pub, bottle shop
    { type: 'servo', name: 'SHELL SERVO' },
    { type: 'derelict', name: 'CARPARK' },
    { type: 'shelter', name: 'CENTRELINK' },
    { type: 'rsl', name: 'MOUNT DRUITT RSL' },
    { type: 'pawn', name: 'BOTTLE-O' },
    { type: 'shop', name: 'WESTFIELD' },
    { type: 'shop', name: 'BARGAIN MART' },
    { type: 'bar', name: 'CRITERION' },
    { type: 'servo', name: 'CALTEX' },
    { type: 'alley', name: 'ALLEY' },
    { type: 'pawn', name: 'CASH CONVERTERS' },
    { type: 'derelict', name: 'WASTELAND' },
    { type: 'vc', name: 'OUTER WEST ANGELS' },
  ],
};

// Visual and economy properties per district
export interface DistrictConfig {
  // Lighting profiles
  neonIntensity: number;
  warmth: number;
  brightness: number;
  primaryColor: string;     // Main neon/light color
  secondaryColor: string;   // Accent color
  
  // Population
  pedestrianDensity: number;
  archetypeWeights: Record<string, number>;
  
  // Economy multipliers
  sexEconomyMultiplier: number;
  foodMultiplier: number;
  servicesMultiplier: number;
  theftMultiplier: number;
  kindnessMultiplier: number;
  dangerMultiplier: number;
  dealerFrequency: number;
  pitchMultiplier: number;
  tradeMultiplier: number;
  violenceMultiplier: number;
  lsdFrequency: number;
  
  // Environment
  policeFrequency: number;
  dogFrequency: number;
  ibisFrequency: number;
  
  // Clutter types for foreground
  clutterTypes: string[];
}

export const DISTRICT_CONFIGS: Record<District, DistrictConfig> = {
  cross: {
    neonIntensity: 1.0,
    warmth: 0.3,
    brightness: 0.6,
    primaryColor: '#ff6688',
    secondaryColor: '#88ffff',
    pedestrianDensity: 0.9,
    archetypeWeights: {
      backpacker: 0.18,
      sexworker: 0.2,
      dealer: 0.12,
      clubber: 0.15,
      cop: 0.08,
      junkie: 0.1,
      tourist: 0.07,
      hoon: 0.04,
      security: 0.03,
      busker: 0.03,
    },
    sexEconomyMultiplier: 1.8,
    foodMultiplier: 0.6,
    servicesMultiplier: 0.5,
    theftMultiplier: 1.0,
    kindnessMultiplier: 0.3,
    dangerMultiplier: 0.8,
    dealerFrequency: 0.95,
    pitchMultiplier: 0.4,
    tradeMultiplier: 1.5,
    violenceMultiplier: 0.6,
    lsdFrequency: 0.3,
    policeFrequency: 0.8,
    dogFrequency: 0.3,
    ibisFrequency: 0.2,
    clutterTypes: ['neon', 'bottles', 'trash', 'flyers', 'crates', 'puddles', 'ashtrays', 'dumpster'],
  },
  oxford: {
    neonIntensity: 0.8,
    warmth: 0.5,
    brightness: 0.5,
    primaryColor: '#ff44aa',
    secondaryColor: '#44ffaa',
    pedestrianDensity: 0.85,
    archetypeWeights: {
      clubber: 0.24,
      student: 0.2,
      queerElder: 0.1,
      backpacker: 0.08,
      cop: 0.06,
      security: 0.05,
      tourist: 0.07,
      officeWorker: 0.07,
      busker: 0.05,
      dealer: 0.03,
      sexworker: 0.05,
    },
    sexEconomyMultiplier: 1.0,
    foodMultiplier: 1.2,
    servicesMultiplier: 0.6,
    theftMultiplier: 0.7,
    kindnessMultiplier: 0.8,
    dangerMultiplier: 0.4,
    dealerFrequency: 0.4,
    pitchMultiplier: 0.5,
    tradeMultiplier: 0.8,
    violenceMultiplier: 0.5,
    lsdFrequency: 0.5,
    policeFrequency: 0.5,
    dogFrequency: 0.2,
    ibisFrequency: 0.3,
    clutterTypes: ['glitter', 'bottles', 'posters', 'kebabvan', 'rainbowFlag', 'crates', 'chalkMenu'],
  },
  cbd: {
    neonIntensity: 0.3,
    warmth: 0.2,
    brightness: 0.7,
    primaryColor: '#88ccff',
    secondaryColor: '#ffffff',
    pedestrianDensity: 0.6,
    archetypeWeights: {
      businessman: 0.32,
      officeWorker: 0.2,
      tourist: 0.18,
      student: 0.08,
      cop: 0.1,
      security: 0.04,
      pensioner: 0.04,
      backpacker: 0.02,
      vc: 0.02,
    },
    sexEconomyMultiplier: 0.15,
    foodMultiplier: 0.8,
    servicesMultiplier: 1.8,
    theftMultiplier: 0.7,
    kindnessMultiplier: 0.6,
    dangerMultiplier: 0.25,
    dealerFrequency: 0.1,
    pitchMultiplier: 1.5,
    tradeMultiplier: 0.2,
    violenceMultiplier: 0.3,
    lsdFrequency: 0.1,
    policeFrequency: 1.0,
    dogFrequency: 0.1,
    ibisFrequency: 0.4,
    clutterTypes: ['briefcase', 'newsrack', 'phonebooth', 'busstop', 'bins', 'cone'],
  },
  chinatown: {
    neonIntensity: 0.6,
    warmth: 0.9,
    brightness: 0.6,
    primaryColor: '#ff4422',
    secondaryColor: '#ffcc00',
    pedestrianDensity: 0.8,
    archetypeWeights: {
      tourist: 0.22,
      pensioner: 0.18,
      student: 0.18,
      businessman: 0.12,
      backpacker: 0.08,
      auntie: 0.08,
      uncle: 0.07,
      dealer: 0.03,
      cop: 0.04,
    },
    sexEconomyMultiplier: 0.1,
    foodMultiplier: 2.0,
    servicesMultiplier: 0.5,
    theftMultiplier: 0.7,
    kindnessMultiplier: 1.0,
    dangerMultiplier: 0.2,
    dealerFrequency: 0.15,
    pitchMultiplier: 0.3,
    tradeMultiplier: 0.1,
    violenceMultiplier: 0.4,
    lsdFrequency: 0.05,
    policeFrequency: 0.4,
    dogFrequency: 0.1,
    ibisFrequency: 0.5,
    clutterTypes: ['crates', 'steam', 'lanterns', 'plasticStools', 'hangingSigns', 'dumpster'],
  },
  central: {
    neonIntensity: 0.2,
    warmth: 0.3,
    brightness: 0.4,
    primaryColor: '#88ff88',
    secondaryColor: '#aaaaaa',
    pedestrianDensity: 0.5,
    archetypeWeights: {
      junkie: 0.2,
      student: 0.15,
      backpacker: 0.12,
      cop: 0.12,
      businessman: 0.1,
      sexworker: 0.08,
      dealer: 0.08,
      tourist: 0.07,
      busker: 0.05,
      security: 0.03,
    },
    sexEconomyMultiplier: 0.9,
    foodMultiplier: 0.8,
    servicesMultiplier: 0.8,
    theftMultiplier: 1.8,
    kindnessMultiplier: 0.15,
    dangerMultiplier: 1.0,
    dealerFrequency: 0.7,
    pitchMultiplier: 0.2,
    tradeMultiplier: 0.5,
    violenceMultiplier: 1.0,
    lsdFrequency: 0.5,
    policeFrequency: 1.2,
    dogFrequency: 0.4,
    ibisFrequency: 0.7,
    clutterTypes: ['ticketMachine', 'timetable', 'pigeons', 'graffiti', 'buskerCorner', 'trash', 'puddles'],
  },
  surryHills: {
    neonIntensity: 0.3,
    warmth: 0.7,
    brightness: 0.6,
    primaryColor: '#ffaa66',
    secondaryColor: '#66aa88',
    pedestrianDensity: 0.6,
    archetypeWeights: {
      student: 0.22,
      officeWorker: 0.12,
      clubber: 0.1,
      tourist: 0.06,
      backpacker: 0.07,
      busker: 0.06,
      queerElder: 0.05,
      cop: 0.04,
      security: 0.03,
      founder: 0.08,
      vc: 0.05,
      junkie: 0.04,
    },
    sexEconomyMultiplier: 0.3,
    foodMultiplier: 1.0,
    servicesMultiplier: 0.8,
    theftMultiplier: 0.5,
    kindnessMultiplier: 0.9,
    dangerMultiplier: 0.3,
    dealerFrequency: 0.35,
    pitchMultiplier: 1.0,
    tradeMultiplier: 0.6,
    violenceMultiplier: 0.3,
    lsdFrequency: 0.4,
    policeFrequency: 0.4,
    dogFrequency: 0.6,
    ibisFrequency: 0.4,
    clutterTypes: ['bikes', 'crates', 'chalkMenu', 'posters', 'potPlants', 'dogBowl'],
  },
  cabramatta: {
    neonIntensity: 0.4,
    warmth: 0.85,
    brightness: 0.5,
    primaryColor: '#ffcc44',
    secondaryColor: '#ff6644',
    pedestrianDensity: 0.75,
    archetypeWeights: {
      auntie: 0.2,
      uncle: 0.15,
      student: 0.14,
      backpacker: 0.05,
      dealer: 0.12,
      cop: 0.08,
      tourist: 0.06,
      junkie: 0.08,
      businessman: 0.04,
      pensioner: 0.08,
    },
    sexEconomyMultiplier: 0.3,
    foodMultiplier: 1.8,
    servicesMultiplier: 0.4,
    theftMultiplier: 1.0,
    kindnessMultiplier: 0.6,
    dangerMultiplier: 1.2,
    dealerFrequency: 0.7,
    pitchMultiplier: 0.15,
    tradeMultiplier: 0.5,
    violenceMultiplier: 1.0,
    lsdFrequency: 0.2,
    policeFrequency: 1.0,
    dogFrequency: 0.4,
    ibisFrequency: 0.3,
    clutterTypes: ['plasticStools', 'herbCrates', 'lanterns', 'seafoodBoxes', 'steam', 'scooter'],
  },
  parramatta: {
    neonIntensity: 0.4,
    warmth: 0.5,
    brightness: 0.5,
    primaryColor: '#ffaa44',
    secondaryColor: '#44aaff',
    pedestrianDensity: 0.55,
    archetypeWeights: {
      businessman: 0.15,
      student: 0.14,
      pensioner: 0.12,
      clubber: 0.08,
      cop: 0.08,
      security: 0.08,
      tourist: 0.06,
      backpacker: 0.05,
      hoon: 0.08,
      dealer: 0.04,
      junkie: 0.05,
      founder: 0.07,
    },
    sexEconomyMultiplier: 0.25,
    foodMultiplier: 0.8,
    servicesMultiplier: 0.7,
    theftMultiplier: 0.8,
    kindnessMultiplier: 0.5,
    dangerMultiplier: 0.6,
    dealerFrequency: 0.4,
    pitchMultiplier: 0.5,
    tradeMultiplier: 0.4,
    violenceMultiplier: 0.6,
    lsdFrequency: 0.2,
    policeFrequency: 0.6,
    dogFrequency: 0.3,
    ibisFrequency: 0.5,
    clutterTypes: ['schooner', 'footyPosters', 'shoppingTrolleys', 'bins', 'busstop', 'crates'],
  },
  mountDruitt: {
    neonIntensity: 0.2,
    warmth: 0.3,
    brightness: 0.35,
    primaryColor: '#ff6644',
    secondaryColor: '#888888',
    pedestrianDensity: 0.4,
    archetypeWeights: {
      hoon: 0.2,
      student: 0.12,
      junkie: 0.15,
      dealer: 0.12,
      cop: 0.12,
      security: 0.08,
      pensioner: 0.06,
      sexworker: 0.05,
      backpacker: 0.02,
      businessman: 0.03,
      clubber: 0.03,
      officeWorker: 0.02,
    },
    sexEconomyMultiplier: 0.4,
    foodMultiplier: 0.5,
    servicesMultiplier: 0.3,
    theftMultiplier: 1.5,
    kindnessMultiplier: 0.2,
    dangerMultiplier: 1.5,
    dealerFrequency: 0.85,
    pitchMultiplier: 0.1,
    tradeMultiplier: 0.4,
    violenceMultiplier: 1.5,
    lsdFrequency: 0.3,
    policeFrequency: 0.9,
    dogFrequency: 0.7,
    ibisFrequency: 0.8,
    clutterTypes: ['cars', 'crates', 'energyCans', 'hoonCar', 'servoSign', 'bins', 'trash'],
  },
};

// Get district based on world offset (each district ~500 units wide)
export function getDistrictFromOffset(worldOffset: number): District {
  const DISTRICT_WIDTH = 500;
  const totalWidth = DISTRICT_WIDTH * DISTRICT_SEQUENCE.length;
  const normalizedOffset = ((worldOffset % totalWidth) + totalWidth) % totalWidth;
  const districtIndex = Math.floor(normalizedOffset / DISTRICT_WIDTH);
  return DISTRICT_SEQUENCE[districtIndex];
}

// Get blend factor between current and next district (0-1)
export function getDistrictBlend(worldOffset: number): { current: District; next: District; blend: number } {
  const DISTRICT_WIDTH = 500;
  const totalWidth = DISTRICT_WIDTH * DISTRICT_SEQUENCE.length;
  const normalizedOffset = ((worldOffset % totalWidth) + totalWidth) % totalWidth;
  const districtIndex = Math.floor(normalizedOffset / DISTRICT_WIDTH);
  const positionInDistrict = normalizedOffset % DISTRICT_WIDTH;
  const blend = positionInDistrict / DISTRICT_WIDTH;
  
  const current = DISTRICT_SEQUENCE[districtIndex];
  const next = DISTRICT_SEQUENCE[(districtIndex + 1) % DISTRICT_SEQUENCE.length];
  
  return { current, next, blend };
}

// Get venue for a specific block index
export function getVenueForBlock(district: District, index: number): BlockSignage {
  const venues = DISTRICT_VENUES[district];
  return venues[index % venues.length];
}

// Map block type to hotspot zone for shop entry
export function blockTypeToHotspotZone(blockType: BlockSignage['type']): import('./game').HotspotZone | null {
  const mapping: Record<BlockSignage['type'], import('./game').HotspotZone | null> = {
    'bar': 'bar',
    'food': 'food-vendor',
    'cafe': 'cafe',
    'vc': 'vc-firm',
    'hub': 'services',
    'club': 'strip-club',
    'pawn': 'pawn',
    'shelter': 'shelter',
    'alley': 'alley',
    'hostel': 'shelter',
    'shop': null,
    'derelict': null,
    'servo': null,
    'rsl': null,
    'station': null,
    'arcade': null,
  };
  return mapping[blockType];
}

// Get the building/venue at a specific world position
// This matches the exact rendering logic in Street.tsx
export function getVenueAtPosition(worldOffset: number, playerX: number): { venue: BlockSignage; hotspotZone: import('./game').HotspotZone | null; venueName: string } {
  const district = getDistrictFromOffset(worldOffset);
  const venues = DISTRICT_VENUES[district];
  
  const blockWidth = 100;  // Must match Street.tsx
  const totalWidth = blockWidth * venues.length;
  
  // This matches the parallax calculation in Street.tsx
  const parallaxOffset = worldOffset * 0.3;
  const normalizedOffset = ((parallaxOffset % totalWidth) + totalWidth) % totalWidth;
  
  // Player is at playerX% of screen width
  // Screen width is approximately 400px (game canvas)
  const screenWidth = 400;
  const playerScreenPixelPos = (playerX / 100) * screenWidth;
  
  // Find which building is at the player's screen position
  // Buildings are rendered at: xPos = (i * blockWidth) - normalizedOffset
  // So building i is visible when: (i * blockWidth) - normalizedOffset ≈ playerScreenPixelPos
  // Solving for i: i = (playerScreenPixelPos + normalizedOffset) / blockWidth
  
  let targetPos = playerScreenPixelPos + normalizedOffset;
  
  // Handle wrapping - buildings wrap around totalWidth
  targetPos = ((targetPos % totalWidth) + totalWidth) % totalWidth;
  
  const blockIndex = Math.floor(targetPos / blockWidth);
  const safeIndex = ((blockIndex % venues.length) + venues.length) % venues.length;
  
  const venue = venues[safeIndex];
  const hotspotZone = blockTypeToHotspotZone(venue.type);
  
  return { venue, hotspotZone, venueName: venue.name };
}
