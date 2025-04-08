import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useGameStore } from "../stores/useGameStore";

/**
 * Custom hook to add to the player's score based on time survived
 */
export function useSurvivalScore() {
  const scoreInterval = useRef<number>(1); // Score every second
  const lastScoreTime = useRef<number>(0);
  
  // Get the current game state
  const gameState = useGameStore(state => state.gameState);
  
  // Use the frame callback to add score over time
  useFrame(({ clock }) => {
    const currentTime = clock.getElapsedTime();
    
    // Only add score when actively playing
    if (gameState !== 'playing') return;
    
    // Check if it's time to add score
    if (currentTime - lastScoreTime.current >= scoreInterval.current) {
      // Add 10 points for surviving another second
      useGameStore.getState().addScore(10);
      
      // Update the last score time
      lastScoreTime.current = currentTime;
    }
  });
}

/**
 * Custom hook to handle the game difficulty progression
 * Makes the game harder as the player's score increases
 */
export function useDifficultyProgression() {
  // Reference to track the current difficulty level
  const difficultyLevel = useRef(1);
  
  // Get the current score from the game store
  const score = useGameStore(state => state.score);
  
  // Calculate difficulty based on score
  // This will be used by the platform generator to adjust difficulty
  const difficulty = Math.min(10, 1 + Math.floor(score / 1000));
  
  // Update the difficulty level if it changed
  if (difficulty !== difficultyLevel.current) {
    difficultyLevel.current = difficulty;
    console.log(`Difficulty increased to level ${difficulty}`);
  }
  
  return difficulty;
}
