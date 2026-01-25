import { GameState, ResolvedButtons, ButtonAction, DesperationAction, PedestrianAction } from '@/types/game';

const DESPERATION_LABELS: Record<DesperationAction, string> = {
  'theft': '💰',
  'car': '🚗',
  'sell': '📦',
  'dog-sacrifice': '🐕',
  'buy-coke': '❄️',
  'purse-steal': '👛',
};

const DEFAULT_BUTTON: ButtonAction = { type: 'none', label: '' };

/**
 * Resolves what each button should display and execute based on current game state.
 * This is the SINGLE SOURCE OF TRUTH for button behavior - both display and handlers
 * should use this to ensure consistency.
 * 
 * Priority order (highest to lowest):
 * 1. Car encounter active → A: approach
 * 2. Dealer nearby → A: buy drugs
 * 3. LSD available in alley → A: take LSD
 * 4. Pedestrian nearby → A: steal, B: pitch, C: trade/hit
 * 5. Steal window (legacy purse steal) → B/C: grab purse
 * 6. Desperation actions → A/B/C mapped by index
 * 7. Zone action → A: zone action
 * 8. Default → A/B/C labels
 */
export function resolveButtonActions(state: GameState): ResolvedButtons {
  const {
    carEncounterActive,
    stealTarget,
    stats,
    lsdTripActive,
    currentZone,
    pedestrianActionAvailable,
    stealWindowActive,
    desperationAvailable,
  } = state;

  const dealerNearby = stealTarget?.archetype === 'dealer';
  const canTakeLSD = stats.lsd > 0 && !lsdTripActive && currentZone === 'alley';

  // Start with defaults
  const buttons: ResolvedButtons = {
    A: { type: 'none', label: 'A' },
    B: { type: 'none', label: 'B' },
    C: { type: 'none', label: 'C' },
  };

  // Priority 1: Car encounter (only affects A)
  if (carEncounterActive) {
    buttons.A = { type: 'car-encounter', label: '🚗', action: 'approach' };
    // B and C fall through to other priorities
  }

  // Priority 2: Dealer nearby (only affects A, if not already set)
  if (!carEncounterActive && dealerNearby) {
    buttons.A = { type: 'dealer', label: '💊', action: 'buy' };
  }

  // Priority 3: LSD in alley (only affects A, if not already set by higher priorities)
  if (!carEncounterActive && !dealerNearby && canTakeLSD) {
    buttons.A = { type: 'lsd', label: '🌈', action: 'take' };
  }

  // Priority 4: Pedestrian actions (if not overridden by higher priorities)
  if (!carEncounterActive && !dealerNearby && pedestrianActionAvailable.length > 0) {
    if (pedestrianActionAvailable.includes('steal') && buttons.A.type === 'none') {
      buttons.A = { type: 'pedestrian', label: '🤏', action: 'steal' };
    }
    if (pedestrianActionAvailable.includes('pitch')) {
      buttons.B = { type: 'pedestrian', label: '📢', action: 'pitch' };
    }
    if (pedestrianActionAvailable.includes('trade')) {
      buttons.C = { type: 'pedestrian', label: '💋', action: 'trade' };
    } else if (pedestrianActionAvailable.includes('hit')) {
      buttons.C = { type: 'pedestrian', label: '👊', action: 'hit' };
    }
  }

  // Priority 5: Steal window (legacy purse steal, B and C only)
  if (stealWindowActive && !dealerNearby && pedestrianActionAvailable.length === 0) {
    if (buttons.B.type === 'none') {
      buttons.B = { type: 'steal', label: '👛', action: 'purse' };
    }
    if (buttons.C.type === 'none') {
      buttons.C = { type: 'steal', label: '👛', action: 'purse' };
    }
  }

  // Priority 6: Desperation actions (fill remaining slots)
  desperationAvailable.forEach((action, index) => {
    const buttonKey = (['A', 'B', 'C'] as const)[index];
    if (buttons[buttonKey].type === 'none') {
      buttons[buttonKey] = {
        type: 'desperation',
        label: DESPERATION_LABELS[action] || buttonKey,
        action,
      };
    }
  });

  // Priority 7: Zone action (A only, if still default)
  if (currentZone && buttons.A.type === 'none') {
    buttons.A = { type: 'zone', label: 'A', action: currentZone };
  }

  return buttons;
}
