import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";
import Game from "./game/Game";
import { Controls } from "./game/GameControls";
import TitleScreen from "./ui/TitleScreen";
import PauseScreen from "./ui/PauseScreen";
import DevMenu from "./ui/DevMenu";
import GameOver from "./ui/GameOver";
import { useGameStore } from "./lib/stores/useGameStore";
import ShopScreen from "./ui/ShopScreen";
import GameUI from "./ui/GameUI";

// Define key mappings for keyboard controls
const keyMap = [
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
  { name: Controls.jump, keys: ["Space", "ArrowUp", "KeyW"] },
  { name: Controls.pause, keys: ["Escape"] },
  { name: Controls.devMenu, keys: ["KeyO"] }, // We'll handle Alt+O in a custom hook
];

function App() {
  const gameState = useGameStore((state) => state.gameState);
  const { setBackgroundMusic, toggleMute, isMuted } = useAudio();
  
  // Load audio resources
  useEffect(() => {
    // Load background music
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    // Load hit sound
    const hitSound = new Audio("/sounds/hit.mp3");
    useAudio.getState().setHitSound(hitSound);

    // Load success sound
    const successSound = new Audio("/sounds/success.mp3");
    useAudio.getState().setSuccessSound(successSound);

    // Play background music if not muted
    if (!isMuted) {
      bgMusic.play().catch(err => console.error("Error playing background music:", err));
    }

    // Cleanup function
    return () => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    };
  }, [setBackgroundMusic, isMuted]);

  // Toggle sound on M key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        toggleMute();
        
        // Play or pause background music based on mute state
        const { backgroundMusic, isMuted } = useAudio.getState();
        if (backgroundMusic) {
          if (isMuted) {
            backgroundMusic.pause();
          } else {
            backgroundMusic.play().catch(err => console.error("Error playing background music:", err));
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleMute]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={keyMap}>
        {/* Main Canvas for the 3D game */}
        <Canvas
          shadows
          camera={{
            position: [0, 5, 10],
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            powerPreference: "default"
          }}
        >
          <color attach="background" args={["#87CEEB"]} />
          
          {/* Only render the 3D game when playing */}
          {(gameState === 'playing' || gameState === 'paused') && (
            <Suspense fallback={null}>
              <Game />
            </Suspense>
          )}
        </Canvas>

        {/* UI Layers */}
        {gameState === 'title' && <TitleScreen />}
        {gameState === 'shop' && <ShopScreen />}
        {gameState === 'playing' && <GameUI />}
        {gameState === 'paused' && <PauseScreen />}
        {gameState === 'gameOver' && <GameOver />}
        <DevMenu />
      </KeyboardControls>
    </div>
  );
}

export default App;
