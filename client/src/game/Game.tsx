import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useDevMenuHotkey, usePauseHotkey } from "../lib/hooks/useKeyPress";
import { usePlayerControls } from "./GameControls";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { useGameStore } from "../lib/stores/useGameStore";
import { useSurvivalScore, useDifficultyProgression } from "../lib/hooks/useGameLoop";
import Player from "./Player";
import PlatformGenerator from "./PlatformGenerator";
import { DirectionalLight, PointLight, AmbientLight } from "three";

const Game: React.FC = () => {
  // Set up game controls
  usePlayerControls();
  
  // Set up hotkey handlers
  useDevMenuHotkey();
  usePauseHotkey();
  
  // Get game state
  const gameState = useGameStore(state => state.gameState);
  
  // Use scoring system
  useSurvivalScore();
  
  // Get difficulty level
  const difficulty = useDifficultyProgression();
  
  // Get player update method
  const updatePlayer = usePlayerStore(state => state.update);
  
  // Reference for time tracking
  const lastUpdateTimeRef = useRef(0);
  
  // Refs for lights
  const directionalLightRef = useRef<DirectionalLight>(null);
  const pointLightRef = useRef<PointLight>(null);
  
  // Listen for game state changes
  useEffect(() => {
    // Reset player position when starting a new game
    if (gameState === 'playing') {
      usePlayerStore.getState().reset();
    }
  }, [gameState]);
  
  // Update game state each frame
  useFrame(({ clock }) => {
    // Only update when the game is actively playing
    if (gameState !== 'playing') return;
    
    const currentTime = clock.getElapsedTime();
    const deltaTime = currentTime - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = currentTime;
    
    // Update player physics
    updatePlayer(deltaTime);
    
    // Update directional light position to follow player
    if (directionalLightRef.current) {
      const playerPos = usePlayerStore.getState().position;
      directionalLightRef.current.position.x = playerPos.x;
      directionalLightRef.current.target.position.set(playerPos.x, playerPos.y, playerPos.z);
      directionalLightRef.current.target.updateMatrixWorld();
    }

    // Update point light to follow player
    if (pointLightRef.current) {
      const playerPos = usePlayerStore.getState().position;
      pointLightRef.current.position.set(playerPos.x, playerPos.y + 3, playerPos.z + 2);
    }
  });
  
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        ref={directionalLightRef}
        position={[0, 10, 5]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
      />
      <pointLight
        ref={pointLightRef}
        position={[0, 5, 3]}
        intensity={0.5}
        color="#ffffff"
      />
      
      {/* Player */}
      <Player />
      
      {/* Level Generation */}
      <PlatformGenerator difficulty={difficulty} />
    </>
  );
};

export default Game;
