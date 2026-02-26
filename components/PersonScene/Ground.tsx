"use client";

import React, { useMemo } from "react";
import { useTexture } from "@react-three/drei";

export const Ground: React.FC = () => {
  const texture = useTexture("/flor.jpeg");

  const configuredTexture = useMemo(() => {
    const t = texture.clone();
    // Keep a single, continuous texture across the whole floor
    // (no visible tiling or repetition)
    t.anisotropy = 8;
    return t;
  }, [texture]);

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial
        map={configuredTexture}
        metalness={0.05}
        roughness={0.35}
      />
    </mesh>
  );
};
