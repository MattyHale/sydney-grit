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
    tick,
  } = useGameState();

  // Handle interactions based on current zone
  const handleInteract = useCallback(() => {
    if (state.currentZone) {
      performAction(state.currentZone);
    }
  }, [state.currentZone, performAction]);

  // Button handlers for desperation actions
  const handleButtonA = useCallback(() => {
    if (state.desperationAvailable[0]) {
      performDesperationAction(state.desperationAvailable[0]);
    } else if (state.currentZone) {
      performAction(state.currentZone);
    }
  }, [state.desperationAvailable, state.currentZone, performAction, performDesperationAction]);

  const handleButtonB = useCallback(() => {
    if (state.desperationAvailable[1]) {
      performDesperationAction(state.desperationAvailable[1]);
    }
  }, [state.desperationAvailable, performDesperationAction]);

  const handleButtonC = useCallback(() => {
    if (state.desperationAvailable[2]) {
      performDesperationAction(state.desperationAvailable[2]);
    }
  }, [state.desperationAvailable, performDesperationAction]);

  // Set up keyboard controls
  useControls({
    onMoveLeft: () => updatePlayerPosition(-2),
    onMoveRight: () => updatePlayerPosition(2),
    onStopMove: stopWalking,
    onDuck: setDucking,
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
        onDown={setDucking}
        onStopMove={stopWalking}
        onButtonA={handleButtonA}
        onButtonB={handleButtonB}
        onButtonC={handleButtonC}
        desperationActions={state.desperationAvailable}
      />
    </div>
  );
};

export default Index;
