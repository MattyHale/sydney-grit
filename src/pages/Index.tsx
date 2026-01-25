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
    handleCarEncounter,
    ignoreCarEncounter,
    attemptPurseSteal,
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

  // Button handlers for desperation actions
  const handleButtonA = useCallback(() => {
    if (state.carEncounterActive) {
      handleCarEncounter();
    } else if (state.desperationAvailable[0]) {
      performDesperationAction(state.desperationAvailable[0]);
    } else if (state.currentZone) {
      performAction(state.currentZone);
    }
  }, [state.desperationAvailable, state.currentZone, state.carEncounterActive, performAction, performDesperationAction, handleCarEncounter]);

  const handleButtonB = useCallback(() => {
    // B button for purse steal when near pedestrian
    if (state.stealWindowActive) {
      attemptPurseSteal();
    } else if (state.desperationAvailable[1]) {
      performDesperationAction(state.desperationAvailable[1]);
    }
  }, [state.stealWindowActive, state.desperationAvailable, attemptPurseSteal, performDesperationAction]);

  const handleButtonC = useCallback(() => {
    // C button also for purse steal
    if (state.stealWindowActive) {
      attemptPurseSteal();
    } else if (state.desperationAvailable[2]) {
      performDesperationAction(state.desperationAvailable[2]);
    }
  }, [state.stealWindowActive, state.desperationAvailable, attemptPurseSteal, performDesperationAction]);

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
      />
    </div>
  );
};

export default Index;
