import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  GameState, 
  INITIAL_STATE, 
  HOTSPOTS, 
  HotspotZone,
  DesperationAction,
  CarState,
  PedestrianState,
  PEDESTRIAN_ARCHETYPES,
  ARCHETYPE_STEAL_BIAS,
  PedestrianArchetype
} from '@/types/game';
import { getDistrictFromOffset, DISTRICT_CONFIGS } from '@/types/districts';

export function useGameState() {
  const [state, setState] = useState<GameState>({ ...INITIAL_STATE });
  const eventTimeoutRef = useRef<number | null>(null);
  const carIdRef = useRef(0);
  const pedIdRef = useRef(0);
  const dogLowHungerTimeRef = useRef(0);

  const showEvent = useCallback((text: string) => {
    if (eventTimeoutRef.current) {
      clearTimeout(eventTimeoutRef.current);
    }
    setState(s => ({ ...s, lastEventText: text, eventTextVisible: true }));
    eventTimeoutRef.current = window.setTimeout(() => {
      setState(s => ({ ...s, eventTextVisible: false }));
    }, 3000);
  }, []);

  const updatePlayerPosition = useCallback((delta: number) => {
    setState(s => {
      if (s.isGameOver || s.isPaused || s.playerState === 'collapsed') return s;
      
      const newX = Math.max(5, Math.min(90, s.playerX + delta));
      const direction = delta > 0 ? 'right' : 'left';
      
      // Check which zone player is in
      let currentZone: HotspotZone | null = null;
      for (const hotspot of HOTSPOTS) {
        if (newX >= hotspot.x && newX <= hotspot.x + hotspot.width) {
          currentZone = hotspot.zone;
          break;
        }
      }
      
      // Update world offset for infinite scroll effect
      const newWorldOffset = s.worldOffset + (delta * 2.5); // Faster scrolling
      const newDistrict = getDistrictFromOffset(newWorldOffset);

      return {
        ...s,
        playerX: newX,
        playerDirection: direction,
        playerState: 'walking',
        currentZone,
        worldOffset: newWorldOffset,
        currentDistrict: newDistrict,
      };
    });
  }, []);

  const stopWalking = useCallback(() => {
    setState(s => {
      if (s.playerState === 'walking') {
        return { ...s, playerState: 'idle' };
      }
      return s;
    });
  }, []);

  const setDucking = useCallback((ducking: boolean) => {
    setState(s => {
      if (s.isGameOver || s.playerState === 'collapsed') return s;
      return { ...s, playerState: ducking ? 'ducking' : 'idle' };
    });
  }, []);

  const togglePause = useCallback(() => {
    setState(s => {
      if (s.isGameOver) return s;
      return { ...s, isPaused: !s.isPaused };
    });
  }, []);

  const triggerGameOver = useCallback((reason: string) => {
    setState(s => ({
      ...s,
      isGameOver: true,
      isPaused: false,
      playerState: 'collapsed',
      gameOverReason: reason,
    }));
  }, []);

  const restartGame = useCallback(() => {
    dogLowHungerTimeRef.current = 0;
    setState({ ...INITIAL_STATE });
  }, []);

  const performAction = useCallback((zone: HotspotZone) => {
    setState(s => {
      if (s.isGameOver || s.isPaused) return s;
      
      const newState = { ...s, stats: { ...s.stats } };
      const districtConfig = DISTRICT_CONFIGS[s.currentDistrict];
      
      switch (zone) {
        case 'ask-help': {
          const kindnessChance = 0.3 * districtConfig.kindnessMultiplier;
          const roll = Math.random();
          if (roll < kindnessChance) {
            const money = Math.floor(Math.random() * 3 * districtConfig.kindnessMultiplier) + 1;
            newState.stats.money += money;
            newState.stats.hope = Math.min(100, newState.stats.hope + 5);
            showEvent('Someone gave you a few dollars.');
          } else if (roll < kindnessChance + 0.2) {
            newState.stats.hope = Math.min(100, newState.stats.hope + 3);
            showEvent('A passerby offered kind words.');
          } else {
            newState.stats.hope = Math.max(0, newState.stats.hope - 2);
            showEvent('People walked past without stopping.');
          }
          break;
        }
        case 'bins': {
          // Ibis mechanic - if ibis is active and has eaten
          if (s.ibis.isActive && s.ibis.hasEaten) {
            showEvent('An ibis picked the bins clean before you.');
            newState.stats.fatigue = Math.min(100, newState.stats.fatigue + 5);
            break;
          }
          
          if (s.binsRestocked) {
            const roll = Math.random();
            if (s.ibis.isActive && roll < 0.3) {
              // Ibis gets some but not all
              newState.stats.hunger = Math.min(100, newState.stats.hunger + 5);
              showEvent('An ibis got most of it. You found some scraps.');
            } else if (roll < 0.4) {
              newState.stats.hunger = Math.min(100, newState.stats.hunger + 15);
              showEvent('You found some stale bread in the bins.');
            } else if (roll < 0.7) {
              newState.stats.hunger = Math.min(100, newState.stats.hunger + 8);
              showEvent('You found half a sandwich. It was cold.');
            } else {
              showEvent('The bins were mostly empty.');
            }
            newState.binsRestocked = false;
          } else {
            showEvent('The bins are empty. Check back later.');
          }
          newState.stats.fatigue = Math.min(100, newState.stats.fatigue + 5);
          break;
        }
        case 'services': {
          const servicesChance = 0.4 * districtConfig.servicesMultiplier;
          if (s.servicesOpen) {
            const roll = Math.random();
            if (roll < servicesChance) {
              const hungerBoost = Math.floor(25 * districtConfig.foodMultiplier);
              newState.stats.hunger = Math.min(100, newState.stats.hunger + hungerBoost);
              newState.stats.warmth = Math.min(100, newState.stats.warmth + 10);
              newState.stats.hope = Math.min(100, newState.stats.hope + 10);
              showEvent('Services gave you a hot meal and some advice.');
            } else if (roll < servicesChance + 0.3) {
              newState.stats.warmth = Math.min(100, newState.stats.warmth + 15);
              showEvent('You waited in the warm lobby for a while.');
            } else {
              newState.stats.hope = Math.max(0, newState.stats.hope - 5);
              showEvent('They told you to come back another day.');
            }
          } else {
            showEvent('Services are closed. Try during the day.');
          }
          break;
        }
        case 'shelter': {
          const shelterChance = 0.5 * districtConfig.servicesMultiplier;
          if (s.shelterOpen) {
            const roll = Math.random();
            if (roll < shelterChance) {
              newState.stats.warmth = Math.min(100, newState.stats.warmth + 30);
              newState.stats.fatigue = Math.max(0, newState.stats.fatigue - 20);
              newState.stats.hope = Math.min(100, newState.stats.hope + 5);
              showEvent('You got a bed in the shelter tonight.');
            } else {
              newState.stats.hope = Math.max(0, newState.stats.hope - 8);
              showEvent('The shelter is full. No beds left.');
            }
          } else {
            showEvent('The shelter only opens in the evening.');
          }
          break;
        }
        case 'sleep': {
          newState.stats.fatigue = Math.max(0, newState.stats.fatigue - 30);
          newState.stats.warmth = Math.max(0, newState.stats.warmth - 15);
          newState.stats.hunger = Math.max(0, newState.stats.hunger - 10);
          if (s.timeOfDay === 'night') {
            newState.stats.warmth = Math.max(0, newState.stats.warmth - 10);
          }
          showEvent('You rested in the doorway. The cold seeped in.');
          break;
        }
      }
      
      return newState;
    });
  }, [showEvent]);

  const handleCarEncounter = useCallback(() => {
    setState(s => {
      if (!s.carEncounterActive || s.isGameOver || s.isPaused) return s;
      
      const newState = { ...s, stats: { ...s.stats } };
      const encounterCount = s.carEncounterCount;
      const survivalTime = s.stats.survivalTime;
      
      // Phase-based economy
      const isEarlyGame = survivalTime < 30 && encounterCount < 3;
      const isMidGame = survivalTime >= 30 && survivalTime < 60 && encounterCount < 6;
      const isLateGame = survivalTime >= 60 || encounterCount >= 6;
      
      const roll = Math.random();
      
      if (isLateGame) {
        // Late game - dangerous and unreliable
        if (roll < 0.15) {
          showEvent('The encounter turned violent. Everything went dark.');
          setTimeout(() => triggerGameOver('A dangerous encounter.'), 1500);
          return newState;
        } else if (roll < 0.35) {
          showEvent('They drove off suddenly. You were hurt.');
          newState.stats.warmth = Math.max(0, newState.stats.warmth - 20);
          newState.stats.hope = Math.max(0, newState.stats.hope - 35);
        } else if (roll < 0.6) {
          showEvent('The car drove off. They changed their mind.');
          newState.stats.hope = Math.max(0, newState.stats.hope - 15);
        } else if (roll < 0.8) {
          // Exploitative outcome
          newState.stats.hunger = Math.min(100, newState.stats.hunger + 10);
          newState.stats.warmth = Math.min(100, newState.stats.warmth + 5);
          newState.stats.hope = Math.max(0, newState.stats.hope - 40);
          newState.stats.fatigue = Math.min(100, newState.stats.fatigue + 15);
          showEvent('It was degrading. You got almost nothing.');
          // May attract police attention
          newState.recentCarEncounter = true;
        } else {
          showEvent('No one stopped. The street was empty.');
        }
      } else if (isMidGame) {
        // Mid game - reduced returns, some refusals
        if (roll < 0.2) {
          showEvent('The car drove off without stopping.');
          newState.stats.hope = Math.max(0, newState.stats.hope - 10);
        } else {
          newState.stats.hunger = Math.min(100, newState.stats.hunger + 20);
          newState.stats.warmth = Math.min(100, newState.stats.warmth + 15);
          newState.stats.hope = Math.max(0, newState.stats.hope - 28);
          newState.stats.fatigue = Math.min(100, newState.stats.fatigue + 12);
          if (roll < 0.4) {
            newState.stats.money += Math.floor(Math.random() * 8) + 3;
          }
          showEvent('The arrangement was brief. You survived another hour.');
          newState.recentCarEncounter = true;
        }
      } else if (isEarlyGame) {
        // Early game - relatively reliable
        newState.stats.hunger = Math.min(100, newState.stats.hunger + 35);
        newState.stats.warmth = Math.min(100, newState.stats.warmth + 28);
        newState.stats.hope = Math.max(0, newState.stats.hope - 22);
        newState.stats.fatigue = Math.min(100, newState.stats.fatigue + 8);
        if (roll < 0.5) {
          newState.stats.money += Math.floor(Math.random() * 15) + 5;
        }
        showEvent('You accepted a private arrangement. It kept you fed and warm. It cost you.');
        newState.recentCarEncounter = true;
      }
      
      // Clear the stopped car and increment counter
      newState.cars = s.cars.filter(c => !c.isEncounter);
      newState.carEncounterActive = false;
      newState.carEncounterCount = s.carEncounterCount + 1;
      
      return newState;
    });
  }, [showEvent, triggerGameOver]);

  const ignoreCarEncounter = useCallback(() => {
    setState(s => {
      if (!s.carEncounterActive) return s;
      
      const newCars = s.cars.filter(c => !c.isEncounter);
      showEvent('You ignored the car. It drove away.');
      
      return {
        ...s,
        cars: newCars,
        carEncounterActive: false,
      };
    });
  }, [showEvent]);

  // Purse steal action
  const attemptPurseSteal = useCallback(() => {
    setState(s => {
      if (!s.stealWindowActive || !s.stealTarget || s.isGameOver || s.isPaused) return s;
      
      const newState = { ...s, stats: { ...s.stats } };
      const target = s.stealTarget;
      const bias = ARCHETYPE_STEAL_BIAS[target.archetype];
      
      const roll = Math.random();
      
      // Rare kindness twist
      if (roll < bias.kindnessChance) {
        const amount = Math.floor(Math.random() * 5) + 2;
        newState.stats.money += amount;
        newState.stats.hope = Math.min(100, newState.stats.hope + 8);
        showEvent('They stopped. They gave you money instead.');
      }
      // Shout - triggers police check
      else if (roll < bias.kindnessChance + bias.shoutChance) {
        newState.stats.hope = Math.max(0, newState.stats.hope - 12);
        newState.recentTheft = true;
        showEvent('They shouted. People are staring.');
        // Police check happens in tick
      }
      // Panic - no loot
      else if (roll < bias.kindnessChance + bias.shoutChance + 0.25) {
        newState.stats.hope = Math.max(0, newState.stats.hope - 8);
        showEvent('You panicked. Got nothing.');
      }
      // Clean success
      else {
        const [minMoney, maxMoney] = bias.moneyRange;
        const stolen = Math.floor(Math.random() * (maxMoney - minMoney + 1)) + minMoney;
        newState.stats.money += stolen;
        newState.stats.hope = Math.max(0, newState.stats.hope - 5);
        showEvent(`You grabbed ${stolen} dollars and ran.`);
        newState.recentTheft = true;
      }
      
      // Remove the target pedestrian and reset steal state
      newState.pedestrians = s.pedestrians.filter(p => p.id !== target.id);
      newState.stealWindowActive = false;
      newState.stealTarget = null;
      
      return newState;
    });
  }, [showEvent]);

  const performDesperationAction = useCallback((action: DesperationAction) => {
    setState(s => {
      if (s.isGameOver || s.isPaused) return s;
      
      const newState = { ...s, stats: { ...s.stats } };
      
      switch (action) {
        case 'theft': {
          const roll = Math.random();
          if (roll < 0.3) {
            newState.stats.money += Math.floor(Math.random() * 10) + 5;
            newState.stats.hope = Math.max(0, newState.stats.hope - 10);
            newState.recentTheft = true;
            showEvent('You stole from a shop. You got away with it.');
          } else {
            showEvent('You stole from a shop. The police caught you.');
            setTimeout(() => triggerGameOver('Arrested for theft.'), 1500);
          }
          break;
        }
        case 'purse-steal': {
          attemptPurseSteal();
          break;
        }
        case 'car': {
          handleCarEncounter();
          break;
        }
        case 'sell': {
          if (newState.stats.money < 50) {
            newState.stats.money += 15;
            newState.stats.hope = Math.max(0, newState.stats.hope - 8);
            showEvent('You sold your last belongings.');
          } else {
            showEvent('You have nothing left to sell.');
          }
          break;
        }
        case 'dog-sacrifice': {
          if (s.hasDog) {
            newState.hasDog = false;
            newState.stats.hunger = Math.min(100, newState.stats.hunger + 60);
            newState.stats.warmth = Math.min(100, newState.stats.warmth + 45);
            newState.stats.hope = Math.max(0, newState.stats.hope - 55);
            newState.permanentHopeLoss += 20; // Permanent penalty
            showEvent('Your companion is gone. You will carry this.');
          }
          break;
        }
      }
      
      return newState;
    });
  }, [showEvent, triggerGameOver, handleCarEncounter, attemptPurseSteal]);

  const tick = useCallback(() => {
    setState(s => {
      if (s.isGameOver || s.isPaused) return s;
      
      const newState = { ...s, stats: { ...s.stats } };
      newState.stats.survivalTime += 1;
      
      // Base stat decay
      newState.stats.hunger = Math.max(0, newState.stats.hunger - 1.5);
      newState.stats.fatigue = Math.min(100, newState.stats.fatigue + 0.8);
      newState.stats.hope = Math.max(0, newState.stats.hope - 0.3 - (s.permanentHopeLoss * 0.01));
      
      // Warmth decay based on time/weather
      let warmthDecay = 0.8;
      if (newState.timeOfDay === 'night') warmthDecay = 1.5;
      if (newState.timeOfDay === 'dusk') warmthDecay = 1.1;
      if (newState.isRaining) warmthDecay += 0.8;
      newState.stats.warmth = Math.max(0, newState.stats.warmth - warmthDecay);
      
      // Dog passive effects
      if (s.hasDog && s.dogHealth > 50 && !s.dogSick) {
        newState.stats.hope = Math.min(100, newState.stats.hope + 0.25);
        newState.stats.warmth = Math.min(100, newState.stats.warmth + 0.15);
      }
      
      // Dog health decay if player hunger is low
      if (s.hasDog && s.stats.hunger < 30) {
        dogLowHungerTimeRef.current += 1;
        newState.dogHealth = Math.max(0, s.dogHealth - 0.8);
        
        // Dog sickness after extended low hunger
        if (dogLowHungerTimeRef.current > 15 && !s.dogSick) {
          newState.dogSick = true;
          newState.stats.hope = Math.max(0, newState.stats.hope - 10);
          showEvent('Your dog is sick. It whimpers weakly.');
        }
        
        if (newState.dogHealth <= 0) {
          newState.hasDog = false;
          newState.stats.hope = Math.max(0, newState.stats.hope - 25);
          showEvent('Your companion passed away from hunger.');
        }
      } else if (s.hasDog) {
        dogLowHungerTimeRef.current = Math.max(0, dogLowHungerTimeRef.current - 0.5);
      }
      
      // Time of day cycle (changes every 30 seconds)
      const timePhase = Math.floor(newState.stats.survivalTime / 30) % 4;
      const times: ('dawn' | 'day' | 'dusk' | 'night')[] = ['dawn', 'day', 'dusk', 'night'];
      newState.timeOfDay = times[timePhase];
      
      // Window states
      newState.shelterOpen = newState.timeOfDay === 'dusk' || newState.timeOfDay === 'night';
      newState.servicesOpen = newState.timeOfDay === 'day' || newState.timeOfDay === 'dawn';
      
      // Restock bins every ~45 seconds
      if (newState.stats.survivalTime % 45 === 0) {
        newState.binsRestocked = true;
      }
      
      // Random weather changes
      if (newState.stats.survivalTime % 20 === 0) {
        newState.isRaining = Math.random() < 0.3;
      }
      
      // === DISTRICT-BASED SYSTEMS ===
      const districtConfig = DISTRICT_CONFIGS[s.currentDistrict];
      
      // === IBIS SYSTEM ===
      // Ibis appears near bins - more frequent in Redfern
      const ibisChance = districtConfig.ibisFrequency;
      const shouldHaveIbis = (newState.stats.survivalTime % 60) > 20 && (newState.stats.survivalTime % 60) < 40;
      if (shouldHaveIbis && !s.ibis.isActive && Math.random() < ibisChance) {
        newState.ibis = { x: 27, isActive: true, hasEaten: Math.random() < 0.5 };
      } else if (!shouldHaveIbis && s.ibis.isActive) {
        newState.ibis = { ...s.ibis, isActive: false };
      }
      
      // === PEDESTRIAN SYSTEM ===
      // Move existing pedestrians
      let updatedPeds = s.pedestrians.map(ped => {
        const dx = ped.direction === 'right' ? ped.speed : -ped.speed;
        return { ...ped, x: ped.x + dx };
      }).filter(ped => ped.x > -10 && ped.x < 110);
      
      // Spawn pedestrian bursts - district-based density
      const baseBurstChance = newState.timeOfDay === 'day' ? 0.08 : 
                              newState.timeOfDay === 'dusk' ? 0.12 :
                              newState.timeOfDay === 'night' ? 0.05 : 0.06;
      const burstChance = baseBurstChance * districtConfig.pedestrianDensity * 1.5;
      const maxPeds = Math.floor(6 * districtConfig.pedestrianDensity + 4);
      
      if (Math.random() < burstChance && updatedPeds.length < maxPeds) {
        const burstSize = Math.floor(Math.random() * 4 * districtConfig.pedestrianDensity) + 1;
        const direction: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right';
        const startX = direction === 'right' ? -5 : 105;
        
        // Use district-weighted archetype selection
        const archetypeWeights = districtConfig.archetypeWeights;
        const weightSum = Object.values(archetypeWeights).reduce((a, b) => a + b, 0);
        
        for (let i = 0; i < burstSize; i++) {
          // Weighted random archetype selection
          let roll = Math.random() * weightSum;
          let selectedArchetype: PedestrianArchetype = 'student';
          for (const [arch, weight] of Object.entries(archetypeWeights)) {
            roll -= weight;
            if (roll <= 0) {
              selectedArchetype = arch as PedestrianArchetype;
              break;
            }
          }
          
          const newPed: PedestrianState = {
            id: pedIdRef.current++,
            x: startX - (i * 6 * (direction === 'right' ? 1 : -1)),
            speed: 0.4 + Math.random() * 0.3,
            direction,
            archetype: selectedArchetype,
            canBeStolen: true,
          };
          updatedPeds.push(newPed);
        }
      }
      
      // Check for steal window
      let stealWindowActive = false;
      let stealTarget: PedestrianState | null = null;
      
      for (const ped of updatedPeds) {
        if (Math.abs(ped.x - s.playerX) < 8 && ped.canBeStolen) {
          stealWindowActive = true;
          stealTarget = ped;
          break;
        }
      }
      
      newState.pedestrians = updatedPeds;
      newState.stealWindowActive = stealWindowActive;
      newState.stealTarget = stealTarget;
      
      // === CAR SYSTEM ===
      let updatedCars = s.cars.map(car => {
        if (car.isStopped) return car;
        return { ...car, x: car.x - car.speed };
      }).filter(car => car.x > -20);
      
      // Car spawn rate varies by time, district, and previous encounters
      const baseSpawnRate = s.timeOfDay === 'night' ? 0.15 : 0.1;
      const spawnModifier = Math.max(0.3, 1 - (s.carEncounterCount * 0.08));
      const spawnRate = baseSpawnRate * spawnModifier;
      
      if (Math.random() < spawnRate && updatedCars.filter(c => !c.isStopped).length < 4) {
        const newCar: CarState = {
          id: carIdRef.current++,
          x: 110,
          speed: 1.5 + Math.random() * 1.5,
          isStopped: false,
          isEncounter: false,
          variant: Math.floor(Math.random() * 3),
        };
        updatedCars.push(newCar);
      }
      
      // Car encounter logic - district-based sex economy
      if (!s.carEncounterActive) {
        const baseSexChance = newState.timeOfDay === 'night' ? 0.05 : 0.01;
        const sexMultiplier = districtConfig.sexEconomyMultiplier;
        const encounterModifier = Math.max(0.15, 1 - (s.carEncounterCount * 0.12));
        const encounterChance = baseSexChance * sexMultiplier * encounterModifier;
        
        const playerNearRoad = s.playerX > 5 && s.playerX < 40;
        
        for (let i = 0; i < updatedCars.length; i++) {
          const car = updatedCars[i];
          if (!car.isStopped && !car.isEncounter && playerNearRoad) {
            if (car.x <= s.playerX + 15 && car.x >= s.playerX - 5) {
              if (Math.random() < encounterChance) {
                updatedCars[i] = {
                  ...car,
                  isStopped: true,
                  isEncounter: true,
                  x: s.playerX + 5,
                };
                newState.carEncounterActive = true;
                break;
              }
            }
          }
        }
      }
      
      newState.cars = updatedCars;
      
      // === POLICE SWEEP SYSTEM ===
      // Rhythmic sweeps - frequency varies by district
      const baseSweepInterval = newState.timeOfDay === 'night' ? 35 : 50;
      const sweepInterval = Math.floor(baseSweepInterval / districtConfig.policeFrequency);
      const isSweepTime = newState.stats.survivalTime % sweepInterval === 0 && newState.stats.survivalTime > 10;
      
      if (isSweepTime && !s.police.isActive && Math.random() < districtConfig.policeFrequency) {
        // Start a police sweep
        newState.police = {
          x: Math.random() < 0.5 ? -10 : 110,
          isActive: true,
          direction: Math.random() < 0.5 ? 'right' : 'left',
        };
      }
      
      // Move police during sweep
      if (s.police.isActive) {
        const policeSpeed = 1.2;
        const newPoliceX = s.police.direction === 'right' 
          ? s.police.x + policeSpeed 
          : s.police.x - policeSpeed;
        
        // Check if police catches player during sweep - danger multiplier affects arrest chance
        if (Math.abs(newPoliceX - s.playerX) < 10) {
          const isSleeping = s.currentZone === 'sleep';
          const isVisible = s.currentZone === null || s.currentZone === 'ask-help';
          const hasRecentActivity = s.recentTheft || s.recentCarEncounter;
          const catchChance = 0.4 * districtConfig.dangerMultiplier;
          
          if ((isSleeping || (isVisible && hasRecentActivity)) && Math.random() < catchChance) {
            const arrestChance = 0.35 * districtConfig.dangerMultiplier;
            if (hasRecentActivity && Math.random() < arrestChance) {
              showEvent('The police arrested you.');
              setTimeout(() => triggerGameOver('Arrested by police.'), 1500);
            } else {
              newState.stats.hope = Math.max(0, newState.stats.hope - 12);
              newState.playerX = 50;
              showEvent('Police moved you along. Keep walking.');
            }
          }
        }
        
        // End sweep when police leaves screen
        if (newPoliceX < -15 || newPoliceX > 115) {
          newState.police = { ...s.police, isActive: false };
        } else {
          newState.police = { ...s.police, x: newPoliceX };
        }
      }
      
      // Clear recent activity flags after some time
      if (s.recentTheft && newState.stats.survivalTime % 20 === 0) {
        newState.recentTheft = false;
      }
      if (s.recentCarEncounter && newState.stats.survivalTime % 25 === 0) {
        newState.recentCarEncounter = false;
      }
      
      // Random events
      if (Math.random() < 0.02) {
        const eventRoll = Math.random();
        if (eventRoll < 0.3) {
          newState.stats.hope = Math.min(100, newState.stats.hope + 5);
          newState.stats.hunger = Math.min(100, newState.stats.hunger + 5);
          showEvent('A stranger bought you a coffee.');
        } else if (eventRoll < 0.4 && newState.timeOfDay === 'night') {
          showEvent('You were attacked. Everything went dark.');
          setTimeout(() => triggerGameOver('Violence on the street.'), 1500);
        } else if (eventRoll < 0.5 && newState.stats.warmth < 30) {
          newState.stats.hunger = Math.max(0, newState.stats.hunger - 20);
          showEvent('You got sick from the cold.');
        }
      }
      
      // Desperation actions availability
      const desperationAvailable: DesperationAction[] = [];
      if (newState.stats.hunger < 25 || newState.stats.warmth < 25 || newState.stats.money <= 0) {
        if (s.currentZone === 'services' || s.currentZone === 'bins') {
          desperationAvailable.push('theft');
        }
        if (s.currentZone === 'services') {
          desperationAvailable.push('sell');
        }
        if (s.hasDog && newState.stats.hunger < 15 && newState.stats.warmth < 15) {
          desperationAvailable.push('dog-sacrifice');
        }
      }
      
      // Purse steal available when near pedestrian
      if (stealWindowActive) {
        desperationAvailable.push('purse-steal');
      }
      
      newState.desperationAvailable = desperationAvailable;
      
      return newState;
    });
  }, [showEvent, triggerGameOver]);

  // Check for game over conditions
  useEffect(() => {
    if (state.isGameOver) return;
    
    if (state.stats.hunger <= 0) {
      triggerGameOver('Starvation.');
    } else if (state.stats.warmth <= 0) {
      triggerGameOver('Hypothermia.');
    } else if (state.stats.hope <= 0) {
      triggerGameOver('Lost all hope.');
    } else if (state.stats.fatigue >= 100) {
      triggerGameOver('Complete exhaustion.');
    }
  }, [state.stats, state.isGameOver, triggerGameOver]);

  return {
    state,
    updatePlayerPosition,
    stopWalking,
    setDucking,
    togglePause,
    restartGame,
    performAction,
    performDesperationAction,
    handleCarEncounter,
    ignoreCarEncounter,
    attemptPurseSteal,
    tick,
  };
}
