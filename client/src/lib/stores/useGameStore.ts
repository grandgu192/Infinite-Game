import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameState = 'title' | 'shop' | 'playing' | 'paused' | 'gameOver';

interface DevCheats {
  scoreMultiplier: number;
  coinMultiplier: number;
  unlockAll: boolean;
  speedMultiplier: number;
  noGravity: boolean;
}

interface GameStateStore {
  // Game state
  gameState: GameState;
  setGameState: (state: GameState) => void;
  
  // Score and coins
  score: number;
  coins: number;
  totalCoins: number;
  addScore: (points: number) => void;
  addCoins: (amount: number) => void;
  
  // Dev menu state
  isDevMenuOpen: boolean;
  toggleDevMenu: () => void;
  
  // Cheat settings
  cheats: DevCheats;
  toggleScoreMultiplier: () => void;
  toggleCoinMultiplier: () => void;
  toggleUnlockAll: () => void;
  toggleSpeedMultiplier: () => void;
  toggleNoGravity: () => void;
  
  // Reset game
  resetGame: () => void;
}

export const useGameStore = create<GameStateStore>()(
  subscribeWithSelector((set) => ({
    // Initial game state
    gameState: 'title',
    setGameState: (state) => set({ gameState: state }),
    
    // Score and coins
    score: 0,
    coins: 0,
    totalCoins: 0,
    
    addScore: (points) => set((state) => {
      const multiplier = state.cheats.scoreMultiplier;
      return { 
        score: state.score + (points * multiplier) 
      };
    }),
    
    addCoins: (amount) => set((state) => {
      const multiplier = state.cheats.coinMultiplier;
      const newCoins = state.coins + (amount * multiplier);
      const newTotalCoins = state.totalCoins + (amount * multiplier);
      return { 
        coins: newCoins,
        totalCoins: newTotalCoins
      };
    }),
    
    // Dev menu state
    isDevMenuOpen: false,
    toggleDevMenu: () => set((state) => ({ isDevMenuOpen: !state.isDevMenuOpen })),
    
    // Cheat settings
    cheats: {
      scoreMultiplier: 1,
      coinMultiplier: 1,
      unlockAll: false,
      speedMultiplier: 1,
      noGravity: false
    },
    
    toggleScoreMultiplier: () => set((state) => ({
      cheats: {
        ...state.cheats,
        scoreMultiplier: state.cheats.scoreMultiplier === 1 ? 10 : 1
      }
    })),
    
    toggleCoinMultiplier: () => set((state) => ({
      cheats: {
        ...state.cheats,
        coinMultiplier: state.cheats.coinMultiplier === 1 ? 10 : 1
      }
    })),
    
    toggleUnlockAll: () => set((state) => ({
      cheats: {
        ...state.cheats,
        unlockAll: !state.cheats.unlockAll
      }
    })),
    
    toggleSpeedMultiplier: () => set((state) => ({
      cheats: {
        ...state.cheats,
        speedMultiplier: state.cheats.speedMultiplier === 1 ? 10 : 1
      }
    })),
    
    toggleNoGravity: () => set((state) => ({
      cheats: {
        ...state.cheats,
        noGravity: !state.cheats.noGravity
      }
    })),
    
    // Reset game
    resetGame: () => set({
      score: 0,
      // Keep total coins but reset current coins
      coins: 0,
      gameState: 'title'
    })
  }))
);
