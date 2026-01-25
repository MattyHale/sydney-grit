import { District } from './districts';

export interface GameStats {
  hunger: number;
  warmth: number;
  hope: number;
  cocaine: number;
  lsd: number;
  money: number;
  survivalTime: number;
}

// Pedestrian action types
export type PedestrianAction = 'steal' | 'pitch' | 'trade' | 'hit';

export type PedestrianArchetype =
  | 'businessman' 
  | 'clubber' 
  | 'tourist' 
  | 'pensioner' 
  | 'backpacker' 
  | 'junkie' 
  | 'sexworker' 
  | 'student'
  | 'cop'
  | 'punk'
  | 'dealer';

export interface PedestrianState {
  id: number;
  x: number;
  speed: number;
  direction: 'left' | 'right';
  archetype: PedestrianArchetype;
  canBeStolen: boolean;
}

export interface CarState {
  id: number;
  x: number;
  speed: number;
  isStopped: boolean;
  isEncounter: boolean;
  variant: number;
}

export interface PoliceState {
  x: number;
  isActive: boolean;
  direction: 'left' | 'right';
}

export interface IbisState {
  x: number;
  isActive: boolean;
  hasEaten: boolean;
}

export type GameScreen = 'title' | 'playing';

export interface GameState {
  screen: GameScreen;
  stats: GameStats;
  playerX: number;
  playerDirection: 'left' | 'right';
  playerState: 'idle' | 'walking' | 'ducking' | 'collapsed';
  hasDog: boolean;
  dogHealth: number;
  dogSick: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  gameOverReason: string;
  currentZone: HotspotZone | null;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  isRaining: boolean;
  lastEventText: string;
  eventTextVisible: boolean;
  desperationAvailable: DesperationAction[];
  shelterOpen: boolean;
  servicesOpen: boolean;
  binsRestocked: boolean;
  cars: CarState[];
  carEncounterActive: boolean;
  carEncounterCount: number;
  pedestrians: PedestrianState[];
  stealWindowActive: boolean;
  stealTarget: PedestrianState | null;
  recentTheft: boolean;
  recentCarEncounter: boolean;
  recentViolence: boolean;
  police: PoliceState;
  ibis: IbisState;
  permanentHopeLoss: number;
  worldOffset: number;
  currentDistrict: District;
  // LSD state
  lsdTripActive: boolean;
  lsdTripTimeRemaining: number;
  // Pedestrian action window
  pedestrianActionAvailable: PedestrianAction[];
  // Action locking - prevents button swapping during press
  lockedButtons: ResolvedButtons | null;
  buttonLockTime: number;
}

export type HotspotZone = 'ask-help' | 'bins' | 'services' | 'shelter' | 'sleep' | 'alley' | 'food-vendor';

export type DesperationAction = 'theft' | 'car' | 'sell' | 'dog-sacrifice' | 'purse-steal' | 'buy-coke';

export interface Hotspot {
  zone: HotspotZone;
  x: number;
  width: number;
  label: string;
}

export const HOTSPOTS: Hotspot[] = [
  { zone: 'ask-help', x: 10, width: 12, label: 'Street' },
  { zone: 'bins', x: 25, width: 10, label: 'Bins' },
  { zone: 'alley', x: 36, width: 8, label: 'Alley' },
  { zone: 'food-vendor', x: 45, width: 10, label: 'Food' },
  { zone: 'services', x: 58, width: 12, label: 'Services' },
  { zone: 'shelter', x: 72, width: 10, label: 'Shelter' },
  { zone: 'sleep', x: 84, width: 10, label: 'Doorway' },
];

export const PEDESTRIAN_ARCHETYPES: PedestrianArchetype[] = [
  'businessman',
  'clubber', 
  'tourist',
  'pensioner',
  'backpacker',
  'junkie',
  'sexworker',
  'student',
  'cop',
  'punk',
  'dealer',
];

// Outcome biases per archetype
export const ARCHETYPE_STEAL_BIAS: Record<PedestrianArchetype, { moneyRange: [number, number]; shoutChance: number; kindnessChance: number }> = {
  businessman: { moneyRange: [10, 25], shoutChance: 0.3, kindnessChance: 0.05 },
  clubber: { moneyRange: [5, 15], shoutChance: 0.15, kindnessChance: 0.1 },
  tourist: { moneyRange: [8, 20], shoutChance: 0.4, kindnessChance: 0.08 },
  pensioner: { moneyRange: [3, 8], shoutChance: 0.5, kindnessChance: 0.15 },
  backpacker: { moneyRange: [2, 10], shoutChance: 0.2, kindnessChance: 0.12 },
  junkie: { moneyRange: [0, 3], shoutChance: 0.1, kindnessChance: 0.02 },
  sexworker: { moneyRange: [5, 15], shoutChance: 0.1, kindnessChance: 0.08 },
  student: { moneyRange: [2, 8], shoutChance: 0.25, kindnessChance: 0.2 },
  cop: { moneyRange: [0, 0], shoutChance: 0.95, kindnessChance: 0.0 },
  punk: { moneyRange: [1, 6], shoutChance: 0.05, kindnessChance: 0.15 },
  dealer: { moneyRange: [15, 40], shoutChance: 0.7, kindnessChance: 0.0 }, // Dealers fight back hard
};

export const INITIAL_STATS: GameStats = {
  hunger: 55,      // Lower start - creates urgency early
  warmth: 60,      // Moderate start
  hope: 50,        // Lower start - hope is precious
  cocaine: 0,
  lsd: 0,
  money: 8,        // Slightly more starting cash for first action
  survivalTime: 0,
};

// Archetype response to pedestrian actions
export const ARCHETYPE_ACTION_BIAS: Record<PedestrianArchetype, {
  pitchSuccess: number;
  tradeWilling: number;
  fightBack: number;
}> = {
  businessman: { pitchSuccess: 0.4, tradeWilling: 0.1, fightBack: 0.2 },
  clubber: { pitchSuccess: 0.2, tradeWilling: 0.3, fightBack: 0.4 },
  tourist: { pitchSuccess: 0.3, tradeWilling: 0.15, fightBack: 0.1 },
  pensioner: { pitchSuccess: 0.15, tradeWilling: 0.05, fightBack: 0.05 },
  backpacker: { pitchSuccess: 0.25, tradeWilling: 0.2, fightBack: 0.15 },
  junkie: { pitchSuccess: 0.05, tradeWilling: 0.4, fightBack: 0.5 },
  sexworker: { pitchSuccess: 0.1, tradeWilling: 0.6, fightBack: 0.3 },
  student: { pitchSuccess: 0.35, tradeWilling: 0.15, fightBack: 0.2 },
  cop: { pitchSuccess: 0.0, tradeWilling: 0.0, fightBack: 0.95 },
  punk: { pitchSuccess: 0.15, tradeWilling: 0.35, fightBack: 0.6 },
  dealer: { pitchSuccess: 0.0, tradeWilling: 1.0, fightBack: 0.8 }, // Dealers trade drugs, dangerous
};

// Button action resolution types
export type ButtonActionType = 'car-encounter' | 'dealer' | 'lsd' | 'pedestrian' | 'steal' | 'desperation' | 'zone' | 'none';

export interface ButtonAction {
  type: ButtonActionType;
  action?: string;
  label: string;
}

export interface ResolvedButtons {
  A: ButtonAction;
  B: ButtonAction;
  C: ButtonAction;
}

export const INITIAL_STATE: GameState = {
  screen: 'title',
  stats: { ...INITIAL_STATS },
  playerX: 50,
  playerDirection: 'right',
  playerState: 'idle',
  hasDog: true,
  dogHealth: 100,
  dogSick: false,
  isPaused: false,
  isGameOver: false,
  gameOverReason: '',
  currentZone: null,
  timeOfDay: 'day',
  isRaining: false,
  lastEventText: '',
  eventTextVisible: false,
  desperationAvailable: [],
  shelterOpen: false,
  servicesOpen: true,
  binsRestocked: true,
  cars: [],
  carEncounterActive: false,
  carEncounterCount: 0,
  pedestrians: [],
  stealWindowActive: false,
  stealTarget: null,
  recentTheft: false,
  recentCarEncounter: false,
  recentViolence: false,
  police: { x: -20, isActive: false, direction: 'right' },
  ibis: { x: 27, isActive: false, hasEaten: false },
  permanentHopeLoss: 0,
  worldOffset: 0,
  currentDistrict: 'cross',
  lsdTripActive: false,
  lsdTripTimeRemaining: 0,
  pedestrianActionAvailable: [],
  lockedButtons: null,
  buttonLockTime: 0,
};
