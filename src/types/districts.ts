// District types for Sydney 1991
export type District = 'cross' | 'oxford' | 'cbd' | 'chinatown' | 'central' | 'redfern';

// District sequence for belt looping
export const DISTRICT_SEQUENCE: District[] = ['cross', 'oxford', 'cbd', 'chinatown', 'central', 'redfern'];

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
      businessman: 0.05,
      clubber: 0.15,
      tourist: 0.1,
      pensioner: 0.02,
      backpacker: 0.22,
      junkie: 0.15,
      sexworker: 0.2,
      student: 0.08,
      cop: 0.03,
    },
    sexEconomyMultiplier: 1.5,
    foodMultiplier: 0.5,
    servicesMultiplier: 0.6,
    theftMultiplier: 0.8,
    kindnessMultiplier: 0.4,
    dangerMultiplier: 0.7,
    dealerFrequency: 0.9,
    pitchMultiplier: 0.5,
    tradeMultiplier: 1.5,
    violenceMultiplier: 0.6,
    lsdFrequency: 0.3,
    policeFrequency: 0.8,
    dogFrequency: 0.3,
    ibisFrequency: 0.2,
    dominantBlocks: ['stripclub', 'bar', 'hostel', 'motel', 'alley', 'club'],
    clutterTypes: ['neon', 'bottles', 'trash', 'posters', 'puddles', 'crates', 'smoke', 'dumpster'],
    signage: ['XXX', 'GIRLS', 'CLUB', 'BAR', '24HR', 'HOSTEL', 'MOTEL', 'LIVE', 'SHOW'],
  },
  oxford: {
    neonIntensity: 0.8,
    warmth: 0.5,
    brightness: 0.5,
    pedestrianDensity: 0.85,
    archetypeWeights: {
      businessman: 0.05,
      clubber: 0.33,
      tourist: 0.1,
      pensioner: 0.02,
      backpacker: 0.1,
      junkie: 0.08,
      sexworker: 0.1,
      student: 0.2,
      cop: 0.02,
    },
    sexEconomyMultiplier: 0.8,
    foodMultiplier: 0.8,
    servicesMultiplier: 0.5,
    theftMultiplier: 0.6,
    kindnessMultiplier: 0.7,
    dangerMultiplier: 0.5,
    dealerFrequency: 0.4,
    pitchMultiplier: 0.6,
    tradeMultiplier: 0.8,
    violenceMultiplier: 0.5,
    lsdFrequency: 0.4,
    policeFrequency: 0.5,
    dogFrequency: 0.2,
    ibisFrequency: 0.3,
    dominantBlocks: ['bar', 'kebab', 'club', 'shop', 'convenience'],
    clutterTypes: ['bottles', 'kebabvan', 'posters', 'crates', 'busstop', 'neon', 'puddles', 'cone'],
    signage: ['PUB', 'KEBAB', 'DANCE', 'CLUB', 'BAR', 'CAFE', 'PIZZA', 'LATE'],
  },
  cbd: {
    neonIntensity: 0.3,
    warmth: 0.2,
    brightness: 0.7,
    pedestrianDensity: 0.6,
    archetypeWeights: {
      businessman: 0.35,
      clubber: 0.05,
      tourist: 0.22,
      pensioner: 0.1,
      backpacker: 0.05,
      junkie: 0.05,
      sexworker: 0.02,
      student: 0.08,
      cop: 0.08,
    },
    sexEconomyMultiplier: 0.2,
    foodMultiplier: 0.6,
    servicesMultiplier: 1.5,
    theftMultiplier: 0.5,
    kindnessMultiplier: 0.5,
    dangerMultiplier: 0.3,
    dealerFrequency: 0.1,
    pitchMultiplier: 1.2,
    tradeMultiplier: 0.2,
    violenceMultiplier: 0.3,
    lsdFrequency: 0.1,
    policeFrequency: 1.0,
    dogFrequency: 0.1,
    ibisFrequency: 0.4,
    dominantBlocks: ['services', 'shelter', 'pawn', 'office', 'newsagent', 'bottleo'],
    clutterTypes: ['newsrack', 'phonebooth', 'busstop', 'bins', 'crates', 'cone'],
    signage: ['SERVICES', 'SHELTER', 'CASH', 'PAWN', 'BOTTLE-O', 'NEWS', 'BANK', 'ATM'],
  },
  chinatown: {
    neonIntensity: 0.6,
    warmth: 0.9,
    brightness: 0.6,
    pedestrianDensity: 0.8,
    archetypeWeights: {
      businessman: 0.1,
      clubber: 0.1,
      tourist: 0.32,
      pensioner: 0.15,
      backpacker: 0.1,
      junkie: 0.05,
      sexworker: 0.02,
      student: 0.13,
      cop: 0.03,
    },
    sexEconomyMultiplier: 0.1,
    foodMultiplier: 1.8,
    servicesMultiplier: 0.4,
    theftMultiplier: 0.4,
    kindnessMultiplier: 0.8,
    dangerMultiplier: 0.2,
    dealerFrequency: 0.15,
    pitchMultiplier: 0.3,
    tradeMultiplier: 0.1,
    violenceMultiplier: 0.4,
    lsdFrequency: 0.05,
    policeFrequency: 0.4,
    dogFrequency: 0.1,
    ibisFrequency: 0.5,
    dominantBlocks: ['restaurant', 'foodstall', 'shop', 'soup'],
    clutterTypes: ['crates', 'bins', 'steam', 'lanterns', 'bottles', 'dumpster'],
    signage: ['食', 'BBQ', 'NOODLE', 'DIM SUM', 'RICE', 'WOK', 'TEA', '面'],
  },
  central: {
    neonIntensity: 0.2,
    warmth: 0.3,
    brightness: 0.4,
    pedestrianDensity: 0.5,
    archetypeWeights: {
      businessman: 0.15,
      clubber: 0.05,
      tourist: 0.08,
      pensioner: 0.1,
      backpacker: 0.08,
      junkie: 0.28,
      sexworker: 0.05,
      student: 0.15,
      cop: 0.06,
    },
    sexEconomyMultiplier: 0.3,
    foodMultiplier: 0.4,
    servicesMultiplier: 0.7,
    theftMultiplier: 1.5,
    kindnessMultiplier: 0.2,
    dangerMultiplier: 0.9,
    dealerFrequency: 0.6,
    pitchMultiplier: 0.2,
    tradeMultiplier: 0.5,
    violenceMultiplier: 1.0,
    lsdFrequency: 0.5,
    policeFrequency: 1.2,
    dogFrequency: 0.4,
    ibisFrequency: 0.6,
    dominantBlocks: ['station', 'alley', 'bins', 'tab', 'newsagent', 'convenience'],
    clutterTypes: ['trash', 'bottles', 'newsrack', 'phonebooth', 'busstop', 'puddles', 'dumpster', 'smoke'],
    signage: ['TRAINS', 'EXIT', 'TAB', 'NEWS', 'TICKETS', 'PLATFORM', 'CENTRAL'],
  },
  redfern: {
    neonIntensity: 0.1,
    warmth: 0.2,
    brightness: 0.3,
    pedestrianDensity: 0.35,
    archetypeWeights: {
      businessman: 0.02,
      clubber: 0.02,
      tourist: 0.02,
      pensioner: 0.15,
      backpacker: 0.02,
      junkie: 0.42,
      sexworker: 0.12,
      student: 0.18,
      cop: 0.05,
    },
    sexEconomyMultiplier: 0.4,
    foodMultiplier: 0.3,
    servicesMultiplier: 0.3,
    theftMultiplier: 1.2,
    kindnessMultiplier: 0.1,
    dangerMultiplier: 1.0,
    dealerFrequency: 0.85,
    pitchMultiplier: 0.0,
    tradeMultiplier: 0.6,
    violenceMultiplier: 1.2,
    lsdFrequency: 0.6,
    policeFrequency: 0.8,
    dogFrequency: 0.8,
    ibisFrequency: 0.9,
    dominantBlocks: ['bins', 'pawn', 'tab', 'boarded', 'alley', 'bottleo'],
    clutterTypes: ['trash', 'bottles', 'crates', 'bins', 'puddles', 'posters', 'dumpster', 'smoke'],
    signage: ['TAB', 'PAWN', 'CASH', 'BOTTLE-O', 'LOANS', 'BUY'],
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
