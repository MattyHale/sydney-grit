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
  
  // Block types that appear more often
  dominantBlocks: string[];
  
  // Clutter types
  clutterTypes: string[];
  
  // Signage fragments
  signage: string[];
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
    // Authentic Kings Cross 1991 venues
    dominantBlocks: ['bourbon', 'porkys', 'stripclub', 'kinselas', 'alamode', 'tunnel', 'hostel', 'kebab', 'bar', 'cafe'],
    clutterTypes: ['neon', 'bottles', 'trash', 'posters', 'puddles', 'crates', 'smoke', 'dumpster', 'syringes'],
    signage: ['THE BOURBON', "PORKY'S", 'TEXAS TAVERN', 'KINSELAS', 'A LA MODE', 'THE TUNNEL', 'STRIPPERAMA', 'LES GIRLS', 'PINK PANTHER', 'CAROUSEL', 'LOVE MACHINE', 'PICCOLO BAR'],
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
    // Authentic Oxford St 1991 - Golden Mile
    dominantBlocks: ['albury', 'midnight', 'beresford', 'exchange', 'taxi', 'bar', 'kebab', 'cafe', 'stripclub'],
    clutterTypes: ['bottles', 'kebabvan', 'posters', 'crates', 'busstop', 'neon', 'puddles', 'cone'],
    signage: ['THE ALBURY', 'MIDNIGHT SHIFT', 'BERESFORD', 'EXCHANGE', 'TAXI CLUB', "GILLIGAN'S", 'FLINDERS', 'DCM', 'STONEWALL', 'COLOMBIAN', 'PALMS', 'BEAUCHAMP'],
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
    // Sydney CBD 1991 - Business district with early Australian VCs & startup hubs
    dominantBlocks: ['services', 'shelter', 'vc', 'startuphub', 'civic', 'newsagent', 'bar', 'cafe', 'parlour'],
    clutterTypes: ['newsrack', 'phonebooth', 'busstop', 'bins', 'crates', 'cone'],
    signage: ['ALLEN & BUCKERIDGE', 'PLATINUM VENTURES', 'POLARIS', 'WESTPAC PLACE', 'MARBLE BAR', 'REGENT', 'AGSM', 'ATP INNOVATIONS', 'QVB', 'GRACE BROS', 'DJ', 'MLC CENTRE'],
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
    // Authentic Dixon St Chinatown 1991
    dominantBlocks: ['goldencentury', 'bbqking', 'eastocean', 'marigold', 'capitol', 'goldshop', 'herbshop', 'cafe'],
    clutterTypes: ['crates', 'bins', 'steam', 'lanterns', 'bottles', 'dumpster'],
    signage: ['GOLDEN CENTURY', 'BBQ KING', 'EAST OCEAN', 'MARIGOLD', 'EMPERORS GARDEN', 'HINGARA', 'CAPITOL', 'PADDY MARKETS', 'EMPERORS CHOICE', 'REGAL', 'SUPERBOWL', 'GOLDEN HARBOUR'],
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
    // Central Station / Eddy Ave 1991 - rough area
    dominantBlocks: ['centralstation', 'salvation', 'derelict', 'boarded', 'alley', 'tab', 'bottleo', 'kebab'],
    clutterTypes: ['trash', 'bottles', 'newsrack', 'phonebooth', 'busstop', 'puddles', 'dumpster', 'smoke', 'syringes'],
    signage: ['CENTRAL', 'EDDY AVE', 'SALVATION ARMY', 'RED ROOSTER', 'TAB', 'BOTTLE-O', 'CITY CIRCLE', 'PLATFORM 1', 'RAILWAY HOTEL', 'TERMINUS', 'CLOCK HOTEL', 'ALFRED'],
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
    // Authentic Redfern / The Block 1991
    dominantBlocks: ['theblock', 'redfernstation', 'hopetoun', 'courthouse', 'pawn', 'boarded', 'alley', 'bottleo', 'tab'],
    clutterTypes: ['trash', 'bottles', 'crates', 'bins', 'puddles', 'posters', 'dumpster', 'smoke'],
    signage: ['THE BLOCK', 'EVELEIGH ST', 'REDFERN', 'HOPETOUN HOTEL', 'COURTHOUSE', 'LAND RIGHTS NOW', 'BOTTLE-O', 'CASH LOANS', 'PAWN', 'KOORI RADIO', 'ELOUERA', 'MURAWINA'],
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
    // Authentic Cabramatta 1991 - Vietnamese community, heroin era
    dominantBlocks: ['pho2000', 'goldshop', 'freedomplaza', 'herbalmed', 'arcade', 'alley', 'cafe', 'kebab'],
    clutterTypes: ['crates', 'bins', 'steam', 'trash', 'bottles', 'dumpster', 'puddles', 'syringes'],
    signage: ['PHỞ TÀU BAY', 'THÀNH BÌNH', 'FREEDOM PLAZA', 'AN RESTAURANT', 'TAN VIET', 'BÁNH MÌ', 'CABRA MALL', 'VÀNG 24K', 'PHO AN', 'HUONG XUAN', 'CAY DUA', 'SAIGON GATE'],
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
