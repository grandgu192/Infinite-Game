import React from "react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "../lib/stores/useGameStore";
import { Play, Home, RotateCcw } from "lucide-react";

const PauseScreen: React.FC = () => {
  const setGameState = useGameStore(state => state.setGameState);
  const resetGame = useGameStore(state => state.resetGame);
  
  // Resume the game
  const handleResume = () => {
    setGameState('playing');
  };
  
  // Return to title screen
  const handleReturnToTitle = () => {
    resetGame();
    setGameState('title');
  };
  
  // Restart the game
  const handleRestart = () => {
    resetGame();
    setGameState('playing');
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-80">
        <h2 className="text-2xl font-bold text-center mb-6">Game Paused</h2>
        
        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleResume}
            className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Play size={18} />
            Resume Game
          </Button>
          
          <Button 
            onClick={handleRestart}
            className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Restart Game
          </Button>
          
          <Button 
            onClick={handleReturnToTitle}
            className="bg-gray-600 hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Return to Title
          </Button>
        </div>
        
        <p className="mt-6 text-sm text-gray-400 text-center">
          Press ESC again to resume
        </p>
      </div>
    </div>
  );
};

export default PauseScreen;
