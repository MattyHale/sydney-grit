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
    buyDrugs,
    sellDrugs,
    clearTransaction,
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

  // PITCH - sales pitch to nearby target
  const handlePitch = useCallback(() => {
    if (state.stealWindowActive && state.stealTarget) {
      performPedestrianAction('pitch');
    } else if (state.carEncounterActive) {
      handleCarEncounter();
    }
  }, [state.stealWindowActive, state.stealTarget, state.carEncounterActive, performPedestrianAction, handleCarEncounter]);

  // BUY DRUGS - from dealer or in alley
  const handleBuyDrugs = useCallback(() => {
    buyDrugs();
  }, [buyDrugs]);

  // SELL DRUGS - to pedestrian
  const handleSellDrugs = useCallback(() => {
    if (state.stealWindowActive && state.stealTarget && state.stats.cocaine > 0) {
      sellDrugs();
    }
  }, [state.stealWindowActive, state.stealTarget, state.stats.cocaine, sellDrugs]);

  // Determine button availability
  const canSteal = state.stealWindowActive && state.stealTarget !== null;
  const canPitch = (state.stealWindowActive && state.stealTarget !== null) || state.carEncounterActive;
  // Can buy drugs if in alley with dealer OR near a dealer pedestrian
  const canBuyDrugs = (state.inAlley && state.dealerNearby) || (state.stealWindowActive && state.stealTarget?.archetype === 'dealer');
  const canSellDrugs = state.stealWindowActive && state.stealTarget !== null && state.stats.cocaine > 0;

  // Set up keyboard controls
  useControls({
    onMoveLeft: () => updatePlayerPosition(-2),
    onMoveRight: () => updatePlayerPosition(2),
    onStopMove: stopWalking,
    onDuck: handleDuck,
    onInteract: handleInteract,
    onSteal: handleSteal,
    onPitch: handlePitch,
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
        onClearTransaction={clearTransaction}
      />
      
      {/* Controls - D-pad and action buttons */}
      <Controls
        onLeft={() => updatePlayerPosition(-2)}
        onRight={() => updatePlayerPosition(2)}
        onUp={handleInteract}
        onDown={handleDuck}
        onStopMove={stopWalking}
        onSteal={handleSteal}
        onPitch={handlePitch}
        onBuyDrugs={handleBuyDrugs}
        onSellDrugs={handleSellDrugs}
        canSteal={canSteal}
        canPitch={canPitch}
        canBuyDrugs={canBuyDrugs}
        canSellDrugs={canSellDrugs}
        currentZone={state.currentZone}
        hasDog={state.hasDog}
      />
    </div>
  );
};

export default Index;
