import { GameState, HotspotZone } from '@/types/game';
import { Street } from './Street';
import { Player } from './Player';
import { Dog } from './Dog';
import { Car } from './Car';
import { Pedestrian } from './Pedestrian';
import { Ibis } from './Ibis';
import { Police } from './Police';
import { TextOverlay } from './TextOverlay';
import { PauseButton } from './PauseButton';
import { PauseOverlay } from './PauseOverlay';
import { GameOverOverlay } from './GameOverOverlay';
import { VictoryOverlay } from './VictoryOverlay';
import { TransactionIndicator } from './TransactionIndicator';
import { ShopInterior } from './ShopInterior';

interface GameCanvasProps {
  state: GameState;
  onPause: () => void;
  onRestart: () => void;
  onClearTransaction: () => void;
  onShopAction?: (shopType: HotspotZone, actionId: string) => void;
  onExitShop?: () => void;
}

export function GameCanvas({ state, onPause, onRestart, onClearTransaction, onShopAction, onExitShop }: GameCanvasProps) {
  const isHigh = state.stats.cocaine > 30;
  const highIntensity = Math.min(1, (state.stats.cocaine - 30) / 70);
  const isTripping = state.lsdTripActive;
  const isDogSacrifice = state.isPaused && !state.hasDog && state.dogHealth === 0;
  
  // Handle shop action
  const handleShopAction = (actionId: string) => {
    if (onShopAction && state.currentShop) {
      onShopAction(state.currentShop, actionId);
    }
  };
  
  // Show shop interior if in a shop
  if (state.inShop && state.currentShop) {
    return (
      <div className="relative flex-1 overflow-hidden bg-gb-dark">
        <ShopInterior 
          shopType={state.currentShop}
          money={state.stats.money}
          energy={state.stats.hunger}
          fundingStage={state.stats.fundingStage}
          onAction={handleShopAction}
          onExit={onExitShop || (() => {})}
        />
      </div>
    );
  }
  
  return (
    <div className="relative flex-1 overflow-hidden bg-gb-dark">
      {/* CRT Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 scanlines opacity-20" />
      
      {/* LSD trip overlay - enhanced chromatic aberration and color shift */}
      {isTripping && (
        <>
          {/* Chromatic aberration layer */}
          <div 
            className="absolute inset-0 pointer-events-none z-25 chromatic-aberration"
            style={{ 
              background: 'transparent',
              mixBlendMode: 'screen',
            }}
          />
          {/* Pulsing color gradient */}
          <div 
            className="absolute inset-0 pointer-events-none z-20 hue-cycle"
            style={{ 
              background: `radial-gradient(ellipse at center, transparent 10%, rgba(150, 100, 255, 0.12) 40%, rgba(100, 200, 255, 0.08) 70%, rgba(255, 150, 200, 0.1) 100%)`,
              mixBlendMode: 'overlay',
            }}
          />
          {/* Vignette with color bleeding */}
          <div 
            className="absolute inset-0 pointer-events-none z-20"
            style={{ 
              boxShadow: 'inset 0 0 80px rgba(150, 100, 255, 0.35), inset 0 0 150px rgba(100, 200, 150, 0.2), inset 0 0 40px rgba(255, 100, 200, 0.15)',
            }}
          />
          {/* RGB split ghost layers */}
          <div 
            className="absolute inset-0 pointer-events-none z-19"
            style={{ 
              background: 'linear-gradient(90deg, rgba(255, 0, 100, 0.03) 0%, transparent 3%, transparent 97%, rgba(0, 255, 200, 0.03) 100%)',
            }}
          />
        </>
      )}
      
      {/* Cocaine high overlay - pink/red tint with pulse */}
      {isHigh && !isTripping && (
        <div 
          className="absolute inset-0 pointer-events-none z-20 animate-pulse"
          style={{ 
            background: `radial-gradient(ellipse at center, transparent 30%, rgba(255, 100, 150, ${highIntensity * 0.15}) 100%)`,
            mixBlendMode: 'overlay',
          }}
        />
      )}
      
      {/* Screen edge vignette when very high on coke */}
      {state.stats.cocaine > 60 && !isTripping && (
        <div 
          className="absolute inset-0 pointer-events-none z-20"
          style={{ 
            boxShadow: `inset 0 0 ${30 + highIntensity * 40}px rgba(255, 50, 100, ${highIntensity * 0.3})`,
          }}
        />
      )}
      
      {/* Dog sacrifice overlay - dark dimming with frozen scroll effect */}
      {isDogSacrifice && (
        <div 
          className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.85)' }}
        >
          <div className="text-center px-4">
            <p className="text-gb-lightest text-[10px] leading-relaxed max-w-[200px]">
              You did what you had to do.
            </p>
            <p className="text-gb-dark text-[8px] mt-2 italic">
              Your companion is gone forever.
            </p>
          </div>
        </div>
      )}
      
      {/* Street background and hotspots - with wavy effect during trip */}
      <div className={isTripping ? 'lsd-wave world-breathe' : ''}>
        <Street 
          timeOfDay={state.timeOfDay}
          isRaining={state.isRaining}
          shelterOpen={state.shelterOpen}
          servicesOpen={state.servicesOpen}
          playerX={state.playerX}
          worldOffset={state.worldOffset}
          isTripping={isTripping}
        />
      </div>
      
      {/* Ibis near bins */}
      <Ibis 
        x={state.ibis.x}
        isActive={state.ibis.isActive}
      />
      
      {/* Cars on the road - wobble during trip */}
      {state.cars.map(car => (
        <div key={car.id} className={isTripping ? 'chromatic-aberration' : ''}>
          <Car 
            x={car.x}
            isStopped={car.isStopped}
            variant={car.variant}
          />
        </div>
      ))}
      
      {/* Pedestrians - wobble and chromatic shift during trip */}
      {state.pedestrians.map(ped => (
        <div key={ped.id} className={isTripping ? 'sprite-wobble chromatic-aberration' : ''} style={isTripping ? { animationDelay: `${ped.id * 0.2}s` } : {}}>
          <Pedestrian 
            pedestrian={ped}
            playerX={state.playerX}
          />
        </div>
      ))}
      
      {/* Police officer during sweeps */}
      <Police 
        x={state.police.x}
        isActive={state.police.isActive}
        direction={state.police.direction}
      />
      
      {/* Dog companion */}
      <Dog 
        playerX={state.playerX}
        playerDirection={state.playerDirection}
        isVisible={state.hasDog}
        health={state.dogHealth}
        isSick={state.dogSick}
      />
      
      {/* Player character */}
      <Player 
        x={state.playerX}
        direction={state.playerDirection}
        state={state.playerState}
        cocaineLevel={state.stats.cocaine}
      />
      
      {/* Event text overlay */}
      <TextOverlay 
        text={state.lastEventText}
        visible={state.eventTextVisible}
      />
      
      {/* Transaction indicator */}
      <TransactionIndicator 
        transaction={state.lastTransaction}
        onClear={onClearTransaction}
      />
      
      {/* Target indicator */}
      {state.stealWindowActive && state.stealTarget && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-gb-darkest text-gb-lightest text-[9px] animate-pulse border border-gb-light rounded">
          {state.stealTarget.archetype === 'vc' ? '📊 Pitch to VC' : 
           state.stealTarget.archetype === 'founder' ? '🤝 Network with Founder' :
           `Target: ${state.stealTarget.archetype}`}
        </div>
      )}
      
      {/* Pause button */}
      {!state.isGameOver && <PauseButton onPause={onPause} />}
      
      {/* Pause overlay */}
      {state.isPaused && !state.isVictory && <PauseOverlay onResume={onPause} />}
      
      {/* Victory overlay */}
      {state.isVictory && (
        <VictoryOverlay 
          survivalTime={state.stats.survivalTime}
          onRestart={onRestart}
        />
      )}
      
      {/* Game over overlay */}
      {state.isGameOver && (
        <GameOverOverlay 
          reason={state.gameOverReason}
          survivalTime={state.stats.survivalTime}
          onRestart={onRestart}
        />
      )}
    </div>
  );
}
