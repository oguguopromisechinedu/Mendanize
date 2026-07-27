"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

const BRAND_AMBER = "#E8940C";
const BRAND_AMBER_DARK = "#C47A08";
const BODY_DARK = "#1a1a2e";
const BODY_MID = "#252540";
const VISOR_BG = "#0d0d1a";
const METAL = "#3a3a5c";

function RobotModel() {
  const groupRef = useRef<THREE.Group>(null!);
  const antennaGlowRef = useRef<THREE.Mesh>(null!);
  const leftEyeRef = useRef<THREE.Mesh>(null!);
  const rightEyeRef = useRef<THREE.Mesh>(null!);
  const chestRef = useRef<THREE.Mesh>(null!);

  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({
        color: BODY_DARK,
        metalness: 0.6,
        roughness: 0.3,
      }),
      bodyLight: new THREE.MeshStandardMaterial({
        color: BODY_MID,
        metalness: 0.5,
        roughness: 0.35,
      }),
      visor: new THREE.MeshStandardMaterial({
        color: VISOR_BG,
        metalness: 0.8,
        roughness: 0.1,
      }),
      amber: new THREE.MeshStandardMaterial({
        color: BRAND_AMBER,
        emissive: BRAND_AMBER,
        emissiveIntensity: 0.8,
        metalness: 0.3,
        roughness: 0.2,
      }),
      amberGlow: new THREE.MeshStandardMaterial({
        color: BRAND_AMBER,
        emissive: BRAND_AMBER,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.9,
      }),
      metal: new THREE.MeshStandardMaterial({
        color: METAL,
        metalness: 0.7,
        roughness: 0.25,
      }),
      chest: new THREE.MeshStandardMaterial({
        color: BRAND_AMBER,
        emissive: BRAND_AMBER,
        emissiveIntensity: 0.5,
        metalness: 0.4,
        roughness: 0.3,
      }),
    }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.15;
    }
    if (antennaGlowRef.current) {
      (antennaGlowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.0 + Math.sin(t * 2) * 0.5;
    }
    if (leftEyeRef.current && rightEyeRef.current) {
      const blink = Math.sin(t * 3) > 0.97 ? 0.1 : 1;
      leftEyeRef.current.scale.y = blink;
      rightEyeRef.current.scale.y = blink;
    }
    if (chestRef.current) {
      (chestRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.4 + Math.sin(t * 1.5) * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={groupRef} position={[0, -0.3, 0]}>
        {/* Antenna post */}
        <mesh position={[0, 2.4, 0]} material={materials.metal}>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
        </mesh>
        {/* Antenna ball */}
        <mesh ref={antennaGlowRef} position={[0, 2.75, 0]} material={materials.amberGlow}>
          <sphereGeometry args={[0.15, 16, 16]} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.65, 0]} material={materials.body}>
          <boxGeometry args={[1.8, 1.4, 1.4]} />
        </mesh>
        {/* Head rounded top */}
        <mesh position={[0, 2.15, 0]} material={materials.body}>
          <sphereGeometry args={[0.7, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>

        {/* Visor */}
        <mesh position={[0, 1.6, 0.72]} material={materials.visor}>
          <boxGeometry args={[1.4, 0.8, 0.05]} />
        </mesh>
        {/* Visor frame */}
        <mesh position={[0, 1.6, 0.73]}>
          <boxGeometry args={[1.5, 0.9, 0.02]} />
          <meshStandardMaterial color={BRAND_AMBER_DARK} metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Eyes */}
        <mesh ref={leftEyeRef} position={[-0.3, 1.6, 0.76]} material={materials.amber}>
          <sphereGeometry args={[0.12, 12, 12]} />
        </mesh>
        <mesh ref={rightEyeRef} position={[0.3, 1.6, 0.76]} material={materials.amber}>
          <sphereGeometry args={[0.12, 12, 12]} />
        </mesh>

        {/* Ear panels */}
        <mesh position={[-0.95, 1.65, 0]} material={materials.metal}>
          <boxGeometry args={[0.12, 0.5, 0.4]} />
        </mesh>
        <mesh position={[0.95, 1.65, 0]} material={materials.metal}>
          <boxGeometry args={[0.12, 0.5, 0.4]} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.85, 0]} material={materials.metal}>
          <cylinderGeometry args={[0.2, 0.25, 0.2, 8]} />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 0.15, 0]} material={materials.bodyLight}>
          <boxGeometry args={[1.5, 1.2, 1.1]} />
        </mesh>

        {/* Chest badge */}
        <mesh ref={chestRef} position={[0, 0.2, 0.57]} material={materials.chest}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
        </mesh>
        {/* Cross on chest */}
        <mesh position={[0, 0.2, 0.6]}>
          <boxGeometry args={[0.25, 0.06, 0.02]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0.2, 0.6]}>
          <boxGeometry args={[0.06, 0.25, 0.02]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
        </mesh>

        {/* Shoulder joints */}
        <mesh position={[-0.9, 0.55, 0]} material={materials.metal}>
          <sphereGeometry args={[0.18, 12, 12]} />
        </mesh>
        <mesh position={[0.9, 0.55, 0]} material={materials.metal}>
          <sphereGeometry args={[0.18, 12, 12]} />
        </mesh>

        {/* Arms */}
        <group position={[-1.15, 0.1, 0]} rotation={[0, 0, 0.15]}>
          <mesh material={materials.body}>
            <boxGeometry args={[0.35, 0.8, 0.35]} />
          </mesh>
          <mesh position={[0, -0.5, 0]} material={materials.metal}>
            <sphereGeometry args={[0.15, 10, 10]} />
          </mesh>
        </group>
        <group position={[1.15, 0.1, 0]} rotation={[0, 0, -0.15]}>
          <mesh material={materials.body}>
            <boxGeometry args={[0.35, 0.8, 0.35]} />
          </mesh>
          <mesh position={[0, -0.5, 0]} material={materials.metal}>
            <sphereGeometry args={[0.15, 10, 10]} />
          </mesh>
        </group>

        {/* Waist */}
        <mesh position={[0, -0.55, 0]} material={materials.metal}>
          <cylinderGeometry args={[0.35, 0.4, 0.15, 12]} />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.35, -1.05, 0]} material={materials.body}>
          <boxGeometry args={[0.4, 0.85, 0.4]} />
        </mesh>
        <mesh position={[0.35, -1.05, 0]} material={materials.body}>
          <boxGeometry args={[0.4, 0.85, 0.4]} />
        </mesh>

        {/* Feet */}
        <mesh position={[-0.35, -1.55, 0.1]} material={materials.metal}>
          <boxGeometry args={[0.45, 0.15, 0.55]} />
        </mesh>
        <mesh position={[0.35, -1.55, 0.1]} material={materials.metal}>
          <boxGeometry args={[0.45, 0.15, 0.55]} />
        </mesh>
      </group>
    </Float>
  );
}

export function MendanizeRobot3D({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-auto", className)}>
      <Canvas
        camera={{ position: [0, 0.5, 5.5], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} color="#fff" />
        <directionalLight position={[-2, 2, -3]} intensity={0.3} color={BRAND_AMBER} />
        <pointLight position={[0, 3, 2]} intensity={0.6} color={BRAND_AMBER} distance={8} />
        <RobotModel />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
