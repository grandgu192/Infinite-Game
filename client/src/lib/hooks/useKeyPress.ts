import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/useGameStore';

/**
 * Custom hook to detect when Alt+O is pressed to open dev menu
 */
export function useDevMenuHotkey() {
  const [altPressed, setAltPressed] = useState(false);
  const toggleDevMenu = useGameStore(state => state.toggleDevMenu);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Track Alt key state
      if (event.key === 'Alt') {
        setAltPressed(true);
      }
      
      // Check for Alt+O combination
      if (altPressed && event.code === 'KeyO') {
        toggleDevMenu();
        event.preventDefault();
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Alt') {
        setAltPressed(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [altPressed, toggleDevMenu]);
  
  // No need to return anything, effect only
}

/**
 * Custom hook to detect when Escape is pressed to toggle pause
 */
export function usePauseHotkey() {
  const gameState = useGameStore(state => state.gameState);
  const setGameState = useGameStore(state => state.setGameState);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        if (gameState === 'playing') {
          setGameState('paused');
        } else if (gameState === 'paused') {
          setGameState('playing');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, setGameState]);
  
  // No need to return anything, effect only
}
