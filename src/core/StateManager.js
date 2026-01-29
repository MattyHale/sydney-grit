import districts from "../config/districts.json";
import economyConfig from "../config/economy.json";
import spawnRates from "../config/spawnRates.json";
import eventsConfig from "../config/events.json";

export default class StateManager {
  constructor() {
    this.time = 0;
    this.delta = 0;
    this.entities = [];
    this.eventQueue = [];
    this.input = {
      keys: new Map(),
      queue: [],
      longPressThresholdMs: 350,
    };
    this.world = {
      width: 3000,
      height: 540,
      scrollX: 0,
      districtIndex: 0,
    };
    this.districts = districts;
    this.spawnRates = spawnRates;
    this.eventsConfig = eventsConfig;
    this.economy = {
      hunger: economyConfig.hunger.start,
      warmth: economyConfig.warmth.start,
      hope: economyConfig.hope.start,
      money: economyConfig.money.start,
      drugs: {},
      status: new Set(),
      decay: {
        hunger: economyConfig.hunger.decayRate,
        warmth: economyConfig.warmth.decayRate,
        hope: economyConfig.hope.decayRate,
      },
    };
    this.randomSeed = 1337;
    this.effects = { lsd: false };
    this.weather = { rain: false, timer: 0 };
    this.popups = [];
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  removeEntity(entity) {
    this.entities = this.entities.filter((item) => item !== entity);
  }

  setDelta(delta) {
    this.delta = delta;
    this.time += delta;
  }

  nextRandom() {
    this.randomSeed = (this.randomSeed * 16807) % 2147483647;
    return (this.randomSeed - 1) / 2147483646;
  }
}
