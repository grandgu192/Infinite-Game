import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "../lib/stores/useGameStore";
import { RotateCcw, ShoppingCart, Home, Trophy, Coins } from "lucide-react";
import { motion } from "framer-motion";

const GameOver: React.FC = () => {
  // Get game data from stores
  const score = useGameStore(state => state.score);
  const coins = useGameStore(state => state.coins);
  const setGameState = useGameStore(state => state.setGameState);
  const resetGame = useGameStore(state => state.resetGame);
  
  // Animation delay for elements
  const [showDetails, setShowDetails] = useState(false);
  
  // Format score with commas
  const formattedScore = score.toLocaleString();
  
  // Show details after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDetails(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle retry button
  const handleRetry = () => {
    resetGame();
    setGameState('playing');
  };
  
  // Handle shop button
  const handleShop = () => {
    resetGame();
    setGameState('shop');
  };
  
  // Handle menu button
  const handleMenu = () => {
    resetGame();
    setGameState('title');
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white">
      <motion.div 
        className="bg-gray-900 border border-gray-700 p-8 rounded-xl shadow-2xl w-96 text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-3xl font-bold mb-6 text-red-500"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Game Over
        </motion.h1>
        
        {showDetails && (
          <>
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex justify-center items-center mb-4">
                <Trophy size={32} className="text-yellow-500 mr-2" />
                <span className="text-xl font-medium">Final Score</span>
              </div>
              <p className="text-4xl font-bold text-yellow-400">{formattedScore}</p>
              
              <div className="flex justify-center items-center mt-6">
                <Coins size={24} className="text-yellow-400 mr-2" />
                <span className="text-lg">Coins Collected: <span className="font-bold">{coins}</span></span>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button
                onClick={handleRetry}
                className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                Play Again
              </Button>
              
              <Button
                onClick={handleShop}
                className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Shop
              </Button>
              
              <Button
                onClick={handleMenu}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Main Menu
              </Button>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default GameOver;
