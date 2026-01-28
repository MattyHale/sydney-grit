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

// Building type to emoji/label mapping for the entry indicator
const BUILDING_INFO: Record<string, { emoji: string; label: string }> = {
  hub: { emoji: '🚀', label: 'STARTUP HUB' },
  vc: { emoji: '💼', label: 'VC OFFICE' },
  shelter: { emoji: '🏠', label: 'SHELTER' },
  club: { emoji: '💃', label: 'CLUB' },
  bar: { emoji: '🍺', label: 'BAR' },
  food: { emoji: '🍴', label: 'RESTAURANT' },
  cafe: { emoji: '☕', label: 'CAFE' },
  hostel: { emoji: '🛏️', label: 'HOSTEL' },
  pawn: { emoji: '💰', label: 'PAWN' },
  alley: { emoji: '🚬', label: 'ALLEY' },
  derelict: { emoji: '🏚️', label: 'EMPTY' },
  shop: { emoji: '🏪', label: 'SHOP' },
  servo: { emoji: '⛽', label: 'SERVO' },
  rsl: { emoji: '🎰', label: 'RSL/POKIES' },
  station: { emoji: '🚂', label: 'STATION' },
  arcade: { emoji: '🎮', label: 'ARCADE' },
};

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
  const isFentanyl = state.fentanylActive;
  
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
          vcFunnelStage={state.vcFunnelStage}
          vcGhosted={state.stats.survivalTime < state.vcGhostedUntil}
          hasDog={state.hasDog}
          hasValuableTech={state.stats.hasValuableTech}
          hasGuitar={state.stats.hasGuitar}
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
      
      {/* LSD trip overlay - golden age scroll lanes */}
      {isTripping && (
        <>
          <div className="absolute inset-0 pointer-events-none z-20 golden-scroll-lanes" />
          <div 
            className="absolute inset-0 pointer-events-none z-21"
            style={{ 
              boxShadow: 'inset 0 0 90px rgba(255, 210, 120, 0.35), inset 0 0 160px rgba(120, 80, 20, 0.25)',
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
      {state.stats.cocaine > 60 && !isTripping && !isFentanyl && (
        <div 
          className="absolute inset-0 pointer-events-none z-20"
          style={{ 
            boxShadow: `inset 0 0 ${30 + highIntensity * 40}px rgba(255, 50, 100, ${highIntensity * 0.3})`,
          }}
        />
      )}
      
      {/* Fentanyl overdose overlay - everything slowed, muted, warning message */}
      {isFentanyl && (
        <>
          {/* Dark blur overlay */}
          <div 
            className="absolute inset-0 pointer-events-none z-40"
            style={{ 
              background: 'rgba(0, 0, 0, 0.6)',
              filter: 'blur(1px)',
            }}
          />
          {/* Pulsing red warning */}
          <div 
            className="absolute inset-0 pointer-events-none z-41 animate-pulse"
            style={{ 
              background: 'radial-gradient(ellipse at center, transparent 20%, rgba(200, 0, 0, 0.25) 100%)',
            }}
          />
          {/* Warning text */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-center">
            <div 
              className="text-red-500 text-lg font-bold animate-pulse px-6 py-3 rounded"
              style={{ 
                background: 'rgba(0, 0, 0, 0.8)',
                textShadow: '0 0 10px red, 0 0 20px red',
              }}
            >
              ☠️ BAD DRUGS - FENTANYL ☠️
            </div>
            <div className="text-white text-xs mt-2 opacity-70">
              {Math.ceil(state.fentanylTimeRemaining)}s remaining...
            </div>
          </div>
        </>
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
        mode={state.police.mode}
        slipStage={state.police.slipStage}
        opacity={state.police.opacity}
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
      
      {/* Building entry indicator - shows what you'll enter when pressing UP */}
      {state.currentVenueName && state.currentVenueType && !state.stealWindowActive && (
        <div 
          className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded border-2 text-center"
          style={{ 
            background: '#000000ee',
            borderColor: BUILDING_INFO[state.currentVenueType]?.emoji ? '#ffffff44' : '#333',
          }}
        >
          <div className="text-[10px] font-bold text-white flex items-center gap-1 justify-center">
            <span>{BUILDING_INFO[state.currentVenueType]?.emoji || '🏢'}</span>
            <span>{BUILDING_INFO[state.currentVenueType]?.label || 'BUILDING'}</span>
          </div>
          <div className="text-[8px] text-gray-300 mt-0.5">{state.currentVenueName}</div>
          <div className="text-[7px] text-gray-500 mt-0.5">↑ ENTER</div>
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
