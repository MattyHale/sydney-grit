import { useEffect, useCallback, useRef } from 'react';
import { HotspotZone, DesperationAction } from '@/types/game';

interface UseControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onStopMove: () => void;
  onDuck: (ducking: boolean) => void;
  onInteract: () => void;
  onButtonA: () => void;
  onButtonB: () => void;
  onButtonC: () => void;
  onPause: () => void;
  isPaused: boolean;
  isGameOver: boolean;
}

export function useControls({
  onMoveLeft,
  onMoveRight,
  onStopMove,
  onDuck,
  onInteract,
  onButtonA,
  onButtonB,
  onButtonC,
  onPause,
  isPaused,
  isGameOver,
}: UseControlsProps) {
  const keysPressed = useRef<Set<string>>(new Set());
  const moveIntervalRef = useRef<number | null>(null);

  const startMoving = useCallback((direction: 'left' | 'right') => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
    }
    
    const moveFunc = direction === 'left' ? onMoveLeft : onMoveRight;
    moveFunc();
    
    moveIntervalRef.current = window.setInterval(() => {
      moveFunc();
    }, 50);
  }, [onMoveLeft, onMoveRight]);

  const stopMoving = useCallback(() => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
    onStopMove();
  }, [onStopMove]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keysPressed.current.has(e.key)) return;
      keysPressed.current.add(e.key);

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        onPause();
        return;
      }

      if (isPaused || isGameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          startMoving('left');
          break;
        case 'ArrowRight':
          startMoving('right');
          break;
        case 'ArrowUp':
          onInteract();
          break;
        case 'ArrowDown':
          onDuck(true);
          break;
        case 'z':
        case 'Z':
          onButtonA();
          break;
        case 'x':
        case 'X':
          onButtonB();
          break;
        case 'c':
        case 'C':
          onButtonC();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        stopMoving();
      }
      if (e.key === 'ArrowDown') {
        onDuck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
    };
  }, [isPaused, isGameOver, onPause, onInteract, onDuck, onButtonA, onButtonB, onButtonC, startMoving, stopMoving]);

  return { startMoving, stopMoving };
}
