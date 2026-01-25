import { District } from './districts';

export type FundingStage = 'bootstrap' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'series-d' | 'ipo';

export interface GameStats {
  hunger: number;      // Energy/burnout
  warmth: number;      // Confidence/composure  
  hope: number;        // Investor confidence / mental state
  cocaine: number;
  lsd: number;
  money: number;       // Cash on hand (runway)
  survivalTime: number;
  // Startup founder specific
  hasWatch: boolean;
  hasLaptop: boolean;
  hasPhone: boolean;
  burnRate: number;    // Monthly burn rate
  fundingStage: FundingStage;  // Current funding stage
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
  | 'dealer'
  | 'vc'           // Venture capitalist
  | 'founder';     // Fellow founder

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

export type TransactionType = 'money' | 'steal' | 'drugs' | 'hope' | 'fail' | 'danger';

export interface TransactionFeedback {
  type: TransactionType;
  amount?: string;
}
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
  // In alley - enables dealer actions
  inAlley: boolean;
  dealerNearby: boolean;
  // Transaction feedback
  lastTransaction: TransactionFeedback | null;
  // Shop interior state
  inShop: boolean;
  currentShop: HotspotZone | null;
}

export type HotspotZone = 'ask-help' | 'bins' | 'services' | 'shelter' | 'sleep' | 'alley' | 'food-vendor' | 'vc-firm' | 'strip-club' | 'bar' | 'pawn' | 'cafe';

export type DesperationAction = 'theft' | 'car' | 'sell' | 'dog-sacrifice' | 'purse-steal' | 'buy-coke';

export interface Hotspot {
  zone: HotspotZone;
  x: number;
  width: number;
  label: string;
}

export const HOTSPOTS: Hotspot[] = [
  { zone: 'vc-firm', x: 5, width: 8, label: 'VC' },
  { zone: 'cafe', x: 14, width: 7, label: 'Cafe' },
  { zone: 'bar', x: 22, width: 8, label: 'Bar' },
  { zone: 'alley', x: 31, width: 6, label: 'Alley' },
  { zone: 'strip-club', x: 38, width: 9, label: 'Club' },
  { zone: 'food-vendor', x: 48, width: 8, label: 'Dining' },
  { zone: 'services', x: 57, width: 10, label: 'Hub' },
  { zone: 'pawn', x: 68, width: 8, label: 'Pawn' },
  { zone: 'shelter', x: 77, width: 8, label: 'Hotel' },
  { zone: 'sleep', x: 86, width: 8, label: 'Office' },
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
  'vc',
  'founder',
];

// Outcome biases per archetype
export const ARCHETYPE_STEAL_BIAS: Record<PedestrianArchetype, { moneyRange: [number, number]; shoutChance: number; kindnessChance: number }> = {
  businessman: { moneyRange: [50, 200], shoutChance: 0.4, kindnessChance: 0.05 },
  clubber: { moneyRange: [20, 80], shoutChance: 0.15, kindnessChance: 0.1 },
  tourist: { moneyRange: [100, 300], shoutChance: 0.5, kindnessChance: 0.08 },
  pensioner: { moneyRange: [10, 50], shoutChance: 0.6, kindnessChance: 0.15 },
  backpacker: { moneyRange: [20, 60], shoutChance: 0.2, kindnessChance: 0.12 },
  junkie: { moneyRange: [0, 20], shoutChance: 0.1, kindnessChance: 0.02 },
  sexworker: { moneyRange: [30, 100], shoutChance: 0.1, kindnessChance: 0.08 },
  student: { moneyRange: [10, 40], shoutChance: 0.25, kindnessChance: 0.2 },
  cop: { moneyRange: [0, 0], shoutChance: 0.95, kindnessChance: 0.0 },
  punk: { moneyRange: [5, 30], shoutChance: 0.05, kindnessChance: 0.15 },
  dealer: { moneyRange: [200, 500], shoutChance: 0.8, kindnessChance: 0.0 },
  vc: { moneyRange: [500, 2000], shoutChance: 0.6, kindnessChance: 0.1 }, // VCs carry lots of cash
  founder: { moneyRange: [20, 100], shoutChance: 0.2, kindnessChance: 0.3 }, // Founders are sympathetic
};

export const INITIAL_STATS: GameStats = {
  hunger: 70,        // Energy level
  warmth: 80,        // Confidence
  hope: 60,          // Investor confidence
  cocaine: 0,
  lsd: 0,
  money: 5000,       // Starting runway (in dollars, displayed as $5K)
  survivalTime: 0,
  hasWatch: true,
  hasLaptop: true,
  hasPhone: true,
  burnRate: 500,     // Losing $500/tick (monthly burn)
  fundingStage: 'bootstrap',
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
  dealer: { pitchSuccess: 0.0, tradeWilling: 1.0, fightBack: 0.8 },
  vc: { pitchSuccess: 0.5, tradeWilling: 0.0, fightBack: 0.1 },      // VCs love pitches
  founder: { pitchSuccess: 0.3, tradeWilling: 0.4, fightBack: 0.15 }, // Founders network
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
  inAlley: false,
  dealerNearby: false,
  lastTransaction: null,
  inShop: false,
  currentShop: null,
};
