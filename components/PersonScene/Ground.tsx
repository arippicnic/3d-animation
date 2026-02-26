"use client";

import React, { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { RepeatWrapping } from "three";

export const Ground: React.FC = () => {
  const texture = useTexture("/flor.jpg");
  const configuredTexture = useMemo(() => {
    const t = texture.clone();
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
    t.repeat.set(8, 8);
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
