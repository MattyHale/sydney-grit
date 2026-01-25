import { useEffect, useCallback } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useControls } from '@/hooks/useControls';
import { HUD } from '@/components/game/HUD';
import { GameCanvas } from '@/components/game/GameCanvas';
import { Controls } from '@/components/game/Controls';

const Index = () => {
  const {
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
  } = useGameState();

  // Handle interactions based on current zone or car encounter
  const handleInteract = useCallback(() => {
    if (state.carEncounterActive) {
      handleCarEncounter();
    } else if (state.currentZone) {
      performAction(state.currentZone);
    }
  }, [state.currentZone, state.carEncounterActive, performAction, handleCarEncounter]);

  // Handle duck/down - also dismisses car encounter
  const handleDuck = useCallback((ducking: boolean) => {
    if (ducking && state.carEncounterActive) {
      ignoreCarEncounter();
    }
    setDucking(ducking);
  }, [state.carEncounterActive, ignoreCarEncounter, setDucking]);

  // Button handlers for desperation actions and pedestrian actions
  const handleButtonA = useCallback(() => {
    if (state.carEncounterActive) {
      handleCarEncounter();
    } else if (state.stats.lsd > 0 && !state.lsdTripActive && state.currentZone === 'alley') {
      // Take LSD in alleys
      takeLSD();
    } else if (state.pedestrianActionAvailable.includes('steal')) {
      performPedestrianAction('steal');
    } else if (state.desperationAvailable[0]) {
      performDesperationAction(state.desperationAvailable[0]);
    } else if (state.currentZone) {
      performAction(state.currentZone);
    }
  }, [state.desperationAvailable, state.currentZone, state.carEncounterActive, state.pedestrianActionAvailable, state.stats.lsd, state.lsdTripActive, performAction, performDesperationAction, performPedestrianAction, handleCarEncounter, takeLSD]);

  const handleButtonB = useCallback(() => {
    // B button for pitch or steal
    if (state.pedestrianActionAvailable.includes('pitch')) {
      performPedestrianAction('pitch');
    } else if (state.stealWindowActive) {
      attemptPurseSteal();
    } else if (state.desperationAvailable[1]) {
      performDesperationAction(state.desperationAvailable[1]);
    }
  }, [state.stealWindowActive, state.desperationAvailable, state.pedestrianActionAvailable, attemptPurseSteal, performDesperationAction, performPedestrianAction]);

  const handleButtonC = useCallback(() => {
    // C button for trade/hit or purse steal
    if (state.pedestrianActionAvailable.includes('trade')) {
      performPedestrianAction('trade');
    } else if (state.pedestrianActionAvailable.includes('hit')) {
      performPedestrianAction('hit');
    } else if (state.stealWindowActive) {
      attemptPurseSteal();
    } else if (state.desperationAvailable[2]) {
      performDesperationAction(state.desperationAvailable[2]);
    }
  }, [state.stealWindowActive, state.desperationAvailable, state.pedestrianActionAvailable, attemptPurseSteal, performDesperationAction, performPedestrianAction]);

  // Set up keyboard controls
  useControls({
    onMoveLeft: () => updatePlayerPosition(-2),
    onMoveRight: () => updatePlayerPosition(2),
    onStopMove: stopWalking,
    onDuck: handleDuck,
    onInteract: handleInteract,
    onButtonA: handleButtonA,
    onButtonB: handleButtonB,
    onButtonC: handleButtonC,
    onPause: togglePause,
    isPaused: state.isPaused,
    isGameOver: state.isGameOver,
  });

  // Game loop - runs every second
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="h-full flex flex-col bg-gb-darkest overflow-hidden">
      {/* HUD - Stats bar at top */}
      <HUD 
        stats={state.stats} 
        timeOfDay={state.timeOfDay}
        isRaining={state.isRaining}
        lsdTripActive={state.lsdTripActive}
      />
      
      {/* Main game canvas - fills remaining space */}
      <GameCanvas 
        state={state}
        onPause={togglePause}
        onRestart={restartGame}
      />
      
      {/* Controls - D-pad and buttons at bottom */}
      <Controls
        onLeft={() => updatePlayerPosition(-2)}
        onRight={() => updatePlayerPosition(2)}
        onUp={handleInteract}
        onDown={handleDuck}
        onStopMove={stopWalking}
        onButtonA={handleButtonA}
        onButtonB={handleButtonB}
        onButtonC={handleButtonC}
        desperationActions={state.desperationAvailable}
        carEncounterActive={state.carEncounterActive}
        stealWindowActive={state.stealWindowActive}
        pedestrianActions={state.pedestrianActionAvailable}
      />
    </div>
  );
};

export default Index;
