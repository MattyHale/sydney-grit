

# Action Button Consistency Fix

## Problem Summary
The A, B, and C action buttons have inconsistent behavior because the button label display logic and the actual button handler logic use different priority orderings. This means a button can show one icon/label but actually trigger a different action when pressed.

## Root Causes

1. **Mismatched Priority Chains**
   - The `getButtonLabel()` function in `Controls.tsx` checks conditions in one order
   - The `handleButtonA/B/C` callbacks in `Index.tsx` check conditions in a different order
   - Example: Button A label shows dealer buy icon, but handler might trigger LSD or steal instead

2. **Overlapping Action Contexts**
   - Multiple game states can be true simultaneously (dealer nearby + pedestrian nearby + desperation available)
   - No clear hierarchy for which takes precedence

3. **Dynamic State Changes**
   - The `pedestrianActionAvailable` array and `desperationAvailable` array update frequently during gameplay
   - Button meanings change mid-press

## Solution

### 1. Create a Unified Action Resolution System
Create a single source of truth that determines what each button does based on current game state:

```text
+-------------------+
|  Game State       |
+-------------------+
        |
        v
+-------------------+
| resolveButtonActions() |
+-------------------+
        |
        v
+-------------------+
| Returns: {        |
|   A: ActionDef    |
|   B: ActionDef    |
|   C: ActionDef    |
| }                 |
+-------------------+
        |
        +------+------+
        |             |
        v             v
  getButtonLabel()  handleButtonX()
  (display)         (execution)
```

### 2. Define Clear Priority Order
Establish a single priority chain that both display and handlers follow:

| Priority | Condition | Button A | Button B | Button C |
|----------|-----------|----------|----------|----------|
| 1 | Car encounter | Approach | - | - |
| 2 | Dealer nearby | Buy drugs | - | - |
| 3 | Pedestrian nearby | Steal | Pitch | Trade/Hit |
| 4 | Steal window | - | Grab purse | Grab purse |
| 5 | Desperation | Action 0 | Action 1 | Action 2 |
| 6 | Zone action | Zone act | - | - |
| 7 | Default | A | B | C |

### 3. Simplify the Controls Component
Remove complex conditional logic from `getButtonLabel()` and instead receive resolved action definitions as props.

## Technical Implementation

### New Types (in `src/types/game.ts`)
Add a new type for resolved button actions:

```typescript
interface ButtonAction {
  type: 'car-encounter' | 'buy-dealer' | 'pedestrian' | 'steal' | 'desperation' | 'zone' | 'none';
  action?: string;
  label: string;
  icon: string;
}

interface ResolvedButtons {
  A: ButtonAction;
  B: ButtonAction;
  C: ButtonAction;
}
```

### New Hook or Helper (in `src/hooks/useGameState.ts`)
Add a `resolveButtonActions()` function that:
- Takes current game state
- Returns consistent `ResolvedButtons` object
- Is called once per render, not per button

### Update Index.tsx
- Call `resolveButtonActions(state)` once
- Pass resolved actions to Controls component
- Use same resolution for handlers

### Update Controls.tsx
- Remove `getButtonLabel()` complexity
- Accept `resolvedActions: ResolvedButtons` as prop
- Simply display `resolvedActions.A.icon` etc.
- Handlers just call parent callbacks (no logic change needed)

## Files to Modify

1. **`src/types/game.ts`**
   - Add `ButtonAction` and `ResolvedButtons` interfaces

2. **`src/hooks/useGameState.ts`**
   - Add `resolveButtonActions()` helper function
   - Export it alongside existing hooks

3. **`src/pages/Index.tsx`**
   - Call resolution function
   - Update button handlers to use resolved actions
   - Pass resolved actions to Controls

4. **`src/components/game/Controls.tsx`**
   - Accept resolved actions prop
   - Remove `getButtonLabel()` function
   - Simplify rendering to use passed-in icons/labels

## Expected Outcome
- Buttons always show the same action they will perform
- Clear, predictable priority order for all contexts
- Easier to maintain and extend with new actions
- No more "button shows X but does Y" bugs

