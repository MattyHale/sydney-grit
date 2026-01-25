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
  PedestrianArchetype,
  TransactionType
} from '@/types/game';
import { getDistrictFromOffset, DISTRICT_CONFIGS, getVenueAtPosition } from '@/types/districts';

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

  // Show transaction feedback
  const showTransaction = useCallback((type: TransactionType, amount?: string) => {
    setState(s => ({ ...s, lastTransaction: { type, amount } }));
  }, []);

  const clearTransaction = useCallback(() => {
    setState(s => ({ ...s, lastTransaction: null }));
  }, []);

  const updatePlayerPosition = useCallback((delta: number) => {
    setState(s => {
      if (s.isGameOver || s.isPaused || s.playerState === 'collapsed') return s;
      
      // 5x speed when high on drugs (cocaine > 30 or LSD active)
      const isHigh = s.stats.cocaine > 30 || s.lsdTripActive;
      const speedMultiplier = isHigh ? 5 : 1;
      const adjustedDelta = delta * speedMultiplier;
      
      const newX = Math.max(5, Math.min(90, s.playerX + adjustedDelta));
      const direction = delta > 0 ? 'right' : 'left';
      
      // Update world offset for infinite scroll effect (also affected by speed)
      const newWorldOffset = s.worldOffset + (adjustedDelta * 2.5); // Faster scrolling
      const newDistrict = getDistrictFromOffset(newWorldOffset);
      
      // Get the actual building at the player's position
      const { venue, hotspotZone } = getVenueAtPosition(newWorldOffset, newX);
      
      // Use the building-based zone instead of fixed hotspots
      const currentZone = hotspotZone;
      
      // Track if player is in alley (for dealer access)
      const inAlley = venue.type === 'alley';
      // Keep dealer nearby if we're still in alley, otherwise clear
      const dealerNearby = inAlley ? s.dealerNearby : false;

      return {
        ...s,
        playerX: newX,
        playerDirection: direction,
        playerState: 'walking',
        currentZone,
        worldOffset: newWorldOffset,
        currentDistrict: newDistrict,
        inAlley,
        dealerNearby,
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
    setState({ ...INITIAL_STATE, screen: 'title' });
  }, []);

  const startGame = useCallback(() => {
    dogLowHungerTimeRef.current = 0;
    setState({ ...INITIAL_STATE, screen: 'playing' });
  }, []);

  // Enter shop - opens shop interior
  const enterShop = useCallback((zone: HotspotZone) => {
    setState(s => {
      if (s.isGameOver || s.isPaused) return s;
      return { ...s, inShop: true, currentShop: zone };
    });
  }, []);

  // Exit shop
  const exitShop = useCallback(() => {
    setState(s => ({ ...s, inShop: false, currentShop: null }));
  }, []);

  // Funding stage progression
  const STAGE_ORDER: import('@/types/game').FundingStage[] = ['bootstrap', 'seed', 'series-a', 'series-b', 'series-c', 'series-d', 'ipo'];
  const STAGE_CONFIG: Record<import('@/types/game').FundingStage, { amount: number; successRate: number; energyCost: number; hopeLoss: number }> = {
    'bootstrap': { amount: 500000, successRate: 0.5, energyCost: 20, hopeLoss: 15 },
    'seed': { amount: 2000000, successRate: 0.4, energyCost: 25, hopeLoss: 25 },
    'series-a': { amount: 10000000, successRate: 0.35, energyCost: 30, hopeLoss: 30 },
    'series-b': { amount: 30000000, successRate: 0.3, energyCost: 35, hopeLoss: 35 },
    'series-c': { amount: 80000000, successRate: 0.25, energyCost: 40, hopeLoss: 40 },
    'series-d': { amount: 500000000, successRate: 0.15, energyCost: 50, hopeLoss: 50 },
    'ipo': { amount: 0, successRate: 1, energyCost: 0, hopeLoss: 0 },
  };

  // Handle shop action
  const handleShopAction = useCallback((shopType: HotspotZone, actionId: string) => {
    setState(s => {
      if (s.isGameOver) return s;
      
      const newState = { ...s, stats: { ...s.stats }, inShop: false, currentShop: null };
      
      // VC Firm actions - progressive funding rounds
      if (shopType === 'vc-firm') {
        if (actionId === 'pitch-next') {
          const currentStage = s.stats.fundingStage;
          const config = STAGE_CONFIG[currentStage];
          const stageIdx = STAGE_ORDER.indexOf(currentStage);
          const nextStage = stageIdx < STAGE_ORDER.length - 1 ? STAGE_ORDER[stageIdx + 1] : null;
          
          // Check energy cost
          if (s.stats.hunger < config.energyCost) {
            showEvent('Too exhausted to pitch. Need more energy.');
            showTransaction('fail', 'No Energy');
            return { ...s, inShop: false, currentShop: null };
          }
          
          // Spend energy
          newState.stats.hunger = Math.max(0, newState.stats.hunger - config.energyCost);
          
          // Valuable tech boosts success rate by 15%
          const techBonus = s.stats.hasValuableTech ? 0.15 : 0;
          const effectiveSuccessRate = Math.min(0.9, config.successRate + techBonus);
          
          if (Math.random() < effectiveSuccessRate && nextStage) {
            newState.stats.money += config.amount;
            newState.stats.fundingStage = nextStage;
            newState.stats.hope = Math.min(100, newState.stats.hope + 25);
            const formatted = config.amount >= 1000000 ? `$${config.amount / 1000000}M` : `$${config.amount / 1000}K`;
            showEvent(`${nextStage.toUpperCase()} CLOSED! ${formatted} in the bank!`);
            showTransaction('money', `+${formatted}`);
            
            // Victory condition - reached IPO!
            if (nextStage === 'ipo') {
              newState.isVictory = true;
              newState.isPaused = true;
              showEvent('🔔 YOU RANG THE BELL! IPO COMPLETE!');
            }
          } else {
            newState.stats.hope = Math.max(0, newState.stats.hope - config.hopeLoss);
            showEvent('"We\'ll pass. Not a fit for our portfolio."');
            showTransaction('fail', 'Rejected');
          }
        } else if (actionId === 'ring-bell') {
          // This is the IPO action - ring the bell for victory!
          newState.isVictory = true;
          newState.isPaused = true;
          showEvent('🔔 YOU RANG THE BELL! IPO COMPLETE!');
        } else if (actionId === 'network') {
          if (s.stats.money >= 20 && s.stats.hunger >= 10) {
            newState.stats.money -= 20;
            newState.stats.hunger = Math.max(0, newState.stats.hunger - 10);
            newState.stats.hope = Math.min(100, newState.stats.hope + 10);
            showEvent('Met some founders. Exchanged cards. Feeling connected.');
            showTransaction('hope', '+10');
          }
        }
      }
      
      // Strip club actions
      if (shopType === 'strip-club') {
        if (actionId === 'drinks' && s.stats.money >= 100) {
          newState.stats.money -= 100;
          newState.stats.warmth = Math.min(100, newState.stats.warmth + 15);
          newState.stats.hope = Math.min(100, newState.stats.hope + 8);
          showEvent('Champagne with clients. Looking like a baller.');
          showTransaction('money', '-$100');
        } else if (actionId === 'massage' && s.stats.money >= 200) {
          newState.stats.money -= 200;
          newState.stats.warmth = Math.min(100, newState.stats.warmth + 30);
          newState.stats.hope = Math.min(100, newState.stats.hope + 20);
          newState.stats.hunger = Math.min(100, newState.stats.hunger + 10);
          showEvent('VIP massage. Stress melting away...');
          showTransaction('hope', '+20');
        } else if (actionId === 'private' && s.stats.money >= 500) {
          newState.stats.money -= 500;
          newState.stats.warmth = 100;
          newState.stats.hope = Math.min(100, newState.stats.hope + 30);
          showEvent('Private room. Complete relaxation. Ready to hustle again.');
          showTransaction('hope', '+30');
        }
      }
      
      // Bar actions  
      if (shopType === 'bar') {
        if (actionId === 'beer' && s.stats.money >= 12) {
          newState.stats.money -= 12;
          newState.stats.warmth = Math.min(100, newState.stats.warmth + 5);
          showEvent('A cold schooner. The simple pleasures.');
        } else if (actionId === 'whiskey' && s.stats.money >= 25) {
          newState.stats.money -= 25;
          newState.stats.warmth = Math.min(100, newState.stats.warmth + 15);
          newState.stats.hope = Math.min(100, newState.stats.hope + 5);
          showEvent('Liquid courage. You can pitch anyone now.');
        } else if (actionId === 'round' && s.stats.money >= 80) {
          newState.stats.money -= 80;
          newState.stats.hope = Math.min(100, newState.stats.hope + 15);
          // Small chance of meeting someone useful
          if (Math.random() < 0.3) {
            newState.stats.money += Math.floor(Math.random() * 200) + 50;
            showEvent('Bought a round. Met an angel investor. Got a check!');
            showTransaction('money', '+$$$');
          } else {
            showEvent('Bought a round. Made some friends. Good vibes.');
          }
        }
      }
      
      // Pawn shop actions
      if (shopType === 'pawn') {
        if (actionId === 'sell-watch' && s.stats.hasWatch) {
          newState.stats.hasWatch = false;
          newState.stats.money += 300;
          newState.stats.hope = Math.max(0, newState.stats.hope - 10);
          showEvent('Sold your Rolex. $300 cash. It was just a thing.');
          showTransaction('money', '+$300');
        } else if (actionId === 'sell-laptop' && s.stats.hasLaptop) {
          newState.stats.hasLaptop = false;
          newState.stats.money += 800;
          newState.stats.hope = Math.max(0, newState.stats.hope - 20);
          newState.stats.burnRate = Math.max(100, newState.stats.burnRate - 200);
          showEvent('Sold your MacBook. $800. Can\'t code for a while.');
          showTransaction('money', '+$800');
        } else if (actionId === 'sell-phone' && s.stats.hasPhone) {
          newState.stats.hasPhone = false;
          newState.stats.money += 400;
          newState.stats.hope = Math.max(0, newState.stats.hope - 15);
          showEvent('Sold your iPhone. $400. Might miss some calls.');
          showTransaction('money', '+$400');
        }
      }
      
      // Cafe actions
      if (shopType === 'cafe') {
        if (actionId === 'coffee' && s.stats.money >= 6) {
          newState.stats.money -= 6;
          newState.stats.hunger = Math.min(100, newState.stats.hunger + 10);
          newState.stats.warmth = Math.min(100, newState.stats.warmth + 5);
          showEvent('Flat white. The fuel of founders.');
        } else if (actionId === 'meeting' && s.stats.money >= 15) {
          newState.stats.money -= 15;
          if (Math.random() < 0.4) {
            const lead = Math.floor(Math.random() * 100) + 20;
            newState.stats.money += lead;
            showEvent(`Coffee meeting went well. Got a $${lead} intro.`);
            showTransaction('money', `+$${lead}`);
          } else {
            newState.stats.hope = Math.min(100, newState.stats.hope + 5);
            showEvent('Coffee meeting. Good chat, no deal. Yet.');
          }
        } else if (actionId === 'cowork' && s.stats.money >= 35) {
          newState.stats.money -= 35;
          newState.stats.hope = Math.min(100, newState.stats.hope + 15);
          newState.stats.hunger = Math.min(100, newState.stats.hunger + 15);
          showEvent('Coworking all day. Productive. Feeling legit.');
        }
      }
      
      // Alley (dealer) actions
      if (shopType === 'alley') {
        if (actionId === 'buy-coke' && s.stats.money >= 150) {
          newState.stats.money -= 150;
          newState.stats.cocaine = Math.min(100, newState.stats.cocaine + 50);
          showEvent('High-grade. Feels like you can do anything.');
          showTransaction('drugs', '+50 COC');
        } else if (actionId === 'buy-party' && s.stats.money >= 400) {
          newState.stats.money -= 400;
          newState.stats.cocaine = Math.min(100, newState.stats.cocaine + 80);
          newState.stats.lsd = Math.min(5, newState.stats.lsd + 2);
          showEvent('Party pack acquired. Client entertainment sorted.');
          showTransaction('drugs', '+PARTY');
        } else if (actionId === 'deal') {
          // Risky business deal
          if (Math.random() < 0.4) {
            const profit = Math.floor(Math.random() * 500) + 200;
            newState.stats.money += profit;
            showEvent(`Shady deal paid off. +$${profit} cash.`);
            showTransaction('money', `+$${profit}`);
          } else {
            newState.stats.money = Math.max(0, newState.stats.money - 200);
            newState.stats.hope = Math.max(0, newState.stats.hope - 15);
            showEvent('Deal went south. Lost money. Stressed.');
            showTransaction('fail', 'Bad Deal');
          }
        }
      }
      
      // Food/dining actions
      if (shopType === 'food-vendor') {
        if (actionId === 'takeaway' && s.stats.money >= 25) {
          newState.stats.money -= 25;
          newState.stats.hunger = Math.min(100, newState.stats.hunger + 30);
          showEvent('UberEats. Quick fuel. Back to the grind.');
        } else if (actionId === 'lunch' && s.stats.money >= 85) {
          newState.stats.money -= 85;
          newState.stats.hunger = Math.min(100, newState.stats.hunger + 50);
          newState.stats.hope = Math.min(100, newState.stats.hope + 10);
          // Networking chance
          if (Math.random() < 0.25) {
            newState.stats.money += Math.floor(Math.random() * 300) + 100;
            showEvent('Business lunch. Client loved it. Got a contract!');
            showTransaction('money', '+$$$');
          } else {
            showEvent('Business lunch at Rockpool. Feeling successful.');
          }
        } else if (actionId === 'dinner' && s.stats.money >= 250) {
          newState.stats.money -= 250;
          newState.stats.hunger = 100;
          newState.stats.hope = Math.min(100, newState.stats.hope + 20);
          if (Math.random() < 0.5) {
            const deal = Math.floor(Math.random() * 1000) + 500;
            newState.stats.money += deal;
            showEvent(`Client dinner at Tetsuya's. Closed a $${deal} deal!`);
            showTransaction('money', `+$${deal}`);
          } else {
            showEvent('Fancy dinner. Great for relationships. No deal yet.');
          }
        } else if (actionId === 'eat-dog' && s.hasDog) {
          // Desperate move: sell dog to kitchen
          newState.hasDog = false;
          newState.dogHealth = 0;
          newState.stats.money += 50;
          newState.stats.hunger = Math.min(100, newState.stats.hunger + 40);
          newState.permanentHopeLoss += 30;
          newState.stats.hope = Math.max(0, newState.stats.hope - 30);
          showEvent('You sold your companion to the kitchen. $50. You monster.');
          showTransaction('danger', 'SOUL LOST');
        }
      }
      
      // Services (startup hub) actions
      if (shopType === 'services') {
        if (actionId === 'mentor') {
          newState.stats.hope = Math.min(100, newState.stats.hope + 15);
          showEvent('Mentor session. "Iterate faster. Talk to customers."');
          showTransaction('hope', '+15');
        } else if (actionId === 'workshop' && s.stats.money >= 50) {
          newState.stats.money -= 50;
          newState.stats.hope = Math.min(100, newState.stats.hope + 10);
          // Pitch improvement - future pitches work better
          showEvent('Pitch workshop. Learning to tell your story better.');
        } else if (actionId === 'apply') {
          if (Math.random() < 0.15) {
            newState.stats.money += 100000;
            newState.stats.hope = Math.min(100, newState.stats.hope + 30);
            showEvent('ACCEPTED! $100K accelerator investment!');
            showTransaction('money', '+$100K');
          } else {
            newState.stats.hope = Math.max(0, newState.stats.hope - 5);
            showEvent('Application submitted. Waiting to hear back...');
          }
        }
      }
      
      // Bins - essential early game scrounging!
      if (shopType === 'bins') {
        if (actionId === 'dig-shallow') {
          if (s.stats.hunger >= 5) {
            newState.stats.hunger = Math.max(0, newState.stats.hunger - 5);
            const found = Math.floor(Math.random() * 30) + 20; // $20-50
            newState.stats.money += found;
            const messages = [
              `Found $${found} in discarded receipts. Someone's expense account.`,
              `Old invoices worth $${found}. Finder's keepers.`,
              `$${found} cash in an envelope. Don't ask questions.`,
            ];
            showEvent(messages[Math.floor(Math.random() * messages.length)]);
            showTransaction('money', `+$${found}`);
          } else {
            showEvent('Too exhausted to dig through rubbish.');
          }
        } else if (actionId === 'dig-deep') {
          if (s.stats.hunger >= 15) {
            newState.stats.hunger = Math.max(0, newState.stats.hunger - 15);
            const found = Math.floor(Math.random() * 100) + 50; // $50-150
            newState.stats.money += found;
            // Chance to find something extra
            if (Math.random() < 0.2) {
              newState.stats.hope = Math.min(100, newState.stats.hope + 5);
              showEvent(`Jackpot! $${found} plus a working prototype someone tossed!`);
              showTransaction('money', `+$${found}`);
            } else {
              const messages = [
                `Deep in the bin: $${found}. Dignity is overrated.`,
                `Found $${found} and some useful contacts. Someone's Rolodex.`,
                `$${found} worth of scrap and cash. The hustle is real.`,
              ];
              showEvent(messages[Math.floor(Math.random() * messages.length)]);
              showTransaction('money', `+$${found}`);
            }
          } else {
            showEvent('Need more energy for a deep dive.');
          }
        } else if (actionId === 'scavenge') {
          if (s.stats.hunger >= 10) {
            newState.stats.hunger = Math.max(0, newState.stats.hunger - 10);
            if (Math.random() < 0.4) {
              const parts = Math.floor(Math.random() * 80) + 40; // $40-120
              newState.stats.money += parts;
              showEvent(`Found tech parts worth $${parts}. Flipped them on eBay.`);
              showTransaction('money', `+$${parts}`);
            } else {
              newState.stats.hope = Math.min(100, newState.stats.hope + 3);
              showEvent('Nothing useful. But you found a motivational poster. Ironic.');
              showTransaction('hope', '+3');
            }
          } else {
            showEvent('Too tired to scavenge.');
          }
        } else if (actionId === 'find-tech' && !s.stats.hasValuableTech) {
          if (s.stats.hunger >= 20) {
            newState.stats.hunger = Math.max(0, newState.stats.hunger - 20);
            if (Math.random() < 0.35) {
              newState.stats.hasValuableTech = true;
              newState.stats.hope = Math.min(100, newState.stats.hope + 15);
              const techFinds = [
                'Found a discarded prototype! This could demo well.',
                'Working GPS unit from a bankrupt startup. Proof of concept!',
                'Old but functional modem setup. Perfect for your pitch deck.',
                'Someone tossed a working Newton. Retro-future vibes for investors!',
              ];
              showEvent(techFinds[Math.floor(Math.random() * techFinds.length)]);
              showTransaction('hope', '+TECH');
            } else {
              newState.stats.hope = Math.min(100, newState.stats.hope + 3);
              showEvent('Nothing groundbreaking. Just more broken dreams.');
              showTransaction('hope', '+3');
            }
          } else {
            showEvent('Need more energy to hunt for prototypes.');
          }
        }
      }
      
      // Shelter (hotel) - rest
      if (shopType === 'shelter') {
        newState.stats.warmth = Math.min(100, newState.stats.warmth + 40);
        newState.stats.hunger = Math.min(100, newState.stats.hunger + 20);
        newState.stats.hope = Math.min(100, newState.stats.hope + 10);
        showEvent('Hotel for the night. Actually slept.');
      }
      
      return newState;
    });
  }, [showEvent, showTransaction]);

  const performAction = useCallback((zone: HotspotZone) => {
    setState(s => {
      if (s.isGameOver || s.isPaused) return s;
      
      // Most zones now open shop interiors (including bins!)
      const shopZones: HotspotZone[] = ['vc-firm', 'strip-club', 'bar', 'pawn', 'cafe', 'services', 'alley', 'food-vendor', 'shelter', 'bins'];
      if (shopZones.includes(zone)) {
        return { ...s, inShop: true, currentShop: zone };
      }
      
      const newState = { ...s, stats: { ...s.stats } };
      
      switch (zone) {
        case 'sleep': {
          // Office/coworking - work on the startup
          newState.stats.hunger = Math.max(0, newState.stats.hunger - 10);
          newState.stats.warmth = Math.min(100, newState.stats.warmth + 5);
          if (s.stats.hasLaptop) {
            newState.stats.hope = Math.min(100, newState.stats.hope + 8);
            // Burn rate generates some revenue if you work
            if (Math.random() < 0.3) {
              const revenue = Math.floor(Math.random() * 200) + 50;
              newState.stats.money += revenue;
              showEvent(`Grinding in the office. Made $${revenue} in revenue.`);
              showTransaction('money', `+$${revenue}`);
            } else {
              showEvent('Working late. Building the dream.');
            }
          } else {
            showEvent('No laptop. Can\'t really work. Just sitting here.');
          }
          break;
        }
        default:
          // Unknown zone - do nothing
          break;
      }
      
      return newState;
    });
  }, [showEvent, showTransaction]);

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
          newState.stats.hope = Math.max(0, newState.stats.hope - 15);
        } else if (roll < 0.6) {
          showEvent('The car drove off. They changed their mind.');
          newState.stats.hope = Math.max(0, newState.stats.hope - 5);
        } else if (roll < 0.8) {
          // Late game still provides SOME hope - money is survival
          const money = Math.floor(Math.random() * 12) + 8;
          newState.stats.money += money;
          newState.stats.hunger = Math.min(100, newState.stats.hunger + 15);
          newState.stats.warmth = Math.min(100, newState.stats.warmth + 10);
          newState.stats.hope = Math.min(100, newState.stats.hope + 5); // Small hope boost - you survived
          showEvent(`They paid $${money}. Brief. Professional. You survived.`);
          showTransaction('money', `+$${money}`);
          newState.recentCarEncounter = true;
        } else {
          showEvent('No one stopped. The street was empty.');
        }
      } else if (isMidGame) {
        // Mid game - still decent returns, hope is mixed
        if (roll < 0.15) {
          showEvent('The car drove off without stopping.');
          newState.stats.hope = Math.max(0, newState.stats.hope - 5);
        } else {
          const money = Math.floor(Math.random() * 15) + 10;
          newState.stats.money += money;
          newState.stats.hunger = Math.min(100, newState.stats.hunger + 25);
          newState.stats.warmth = Math.min(100, newState.stats.warmth + 20);
          // Net positive hope - you're surviving, that's something
          newState.stats.hope = Math.min(100, newState.stats.hope + 8);
          showEvent(`$${money}. Quick transaction. You're still here.`);
          showTransaction('money', `+$${money}`);
          newState.recentCarEncounter = true;
        }
      } else if (isEarlyGame) {
        // Early game - reliable money, good hope boost (control over your survival)
        const money = Math.floor(Math.random() * 20) + 15;
        newState.stats.money += money;
        newState.stats.hunger = Math.min(100, newState.stats.hunger + 35);
        newState.stats.warmth = Math.min(100, newState.stats.warmth + 30);
        // Significant hope boost - you took action, earned money, you're surviving
        newState.stats.hope = Math.min(100, newState.stats.hope + 15);
        showEvent(`$${money}. You made it work. That's survival.`);
        showTransaction('money', `+$${money}`);
        newState.recentCarEncounter = true;
      }
      
      // Clear the stopped car and increment counter
      newState.cars = s.cars.filter(c => !c.isEncounter);
      newState.carEncounterActive = false;
      newState.carEncounterCount = s.carEncounterCount + 1;
      
      return newState;
    });
  }, [showEvent, showTransaction, triggerGameOver]);

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
            const amount = Math.floor(Math.random() * 3) + 1;
            newState.stats.money += amount;
            newState.stats.hope = Math.min(100, newState.stats.hope + 5);
            showEvent('They stopped. They gave you money instead.');
            showTransaction('money', `+$${amount}`);
          } else if (roll < stealBias.kindnessChance + stealBias.shoutChance) {
            newState.stats.hope = Math.max(0, newState.stats.hope - 8);
            newState.recentTheft = true;
            showEvent('They shouted. People are staring.');
            showTransaction('danger', 'BUSTED');
          } else {
            const [minMoney, maxMoney] = stealBias.moneyRange;
            const stolen = Math.floor(Math.random() * (maxMoney - minMoney + 1)) + minMoney;
            newState.stats.money += stolen;
            newState.stats.hope = Math.max(0, newState.stats.hope - 3);
            showEvent(`You grabbed $${stolen} and ran.`);
            showTransaction('steal', `+$${stolen}`);
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
  }, [showEvent, showTransaction]);

  // Buy from dealer action (when near dealer pedestrian)
  const buyFromDealer = useCallback(() => {
    setState(s => {
      if (!s.stealWindowActive || !s.stealTarget || s.isGameOver || s.isPaused) return s;
      if (s.stealTarget.archetype !== 'dealer') return s;
      
      const newState = { ...s, stats: { ...s.stats } };
      const cost = 15 + Math.floor(Math.random() * 10); // $15-25
      
      if (newState.stats.money < cost) {
        showEvent('Not enough cash. The dealer waves you off.');
        showTransaction('fail', 'No $');
        return s;
      }
      
      // Random product
      const product = Math.random();
      newState.stats.money -= cost;
      
      if (product < 0.6) {
        // Cocaine
        newState.stats.cocaine = Math.min(100, newState.stats.cocaine + 40);
        showEvent(`Paid $${cost}. White powder in a tiny bag.`);
        showTransaction('drugs', `+40 COC`);
      } else {
        // LSD
        newState.stats.lsd = Math.min(5, newState.stats.lsd + 1);
        showEvent(`Paid $${cost}. A tiny square on your tongue.`);
        showTransaction('drugs', `+1 LSD`);
      }
      
      // Dealer disappears after transaction
      newState.pedestrians = s.pedestrians.filter(p => p.id !== s.stealTarget!.id);
      newState.stealWindowActive = false;
      newState.stealTarget = null;
      
      return newState;
    });
  }, [showEvent, showTransaction]);

  // Buy drugs - works in alley OR from dealer pedestrian
  const buyDrugs = useCallback(() => {
    setState(s => {
      if (s.isGameOver || s.isPaused) return s;
      
      // If near a dealer pedestrian, buy from them
      if (s.stealWindowActive && s.stealTarget?.archetype === 'dealer') {
        // Delegate to buyFromDealer
        return s; // Will be called separately
      }
      
      // If in alley with dealer nearby, buy there
      if (s.inAlley && s.dealerNearby) {
        const districtConfig = DISTRICT_CONFIGS[s.currentDistrict];
        const newState = { ...s, stats: { ...s.stats } };
        
        // Alley prices are slightly cheaper but riskier
        const cost = 10 + Math.floor(Math.random() * 8); // $10-17
        
        if (newState.stats.money < cost) {
          // Try begging
          if (Math.random() < 0.2) {
            newState.stats.cocaine = Math.min(100, newState.stats.cocaine + 10);
            showEvent('Dealer took pity. A small taste.');
            showTransaction('drugs', '+10 COC');
          } else {
            showEvent('No money. The dealer ignores you.');
            showTransaction('fail', 'No $');
          }
          return newState;
        }
        
        const roll = Math.random();
        if (roll < 0.7 * districtConfig.dealerFrequency) {
          // Good deal
          newState.stats.money -= cost;
          newState.stats.cocaine = Math.min(100, newState.stats.cocaine + 35);
          showEvent(`Paid $${cost}. The alley deal was clean.`);
          showTransaction('drugs', `+35 COC`);
        } else if (roll < 0.85) {
          // Weak stuff
          newState.stats.money -= cost;
          newState.stats.cocaine = Math.min(100, newState.stats.cocaine + 20);
          showEvent('Weak gear. Better than nothing.');
          showTransaction('drugs', '+20 COC');
        } else if (roll < 0.95) {
          // Scammed
          newState.stats.money -= cost;
          newState.stats.hope = Math.max(0, newState.stats.hope - 5);
          showEvent('They took your money and ran.');
          showTransaction('fail', `-$${cost}`);
        } else {
          // Cops! Dealer runs
          newState.dealerNearby = false;
          showEvent('Cops! The dealer scattered.');
          showTransaction('danger', 'RUN!');
        }
        
        return newState;
      }
      
      return s;
    });
    
    // Also try dealer pedestrian path
    buyFromDealer();
  }, [showEvent, showTransaction, buyFromDealer]);

  // Sell drugs to pedestrian
  const sellDrugs = useCallback(() => {
    setState(s => {
      if (!s.stealWindowActive || !s.stealTarget || s.isGameOver || s.isPaused) return s;
      if (s.stats.cocaine <= 0) {
        showEvent('You have nothing to sell.');
        return s;
      }
      
      const newState = { ...s, stats: { ...s.stats } };
      const target = s.stealTarget;
      const archetype = target.archetype;
      
      // Different archetypes buy at different rates
      const buyChance: Record<string, number> = {
        'junkie': 0.95,    // Junkies always buy
        'clubber': 0.6,    // Clubbers might buy
        'student': 0.3,    // Students sometimes
        'businessman': 0.1, // Businessmen rarely
        'backpacker': 0.4,
        'punk': 0.5,
        'sexworker': 0.4,
        'cop': 0.0,        // Cops never buy (arrest you!)
        'tourist': 0.05,
        'pensioner': 0.01,
        'dealer': 0.0,     // Dealers don't buy from you
      };
      
      const chance = buyChance[archetype] || 0.1;
      const roll = Math.random();
      
      if (archetype === 'cop') {
        showEvent('You tried to sell to a cop. Big mistake.');
        newState.recentTheft = true; // Triggers police
        newState.stats.hope = Math.max(0, newState.stats.hope - 20);
        showTransaction('danger', 'COP!');
      } else if (roll < chance) {
        // Successful sale - balanced: sell 15 coke for $10-18
        const amount = Math.floor(Math.random() * 8) + 10;
        newState.stats.money += amount;
        newState.stats.cocaine = Math.max(0, newState.stats.cocaine - 15);
        showEvent(`Sold a bump for $${amount}.`);
        showTransaction('money', `+$${amount}`);
      } else if (roll < chance + 0.2) {
        // They're interested but haggle - sell 10 coke for $5-8
        const amount = Math.floor(Math.random() * 3) + 5;
        newState.stats.money += amount;
        newState.stats.cocaine = Math.max(0, newState.stats.cocaine - 10);
        showEvent(`They wanted a taste. $${amount}.`);
        showTransaction('money', `+$${amount}`);
      } else {
        // No interest
        newState.stats.hope = Math.max(0, newState.stats.hope - 2);
        showEvent('Not interested. They walked away.');
        showTransaction('fail', 'No sale');
      }
      
      // Target moves on after interaction
      newState.pedestrians = s.pedestrians.filter(p => p.id !== target.id);
      newState.stealWindowActive = false;
      newState.stealTarget = null;
      
      return newState;
    });
  }, [showEvent, showTransaction]);

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
      
      // Base stat decay - tuned for 45-90 second runs
      // Hunger: 55 start, 1.0/sec decay = ~55 sec without food
      newState.stats.hunger = Math.max(0, newState.stats.hunger - 1.0);
      // Hope: 50 start, 0.5/sec decay = ~100 sec base, but penalties stack
      newState.stats.hope = Math.max(0, newState.stats.hope - 0.5 - (s.permanentHopeLoss * 0.02));
      
      // Cocaine effects - when high, hope boost but accelerated hunger drain
      const isHigh = s.stats.cocaine > 30;
      const isWithdrawing = s.stats.cocaine > 0 && s.stats.cocaine <= 20;
      
      if (isHigh) {
        // High on coke - feel invincible but burning through energy faster
        newState.stats.hope = Math.min(100, newState.stats.hope + 0.6);
        newState.stats.hunger = Math.max(0, newState.stats.hunger - 0.5); // Extra hunger drain
        newState.stats.warmth = Math.min(100, newState.stats.warmth + 0.3); // Feel warmer
        
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
      
      // Warmth decay based on time/weather - tuned for 45-90 sec runs
      let warmthDecay = 0.6;
      if (newState.timeOfDay === 'night') warmthDecay = 1.2;
      if (newState.timeOfDay === 'dusk') warmthDecay = 0.9;
      if (newState.isRaining) warmthDecay += 0.6;
      // LSD reduces awareness of cold
      if (s.lsdTripActive) warmthDecay *= 0.4;
      newState.stats.warmth = Math.max(0, newState.stats.warmth - warmthDecay);
      
      // Dog passive effects - stronger to reward keeping dog alive
      if (s.hasDog && s.dogHealth > 50 && !s.dogSick) {
        newState.stats.hope = Math.min(100, newState.stats.hope + 0.4);
        newState.stats.warmth = Math.min(100, newState.stats.warmth + 0.25);
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
      
      // Time of day cycle (changes every 20 seconds for faster gameplay)
      const timePhase = Math.floor(newState.stats.survivalTime / 20) % 4;
      const times: ('dawn' | 'day' | 'dusk' | 'night')[] = ['dawn', 'day', 'dusk', 'night'];
      newState.timeOfDay = times[timePhase];
      
      // Window states
      newState.shelterOpen = newState.timeOfDay === 'dusk' || newState.timeOfDay === 'night';
      newState.servicesOpen = newState.timeOfDay === 'day' || newState.timeOfDay === 'dawn';
      
      // Restock bins every ~25 seconds (more frequent for faster gameplay)
      if (newState.stats.survivalTime % 25 === 0 && newState.stats.survivalTime > 0) {
        newState.binsRestocked = true;
      }
      
      // Random weather changes every 15 seconds
      if (newState.stats.survivalTime % 15 === 0) {
        newState.isRaining = Math.random() < 0.25;
      }
      
      // === DISTRICT-BASED SYSTEMS ===
      const districtConfig = DISTRICT_CONFIGS[s.currentDistrict];
      
      // === IBIS SYSTEM ===
      // Ibis appears near bins - frequency varies by district
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
      
      // === DEALER SPAWN SYSTEM ===
      // Dealers spawn in alleys (zone 36-44) in higher-frequency districts
      const isDealerDistrict = districtConfig.dealerFrequency > 0.3;
      const dealerSpawnChance = districtConfig.dealerFrequency * 0.08;
      const hasDealer = updatedPeds.some(p => p.archetype === 'dealer');
      
      if (isDealerDistrict && !hasDealer && Math.random() < dealerSpawnChance) {
        // Spawn dealer in alley zone (stationary, lurking)
        const alleyX = 36 + Math.random() * 8; // Alley hotspot area
        const newDealer: PedestrianState = {
          id: pedIdRef.current++,
          x: alleyX,
          speed: 0.05, // Nearly stationary - lurking
          direction: Math.random() < 0.5 ? 'left' : 'right',
          archetype: 'dealer',
          canBeStolen: true,
        };
        updatedPeds.push(newDealer);
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
    startGame,
    restartGame,
    performAction,
    performDesperationAction,
    performPedestrianAction,
    handleCarEncounter,
    ignoreCarEncounter,
    attemptPurseSteal,
    buyFromDealer,
    buyDrugs,
    sellDrugs,
    clearTransaction,
    takeLSD,
    tick,
    enterShop,
    exitShop,
    handleShopAction,
  };
}
