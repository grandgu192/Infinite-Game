import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { useShopStore } from "../lib/stores/useShopStore";

const Player: React.FC = () => {
  // Reference to the mesh
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Get player state from store
  const position = usePlayerStore(state => state.position);
  const direction = usePlayerStore(state => state.direction);
  
  // Get equipped items
  const equippedItems = useShopStore(state => state.getEquippedItems());
  
  // Check for special effects
  const hasGlow = equippedItems.some(item => item.effect?.glow);
  const hasTrail = equippedItems.some(item => item.effect?.trail);
  
  // Trail effect - create trail points when player moves
  const trailPoints = useRef<THREE.Vector3[]>([]);
  const trailMeshRef = useRef<THREE.Mesh>(null);
  
  // Update player mesh position
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(position.x, position.y, position.z);
    }
  }, [position]);
  
  // Handle trail effect
  useFrame(() => {
    if (hasTrail && meshRef.current && trailMeshRef.current) {
      // Add current position to trail
      const currentPos = new THREE.Vector3(position.x, position.y, position.z);
      
      // Only add points when moving
      if (direction !== 0) {
        trailPoints.current.push(currentPos.clone());
        
        // Limit trail length
        if (trailPoints.current.length > 10) {
          trailPoints.current.shift();
        }
      }
      
      // Update trail geometry
      if (trailPoints.current.length > 1) {
        const geometry = new THREE.BufferGeometry().setFromPoints(trailPoints.current);
        trailMeshRef.current.geometry = geometry;
      }
    }
  });
  
  return (
    <>
      {/* Player Mesh */}
      <mesh
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.8, 1.2, 0.5]} />
        <meshStandardMaterial color="#4287f5" />
        
        {/* Glow effect if enabled */}
        {hasGlow && (
          <pointLight
            position={[0, 0, 0]}
            intensity={0.8}
            distance={2}
            color="#88ccff"
          />
        )}
      </mesh>
      
      {/* Trail effect if enabled */}
      {hasTrail && (
        <line ref={trailMeshRef}>
          <bufferGeometry />
          <lineBasicMaterial color="#88ccff" linewidth={1} />
        </line>
      )}
    </>
  );
};

export default Player;
