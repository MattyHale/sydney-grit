import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  GameState, 
  INITIAL_STATE, 
  HOTSPOTS, 
  HotspotZone,
  DesperationAction 
} from '@/types/game';

export function useGameState() {
  const [state, setState] = useState<GameState>({ ...INITIAL_STATE });
  const eventTimeoutRef = useRef<number | null>(null);

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

      return {
        ...s,
        playerX: newX,
        playerDirection: direction,
        playerState: 'walking',
        currentZone,
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
    setState({ ...INITIAL_STATE });
  }, []);

  const performAction = useCallback((zone: HotspotZone) => {
    setState(s => {
      if (s.isGameOver || s.isPaused) return s;
      
      const newState = { ...s, stats: { ...s.stats } };
      
      switch (zone) {
        case 'ask-help': {
          const roll = Math.random();
          if (roll < 0.3) {
            newState.stats.money += Math.floor(Math.random() * 3) + 1;
            newState.stats.hope = Math.min(100, newState.stats.hope + 5);
            showEvent('Someone gave you a few dollars.');
          } else if (roll < 0.5) {
            newState.stats.hope = Math.min(100, newState.stats.hope + 3);
            showEvent('A passerby offered kind words.');
          } else {
            newState.stats.hope = Math.max(0, newState.stats.hope - 2);
            showEvent('People walked past without stopping.');
          }
          break;
        }
        case 'bins': {
          if (s.binsRestocked) {
            const roll = Math.random();
            if (roll < 0.4) {
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
          if (s.servicesOpen) {
            const roll = Math.random();
            if (roll < 0.4) {
              newState.stats.hunger = Math.min(100, newState.stats.hunger + 25);
              newState.stats.warmth = Math.min(100, newState.stats.warmth + 10);
              newState.stats.hope = Math.min(100, newState.stats.hope + 10);
              showEvent('Services gave you a hot meal and some advice.');
            } else if (roll < 0.7) {
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
          if (s.shelterOpen) {
            const roll = Math.random();
            if (roll < 0.5) {
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
            showEvent('You stole from a shop. You got away with it.');
          } else {
            showEvent('You stole from a shop. The police caught you.');
            setTimeout(() => triggerGameOver('Arrested for theft.'), 1500);
          }
          break;
        }
        case 'car': {
          newState.stats.hunger = Math.min(100, newState.stats.hunger + 40);
          newState.stats.warmth = Math.min(100, newState.stats.warmth + 30);
          newState.stats.hope = Math.max(0, newState.stats.hope - 25);
          newState.stats.money += Math.floor(Math.random() * 20) + 10;
          showEvent('You accepted a private car arrangement. It cost you.');
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
            newState.stats.warmth = Math.min(100, newState.stats.warmth + 40);
            newState.stats.hope = Math.max(0, newState.stats.hope - 50);
            showEvent('Your companion is gone. You survived another day.');
          }
          break;
        }
      }
      
      return newState;
    });
  }, [showEvent, triggerGameOver]);

  const tick = useCallback(() => {
    setState(s => {
      if (s.isGameOver || s.isPaused) return s;
      
      const newState = { ...s, stats: { ...s.stats } };
      newState.stats.survivalTime += 1;
      
      // Base stat decay
      newState.stats.hunger = Math.max(0, newState.stats.hunger - 1.5);
      newState.stats.fatigue = Math.min(100, newState.stats.fatigue + 0.8);
      newState.stats.hope = Math.max(0, newState.stats.hope - 0.3);
      
      // Warmth decay based on time/weather
      let warmthDecay = 0.8;
      if (newState.timeOfDay === 'night') warmthDecay = 1.5;
      if (newState.isRaining) warmthDecay += 0.8;
      newState.stats.warmth = Math.max(0, newState.stats.warmth - warmthDecay);
      
      // Dog passive effects
      if (s.hasDog && s.dogHealth > 50) {
        newState.stats.hope = Math.min(100, newState.stats.hope + 0.2);
        newState.stats.warmth = Math.min(100, newState.stats.warmth + 0.1);
      }
      
      // Dog health decay if player hunger is low
      if (s.hasDog && s.stats.hunger < 30) {
        newState.dogHealth = Math.max(0, s.dogHealth - 1);
        if (newState.dogHealth <= 0) {
          newState.hasDog = false;
          newState.stats.hope = Math.max(0, newState.stats.hope - 20);
          showEvent('Your companion passed away from hunger.');
        }
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
      
      // Police sweep at night
      if (newState.timeOfDay === 'night' && newState.stats.survivalTime % 60 === 30) {
        if (s.currentZone === 'sleep' || s.currentZone === null) {
          if (Math.random() < 0.4) {
            newState.stats.hope = Math.max(0, newState.stats.hope - 10);
            newState.playerX = 50;
            showEvent('Police moved you along. Keep walking.');
          } else if (Math.random() < 0.2) {
            showEvent('You were arrested for loitering.');
            setTimeout(() => triggerGameOver('Arrested by police.'), 1500);
          }
        }
      }
      
      // Desperation actions availability
      const desperationAvailable: DesperationAction[] = [];
      if (newState.stats.hunger < 25 || newState.stats.warmth < 25 || newState.stats.money <= 0) {
        if (s.currentZone === 'services' || s.currentZone === 'bins') {
          desperationAvailable.push('theft');
        }
        if (s.currentZone === 'ask-help' && Math.random() < 0.1) {
          desperationAvailable.push('car');
        }
        if (s.currentZone === 'services') {
          desperationAvailable.push('sell');
        }
        if (s.hasDog && newState.stats.hunger < 15 && newState.stats.warmth < 15) {
          desperationAvailable.push('dog-sacrifice');
        }
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
    tick,
  };
}
