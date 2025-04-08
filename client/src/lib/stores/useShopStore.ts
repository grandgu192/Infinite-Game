import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useGameStore } from "./useGameStore";

// Define shop item types
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  owned: boolean;
  equipped: boolean;
  type: 'character' | 'ability' | 'booster' | 'cosmetic';
  icon: string; // Lucide icon name
  effect?: any; // Effect when equipped
}

interface ShopState {
  items: ShopItem[];
  selectedItem: ShopItem | null;
  
  // Methods
  buyItem: (itemId: string) => boolean;
  equipItem: (itemId: string) => void;
  selectItem: (itemId: string) => void;
  clearSelection: () => void;
  getEquippedItems: () => ShopItem[];
}

// Initial shop items
const initialItems: ShopItem[] = [
  {
    id: 'char_default',
    name: 'Default Character',
    description: 'The standard character with balanced stats',
    cost: 0, // Free
    owned: true, // Already owned
    equipped: true, // Already equipped
    type: 'character',
    icon: 'User'
  },
  {
    id: 'char_fast',
    name: 'Speed Runner',
    description: 'Moves 25% faster than the default character',
    cost: 1000,
    owned: false,
    equipped: false,
    type: 'character',
    icon: 'Zap',
    effect: { speedBoost: 1.25 }
  },
  {
    id: 'char_bouncy',
    name: 'Bouncy Buddy',
    description: 'Jumps 30% higher than the default character',
    cost: 1200,
    owned: false,
    equipped: false,
    type: 'character',
    icon: 'ArrowUp',
    effect: { jumpBoost: 1.3 }
  },
  {
    id: 'ability_double_jump',
    name: 'Double Jump',
    description: 'Allows you to jump once more while in the air',
    cost: 2000,
    owned: false,
    equipped: false,
    type: 'ability',
    icon: 'ArrowUpCircle',
    effect: { doubleJump: true }
  },
  {
    id: 'booster_coin',
    name: 'Coin Magnet',
    description: 'Attracts coins from a distance',
    cost: 1500,
    owned: false,
    equipped: false,
    type: 'booster',
    icon: 'Coins',
    effect: { coinAttraction: true }
  },
  {
    id: 'booster_score',
    name: 'Score Multiplier',
    description: 'Increases score gain by 50%',
    cost: 2500,
    owned: false,
    equipped: false,
    type: 'booster',
    icon: 'Star',
    effect: { scoreMultiplier: 1.5 }
  },
  {
    id: 'cosmetic_trail',
    name: 'Particle Trail',
    description: 'Leaves a colorful trail behind you',
    cost: 800,
    owned: false,
    equipped: false,
    type: 'cosmetic',
    icon: 'Sparkles',
    effect: { trail: true }
  },
  {
    id: 'cosmetic_glow',
    name: 'Character Glow',
    description: 'Makes your character emit light',
    cost: 1000,
    owned: false,
    equipped: false,
    type: 'cosmetic',
    icon: 'Sun',
    effect: { glow: true }
  }
];

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      items: initialItems,
      selectedItem: null,
      
      buyItem: (itemId) => {
        const { coins } = useGameStore.getState();
        const { cheats } = useGameStore.getState();
        
        // Find the item
        const item = get().items.find(item => item.id === itemId);
        
        // If item not found or already owned, return false
        if (!item || item.owned) return false;
        
        // If unlock all cheat is active, give for free
        if (cheats.unlockAll) {
          set(state => ({
            items: state.items.map(item => 
              item.id === itemId 
                ? { ...item, owned: true }
                : item
            )
          }));
          return true;
        }
        
        // Check if player has enough coins
        if (coins >= item.cost) {
          // Deduct coins and update item ownership
          useGameStore.getState().addCoins(-item.cost); // Remove coins
          
          // Update the item's ownership status
          set(state => ({
            items: state.items.map(item => 
              item.id === itemId 
                ? { ...item, owned: true }
                : item
            )
          }));
          
          // Play success sound
          const { playSuccess } = useAudio.getState();
          playSuccess();
          
          return true;
        }
        
        return false;
      },
      
      equipItem: (itemId) => {
        const item = get().items.find(item => item.id === itemId);
        
        // If item not found or not owned, do nothing
        if (!item || !item.owned) return;
        
        // Unequip all items of the same type, and equip the selected one
        set(state => ({
          items: state.items.map(i => 
            i.type === item.type
              ? { ...i, equipped: i.id === itemId }
              : i
          )
        }));
        
        // Play success sound
        const { playSuccess } = useAudio.getState();
        playSuccess();
      },
      
      selectItem: (itemId) => {
        const item = get().items.find(item => item.id === itemId);
        if (item) {
          set({ selectedItem: item });
        }
      },
      
      clearSelection: () => {
        set({ selectedItem: null });
      },
      
      getEquippedItems: () => {
        return get().items.filter(item => item.equipped);
      }
    }),
    {
      name: 'platformer-shop-storage',
      partialize: (state) => ({
        items: state.items.map(({ id, owned, equipped }) => ({ id, owned, equipped }))
      })
    }
  )
);

// Import useAudio here to avoid circular dependency
import { useAudio } from "./useAudio";
