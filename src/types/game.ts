export interface GameStats {
  hunger: number;
  warmth: number;
  hope: number;
  fatigue: number;
  money: number;
  survivalTime: number;
}

export interface CarState {
  id: number;
  x: number;
  speed: number;
  isStopped: boolean;
  isEncounter: boolean;
  variant: number;
}

export interface GameState {
  stats: GameStats;
  playerX: number;
  playerDirection: 'left' | 'right';
  playerState: 'idle' | 'walking' | 'ducking' | 'collapsed';
  hasDog: boolean;
  dogHealth: number;
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
}

export type HotspotZone = 'ask-help' | 'bins' | 'services' | 'shelter' | 'sleep';

export type DesperationAction = 'theft' | 'car' | 'sell' | 'dog-sacrifice';

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

export const INITIAL_STATS: GameStats = {
  hunger: 70,
  warmth: 70,
  hope: 60,
  fatigue: 20,
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
};
