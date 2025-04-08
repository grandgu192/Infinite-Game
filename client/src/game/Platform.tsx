import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { useGameStore } from "../lib/stores/useGameStore";

interface PlatformProps {
  position: [number, number, number];
  size: [number, number, number];
  type?: 'normal' | 'bouncy' | 'moving';
  movementRange?: number;
  movementSpeed?: number;
}

const Platform: React.FC<PlatformProps> = ({ 
  position, 
  size, 
  type = 'normal',
  movementRange = 0,
  movementSpeed = 1
}) => {
  // Texture for the platform
  const woodTexture = useTexture("/textures/wood.jpg");
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(size[0], size[2]);
  
  // Reference to the platform mesh
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Reference for initial position
  const initialPos = useRef(new THREE.Vector3(...position));
  
  // Reference for platform movement
  const movementDirection = useRef(1);
  const currentOffset = useRef(0);
  
  // Get player data
  const playerPosition = usePlayerStore(state => state.position);
  const playerVelocity = usePlayerStore(state => state.velocity);
  const setPlayerVelocity = usePlayerStore(state => state.setVelocity);
  const setIsGrounded = usePlayerStore(state => state.setIsGrounded);
  const setIsJumping = usePlayerStore(state => state.setIsJumping);
  
  // Get game state
  const gameState = useGameStore(state => state.gameState);
  
  // Moving platform animation
  useEffect(() => {
    if (type === 'moving' && meshRef.current) {
      meshRef.current.position.set(...position);
    }
  }, [position, type]);
  
  // Update moving platform position
  useFrame((_, delta) => {
    // Only update when the game is playing
    if (gameState !== 'playing') return;
    
    // Handle moving platforms
    if (type === 'moving' && meshRef.current && movementRange > 0) {
      // Update horizontal position
      currentOffset.current += movementDirection.current * movementSpeed * delta;
      
      // Reverse direction if reached movement limits
      if (Math.abs(currentOffset.current) >= movementRange) {
        movementDirection.current *= -1;
        currentOffset.current = Math.sign(currentOffset.current) * movementRange;
      }
      
      // Apply movement
      meshRef.current.position.x = initialPos.current.x + currentOffset.current;
    }
    
    // Check for collision with player
    if (meshRef.current) {
      const platformTop = position[1] + size[1] / 2;
      const platformBottom = position[1] - size[1] / 2;
      const platformLeft = meshRef.current.position.x - size[0] / 2;
      const platformRight = meshRef.current.position.x + size[0] / 2;
      const platformFront = position[2] + size[2] / 2;
      const platformBack = position[2] - size[2] / 2;
      
      const playerBottom = playerPosition.y - 0.6; // Half of player height
      const playerTop = playerPosition.y + 0.6;
      const playerLeft = playerPosition.x - 0.4; // Half of player width
      const playerRight = playerPosition.x + 0.4;
      const playerFront = playerPosition.z + 0.25; // Half of player depth
      const playerBack = playerPosition.z - 0.25;
      
      // Check for collision
      if (
        playerRight > platformLeft && 
        playerLeft < platformRight && 
        playerFront > platformBack && 
        playerBack < platformFront
      ) {
        // Check if landing on top of platform
        if (
          playerBottom <= platformTop && 
          playerBottom > platformBottom &&
          playerVelocity.y <= 0
        ) {
          // Player is on top of platform
          setIsGrounded(true);
          setIsJumping(false);
          
          // Snap player to platform top
          const newPosition = {
            x: playerPosition.x,
            y: platformTop + 0.6, // Position player on top of platform
            z: playerPosition.z
          };
          usePlayerStore.getState().setPosition(newPosition);
          
          // Stop downward velocity
          setPlayerVelocity({
            ...playerVelocity,
            y: 0
          });
          
          // For bouncy platforms, apply upward force
          if (type === 'bouncy') {
            setPlayerVelocity({
              ...playerVelocity,
              y: 15 // Bouncy jump force
            });
            setIsGrounded(false);
            setIsJumping(true);
            
            // Play sound
            const { playHit } = useAudio.getState();
            playHit();
          }
          
          // For moving platforms, move the player with the platform
          if (type === 'moving' && movementRange > 0) {
            // Apply platform movement to player
            const platformVelocity = movementDirection.current * movementSpeed;
            
            // Update player position to move with platform
            const newPlatformPos = {
              x: playerPosition.x + platformVelocity * delta,
              y: playerPosition.y,
              z: playerPosition.z
            };
            usePlayerStore.getState().setPosition(newPlatformPos);
          }
        }
      }
    }
  });
  
  // Platform color based on type
  const getPlatformColor = () => {
    switch (type) {
      case 'bouncy':
        return '#ff5555';
      case 'moving':
        return '#55ff55';
      default:
        return '#ffffff';
    }
  };
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
      <meshStandardMaterial 
        map={woodTexture} 
        color={getPlatformColor()} 
      />
    </mesh>
  );
};

// Import useAudio here to avoid circular dependency
import { useFrame } from "@react-three/fiber";
import { useAudio } from "../lib/stores/useAudio";

export default Platform;
