import { create } from "zustand";
import { Vector3 } from "three";
import { useGameStore } from "./useGameStore";

interface PlayerState {
  // Player position
  position: {
    x: number;
    y: number;
    z: number;
  };
  velocity: {
    x: number;
    y: number;
    z: number;
  };
  // Player state
  isJumping: boolean;
  isGrounded: boolean;
  direction: -1 | 0 | 1; // -1: left, 0: none, 1: right
  // Player settings
  jumpForce: number;
  speed: number;
  gravity: number;
  // Methods
  setPosition: (position: { x: number; y: number; z: number }) => void;
  setVelocity: (velocity: { x: number; y: number; z: number }) => void;
  setDirection: (direction: -1 | 0 | 1) => void;
  setIsJumping: (isJumping: boolean) => void;
  setIsGrounded: (isGrounded: boolean) => void;
  jump: () => void;
  reset: () => void;
  update: (delta: number) => void;
}

// Default player values
const DEFAULT_POSITION = { x: 0, y: 1, z: 0 };
const DEFAULT_VELOCITY = { x: 0, y: 0, z: 0 };
const DEFAULT_JUMP_FORCE = 13;
const DEFAULT_SPEED = 7;
const DEFAULT_GRAVITY = 30;

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // Initial position and velocity
  position: { ...DEFAULT_POSITION },
  velocity: { ...DEFAULT_VELOCITY },
  
  // Initial state
  isJumping: false,
  isGrounded: false,
  direction: 0,
  
  // Default settings
  jumpForce: DEFAULT_JUMP_FORCE,
  speed: DEFAULT_SPEED,
  gravity: DEFAULT_GRAVITY,
  
  // Methods to update player state
  setPosition: (position) => set(() => ({ position })),
  
  setVelocity: (velocity) => set(() => ({ velocity })),
  
  setDirection: (direction) => set(() => ({ direction })),
  
  setIsJumping: (isJumping) => set(() => ({ isJumping })),
  
  setIsGrounded: (isGrounded) => set(() => ({ isGrounded })),
  
  // Jump method
  jump: () => {
    const { isGrounded, velocity } = get();
    
    if (isGrounded) {
      set(() => ({ 
        isJumping: true,
        isGrounded: false,
        velocity: {
          ...velocity,
          y: get().jumpForce
        }
      }));
      
      // Play jump sound
      const { playHit } = useAudio.getState();
      playHit();
    }
  },
  
  // Reset player to initial state
  reset: () => set(() => ({
    position: { ...DEFAULT_POSITION },
    velocity: { ...DEFAULT_VELOCITY },
    isJumping: false,
    isGrounded: false,
    direction: 0
  })),
  
  // Update method to be called every frame
  update: (delta) => {
    const { 
      position, 
      velocity, 
      direction, 
      isGrounded,
      speed
    } = get();
    
    // Get cheat settings
    const { cheats } = useGameStore.getState();
    const speedMultiplier = cheats.speedMultiplier;
    const gravityMultiplier = cheats.noGravity ? 0 : 1;
    
    // Calculate new velocity
    let newVelocityX = 0;
    
    // Apply horizontal movement based on direction
    if (direction !== 0) {
      newVelocityX = direction * speed * speedMultiplier;
    }
    
    // Apply gravity if not grounded
    let newVelocityY = velocity.y;
    if (!isGrounded) {
      newVelocityY -= get().gravity * delta * gravityMultiplier;
    }
    
    // Update velocity
    set(() => ({
      velocity: {
        x: newVelocityX,
        y: newVelocityY,
        z: 0
      }
    }));
    
    // Update position based on velocity
    set(() => ({
      position: {
        x: position.x + velocity.x * delta,
        y: position.y + velocity.y * delta,
        z: position.z + velocity.z * delta
      }
    }));
    
    // If falling below a certain point, trigger game over
    if (position.y < -10) {
      useGameStore.getState().setGameState('gameOver');
    }
  }
}));

// Import useAudio here to avoid circular dependency
import { useAudio } from "./useAudio";
