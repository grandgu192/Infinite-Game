import { useEffect } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { useGameStore } from "../lib/stores/useGameStore";

// Control keys enum
export enum Controls {
  left = 'left',
  right = 'right',
  jump = 'jump',
  pause = 'pause',
  devMenu = 'devMenu'
}

export function usePlayerControls() {
  // Get control state from drei keyboard controls
  const leftPressed = useKeyboardControls<Controls>(state => state.left);
  const rightPressed = useKeyboardControls<Controls>(state => state.right);
  const jumpPressed = useKeyboardControls<Controls>(state => state.jump);
  const pausePressed = useKeyboardControls<Controls>(state => state.pause);
  
  // Get player methods from player store
  const setDirection = usePlayerStore(state => state.setDirection);
  const jump = usePlayerStore(state => state.jump);
  
  // Get game state
  const gameState = useGameStore(state => state.gameState);
  const setGameState = useGameStore(state => state.setGameState);

  // Update player direction based on key presses
  useEffect(() => {
    // Only process controls when the game is in playing state
    if (gameState !== 'playing') return;
    
    // Set direction based on left/right keys
    if (leftPressed && !rightPressed) {
      setDirection(-1);
    } else if (rightPressed && !leftPressed) {
      setDirection(1);
    } else {
      setDirection(0);
    }
  }, [leftPressed, rightPressed, setDirection, gameState]);

  // Handle jump action
  useEffect(() => {
    // Only process jump when the game is in playing state
    if (gameState !== 'playing') return;
    
    if (jumpPressed) {
      jump();
    }
  }, [jumpPressed, jump, gameState]);
  
  // Handle pause toggle
  useEffect(() => {
    if (pausePressed) {
      if (gameState === 'playing') {
        setGameState('paused');
      } else if (gameState === 'paused') {
        setGameState('playing');
      }
    }
  }, [pausePressed, gameState, setGameState]);
}
