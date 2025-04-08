import { useEffect, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Platform from "./Platform";
import Coin from "./Coin";
import Obstacles from "./Obstacles";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { useGameStore } from "../lib/stores/useGameStore";

interface PlatformGeneratorProps {
  difficulty: number;
}

// Types for generated platforms
interface GeneratedPlatform {
  id: number;
  position: [number, number, number];
  size: [number, number, number];
  type: 'normal' | 'bouncy' | 'moving';
  movementRange?: number;
  movementSpeed?: number;
}

// Types for generated coins
interface GeneratedCoin {
  id: number;
  position: [number, number, number];
  value: number;
}

// Types for generated obstacles
interface GeneratedObstacle {
  id: number;
  position: [number, number, number];
  type: 'spike' | 'barrier';
  size: [number, number, number];
}

const PlatformGenerator: React.FC<PlatformGeneratorProps> = ({ difficulty }) => {
  // State for generated elements
  const [platforms, setPlatforms] = useState<GeneratedPlatform[]>([]);
  const [coins, setCoins] = useState<GeneratedCoin[]>([]);
  const [obstacles, setObstacles] = useState<GeneratedObstacle[]>([]);
  
  // Reference for last generated position
  const lastPlatformEnd = useRef(0);
  const currentSeed = useRef(Date.now());
  const platformCounter = useRef(0);
  const coinCounter = useRef(0);
  const obstacleCounter = useRef(0);
  
  // Get player position
  const playerPosition = usePlayerStore(state => state.position);
  
  // Get game state
  const gameState = useGameStore(state => state.gameState);
  
  // Pseudo-random generator for consistent generation
  const random = () => {
    currentSeed.current = (currentSeed.current * 9301 + 49297) % 233280;
    return currentSeed.current / 233280;
  };
  
  // Generate initial platforms
  useEffect(() => {
    // Reset the generator
    lastPlatformEnd.current = 0;
    platformCounter.current = 0;
    coinCounter.current = 0;
    obstacleCounter.current = 0;
    currentSeed.current = Date.now();
    
    // Clear existing platforms
    setPlatforms([]);
    setCoins([]);
    setObstacles([]);
    
    // Generate initial set of platforms
    generateNewSection(20);
  }, []);
  
  // Generate more platforms as player moves
  useFrame(() => {
    // Only generate more platforms when the game is playing
    if (gameState !== 'playing') return;
    
    // Get player x position
    const playerX = playerPosition.x;
    
    // Generate more platforms when player gets close to the end of current platforms
    if (playerX > lastPlatformEnd.current - 20) {
      generateNewSection(10);
    }
    
    // Remove platforms that are too far behind the player
    if (platforms.length > 50) {
      // Find platforms that are far behind the player
      const newPlatforms = platforms.filter(platform => platform.position[0] > playerX - 30);
      
      // Only update if we're removing platforms
      if (newPlatforms.length < platforms.length) {
        setPlatforms(newPlatforms);
      }
    }
    
    // Remove coins that are too far behind the player
    if (coins.length > 50) {
      const newCoins = coins.filter(coin => coin.position[0] > playerX - 30);
      
      if (newCoins.length < coins.length) {
        setCoins(newCoins);
      }
    }
    
    // Remove obstacles that are too far behind the player
    if (obstacles.length > 50) {
      const newObstacles = obstacles.filter(obstacle => obstacle.position[0] > playerX - 30);
      
      if (newObstacles.length < obstacles.length) {
        setObstacles(newObstacles);
      }
    }
  });
  
  // Function to generate a new section of platforms
  const generateNewSection = (count: number) => {
    const newPlatforms: GeneratedPlatform[] = [];
    const newCoins: GeneratedCoin[] = [];
    const newObstacles: GeneratedObstacle[] = [];
    
    let currentX = lastPlatformEnd.current;
    
    // Generate a sequence of platforms
    for (let i = 0; i < count; i++) {
      // Generate platform
      const platformWidth = 2 + random() * 4; // Platforms between 2 and 6 units wide
      const platformHeight = 0.5;
      const platformDepth = 2;
      
      // Set position with gaps between platforms that increase with difficulty
      const gap = 1 + (random() * difficulty * 0.5);
      currentX += platformWidth / 2 + gap;
      
      // Vary platform height with difficulty
      const heightVariation = Math.min(5, difficulty * 0.5);
      const platformY = -2 + (random() * heightVariation - heightVariation / 2);
      
      // Determine platform type (with increasing chance of special platforms based on difficulty)
      let platformType: 'normal' | 'bouncy' | 'moving' = 'normal';
      const typeRoll = random();
      
      // Higher chance of special platforms with higher difficulty
      if (typeRoll < 0.05 * difficulty) {
        platformType = 'bouncy';
      } else if (typeRoll < 0.1 * difficulty) {
        platformType = 'moving';
      }
      
      // Movement parameters for moving platforms
      const movementRange = platformType === 'moving' ? 1 + random() * 3 : 0;
      const movementSpeed = 1 + random() * 2;
      
      // Add the platform
      newPlatforms.push({
        id: platformCounter.current++,
        position: [currentX, platformY, 0],
        size: [platformWidth, platformHeight, platformDepth],
        type: platformType,
        movementRange,
        movementSpeed
      });
      
      // Add coins on some platforms (higher chance with higher difficulty)
      if (random() < 0.3 + (difficulty * 0.05)) {
        // Number of coins to place on this platform
        const coinCount = 1 + Math.floor(random() * 3);
        
        for (let c = 0; c < coinCount; c++) {
          // Position coins along the platform
          const coinOffset = (random() * platformWidth * 0.8) - (platformWidth * 0.4);
          
          newCoins.push({
            id: coinCounter.current++,
            position: [currentX + coinOffset, platformY + 1, 0],
            value: 1
          });
        }
      }
      
      // Special gold coin (higher value) on some platforms
      if (random() < 0.05 * difficulty) {
        newCoins.push({
          id: coinCounter.current++,
          position: [currentX, platformY + 1.5, 0],
          value: 5 // Gold coin worth more
        });
      }
      
      // Add obstacles on some platforms (higher chance with higher difficulty)
      if (random() < 0.1 * difficulty && platformWidth > 3) {
        // Obstacle type
        const obstacleType = random() < 0.5 ? 'spike' : 'barrier';
        
        // Position obstacle on the platform
        const obstacleOffset = (random() * platformWidth * 0.6) - (platformWidth * 0.3);
        
        // Size depends on type
        const obstacleSize: [number, number, number] = 
          obstacleType === 'spike' 
            ? [0.5, 0.5, 0.5] // Spike is small
            : [0.3, 1.2, 1.5]; // Barrier is taller
        
        newObstacles.push({
          id: obstacleCounter.current++,
          position: [currentX + obstacleOffset, platformY + obstacleSize[1] / 2, 0],
          type: obstacleType,
          size: obstacleSize
        });
      }
      
      // Update the last platform end position
      currentX += platformWidth / 2;
      lastPlatformEnd.current = currentX;
    }
    
    // Add new platforms to the state
    setPlatforms(prev => [...prev, ...newPlatforms]);
    
    // Add new coins to the state
    setCoins(prev => [...prev, ...newCoins]);
    
    // Add new obstacles to the state
    setObstacles(prev => [...prev, ...newObstacles]);
  };
  
  return (
    <>
      {/* Render platforms */}
      {platforms.map(platform => (
        <Platform
          key={`platform-${platform.id}`}
          position={platform.position}
          size={platform.size}
          type={platform.type}
          movementRange={platform.movementRange}
          movementSpeed={platform.movementSpeed}
        />
      ))}
      
      {/* Render coins */}
      {coins.map(coin => (
        <Coin
          key={`coin-${coin.id}`}
          position={coin.position}
          value={coin.value}
        />
      ))}
      
      {/* Render obstacles */}
      {obstacles.map(obstacle => (
        <Obstacles
          key={`obstacle-${obstacle.id}`}
          position={obstacle.position}
          type={obstacle.type}
          size={obstacle.size}
        />
      ))}
      
      {/* Ground plane (starting platform) */}
      <mesh
        position={[0, -3, 0]}
        receiveShadow
      >
        <boxGeometry args={[10, 1, 5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </>
  );
};

export default PlatformGenerator;
