import React from "react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "../lib/stores/useGameStore";
import { useAudio } from "../lib/stores/useAudio";
import { 
  Play, 
  ShoppingCart, 
  Volume2, 
  VolumeX, 
  HelpCircle,
  Settings 
} from "lucide-react";

const TitleScreen: React.FC = () => {
  const setGameState = useGameStore(state => state.setGameState);
  const { isMuted, toggleMute, backgroundMusic } = useAudio();
  
  // Start the game
  const handleStartGame = () => {
    setGameState('playing');
    
    // Play background music if not muted
    if (backgroundMusic && !isMuted) {
      backgroundMusic.play().catch(err => {
        console.error("Error playing background music:", err);
      });
    }
  };
  
  // Open the shop
  const handleOpenShop = () => {
    setGameState('shop');
  };
  
  // Toggle sound mute
  const handleToggleMute = () => {
    toggleMute();
    
    // Play or pause background music based on mute state
    if (backgroundMusic) {
      if (!isMuted) { // Will be toggled after this call
        backgroundMusic.pause();
      } else {
        backgroundMusic.play().catch(err => {
          console.error("Error playing background music:", err);
        });
      }
    }
  };
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 text-white">
      <div className="w-full max-w-lg p-8 bg-gray-800 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-8">Platform Runner</h1>
        
        <div className="flex flex-col gap-4 items-center mb-8">
          <Button 
            onClick={handleStartGame}
            className="w-48 h-12 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Play size={20} />
            Start Game
          </Button>
          
          <Button 
            onClick={handleOpenShop}
            className="w-48 h-12 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            Shop
          </Button>
        </div>
        
        {/* Four action buttons in a grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button
            onClick={handleToggleMute}
            variant="outline"
            className="h-12 bg-gray-700 hover:bg-gray-600 flex items-center justify-center gap-2"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            {isMuted ? "Unmute" : "Mute"}
          </Button>
          
          <Button
            variant="outline"
            className="h-12 bg-gray-700 hover:bg-gray-600 flex items-center justify-center gap-2"
          >
            <HelpCircle size={20} />
            Help
          </Button>
          
          <Button
            variant="outline"
            className="h-12 bg-gray-700 hover:bg-gray-600 flex items-center justify-center gap-2"
          >
            <Settings size={20} />
            Settings
          </Button>
          
          <Button
            variant="outline"
            className="h-12 bg-gray-700 hover:bg-gray-600 flex items-center justify-center gap-2"
            onClick={() => window.open("https://github.com", "_blank")}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.419 2.865 8.166 6.839 9.489.5.09.682-.217.682-.482 0-.237-.009-.866-.014-1.699-2.782.605-3.369-1.338-3.369-1.338-.454-1.152-1.11-1.459-1.11-1.459-.908-.619.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.89 1.525 2.341 1.084 2.91.828.09-.645.35-1.084.636-1.334-2.22-.251-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.254-.447-1.27.097-2.646 0 0 .84-.269 2.75 1.022A9.578 9.578 0 0112 7.073c.85.004 1.705.115 2.504.337 1.909-1.291 2.747-1.022 2.747-1.022.546 1.376.202 2.394.1 2.646.64.699 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.307.679.917.679 1.852 0 1.335-.012 2.415-.012 2.741 0 .269.18.578.688.481C19.138 20.164 22 16.419 22 12c0-5.523-4.477-10-10-10z"></path>
            </svg>
            Source
          </Button>
        </div>
        
        <p className="text-center text-gray-400 text-sm">
          Use Arrow keys or WASD to move, Space to jump.<br />
          Press ESC to pause, and ALT+O for developer menu.
        </p>
      </div>
    </div>
  );
};

export default TitleScreen;
