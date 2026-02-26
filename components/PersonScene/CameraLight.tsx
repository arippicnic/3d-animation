"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";


export const CameraLight: React.FC = () => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();
  const target = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;
    target.position.set(0, 2, 0);
    scene.add(target);
    light.target = target;
    return () => {
      scene.remove(target);
    };
  }, [scene, target]);

  return (
    <directionalLight
      ref={lightRef}
      position={[45, 22, -25]}
      intensity={1.2}
      color="#f0d890"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-radius={14}
      shadow-bias={-0.00015}
      shadow-camera-near={5}
      shadow-camera-far={220}
      shadow-camera-left={-90}
      shadow-camera-right={90}
      shadow-camera-top={90}
      shadow-camera-bottom={-90}
    />
  );
};
