import React from "react";
import { useGameStore } from "../lib/stores/useGameStore";
import { Coins } from "lucide-react";

const GameUI: React.FC = () => {
  // Get score and coins from game store
  const score = useGameStore(state => state.score);
  const coins = useGameStore(state => state.coins);
  
  // Format score with commas
  const formattedScore = score.toLocaleString();
  
  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
      <div className="container mx-auto flex justify-between items-start">
        {/* Score display */}
        <div className="bg-gray-900 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">Score</h2>
          <p className="text-2xl font-bold">{formattedScore}</p>
        </div>
        
        {/* Coins display */}
        <div className="bg-gray-900 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
          <Coins size={24} className="text-yellow-400 mr-2" />
          <span className="text-xl font-bold">{coins}</span>
        </div>
      </div>
      
      {/* Controls help */}
      <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
        ← → or A D to move | Space to jump | ESC to pause
      </div>
    </div>
  );
};

export default GameUI;
