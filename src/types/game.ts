import { District } from './districts';

export interface GameStats {
  hunger: number;
  warmth: number;
  hope: number;
  cocaine: number;
  money: number;
  survivalTime: number;
}

export type PedestrianArchetype =
  | 'businessman' 
  | 'clubber' 
  | 'tourist' 
  | 'pensioner' 
  | 'backpacker' 
  | 'junkie' 
  | 'sexworker' 
  | 'student';

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

export interface GameState {
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
  police: PoliceState;
  ibis: IbisState;
  permanentHopeLoss: number;
  worldOffset: number; // For infinite scrolling
  currentDistrict: District;
}

export type HotspotZone = 'ask-help' | 'bins' | 'services' | 'shelter' | 'sleep';

export type DesperationAction = 'theft' | 'car' | 'sell' | 'dog-sacrifice' | 'purse-steal';

export interface Hotspot {
  zone: HotspotZone;
  x: number;
  width: number;
  label: string;
}

export const HOTSPOTS: Hotspot[] = [
  { zone: 'ask-help', x: 10, width: 12, label: 'Street' },
  { zone: 'bins', x: 25, width: 10, label: 'Bins' },
  { zone: 'services', x: 40, width: 12, label: 'Services' },
  { zone: 'shelter', x: 55, width: 12, label: 'Shelter' },
  { zone: 'sleep', x: 75, width: 15, label: 'Doorway' },
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
};

export const INITIAL_STATS: GameStats = {
  hunger: 70,
  warmth: 70,
  hope: 60,
  cocaine: 0,
  money: 5,
  survivalTime: 0,
};

export const INITIAL_STATE: GameState = {
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
  police: { x: -20, isActive: false, direction: 'right' },
  ibis: { x: 27, isActive: false, hasEaten: false },
  permanentHopeLoss: 0,
  worldOffset: 0,
  currentDistrict: 'cross',
};
