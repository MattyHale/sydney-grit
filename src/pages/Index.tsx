import { useEffect, useCallback, useState, useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useControls } from '@/hooks/useControls';
import { useAmbientAudio } from '@/hooks/useAmbientAudio';
import { HUD } from '@/components/game/HUD';
import { GameCanvas } from '@/components/game/GameCanvas';
import { Controls } from '@/components/game/Controls';
import { TitleScreen } from '@/components/game/TitleScreen';
import { resolveButtonActions } from '@/utils/resolveButtonActions';

const Index = () => {
  const [isMuted, setIsMuted] = useState(false);
  
  const {
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
    takeLSD,
    tick,
  } = useGameState();

  // Resolve button actions ONCE based on current state
  // This is the single source of truth for what each button does
  const resolvedButtons = useMemo(() => resolveButtonActions(state), [state]);

  // Ambient audio per district
  useAmbientAudio(
    state.currentDistrict,
    state.isPaused,
    state.isGameOver,
    state.isRaining,
    state.timeOfDay,
    isMuted
  );

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

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

  // Button handlers use the resolved actions for consistency
  const handleButtonA = useCallback(() => {
    const action = resolvedButtons.A;
    switch (action.type) {
      case 'car-encounter':
        handleCarEncounter();
        break;
      case 'dealer':
        buyFromDealer();
        break;
      case 'lsd':
        takeLSD();
        break;
      case 'pedestrian':
        if (action.action === 'steal') performPedestrianAction('steal');
        break;
      case 'desperation':
        if (action.action) performDesperationAction(action.action as any);
        break;
      case 'zone':
        if (action.action) performAction(action.action as any);
        break;
      default:
        break;
    }
  }, [resolvedButtons.A, handleCarEncounter, buyFromDealer, takeLSD, performPedestrianAction, performDesperationAction, performAction]);

  const handleButtonB = useCallback(() => {
    const action = resolvedButtons.B;
    switch (action.type) {
      case 'pedestrian':
        if (action.action === 'pitch') performPedestrianAction('pitch');
        break;
      case 'steal':
        attemptPurseSteal();
        break;
      case 'desperation':
        if (action.action) performDesperationAction(action.action as any);
        break;
      default:
        break;
    }
  }, [resolvedButtons.B, performPedestrianAction, attemptPurseSteal, performDesperationAction]);

  const handleButtonC = useCallback(() => {
    const action = resolvedButtons.C;
    switch (action.type) {
      case 'pedestrian':
        if (action.action === 'trade') performPedestrianAction('trade');
        else if (action.action === 'hit') performPedestrianAction('hit');
        break;
      case 'steal':
        attemptPurseSteal();
        break;
      case 'desperation':
        if (action.action) performDesperationAction(action.action as any);
        break;
      default:
        break;
    }
  }, [resolvedButtons.C, performPedestrianAction, attemptPurseSteal, performDesperationAction]);

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

  // Show title screen if not playing
  if (state.screen === 'title') {
    return <TitleScreen onStart={startGame} />;
  }

  return (
    <div className="h-full flex flex-col bg-gb-darkest overflow-hidden">
      {/* HUD - Stats bar at top */}
      <HUD 
        stats={state.stats} 
        timeOfDay={state.timeOfDay}
        isRaining={state.isRaining}
        lsdTripActive={state.lsdTripActive}
        isMuted={isMuted}
        onToggleMute={toggleMute}
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
        resolvedButtons={resolvedButtons}
      />
    </div>
  );
};

export default Index;
