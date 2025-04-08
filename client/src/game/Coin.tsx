import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { useGameStore } from "../lib/stores/useGameStore";
import { useShopStore } from "../lib/stores/useShopStore";
import { useAudio } from "../lib/stores/useAudio";

interface CoinProps {
  position: [number, number, number];
  value?: number;
}

const Coin: React.FC<CoinProps> = ({ position, value = 1 }) => {
  // Reference to the coin mesh
  const meshRef = useRef<THREE.Mesh>(null);
  
  // State to track if coin is collected
  const [collected, setCollected] = useState(false);
  
  // Get player data
  const playerPosition = usePlayerStore(state => state.position);
  
  // Get game state
  const gameState = useGameStore(state => state.gameState);
  const addCoins = useGameStore(state => state.addCoins);
  const addScore = useGameStore(state => state.addScore);
  
  // Check if player has coin magnet
  const equippedItems = useShopStore(state => state.getEquippedItems());
  const hasCoinMagnet = equippedItems.some(item => item.effect?.coinAttraction);
  
  // Sound effect
  const { playSuccess } = useAudio();
  
  // Initial setup
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
    }
  }, [position]);
  
  // Animation and collection check
  useFrame((_, delta) => {
    // Only update when the game is playing and coin is not collected
    if (gameState !== 'playing' || collected) return;
    
    if (meshRef.current) {
      // Rotate coin
      meshRef.current.rotation.y += 2 * delta;
      
      // Float up and down slightly
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.1;
      
      // Calculate distance to player
      const distanceToPlayer = new THREE.Vector3(
        playerPosition.x,
        playerPosition.y,
        playerPosition.z
      ).distanceTo(new THREE.Vector3(...position));
      
      // Coin magnet effect - attract coins when player is nearby
      if (hasCoinMagnet && distanceToPlayer < 5 && !collected) {
        // Move coin towards player
        const direction = new THREE.Vector3(
          playerPosition.x - meshRef.current.position.x,
          playerPosition.y - meshRef.current.position.y,
          playerPosition.z - meshRef.current.position.z
        ).normalize();
        
        // Move faster when closer to player
        const attractionSpeed = 5 * (1 - distanceToPlayer / 5);
        
        // Update position
        meshRef.current.position.x += direction.x * attractionSpeed * delta;
        meshRef.current.position.y += direction.y * attractionSpeed * delta;
        meshRef.current.position.z += direction.z * attractionSpeed * delta;
      }
      
      // Check for collection (when player touches coin)
      if (distanceToPlayer < 1 && !collected) {
        // Mark as collected
        setCollected(true);
        
        // Add coins and score
        addCoins(value);
        addScore(value * 50); // 50 points per coin value
        
        // Play sound
        playSuccess();
      }
    }
  });
  
  // Don't render if collected
  if (collected) return null;
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
    >
      <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
      <meshStandardMaterial color="#ffdc73" metalness={0.8} roughness={0.2} />
    </mesh>
  );
};

export default Coin;
