// District types for Sydney 1991
export type District = 'cross' | 'oxford' | 'cbd' | 'chinatown' | 'central' | 'redfern' | 'cabramatta';

// District sequence for belt looping
export const DISTRICT_SEQUENCE: District[] = ['cross', 'oxford', 'cbd', 'chinatown', 'central', 'redfern', 'cabramatta'];

// Human-readable district names
export const DISTRICT_NAMES: Record<District, string> = {
  cross: "Kings Cross",
  oxford: "Oxford St",
  cbd: "Sydney City",
  chinatown: "Chinatown",
  central: "Central",
  redfern: "Redfern",
  cabramatta: "Cabramatta",
};

// Block type to signage mapping - ensures accurate function-to-name matching
export interface BlockSignage {
  type: 'bar' | 'food' | 'cafe' | 'vc' | 'hub' | 'club' | 'pawn' | 'shelter' | 'alley' | 'hostel' | 'shop' | 'derelict';
  name: string;
}

// District-specific venue lists with accurate block types
export const DISTRICT_VENUES: Record<District, BlockSignage[]> = {
  cross: [
    // Bars/Pubs
    { type: 'bar', name: 'THE BOURBON' },
    { type: 'bar', name: 'TEXAS TAVERN' },
    { type: 'bar', name: "PORKY'S" },
    { type: 'bar', name: 'PICCOLO BAR' },
    // Clubs
    { type: 'club', name: 'KINSELAS' },
    { type: 'club', name: 'THE TUNNEL' },
    { type: 'club', name: 'LES GIRLS' },
    { type: 'club', name: 'CAROUSEL' },
    // Food
    { type: 'food', name: 'HARRYS CAFE' },
    { type: 'food', name: 'TROPICANA' },
    { type: 'cafe', name: 'PICCOLO' },
    // Other
    { type: 'hostel', name: 'EVAS HOSTEL' },
    { type: 'pawn', name: 'CROSS PAWN' },
    { type: 'alley', name: 'ALLEY' },
  ],
  oxford: [
    // Bars/Pubs - Golden Mile
    { type: 'bar', name: 'THE ALBURY' },
    { type: 'bar', name: 'MIDNIGHT SHIFT' },
    { type: 'bar', name: 'BERESFORD' },
    { type: 'bar', name: 'FLINDERS' },
    { type: 'bar', name: "GILLIGAN'S" },
    // Clubs
    { type: 'club', name: 'DCM' },
    { type: 'club', name: 'EXCHANGE' },
    { type: 'club', name: 'TAXI CLUB' },
    { type: 'club', name: 'PALMS' },
    // Food
    { type: 'food', name: 'COLOMBIAN' },
    { type: 'food', name: 'BALKAN' },
    { type: 'cafe', name: 'TROPICANA' },
    // Other
    { type: 'pawn', name: 'OXFORD GOLD' },
    { type: 'alley', name: 'ALLEY' },
  ],
  cbd: [
    // Australian VCs (real 1990s era)
    { type: 'vc', name: 'ALLEN & BUCKERIDGE' },
    { type: 'vc', name: 'PLATINUM VENTURES' },
    { type: 'vc', name: 'POLARIS' },
    { type: 'vc', name: 'HAMBROS' },
    // Startup Hubs / Accelerators
    { type: 'hub', name: 'ATP INNOVATIONS' },
    { type: 'hub', name: 'AGSM' },
    { type: 'hub', name: 'TECH SYDNEY' },
    // Bars
    { type: 'bar', name: 'MARBLE BAR' },
    { type: 'bar', name: 'REGENT' },
    { type: 'bar', name: 'CIVIC' },
    // Food
    { type: 'food', name: 'ROCKPOOL' },
    { type: 'food', name: 'KABLES' },
    { type: 'cafe', name: 'LINDT' },
    // Other
    { type: 'shelter', name: 'QVB' },
    { type: 'shop', name: 'DAVID JONES' },
  ],
  chinatown: [
    // Restaurants - all food!
    { type: 'food', name: 'GOLDEN CENTURY' },
    { type: 'food', name: 'BBQ KING' },
    { type: 'food', name: 'EAST OCEAN' },
    { type: 'food', name: 'MARIGOLD' },
    { type: 'food', name: 'EMPERORS GARDEN' },
    { type: 'food', name: 'HINGARA' },
    { type: 'food', name: 'REGAL' },
    { type: 'food', name: 'SUPERBOWL' },
    { type: 'cafe', name: 'EMPEROR' },
    // Other
    { type: 'shop', name: 'PADDY MARKETS' },
    { type: 'shop', name: 'CAPITOL' },
    { type: 'pawn', name: 'GOLD SHOP' },
    { type: 'alley', name: 'ALLEY' },
  ],
  central: [
    // Bars/Pubs around Central
    { type: 'bar', name: 'RAILWAY HOTEL' },
    { type: 'bar', name: 'CLOCK HOTEL' },
    { type: 'bar', name: 'TERMINUS' },
    { type: 'bar', name: 'ALFRED' },
    // Food
    { type: 'food', name: 'RED ROOSTER' },
    { type: 'food', name: 'RAILWAY BUFFET' },
    { type: 'cafe', name: 'CENTRAL CAFE' },
    // Services
    { type: 'shelter', name: 'SALVATION ARMY' },
    { type: 'shelter', name: 'CITY MISSION' },
    // Other
    { type: 'shop', name: 'CENTRAL' },
    { type: 'pawn', name: 'TAB' },
    { type: 'pawn', name: 'BOTTLE-O' },
    { type: 'derelict', name: 'EDDY AVE' },
    { type: 'alley', name: 'ALLEY' },
  ],
  redfern: [
    // Pubs
    { type: 'bar', name: 'HOPETOUN HOTEL' },
    { type: 'bar', name: 'COURTHOUSE' },
    { type: 'bar', name: 'REGENT' },
    // Food
    { type: 'food', name: 'REDFERN RSL' },
    { type: 'cafe', name: 'ELOUERA' },
    // Shelters/Services
    { type: 'shelter', name: 'THE BLOCK' },
    { type: 'shelter', name: 'MURAWINA' },
    // Other
    { type: 'pawn', name: 'CASH LOANS' },
    { type: 'pawn', name: 'BOTTLE-O' },
    { type: 'shop', name: 'KOORI RADIO' },
    { type: 'derelict', name: 'EVELEIGH ST' },
    { type: 'alley', name: 'ALLEY' },
  ],
  cabramatta: [
    // Vietnamese Restaurants - all food!
    { type: 'food', name: 'PHO TAU BAY' },
    { type: 'food', name: 'THANH BINH' },
    { type: 'food', name: 'AN RESTAURANT' },
    { type: 'food', name: 'TAN VIET' },
    { type: 'food', name: 'PHO AN' },
    { type: 'food', name: 'HUONG XUAN' },
    { type: 'food', name: 'SAIGON GATE' },
    { type: 'cafe', name: 'CA PHE' },
    { type: 'cafe', name: 'BANH MI' },
    // Other
    { type: 'shop', name: 'FREEDOM PLAZA' },
    { type: 'shop', name: 'CABRA MALL' },
    { type: 'pawn', name: 'VANG 24K' },
    { type: 'alley', name: 'ALLEY' },
  ],
};

// Visual and economy properties per district
export interface DistrictConfig {
  // Lighting
  neonIntensity: number; // 0-1
  warmth: number; // 0-1 (warm vs cold light)
  brightness: number; // 0-1
  
  // Population biases
  pedestrianDensity: number; // 0-1
  archetypeWeights: Record<string, number>;
  
  // Economy biases (multipliers)
  sexEconomyMultiplier: number;
  foodMultiplier: number;
  servicesMultiplier: number;
  theftMultiplier: number;
  kindnessMultiplier: number;
  dangerMultiplier: number;
  dealerFrequency: number; // 0-1 chance of dealer events
  
  // Pedestrian action biases (multipliers)
  pitchMultiplier: number;
  tradeMultiplier: number;
  violenceMultiplier: number;
  lsdFrequency: number; // 0-1 chance of LSD events
  
  // Environment
  policeFrequency: number;
  dogFrequency: number;
  ibisFrequency: number;
  
  // Clutter types
  clutterTypes: string[];
}

export const DISTRICT_CONFIGS: Record<District, DistrictConfig> = {
  cross: {
    neonIntensity: 1.0,
    warmth: 0.3,
    brightness: 0.6,
    pedestrianDensity: 0.9,
    archetypeWeights: {
      businessman: 0.03,
      clubber: 0.12,
      tourist: 0.08,
      pensioner: 0.02,
      backpacker: 0.18,
      junkie: 0.15,
      sexworker: 0.25,
      student: 0.05,
      cop: 0.04,
      punk: 0.08,
    },
    sexEconomyMultiplier: 1.8,
    foodMultiplier: 0.6,
    servicesMultiplier: 0.5,
    theftMultiplier: 1.0,
    kindnessMultiplier: 0.3,
    dangerMultiplier: 0.8,
    dealerFrequency: 0.95,
    pitchMultiplier: 0.5,
    tradeMultiplier: 1.5,
    violenceMultiplier: 0.6,
    lsdFrequency: 0.3,
    policeFrequency: 0.8,
    dogFrequency: 0.3,
    ibisFrequency: 0.2,
    clutterTypes: ['neon', 'bottles', 'trash', 'posters', 'puddles', 'crates', 'smoke', 'dumpster', 'syringes'],
  },
  oxford: {
    neonIntensity: 0.8,
    warmth: 0.5,
    brightness: 0.5,
    pedestrianDensity: 0.85,
    archetypeWeights: {
      businessman: 0.05,
      clubber: 0.30,
      tourist: 0.08,
      pensioner: 0.02,
      backpacker: 0.08,
      junkie: 0.08,
      sexworker: 0.08,
      student: 0.18,
      cop: 0.03,
      punk: 0.10,
    },
    sexEconomyMultiplier: 1.0,
    foodMultiplier: 1.0,
    servicesMultiplier: 0.6,
    theftMultiplier: 0.7,
    kindnessMultiplier: 0.8,
    dangerMultiplier: 0.4,
    dealerFrequency: 0.4,
    pitchMultiplier: 0.6,
    tradeMultiplier: 0.8,
    violenceMultiplier: 0.5,
    lsdFrequency: 0.4,
    policeFrequency: 0.5,
    dogFrequency: 0.2,
    ibisFrequency: 0.3,
    clutterTypes: ['bottles', 'kebabvan', 'posters', 'crates', 'busstop', 'neon', 'puddles', 'cone'],
  },
  cbd: {
    neonIntensity: 0.3,
    warmth: 0.2,
    brightness: 0.7,
    pedestrianDensity: 0.6,
    archetypeWeights: {
      businessman: 0.40,
      clubber: 0.03,
      tourist: 0.20,
      pensioner: 0.08,
      backpacker: 0.04,
      junkie: 0.05,
      sexworker: 0.02,
      student: 0.08,
      cop: 0.08,
      punk: 0.02,
    },
    sexEconomyMultiplier: 0.15,
    foodMultiplier: 0.8,
    servicesMultiplier: 1.8,
    theftMultiplier: 0.4,
    kindnessMultiplier: 0.6,
    dangerMultiplier: 0.25,
    dealerFrequency: 0.1,
    pitchMultiplier: 1.2,
    tradeMultiplier: 0.2,
    violenceMultiplier: 0.3,
    lsdFrequency: 0.1,
    policeFrequency: 1.0,
    dogFrequency: 0.1,
    ibisFrequency: 0.4,
    clutterTypes: ['newsrack', 'phonebooth', 'busstop', 'bins', 'crates', 'cone'],
  },
  chinatown: {
    neonIntensity: 0.6,
    warmth: 0.9,
    brightness: 0.6,
    pedestrianDensity: 0.8,
    archetypeWeights: {
      businessman: 0.10,
      clubber: 0.08,
      tourist: 0.35,
      pensioner: 0.12,
      backpacker: 0.10,
      junkie: 0.04,
      sexworker: 0.02,
      student: 0.15,
      cop: 0.02,
      punk: 0.02,
    },
    sexEconomyMultiplier: 0.1,
    foodMultiplier: 2.0,
    servicesMultiplier: 0.5,
    theftMultiplier: 0.35,
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
    clutterTypes: ['crates', 'bins', 'steam', 'lanterns', 'bottles', 'dumpster'],
  },
  central: {
    neonIntensity: 0.2,
    warmth: 0.3,
    brightness: 0.4,
    pedestrianDensity: 0.5,
    archetypeWeights: {
      businessman: 0.12,
      clubber: 0.05,
      tourist: 0.06,
      pensioner: 0.08,
      backpacker: 0.08,
      junkie: 0.25,
      sexworker: 0.06,
      student: 0.15,
      cop: 0.07,
      punk: 0.08,
    },
    sexEconomyMultiplier: 0.25,
    foodMultiplier: 0.5,
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
    ibisFrequency: 0.6,
    clutterTypes: ['trash', 'bottles', 'newsrack', 'phonebooth', 'busstop', 'puddles', 'dumpster', 'smoke', 'syringes'],
  },
  redfern: {
    neonIntensity: 0.1,
    warmth: 0.2,
    brightness: 0.3,
    pedestrianDensity: 0.35,
    archetypeWeights: {
      businessman: 0.02,
      clubber: 0.02,
      tourist: 0.01,
      pensioner: 0.12,
      backpacker: 0.02,
      junkie: 0.38,
      sexworker: 0.10,
      student: 0.15,
      cop: 0.06,
      punk: 0.12,
    },
    sexEconomyMultiplier: 0.5,
    foodMultiplier: 0.25,
    servicesMultiplier: 0.2,
    theftMultiplier: 1.5,
    kindnessMultiplier: 0.05,
    dangerMultiplier: 1.2,
    dealerFrequency: 0.95,
    pitchMultiplier: 0.0,
    tradeMultiplier: 0.6,
    violenceMultiplier: 1.2,
    lsdFrequency: 0.6,
    policeFrequency: 0.8,
    dogFrequency: 0.8,
    ibisFrequency: 0.9,
    clutterTypes: ['trash', 'bottles', 'crates', 'bins', 'puddles', 'posters', 'dumpster', 'smoke'],
  },
  cabramatta: {
    neonIntensity: 0.4,
    warmth: 0.85,
    brightness: 0.45,
    pedestrianDensity: 0.7,
    archetypeWeights: {
      businessman: 0.03,
      clubber: 0.02,
      tourist: 0.05,
      pensioner: 0.15,
      backpacker: 0.03,
      junkie: 0.35,
      sexworker: 0.05,
      student: 0.12,
      cop: 0.08,
      punk: 0.12,
    },
    sexEconomyMultiplier: 0.3,
    foodMultiplier: 1.8,
    servicesMultiplier: 0.4,
    theftMultiplier: 1.2,
    kindnessMultiplier: 0.5,
    dangerMultiplier: 1.5,
    dealerFrequency: 1.0,
    pitchMultiplier: 0.1,
    tradeMultiplier: 0.4,
    violenceMultiplier: 1.5,
    lsdFrequency: 0.2,
    policeFrequency: 1.2,
    dogFrequency: 0.5,
    ibisFrequency: 0.3,
    clutterTypes: ['crates', 'bins', 'steam', 'trash', 'bottles', 'dumpster', 'puddles', 'syringes'],
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
    'shop': 'bins',  // Generic shops have bins
    'derelict': 'bins',  // Derelict buildings have bins
  };
  return mapping[blockType];
}

// Get the building/venue at a specific world position
export function getVenueAtPosition(worldOffset: number, playerX: number): { venue: BlockSignage; hotspotZone: import('./game').HotspotZone | null } {
  const district = getDistrictFromOffset(worldOffset);
  const venues = DISTRICT_VENUES[district];
  
  // Block width is 100px (WIDER buildings), matches Street.tsx
  const blockWidth = 100;
  const totalWidth = blockWidth * venues.length;
  
  // Calculate which block the player is standing in front of
  // playerX is 0-100%, convert to pixel position in the parallax space
  const parallaxOffset = worldOffset * 0.3;
  const normalizedOffset = ((parallaxOffset % totalWidth) + totalWidth) % totalWidth;
  
  // Player screen position (0-100%) maps to a block
  // Screen shows about 10 blocks at 100px each
  const screenWidth = blockWidth * 10;
  const playerScreenPos = (playerX / 100) * screenWidth;
  
  // The block at the player's position
  const absolutePos = normalizedOffset + playerScreenPos;
  const blockIndex = Math.floor((absolutePos / blockWidth)) % venues.length;
  
  const venue = venues[blockIndex];
  const hotspotZone = blockTypeToHotspotZone(venue.type);
  
  return { venue, hotspotZone };
}
