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
    dominantBlocks: ['lesboys', 'bourbon', 'porkys', 'texasontap', 'stripclub', 'kinselas', 'alamode', 'tunnel', 'injectionroom', 'hostel', 'kebab'],
    clutterTypes: ['neon', 'bottles', 'trash', 'posters', 'puddles', 'crates', 'smoke', 'dumpster', 'syringes'],
    signage: ['LES BOYS', 'THE BOURBON', "PORKY'S", 'TEXAS ON TAP', 'TUNNEL', 'A LA MODE', 'KINSELAS', 'SHOWGIRLS', 'XXX', 'LOVE MACHINE', 'CAROUSEL', 'PINK PANTHER'],
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
    // Authentic Oxford St 1991 - Golden Mile gay scene
    dominantBlocks: ['albury', 'midnight', 'gilligan', 'beresford', 'dco', 'kinselas', 'exchange', 'stonewall', 'taxi', 'flinders', 'kebab', 'cafe'],
    clutterTypes: ['bottles', 'kebabvan', 'posters', 'crates', 'busstop', 'neon', 'puddles', 'cone'],
    signage: ['THE ALBURY', 'MIDNIGHT SHIFT', "GILLIGAN'S", 'DCO', 'KINSELAS', 'BERESFORD', 'EXCHANGE', 'FLINDERS', 'TAXI CLUB', 'BEAUCHAMP'],
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
    // Authentic Sydney CBD 1991
    dominantBlocks: ['services', 'shelter', 'marblebarr', 'regent', 'state', 'forcesfood', 'qvb', 'wynyard', 'davidjones', 'civic', 'newsagent', 'parlour'],
    clutterTypes: ['newsrack', 'phonebooth', 'busstop', 'bins', 'crates', 'cone'],
    signage: ['MARBLE BAR', 'REGENT', 'STATE THEATRE', 'FORCES CANTEEN', 'QVB', 'WYNYARD', 'DJ', 'GRACE BROS', 'CIVIC', 'GPO'],
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
    dominantBlocks: ['goldencentury', 'bbqking', 'eastocean', 'marigold', 'hingfong', 'capitol', 'marketcity', 'paddy', 'goldshop', 'herbshop'],
    clutterTypes: ['crates', 'bins', 'steam', 'lanterns', 'bottles', 'dumpster'],
    signage: ['GOLDEN CENTURY', 'BBQ KING', 'EAST OCEAN', 'MARIGOLD', 'HING FONG', 'CAPITOL', 'PADDY MARKETS', 'MARKET CITY', '金'],
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
    // Authentic Central Station / Eddy Ave 1991 - notorious drug area
    dominantBlocks: ['centralstation', 'eddyave', 'railwaybuffet', 'salvation', 'derelict', 'boarded', 'alley', 'sexshop', 'redrooster', 'tab'],
    clutterTypes: ['trash', 'bottles', 'newsrack', 'phonebooth', 'busstop', 'puddles', 'dumpster', 'smoke', 'syringes'],
    signage: ['CENTRAL', 'EDDY AVE', 'RAILWAY BUFFET', 'SALVO', 'PLATFORM 1', 'CITY CIRCLE', 'RED ROOSTER', 'NEWSAGENT', 'TAB'],
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
    // Authentic Redfern / The Block 1991 - Indigenous community, poverty
    dominantBlocks: ['theblock', 'eveleigh', 'redfernstation', 'indigenous', 'hopetoun', 'courthouse', 'pawn', 'boarded', 'alley', 'bottleo'],
    clutterTypes: ['trash', 'bottles', 'crates', 'bins', 'puddles', 'posters', 'dumpster', 'smoke'],
    signage: ['THE BLOCK', 'EVELEIGH ST', 'REDFERN', 'HOPETOUN', 'COURTHOUSE', 'LAND RIGHTS', 'BOTTLE-O', 'CASH LOANS', 'PAWN'],
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
    // Authentic Cabramatta 1991 - Vietnamese community, heroin capital of Australia
    dominantBlocks: ['pho2000', 'thanbinh', 'goldshop', 'freedomplaza', 'cabrashops', 'herbalmed', 'arcade', 'butcher', 'fishmarket', 'alley'],
    clutterTypes: ['crates', 'bins', 'steam', 'trash', 'bottles', 'dumpster', 'puddles', 'syringes'],
    signage: ['PHỞ 2000', 'THÀNH BÌNH', 'VÀNG', 'FREEDOM PLAZA', 'TIỆM THUỐC', 'CABRA MALL', 'BÁNH MÌ', 'CÀ PHÊ', 'VÀNG 24K'],
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
