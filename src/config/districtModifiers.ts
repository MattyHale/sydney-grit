// District economy modifiers and spawn tables
// Tuning reference for survival economy per district

import { District } from '@/types/districts';
import { PedestrianArchetype } from '@/types/game';

export interface DistrictModifiers {
  // Economy biases (Low=0.2, Medium=0.5, High=0.8, Very High=1.0)
  food: number;
  sexTrade: number;
  theft: number;
  drugs: number;
  cops: number;
  kindness: number;
  shelter: number;
  violence: number;
  gambling: number;
  pitch: number; // Founder pitch success
  dogsIbis: number;
}

export interface PersonaSpawnWeight {
  archetype: PedestrianArchetype;
  weight: number;
}

// District modifier matrix (from tuning reference)
export const DISTRICT_MODIFIERS: Record<District, DistrictModifiers> = {
  cross: {
    food: 0.5,
    sexTrade: 0.9,
    theft: 0.5,
    drugs: 0.9,
    cops: 0.7,
    kindness: 0.2,
    shelter: 0.2,
    violence: 0.4,
    gambling: 0.3,
    pitch: 0.3,
    dogsIbis: 0.5,
  },
  oxford: {
    food: 0.7,
    sexTrade: 0.5,
    theft: 0.5,
    drugs: 0.5,
    cops: 0.5,
    kindness: 0.5,
    shelter: 0.3,
    violence: 0.3,
    gambling: 0.2,
    pitch: 0.4,
    dogsIbis: 0.3,
  },
  cbd: {
    food: 0.5,
    sexTrade: 0.2,
    theft: 0.5,
    drugs: 0.2,
    cops: 0.9,
    kindness: 0.3,
    shelter: 0.8,
    violence: 0.2,
    gambling: 0.4,
    pitch: 0.9,
    dogsIbis: 0.3,
  },
  chinatown: {
    food: 1.0,
    sexTrade: 0.2,
    theft: 0.6,
    drugs: 0.3,
    cops: 0.5,
    kindness: 0.5,
    shelter: 0.3,
    violence: 0.3,
    gambling: 0.4,
    pitch: 0.3,
    dogsIbis: 0.5,
  },
  central: {
    food: 0.5,
    sexTrade: 0.8,
    theft: 0.9,
    drugs: 0.7,
    cops: 0.9,
    kindness: 0.2,
    shelter: 0.5,
    violence: 0.7,
    gambling: 0.3,
    pitch: 0.2,
    dogsIbis: 0.6,
  },
  surryHills: {
    food: 0.5,
    sexTrade: 0.2,
    theft: 0.4,
    drugs: 0.5,
    cops: 0.4,
    kindness: 0.6,
    shelter: 0.4,
    violence: 0.2,
    gambling: 0.2,
    pitch: 0.7,
    dogsIbis: 0.5,
  },
  cabramatta: {
    food: 1.0,
    sexTrade: 0.2,
    theft: 0.5,
    drugs: 0.6,
    cops: 0.5,
    kindness: 0.6,
    shelter: 0.5,
    violence: 0.5,
    gambling: 0.3,
    pitch: 0.2,
    dogsIbis: 0.5,
  },
  parramatta: {
    food: 0.5,
    sexTrade: 0.2,
    theft: 0.5,
    drugs: 0.5,
    cops: 0.5,
    kindness: 0.4,
    shelter: 0.5,
    violence: 0.4,
    gambling: 0.8,
    pitch: 0.3,
    dogsIbis: 0.3,
  },
  mountDruitt: {
    food: 0.4,
    sexTrade: 0.3,
    theft: 0.7,
    drugs: 0.8,
    cops: 0.7,
    kindness: 0.2,
    shelter: 0.2,
    violence: 0.9,
    gambling: 0.6,
    pitch: 0.1,
    dogsIbis: 0.8,
  },
  redfern: {
    food: 0.3,
    sexTrade: 0.4,
    theft: 0.8,
    drugs: 0.8,
    cops: 0.6,
    kindness: 0.2,
    shelter: 0.3,
    violence: 0.8,
    gambling: 0.4,
    pitch: 0.1,
    dogsIbis: 0.9,
  },
};

// Persona spawn tables per district
export const DISTRICT_SPAWN_TABLES: Record<District, PersonaSpawnWeight[]> = {
  cross: [
    { archetype: 'backpacker', weight: 0.18 },
    { archetype: 'sexworker', weight: 0.2 },
    { archetype: 'dealer', weight: 0.12 },
    { archetype: 'clubber', weight: 0.15 },
    { archetype: 'cop', weight: 0.08 },
    { archetype: 'junkie', weight: 0.1 },
    { archetype: 'tourist', weight: 0.08 },
    { archetype: 'punk', weight: 0.05 },
    { archetype: 'founder', weight: 0.02 },
    { archetype: 'vc', weight: 0.02 },
  ],
  oxford: [
    { archetype: 'clubber', weight: 0.25 },
    { archetype: 'student', weight: 0.15 },
    { archetype: 'punk', weight: 0.12 },
    { archetype: 'tourist', weight: 0.1 },
    { archetype: 'sexworker', weight: 0.08 },
    { archetype: 'cop', weight: 0.06 },
    { archetype: 'dealer', weight: 0.06 },
    { archetype: 'backpacker', weight: 0.08 },
    { archetype: 'pensioner', weight: 0.05 },
    { archetype: 'founder', weight: 0.05 },
  ],
  cbd: [
    { archetype: 'businessman', weight: 0.3 },
    { archetype: 'tourist', weight: 0.18 },
    { archetype: 'vc', weight: 0.12 },
    { archetype: 'founder', weight: 0.1 },
    { archetype: 'cop', weight: 0.1 },
    { archetype: 'student', weight: 0.08 },
    { archetype: 'pensioner', weight: 0.06 },
    { archetype: 'backpacker', weight: 0.04 },
    { archetype: 'junkie', weight: 0.02 },
  ],
  chinatown: [
    { archetype: 'tourist', weight: 0.25 },
    { archetype: 'pensioner', weight: 0.18 },
    { archetype: 'student', weight: 0.15 },
    { archetype: 'businessman', weight: 0.12 },
    { archetype: 'backpacker', weight: 0.1 },
    { archetype: 'clubber', weight: 0.08 },
    { archetype: 'cop', weight: 0.05 },
    { archetype: 'founder', weight: 0.04 },
    { archetype: 'dealer', weight: 0.03 },
  ],
  central: [
    { archetype: 'junkie', weight: 0.2 },
    { archetype: 'student', weight: 0.15 },
    { archetype: 'backpacker', weight: 0.12 },
    { archetype: 'cop', weight: 0.12 },
    { archetype: 'businessman', weight: 0.1 },
    { archetype: 'sexworker', weight: 0.08 },
    { archetype: 'dealer', weight: 0.08 },
    { archetype: 'tourist', weight: 0.08 },
    { archetype: 'pensioner', weight: 0.05 },
    { archetype: 'punk', weight: 0.02 },
  ],
  surryHills: [
    { archetype: 'student', weight: 0.2 },
    { archetype: 'founder', weight: 0.15 },
    { archetype: 'punk', weight: 0.12 },
    { archetype: 'clubber', weight: 0.1 },
    { archetype: 'businessman', weight: 0.1 },
    { archetype: 'tourist', weight: 0.08 },
    { archetype: 'backpacker', weight: 0.08 },
    { archetype: 'dealer', weight: 0.06 },
    { archetype: 'vc', weight: 0.06 },
    { archetype: 'pensioner', weight: 0.05 },
  ],
  cabramatta: [
    { archetype: 'pensioner', weight: 0.2 },
    { archetype: 'student', weight: 0.15 },
    { archetype: 'dealer', weight: 0.12 },
    { archetype: 'businessman', weight: 0.1 },
    { archetype: 'junkie', weight: 0.1 },
    { archetype: 'cop', weight: 0.1 },
    { archetype: 'backpacker', weight: 0.08 },
    { archetype: 'tourist', weight: 0.08 },
    { archetype: 'punk', weight: 0.05 },
    { archetype: 'founder', weight: 0.02 },
  ],
  parramatta: [
    { archetype: 'businessman', weight: 0.18 },
    { archetype: 'student', weight: 0.15 },
    { archetype: 'pensioner', weight: 0.12 },
    { archetype: 'punk', weight: 0.1 },
    { archetype: 'clubber', weight: 0.1 },
    { archetype: 'cop', weight: 0.1 },
    { archetype: 'tourist', weight: 0.08 },
    { archetype: 'backpacker', weight: 0.07 },
    { archetype: 'dealer', weight: 0.05 },
    { archetype: 'junkie', weight: 0.05 },
  ],
  mountDruitt: [
    { archetype: 'punk', weight: 0.2 },
    { archetype: 'junkie', weight: 0.15 },
    { archetype: 'dealer', weight: 0.12 },
    { archetype: 'cop', weight: 0.12 },
    { archetype: 'student', weight: 0.1 },
    { archetype: 'pensioner', weight: 0.1 },
    { archetype: 'sexworker', weight: 0.08 },
    { archetype: 'backpacker', weight: 0.05 },
    { archetype: 'businessman', weight: 0.05 },
    { archetype: 'clubber', weight: 0.03 },
  ],
  redfern: [
    { archetype: 'junkie', weight: 0.22 },
    { archetype: 'punk', weight: 0.15 },
    { archetype: 'student', weight: 0.12 },
    { archetype: 'dealer', weight: 0.12 },
    { archetype: 'sexworker', weight: 0.1 },
    { archetype: 'cop', weight: 0.08 },
    { archetype: 'pensioner', weight: 0.08 },
    { archetype: 'backpacker', weight: 0.05 },
    { archetype: 'founder', weight: 0.05 },
    { archetype: 'clubber', weight: 0.03 },
  ],
};

// Time-of-day modifiers
export interface TimeModifiers {
  crimeMultiplier: number;
  crowdDensity: number;
  serviceAvailable: boolean;
  neonIntensity: number;
}

export const TIME_MODIFIERS: Record<'dawn' | 'day' | 'dusk' | 'night', TimeModifiers> = {
  dawn: {
    crimeMultiplier: 0.4,
    crowdDensity: 0.3,
    serviceAvailable: false,
    neonIntensity: 0.2,
  },
  day: {
    crimeMultiplier: 0.5,
    crowdDensity: 0.7,
    serviceAvailable: true,
    neonIntensity: 0.1,
  },
  dusk: {
    crimeMultiplier: 0.8,
    crowdDensity: 0.9,
    serviceAvailable: true,
    neonIntensity: 0.8,
  },
  night: {
    crimeMultiplier: 1.0,
    crowdDensity: 0.6,
    serviceAvailable: false,
    neonIntensity: 1.0,
  },
};

// Collapse messages
export const COLLAPSE_MESSAGES: Record<string, string> = {
  hunger: "You starved.",
  warmth: "You froze.",
  hope: "You stopped trying.",
  cokeWithdrawal: "Your body gave out.",
  overdose: "Your heart couldn't keep up.",
  arrested: "You were taken off the street.",
  violence: "You picked the wrong fight.",
  disappeared: "You didn't come back.",
};

// Get effective modifier based on district and time
export function getEffectiveModifier(
  district: District,
  modifier: keyof DistrictModifiers,
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night'
): number {
  const baseValue = DISTRICT_MODIFIERS[district][modifier];
  const timeMod = TIME_MODIFIERS[timeOfDay];
  
  // Apply time-based adjustments
  if (modifier === 'theft' || modifier === 'violence' || modifier === 'drugs' || modifier === 'sexTrade') {
    return baseValue * timeMod.crimeMultiplier;
  }
  if (modifier === 'shelter' || modifier === 'pitch') {
    return baseValue * (timeMod.serviceAvailable ? 1.0 : 0.3);
  }
  
  return baseValue;
}

// Weighted random selection from spawn table
export function selectRandomArchetype(district: District): PedestrianArchetype {
  const table = DISTRICT_SPAWN_TABLES[district];
  const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const entry of table) {
    random -= entry.weight;
    if (random <= 0) {
      return entry.archetype;
    }
  }
  
  return table[0].archetype;
}
