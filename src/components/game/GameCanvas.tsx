import { GameState } from '@/types/game';
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

interface GameCanvasProps {
  state: GameState;
  onPause: () => void;
  onRestart: () => void;
}

export function GameCanvas({ state, onPause, onRestart }: GameCanvasProps) {
  const isHigh = state.stats.cocaine > 30;
  const highIntensity = Math.min(1, (state.stats.cocaine - 30) / 70);
  const isTripping = state.lsdTripActive;
  const isDogSacrifice = state.isPaused && !state.hasDog && state.dogHealth === 0;
  
  return (
    <div className="relative flex-1 overflow-hidden bg-gb-dark">
      {/* CRT Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 scanlines opacity-20" />
      
      {/* LSD trip overlay - chromatic aberration and color shift */}
      {isTripping && (
        <>
          <div 
            className="absolute inset-0 pointer-events-none z-20 animate-pulse"
            style={{ 
              background: `radial-gradient(ellipse at center, transparent 20%, rgba(150, 100, 255, 0.15) 60%, rgba(100, 200, 255, 0.1) 100%)`,
              mixBlendMode: 'overlay',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <div 
            className="absolute inset-0 pointer-events-none z-20"
            style={{ 
              boxShadow: 'inset 0 0 60px rgba(150, 100, 255, 0.3), inset 0 0 120px rgba(100, 200, 150, 0.15)',
              filter: 'hue-rotate(15deg)',
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
      
      {/* Street background and hotspots */}
      <Street 
        timeOfDay={state.timeOfDay}
        isRaining={state.isRaining}
        shelterOpen={state.shelterOpen}
        servicesOpen={state.servicesOpen}
        playerX={state.playerX}
        worldOffset={state.worldOffset}
      />
      
      {/* Ibis near bins */}
      <Ibis 
        x={state.ibis.x}
        isActive={state.ibis.isActive}
      />
      
      {/* Cars on the road */}
      {state.cars.map(car => (
        <Car 
          key={car.id}
          x={car.x}
          isStopped={car.isStopped}
          variant={car.variant}
        />
      ))}
      
      {/* Pedestrians */}
      {state.pedestrians.map(ped => (
        <Pedestrian 
          key={ped.id}
          pedestrian={ped}
          playerX={state.playerX}
        />
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
      
      {/* Steal window indicator */}
      {state.stealWindowActive && state.stealTarget && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-gb-darkest text-gb-lightest text-[9px] animate-pulse border border-gb-light rounded">
          B/C: Steal from {state.stealTarget.archetype}
        </div>
      )}
      
      {/* Pause button */}
      {!state.isGameOver && <PauseButton onPause={onPause} />}
      
      {/* Pause overlay */}
      {state.isPaused && <PauseOverlay onResume={onPause} />}
      
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
