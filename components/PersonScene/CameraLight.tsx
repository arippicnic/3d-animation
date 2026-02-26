"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Vector3 } from "three";

export type CameraLightProps = {
  target: React.RefObject<THREE.Group | null>;
};

export const CameraLight: React.FC<CameraLightProps> = ({ target }) => {
  const { camera, scene } = useThree();
  const lightRef = useRef<THREE.DirectionalLight | null>(null);
  const lightTarget = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;

    light.target = lightTarget;
    scene.add(lightTarget);

    return () => {
      scene.remove(lightTarget);
    };
  }, [scene, lightTarget]);

  useFrame(() => {
    const light = lightRef.current;
    const targetGroup = target.current;
    if (!light || !targetGroup) return;

    const targetWorld = new Vector3();
    targetGroup.getWorldPosition(targetWorld);

    const forward = new Vector3()
      .subVectors(targetWorld, camera.position)
      .normalize();
    const up = new Vector3(0, 1, 0);
    const right = new Vector3().crossVectors(forward, up).normalize();

    const lightPosition = new Vector3()
      .copy(camera.position)
      .addScaledVector(right, 10)
      .addScaledVector(up, 5);

    light.position.copy(lightPosition);
    lightTarget.position.copy(targetWorld);
    lightTarget.updateMatrixWorld();
  });

  return (
    <directionalLight
      ref={lightRef}
      intensity={1.5}
      color="#ffffff"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-radius={4}
      shadow-bias={-0.0004}
    />
  );
};
