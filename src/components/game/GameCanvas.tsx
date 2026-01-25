import { GameState } from '@/types/game';
import { Street } from './Street';
import { Player } from './Player';
import { Dog } from './Dog';
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
  return (
    <div className="relative flex-1 overflow-hidden bg-gb-dark">
      {/* CRT Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 scanlines opacity-20" />
      
      {/* Street background and hotspots */}
      <Street 
        timeOfDay={state.timeOfDay}
        isRaining={state.isRaining}
        shelterOpen={state.shelterOpen}
        servicesOpen={state.servicesOpen}
        playerX={state.playerX}
      />
      
      {/* Dog companion */}
      <Dog 
        playerX={state.playerX}
        playerDirection={state.playerDirection}
        isVisible={state.hasDog}
        health={state.dogHealth}
      />
      
      {/* Player character */}
      <Player 
        x={state.playerX}
        direction={state.playerDirection}
        state={state.playerState}
      />
      
      {/* Event text overlay */}
      <TextOverlay 
        text={state.lastEventText}
        visible={state.eventTextVisible}
      />
      
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
