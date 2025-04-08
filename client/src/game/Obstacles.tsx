import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { useGameStore } from "../lib/stores/useGameStore";
import { useAudio } from "../lib/stores/useAudio";

interface ObstaclesProps {
  position: [number, number, number];
  type: 'spike' | 'barrier';
  size: [number, number, number];
}

const Obstacles: React.FC<ObstaclesProps> = ({ position, type, size }) => {
  // Reference to the obstacle mesh
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Get player data
  const playerPosition = usePlayerStore(state => state.position);
  const playerVelocity = usePlayerStore(state => state.velocity);
  
  // Get game state
  const gameState = useGameStore(state => state.gameState);
  
  // Sound effect
  const { playHit } = useAudio();
  
  // Initial setup
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
    }
  }, [position]);
  
  // Check for collision with player
  useFrame(() => {
    // Only check collisions when the game is playing
    if (gameState !== 'playing' || !meshRef.current) return;
    
    // Calculate obstacle bounds
    const obstacleLeft = position[0] - size[0] / 2;
    const obstacleRight = position[0] + size[0] / 2;
    const obstacleBottom = position[1] - size[1] / 2;
    const obstacleTop = position[1] + size[1] / 2;
    const obstacleFront = position[2] + size[2] / 2;
    const obstacleBack = position[2] - size[2] / 2;
    
    // Calculate player bounds
    const playerLeft = playerPosition.x - 0.4; // Half player width
    const playerRight = playerPosition.x + 0.4;
    const playerBottom = playerPosition.y - 0.6; // Half player height
    const playerTop = playerPosition.y + 0.6;
    const playerFront = playerPosition.z + 0.25; // Half player depth
    const playerBack = playerPosition.z - 0.25;
    
    // Check for collision
    if (
      playerRight > obstacleLeft && 
      playerLeft < obstacleRight && 
      playerTop > obstacleBottom && 
      playerBottom < obstacleTop &&
      playerFront > obstacleBack &&
      playerBack < obstacleFront
    ) {
      // Collision detected!
      handleCollision();
    }
  });
  
  // Handle collision with obstacle
  const handleCollision = () => {
    // Play hit sound
    playHit();
    
    if (type === 'spike') {
      // Spikes cause game over
      useGameStore.getState().setGameState('gameOver');
    } else {
      // Barriers knock player back
      const knockbackForce = 8;
      
      // Get current player velocity
      const velocity = playerVelocity;
      
      // Apply knockback in opposite direction from barrier
      const directionToPlayer = new THREE.Vector3(
        playerPosition.x - position[0],
        0, // Only knockback horizontally
        playerPosition.z - position[2]
      ).normalize();
      
      // Update velocity with knockback
      usePlayerStore.getState().setVelocity({
        x: directionToPlayer.x * knockbackForce,
        y: 5, // Add some upward force
        z: directionToPlayer.z * knockbackForce
      });
    }
  };
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
    >
      {type === 'spike' ? (
        // Spike obstacle (pyramid shape)
        <coneGeometry args={[size[0], size[1] * 2, 4]} />
      ) : (
        // Barrier obstacle (cuboid)
        <boxGeometry args={size} />
      )}
      <meshStandardMaterial 
        color={type === 'spike' ? '#ff3030' : '#555555'} 
        roughness={0.7}
      />
    </mesh>
  );
};

export default Obstacles;
