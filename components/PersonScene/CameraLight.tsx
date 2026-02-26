"use client";

import React from "react";

/**
 * Single main light matching floor image sunlight.
 * - From the RIGHT side of the scene (+X), low angle (late afternoon through window)
 * - Slightly downward, not top-down; one coherent light for all shadows
 * - Warm soft yellow/golden; soft, long shadows aligned with light
 */
export const CameraLight: React.FC = () => {
  return (
    <directionalLight
      position={[55, 20, 0]}
      intensity={1.2}
      color="#f0d890"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-radius={10}
      shadow-bias={-0.0002}
      shadow-camera-near={5}
      shadow-camera-far={220}
      shadow-camera-left={-90}
      shadow-camera-right={90}
      shadow-camera-top={90}
      shadow-camera-bottom={-90}
    />
  );
};
