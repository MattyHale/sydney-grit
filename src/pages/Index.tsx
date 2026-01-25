import { useEffect, useCallback, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useControls } from '@/hooks/useControls';
import { useAmbientAudio } from '@/hooks/useAmbientAudio';
import { HUD } from '@/components/game/HUD';
import { GameCanvas } from '@/components/game/GameCanvas';
import { Controls } from '@/components/game/Controls';
import { TitleScreen } from '@/components/game/TitleScreen';

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
    performPedestrianAction,
    handleCarEncounter,
    ignoreCarEncounter,
    buyFromDealer,
    sellDrugs,
    tick,
  } = useGameState();

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

  // UP button - enters zones or approaches car
  const handleInteract = useCallback(() => {
    if (state.carEncounterActive) {
      handleCarEncounter();
    } else if (state.currentZone) {
      performAction(state.currentZone);
    }
  }, [state.currentZone, state.carEncounterActive, performAction, handleCarEncounter]);

  // DOWN button - duck or dismiss car
  const handleDuck = useCallback((ducking: boolean) => {
    if (ducking && state.carEncounterActive) {
      ignoreCarEncounter();
    }
    setDucking(ducking);
  }, [state.carEncounterActive, ignoreCarEncounter, setDucking]);

  // STEAL - attempt theft on nearby pedestrian
  const handleSteal = useCallback(() => {
    if (state.stealWindowActive && state.stealTarget) {
      performPedestrianAction('steal');
    }
  }, [state.stealWindowActive, state.stealTarget, performPedestrianAction]);

  // FUCK - sex work with nearby target
  const handleFuck = useCallback(() => {
    if (state.stealWindowActive && state.stealTarget) {
      performPedestrianAction('trade');
    } else if (state.carEncounterActive) {
      handleCarEncounter();
    }
  }, [state.stealWindowActive, state.stealTarget, state.carEncounterActive, performPedestrianAction, handleCarEncounter]);

  // BUY DRUGS - from dealer
  const handleBuyDrugs = useCallback(() => {
    if (state.stealWindowActive && state.stealTarget?.archetype === 'dealer') {
      buyFromDealer();
    }
  }, [state.stealWindowActive, state.stealTarget, buyFromDealer]);

  // SELL DRUGS - to pedestrian
  const handleSellDrugs = useCallback(() => {
    if (state.stealWindowActive && state.stealTarget && state.stats.cocaine > 0) {
      sellDrugs();
    }
  }, [state.stealWindowActive, state.stealTarget, state.stats.cocaine, sellDrugs]);

  // Determine button availability
  const canSteal = state.stealWindowActive && state.stealTarget !== null;
  const canFuck = (state.stealWindowActive && state.stealTarget !== null) || state.carEncounterActive;
  const canBuyDrugs = state.stealWindowActive && state.stealTarget?.archetype === 'dealer';
  const canSellDrugs = state.stealWindowActive && state.stealTarget !== null && state.stats.cocaine > 0;

  // Set up keyboard controls
  useControls({
    onMoveLeft: () => updatePlayerPosition(-2),
    onMoveRight: () => updatePlayerPosition(2),
    onStopMove: stopWalking,
    onDuck: handleDuck,
    onInteract: handleInteract,
    onSteal: handleSteal,
    onFuck: handleFuck,
    onBuyDrugs: handleBuyDrugs,
    onSellDrugs: handleSellDrugs,
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
        currentDistrict={state.currentDistrict}
      />
      
      {/* Main game canvas - fills remaining space */}
      <GameCanvas 
        state={state}
        onPause={togglePause}
        onRestart={restartGame}
      />
      
      {/* Controls - D-pad and action buttons */}
      <Controls
        onLeft={() => updatePlayerPosition(-2)}
        onRight={() => updatePlayerPosition(2)}
        onUp={handleInteract}
        onDown={handleDuck}
        onStopMove={stopWalking}
        onSteal={handleSteal}
        onFuck={handleFuck}
        onBuyDrugs={handleBuyDrugs}
        onSellDrugs={handleSellDrugs}
        canSteal={canSteal}
        canFuck={canFuck}
        canBuyDrugs={canBuyDrugs}
        canSellDrugs={canSellDrugs}
        currentZone={state.currentZone}
        hasDog={state.hasDog}
      />
    </div>
  );
};

export default Index;
