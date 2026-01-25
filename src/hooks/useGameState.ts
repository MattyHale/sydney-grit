import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  GameState, 
  INITIAL_STATE, 
  HOTSPOTS, 
  HotspotZone,
  DesperationAction,
  CarState,
  PedestrianState,
  PedestrianAction,
  PEDESTRIAN_ARCHETYPES,
  ARCHETYPE_STEAL_BIAS,
  ARCHETYPE_ACTION_BIAS,
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
            const messages = [
              `Someone pressed ${money} dollars into your hand.`,
              'A stranger stopped. They saw you.',
              `"Here." ${money} dollars. No eye contact.`,
            ];
            showEvent(messages[Math.floor(Math.random() * messages.length)]);
          } else if (roll < kindnessChance + 0.2) {
            newState.stats.hope = Math.min(100, newState.stats.hope + 3);
            const messages = [
              'A nod. Just a nod. It was something.',
              'Someone smiled. Brief, but real.',
              '"Hang in there." They kept walking.',
            ];
            showEvent(messages[Math.floor(Math.random() * messages.length)]);
          } else {
            newState.stats.hope = Math.max(0, newState.stats.hope - 2);
            const messages = [
              'Eyes forward. They all looked away.',
              'Invisible. You\'re invisible.',
              'The crowd parted around you.',
            ];
            showEvent(messages[Math.floor(Math.random() * messages.length)]);
          }
          break;
        }
        case 'bins': {
          if (s.ibis.isActive && s.ibis.hasEaten) {
            showEvent('A bin chicken got there first. Nothing left.');
            newState.stats.hope = Math.max(0, newState.stats.hope - 3);
            break;
          }
          
          if (s.binsRestocked) {
            const roll = Math.random();
            if (s.ibis.isActive && roll < 0.3) {
              newState.stats.hunger = Math.min(100, newState.stats.hunger + 5);
              showEvent('You fought an ibis for scraps. Won some.');
            } else if (roll < 0.4) {
              newState.stats.hunger = Math.min(100, newState.stats.hunger + 15);
              showEvent('Bread. Stale but edible.');
            } else if (roll < 0.7) {
              newState.stats.hunger = Math.min(100, newState.stats.hunger + 8);
              showEvent('Half a meat pie. Cold. It\'ll do.');
            } else {
              showEvent('Empty. All of them.');
            }
            newState.binsRestocked = false;
          } else {
            showEvent('Already checked. Nothing new.');
          }
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
              newState.stats.hope = Math.min(100, newState.stats.hope + 8);
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
          newState.stats.warmth = Math.max(0, newState.stats.warmth - 15);
          newState.stats.hunger = Math.max(0, newState.stats.hunger - 10);
          newState.stats.hope = Math.min(100, newState.stats.hope + 5);
          if (s.timeOfDay === 'night') {
            newState.stats.warmth = Math.max(0, newState.stats.warmth - 10);
          }
          // Cocaine withdrawal hits hard when resting
          if (s.stats.cocaine > 30) {
            newState.stats.cocaine = Math.max(0, newState.stats.cocaine - 15);
            newState.stats.hope = Math.max(0, newState.stats.hope - 10);
            showEvent('You tried to rest. The comedown was brutal.');
          } else {
            showEvent('You rested in the doorway. The cold seeped in.');
          }
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
            // Dog sacrifice event - enhanced with freeze and dimming via state
            newState.hasDog = false;
            newState.dogHealth = 0;
            newState.stats.hunger = Math.min(100, newState.stats.hunger + 60);
            newState.stats.warmth = Math.min(100, newState.stats.warmth + 45);
            newState.stats.hope = Math.max(0, newState.stats.hope - 55);
            newState.permanentHopeLoss += 25; // Stronger permanent penalty
            // Pause for dramatic effect
            newState.isPaused = true;
            showEvent('You did what you had to. Your companion is gone. You will carry this forever.');
            // Auto-unpause after 3 seconds
            setTimeout(() => {
              setState(prev => ({ ...prev, isPaused: false }));
            }, 3000);
          }
          break;
        }
        case 'buy-coke': {
          const districtConfig = DISTRICT_CONFIGS[s.currentDistrict];
          const dealerPresent = Math.random() < districtConfig.dealerFrequency;
          
          if (!dealerPresent) {
            showEvent('No one around. The alley is empty.');
            break;
          }
          
          if (s.stats.money >= 10) {
            const roll = Math.random();
            if (roll < 0.7) {
              // Good deal
              newState.stats.money -= 10;
              newState.stats.cocaine = Math.min(100, newState.stats.cocaine + 35);
              newState.stats.hope = Math.min(100, newState.stats.hope + 8);
              showEvent('You scored. The world sharpens.');
            } else if (roll < 0.85) {
              // Weak stuff
              newState.stats.money -= 10;
              newState.stats.cocaine = Math.min(100, newState.stats.cocaine + 20);
              showEvent('Weak gear. Better than nothing.');
            } else {
              // Scammed
              newState.stats.money -= 10;
              newState.stats.hope = Math.max(0, newState.stats.hope - 8);
              showEvent('They took your money and ran.');
            }
          } else if (s.stats.money >= 5) {
            // Cheaper, riskier
            const roll = Math.random();
            if (roll < 0.4) {
              newState.stats.money -= 5;
              newState.stats.cocaine = Math.min(100, newState.stats.cocaine + 15);
              showEvent('Got a taste for cheap.');
            } else {
              newState.stats.money -= 5;
              showEvent('Not enough. They laughed and left.');
            }
          } else {
            // No money - beg for a hit
            if (Math.random() < 0.15) {
              newState.stats.cocaine = Math.min(100, newState.stats.cocaine + 10);
              showEvent('They took pity. A small bump.');
            } else {
              newState.stats.hope = Math.max(0, newState.stats.hope - 3);
              showEvent('No money, no gear. Move along.');
            }
          }
          break;
        }
      }
      
      return newState;
    });
  }, [showEvent, triggerGameOver, handleCarEncounter, attemptPurseSteal]);

  // Pedestrian actions: Pitch, Trade, Hit
  const performPedestrianAction = useCallback((action: PedestrianAction) => {
    setState(s => {
      if (!s.stealTarget || s.isGameOver || s.isPaused) return s;
      
      const newState = { ...s, stats: { ...s.stats } };
      const target = s.stealTarget;
      const archetype = target.archetype;
      const stealBias = ARCHETYPE_STEAL_BIAS[archetype];
      const actionBias = ARCHETYPE_ACTION_BIAS[archetype];
      const districtConfig = DISTRICT_CONFIGS[s.currentDistrict];
      const isTripping = s.lsdTripActive;
      
      switch (action) {
        case 'steal': {
          // Reuse existing purse steal logic
          const roll = Math.random();
          if (roll < stealBias.kindnessChance) {
            const amount = Math.floor(Math.random() * 5) + 2;
            newState.stats.money += amount;
            newState.stats.hope = Math.min(100, newState.stats.hope + 8);
            showEvent('They stopped. They gave you money instead.');
          } else if (roll < stealBias.kindnessChance + stealBias.shoutChance) {
            newState.stats.hope = Math.max(0, newState.stats.hope - 12);
            newState.recentTheft = true;
            showEvent('They shouted. People are staring.');
          } else {
            const [minMoney, maxMoney] = stealBias.moneyRange;
            const stolen = Math.floor(Math.random() * (maxMoney - minMoney + 1)) + minMoney;
            newState.stats.money += stolen;
            newState.stats.hope = Math.max(0, newState.stats.hope - 5);
            showEvent(`You grabbed ${stolen} dollars and ran.`);
            newState.recentTheft = true;
          }
          break;
        }
        case 'pitch': {
          // Sales pitch - founder arc
          const successChance = actionBias.pitchSuccess * districtConfig.pitchMultiplier;
          const roll = Math.random();
          
          if (isTripping) {
            // LSD makes pitches weird
            if (roll < 0.3) {
              newState.stats.money += Math.floor(Math.random() * 8) + 2;
              newState.stats.hope = Math.min(100, newState.stats.hope + 5);
              showEvent('Your pitch was... transcendent? They bought it.');
            } else {
              newState.stats.hope = Math.max(0, newState.stats.hope - 8);
              showEvent('You pitched. The words came out wrong. They walked away.');
            }
          } else if (roll < successChance) {
            const earnings = Math.floor(Math.random() * 10) + 3;
            newState.stats.money += earnings;
            newState.stats.hope = Math.min(100, newState.stats.hope + 6);
            showEvent(`They listened. You earned $${earnings}.`);
          } else if (roll < successChance + 0.3) {
            newState.stats.hope = Math.max(0, newState.stats.hope - 5);
            showEvent('They ignored you completely.');
          } else if (roll < successChance + 0.5) {
            newState.stats.hope = Math.max(0, newState.stats.hope - 10);
            showEvent('"Get a job." They laughed.');
          } else {
            // Police interest
            if (Math.random() < 0.15 * districtConfig.policeFrequency) {
              newState.recentTheft = true; // Triggers police attention
              showEvent('Someone called security. Move.');
            } else {
              showEvent('No takers.');
            }
          }
          break;
        }
        case 'trade': {
          // Non-explicit sex trade - reuses sex economy logic
          const willingChance = actionBias.tradeWilling * districtConfig.tradeMultiplier;
          const roll = Math.random();
          
          if (roll < willingChance) {
            // Trade accepted
            const reward = Math.random();
            if (reward < 0.4) {
              newState.stats.money += Math.floor(Math.random() * 12) + 5;
              showEvent('Transaction complete. Money changed hands.');
            } else if (reward < 0.7) {
              newState.stats.hunger = Math.min(100, newState.stats.hunger + 25);
              showEvent('They bought you food instead.');
            } else {
              newState.stats.warmth = Math.min(100, newState.stats.warmth + 20);
              showEvent('A warm place for a while.');
            }
            newState.stats.hope = Math.max(0, newState.stats.hope - 18);
            newState.recentCarEncounter = true;
          } else if (roll < willingChance + 0.2) {
            newState.stats.hope = Math.max(0, newState.stats.hope - 8);
            showEvent('They looked disgusted and walked away.');
          } else {
            showEvent('Not interested.');
          }
          break;
        }
        case 'hit': {
          // Violence - dangerous
          const fightBackChance = actionBias.fightBack * districtConfig.violenceMultiplier;
          const roll = Math.random();
          
          if (roll < 0.25) {
            // Knockdown success
            const loot = Math.floor(Math.random() * 15) + 3;
            newState.stats.money += loot;
            newState.stats.hope = Math.max(0, newState.stats.hope - 15);
            newState.recentViolence = true;
            showEvent(`They went down. You took $${loot}.`);
          } else if (roll < 0.25 + fightBackChance) {
            // They fight back
            newState.stats.warmth = Math.max(0, newState.stats.warmth - 25);
            newState.stats.hope = Math.max(0, newState.stats.hope - 20);
            newState.recentViolence = true;
            showEvent('They fought back. You\'re hurt.');
          } else if (roll < 0.6) {
            // Cops called
            newState.recentViolence = true;
            if (!s.police.isActive) {
              newState.police = {
                x: Math.random() < 0.5 ? -10 : 110,
                isActive: true,
                direction: Math.random() < 0.5 ? 'right' : 'left',
              };
            }
            showEvent('Someone screamed. Cops are coming.');
          } else {
            // They run
            newState.stats.hope = Math.max(0, newState.stats.hope - 5);
            showEvent('They ran. You got nothing.');
          }
          break;
        }
      }
      
      // Remove the target pedestrian
      newState.pedestrians = s.pedestrians.filter(p => p.id !== target.id);
      newState.stealWindowActive = false;
      newState.stealTarget = null;
      
      return newState;
    });
  }, [showEvent]);

  // Take LSD action
  const takeLSD = useCallback(() => {
    setState(s => {
      if (s.stats.lsd <= 0 || s.lsdTripActive || s.isGameOver || s.isPaused) return s;
      
      const newState = { ...s, stats: { ...s.stats } };
      newState.stats.lsd = Math.max(0, newState.stats.lsd - 1);
      newState.lsdTripActive = true;
      newState.lsdTripTimeRemaining = 15 + Math.floor(Math.random() * 10); // 15-25 seconds
      newState.stats.hope = Math.min(100, newState.stats.hope + 25);
      newState.stats.warmth = Math.min(100, newState.stats.warmth + 10);
      showEvent('The world shifts. Colors bleed. You feel... free.');
      
      return newState;
    });
  }, [showEvent]);

  const tick = useCallback(() => {
    setState(s => {
      if (s.isGameOver || s.isPaused) return s;
      
      const newState = { ...s, stats: { ...s.stats } };
      newState.stats.survivalTime += 1;
      
      // Base stat decay
      newState.stats.hunger = Math.max(0, newState.stats.hunger - 1.5);
      newState.stats.hope = Math.max(0, newState.stats.hope - 0.3 - (s.permanentHopeLoss * 0.01));
      
      // Cocaine effects - when high, hope boost but accelerated hunger drain
      const isHigh = s.stats.cocaine > 30;
      const isWithdrawing = s.stats.cocaine > 0 && s.stats.cocaine <= 20;
      
      if (isHigh) {
        // High on coke - feel invincible but burning through energy
        newState.stats.hope = Math.min(100, newState.stats.hope + 0.4);
        newState.stats.hunger = Math.max(0, newState.stats.hunger - 0.8); // Extra hunger drain
        newState.stats.warmth = Math.min(100, newState.stats.warmth + 0.2); // Feel warmer
        
        // PARANOIA - increased police attention when high
        if (Math.random() < 0.03 * (s.stats.cocaine / 100)) {
          // Paranoia event - might trigger police or be hallucination
          const paranoiaRoll = Math.random();
          if (paranoiaRoll < 0.4 && !s.police.isActive) {
            // Real police triggered by erratic behavior
            newState.police = {
              x: Math.random() < 0.5 ? -10 : 110,
              isActive: true,
              direction: Math.random() < 0.5 ? 'right' : 'left',
            };
            showEvent('You\'re acting paranoid. Someone called the cops.');
          } else if (paranoiaRoll < 0.7) {
            // Paranoid delusion - think someone's following
            newState.stats.hope = Math.max(0, newState.stats.hope - 5);
            showEvent('Someone\'s watching you. Or are they?');
          } else {
            // Paranoia makes you aggressive/erratic
            newState.stats.hope = Math.max(0, newState.stats.hope - 3);
            showEvent('Your heart races. Everything feels threatening.');
          }
        }
      }
      
      // Cocaine decay
      if (s.stats.cocaine > 0) {
        newState.stats.cocaine = Math.max(0, newState.stats.cocaine - 0.5);
        // Withdrawal effects when crashing below 30
        if (s.stats.cocaine > 30 && newState.stats.cocaine <= 30) {
          newState.stats.hope = Math.max(0, newState.stats.hope - 12);
          newState.stats.hunger = Math.max(0, newState.stats.hunger - 15);
          showEvent('The crash hits. Everything feels empty.');
        }
      }
      
      // WITHDRAWAL HALLUCINATIONS - when coming down (1-20 cocaine)
      if (isWithdrawing && Math.random() < 0.04) {
        const hallucinationRoll = Math.random();
        if (hallucinationRoll < 0.25) {
          // See fake threats
          showEvent('Shadows move at the edge of your vision. Nothing\'s there.');
          newState.stats.hope = Math.max(0, newState.stats.hope - 4);
        } else if (hallucinationRoll < 0.45) {
          // Hear things
          showEvent('You hear footsteps behind you. Just the wind.');
          newState.stats.hope = Math.max(0, newState.stats.hope - 3);
        } else if (hallucinationRoll < 0.6) {
          // See a dealer that isn't there
          showEvent('You see a dealer across the street. When you look again, they\'re gone.');
          newState.stats.hope = Math.max(0, newState.stats.hope - 5);
        } else if (hallucinationRoll < 0.75) {
          // Body horror
          showEvent('Your skin crawls. Bugs everywhere. Not real. Not real.');
          newState.stats.hope = Math.max(0, newState.stats.hope - 6);
          newState.stats.warmth = Math.max(0, newState.stats.warmth - 5);
        } else if (hallucinationRoll < 0.85) {
          // Fake police siren
          showEvent('Sirens! You duck—nothing. Just your mind.');
          newState.stats.hope = Math.max(0, newState.stats.hope - 4);
        } else {
          // Craving hits hard
          showEvent('The craving claws at you. You need more.');
          newState.stats.hope = Math.max(0, newState.stats.hope - 8);
          newState.stats.hunger = Math.max(0, newState.stats.hunger - 5);
        }
      }
      
      // === LSD TRIP MECHANICS ===
      if (s.lsdTripActive) {
        newState.lsdTripTimeRemaining = Math.max(0, s.lsdTripTimeRemaining - 1);
        
        // During trip: hope boost, hunger/warmth stable, perception altered
        newState.stats.hope = Math.min(100, newState.stats.hope + 0.6);
        newState.stats.hunger = Math.min(100, newState.stats.hunger + 0.3); // Less hunger awareness
        newState.stats.warmth = Math.min(100, newState.stats.warmth + 0.2);
        
        // Random trip events
        if (Math.random() < 0.08) {
          const tripEvent = Math.random();
          if (tripEvent < 0.25) {
            showEvent('The signs are speaking to you. Beautiful nonsense.');
          } else if (tripEvent < 0.5) {
            showEvent('Colors pulse. The city breathes.');
          } else if (tripEvent < 0.7) {
            showEvent('Time stretches. Seconds feel like hours.');
          } else if (tripEvent < 0.85) {
            showEvent('Everyone\'s face looks... familiar. Wrong.');
          } else {
            // Bad decision risk
            if (Math.random() < 0.3 && s.stats.money > 0) {
              const lost = Math.floor(Math.random() * Math.min(s.stats.money, 8));
              newState.stats.money = Math.max(0, newState.stats.money - lost);
              showEvent(`You gave away $${lost}. It felt right.`);
            }
          }
        }
        
        // Trip ends
        if (newState.lsdTripTimeRemaining <= 0) {
          newState.lsdTripActive = false;
          newState.stats.hope = Math.max(0, newState.stats.hope - 15);
          newState.stats.hunger = Math.max(0, newState.stats.hunger - 10);
          showEvent('The trip fades. Reality crashes back. Cold. Hungry.');
        }
      }
      
      // Warmth decay based on time/weather
      let warmthDecay = 0.8;
      if (newState.timeOfDay === 'night') warmthDecay = 1.5;
      if (newState.timeOfDay === 'dusk') warmthDecay = 1.1;
      if (newState.isRaining) warmthDecay += 0.8;
      // LSD reduces awareness of cold
      if (s.lsdTripActive) warmthDecay *= 0.3;
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
        if (eventRoll < 0.25) {
          newState.stats.hope = Math.min(100, newState.stats.hope + 5);
          newState.stats.hunger = Math.min(100, newState.stats.hunger + 5);
          showEvent('A stranger bought you a coffee.');
        } else if (eventRoll < 0.35 && newState.timeOfDay === 'night') {
          showEvent('You were attacked. Everything went dark.');
          setTimeout(() => triggerGameOver('Violence on the street.'), 1500);
        } else if (eventRoll < 0.45 && newState.stats.warmth < 30) {
          newState.stats.hunger = Math.max(0, newState.stats.hunger - 20);
          showEvent('You got sick from the cold.');
        }
      }
      
      // Dealer approach events - district based, more aggressive
      const dealerChance = districtConfig.dealerFrequency * 0.018;
      if (Math.random() < dealerChance && newState.timeOfDay !== 'dawn') {
        const dealerRoll = Math.random();
        const isWithdrawingNow = s.stats.cocaine > 0 && s.stats.cocaine <= 20;
        
        // Dealers more aggressive when you're withdrawing
        const aggressionBonus = isWithdrawingNow ? 0.15 : 0;
        
        if (dealerRoll < 0.3 + aggressionBonus && s.stats.money >= 10) {
          // Dealer offers coke for money
          newState.stats.money -= 10;
          newState.stats.cocaine = Math.min(100, newState.stats.cocaine + 35);
          newState.stats.hope = Math.min(100, newState.stats.hope + 10);
          showEvent('A dealer approached. You scored. Everything feels possible.');
        } else if (dealerRoll < 0.45 + aggressionBonus) {
          // Free sample / pity hit - dealers know you'll come back
          newState.stats.cocaine = Math.min(100, newState.stats.cocaine + 20);
          newState.stats.hope = Math.min(100, newState.stats.hope + 5);
          if (isWithdrawingNow) {
            showEvent('Dealer saw you shaking. "First one\'s free." You take it.');
          } else {
            showEvent('Someone passed you a taste. The world sharpens.');
          }
        } else if (dealerRoll < 0.6 && s.stats.money >= 5) {
          // Cheaper deal, lower quality
          newState.stats.money -= 5;
          newState.stats.cocaine = Math.min(100, newState.stats.cocaine + 15);
          showEvent('Got some gear cheap. Might be cut with something.');
        } else if (dealerRoll < 0.7 && s.stats.money >= 8) {
          // Dealer scam / bad deal
          newState.stats.money -= 8;
          newState.stats.hope = Math.max(0, newState.stats.hope - 5);
          showEvent('Dealer took your money and vanished.');
        } else if (dealerRoll < 0.8) {
          // Dealer just watching - paranoia inducing
          if (s.stats.cocaine > 0) {
            showEvent('A figure in the alley watches you. Dealer? Cop? You can\'t tell.');
            newState.stats.hope = Math.max(0, newState.stats.hope - 3);
          }
        } else if (dealerRoll < 0.9 && isWithdrawingNow) {
          // Dealer offers credit - dangerous
          newState.stats.cocaine = Math.min(100, newState.stats.cocaine + 25);
          newState.permanentHopeLoss += 5; // You owe someone now
          showEvent('Dealer fronts you some. "You owe me." This won\'t end well.');
        }
      }
      
      // LSD acquisition events - district based
      const lsdChance = districtConfig.lsdFrequency * 0.012;
      if (Math.random() < lsdChance && !s.lsdTripActive) {
        const lsdRoll = Math.random();
        if (lsdRoll < 0.3 && s.stats.money >= 8) {
          // Buy acid
          newState.stats.money -= 8;
          newState.stats.lsd += 1;
          showEvent('Someone sold you a tab. Small and powerful.');
        } else if (lsdRoll < 0.5) {
          // Free trip
          newState.stats.lsd += 1;
          showEvent('A stranger pressed something into your hand. "Expand your mind."');
        } else if (lsdRoll < 0.65 && s.stats.money >= 5) {
          // Trade for acid
          newState.stats.money -= 5;
          newState.stats.lsd += 1;
          newState.stats.hope = Math.min(100, newState.stats.hope + 3);
          showEvent('Got a hit in exchange for helping move some boxes.');
        }
      }
      
      // Clear violence flag
      if (s.recentViolence && newState.stats.survivalTime % 30 === 0) {
        newState.recentViolence = false;
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
      
      // Buy coke available in alleys in dealer districts
      if (s.currentZone === 'alley' && districtConfig.dealerFrequency > 0.3) {
        desperationAvailable.push('buy-coke');
      }
      
      // Purse steal available when near pedestrian
      if (stealWindowActive) {
        desperationAvailable.push('purse-steal');
      }
      
      // Pedestrian actions available when near target
      const pedestrianActionAvailable: PedestrianAction[] = [];
      if (stealWindowActive && s.stealTarget) {
        pedestrianActionAvailable.push('steal', 'pitch', 'trade', 'hit');
      }
      newState.pedestrianActionAvailable = pedestrianActionAvailable;
      
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
    } else if (state.stats.cocaine >= 100) {
      triggerGameOver('Overdose.');
    }
  }, [state.stats, state.isGameOver, triggerGameOver]);

  // Expose setState for dog sacrifice timeout
  // This is handled via closure in the performDesperationAction callback

  return {
    state,
    updatePlayerPosition,
    stopWalking,
    setDucking,
    togglePause,
    restartGame,
    performAction,
    performDesperationAction,
    performPedestrianAction,
    handleCarEncounter,
    ignoreCarEncounter,
    attemptPurseSteal,
    takeLSD,
    tick,
  };
}
