import { useEffect, useCallback, useRef } from 'react';

interface UseControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onStopMove: () => void;
  onDuck: (ducking: boolean) => void;
  onInteract: () => void;
  onSteal: () => void;
  onPitch: () => void;
  onBuyDrugs: () => void;
  onSellDrugs: () => void;
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
  onSteal,
  onPitch,
  onBuyDrugs,
  onSellDrugs,
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
        // Keyboard mappings for 4 action buttons
        case 'z':
        case 'Z':
        case '1':
          onSteal();
          break;
        case 'x':
        case 'X':
        case '2':
          onPitch();
          break;
        case 'c':
        case 'C':
        case '3':
          onBuyDrugs();
          break;
        case 'v':
        case 'V':
        case '4':
          onSellDrugs();
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
  }, [isPaused, isGameOver, onPause, onInteract, onDuck, onSteal, onPitch, onBuyDrugs, onSellDrugs, startMoving, stopMoving]);

  return { startMoving, stopMoving };
}
