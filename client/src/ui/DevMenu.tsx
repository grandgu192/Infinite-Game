import React, { useEffect } from "react";
import { useDevMenuHotkey } from "../lib/hooks/useKeyPress";
import { useGameStore } from "../lib/stores/useGameStore";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Coins, 
  Unlock, 
  Zap, 
  Feather, 
  X, 
  CheckSquare, 
  Square 
} from "lucide-react";

const DevMenu: React.FC = () => {
  // Setup Alt+O hotkey
  useDevMenuHotkey();
  
  // Get dev menu state from store
  const isDevMenuOpen = useGameStore(state => state.isDevMenuOpen);
  const toggleDevMenu = useGameStore(state => state.toggleDevMenu);
  
  // Get cheat states
  const cheats = useGameStore(state => state.cheats);
  
  // Get cheat toggle functions
  const toggleScoreMultiplier = useGameStore(state => state.toggleScoreMultiplier);
  const toggleCoinMultiplier = useGameStore(state => state.toggleCoinMultiplier);
  const toggleUnlockAll = useGameStore(state => state.toggleUnlockAll);
  const toggleSpeedMultiplier = useGameStore(state => state.toggleSpeedMultiplier);
  const toggleNoGravity = useGameStore(state => state.toggleNoGravity);
  
  // Close dev menu when ESC is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && isDevMenuOpen) {
        toggleDevMenu();
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDevMenuOpen, toggleDevMenu]);
  
  // Don't render anything if the menu is closed
  if (!isDevMenuOpen) return null;
  
  return (
    <div className="absolute right-4 top-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl text-white w-72 overflow-hidden z-50">
      <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700">
        <h3 className="font-bold">Developer Cheats Menu</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleDevMenu}
          className="h-8 w-8 text-gray-400 hover:text-white"
        >
          <X size={18} />
        </Button>
      </div>
      
      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-400 mb-2">
          Press Alt+O to toggle this menu
        </p>
        
        {/* Cheat options */}
        <div className="space-y-2">
          {/* 10x Score */}
          <Button
            variant="outline"
            onClick={toggleScoreMultiplier}
            className={`w-full justify-start font-normal ${cheats.scoreMultiplier > 1 ? 'bg-green-900/30 border-green-700' : ''}`}
          >
            {cheats.scoreMultiplier > 1 ? (
              <CheckSquare size={18} className="mr-2 text-green-500" />
            ) : (
              <Square size={18} className="mr-2" />
            )}
            <Star size={18} className="mr-2" />
            10x Score
          </Button>
          
          {/* 10x Coins */}
          <Button
            variant="outline"
            onClick={toggleCoinMultiplier}
            className={`w-full justify-start font-normal ${cheats.coinMultiplier > 1 ? 'bg-green-900/30 border-green-700' : ''}`}
          >
            {cheats.coinMultiplier > 1 ? (
              <CheckSquare size={18} className="mr-2 text-green-500" />
            ) : (
              <Square size={18} className="mr-2" />
            )}
            <Coins size={18} className="mr-2" />
            10x Coins
          </Button>
          
          {/* Unlock All */}
          <Button
            variant="outline"
            onClick={toggleUnlockAll}
            className={`w-full justify-start font-normal ${cheats.unlockAll ? 'bg-green-900/30 border-green-700' : ''}`}
          >
            {cheats.unlockAll ? (
              <CheckSquare size={18} className="mr-2 text-green-500" />
            ) : (
              <Square size={18} className="mr-2" />
            )}
            <Unlock size={18} className="mr-2" />
            Unlock All
          </Button>
          
          {/* 10x Speed */}
          <Button
            variant="outline"
            onClick={toggleSpeedMultiplier}
            className={`w-full justify-start font-normal ${cheats.speedMultiplier > 1 ? 'bg-green-900/30 border-green-700' : ''}`}
          >
            {cheats.speedMultiplier > 1 ? (
              <CheckSquare size={18} className="mr-2 text-green-500" />
            ) : (
              <Square size={18} className="mr-2" />
            )}
            <Zap size={18} className="mr-2" />
            10x Speed
          </Button>
          
          {/* No Gravity */}
          <Button
            variant="outline"
            onClick={toggleNoGravity}
            className={`w-full justify-start font-normal ${cheats.noGravity ? 'bg-green-900/30 border-green-700' : ''}`}
          >
            {cheats.noGravity ? (
              <CheckSquare size={18} className="mr-2 text-green-500" />
            ) : (
              <Square size={18} className="mr-2" />
            )}
            <Feather size={18} className="mr-2" />
            No Gravity
          </Button>
        </div>
      </div>
      
      <div className="p-3 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        These cheats are for development and testing purposes.
      </div>
    </div>
  );
};

export default DevMenu;
