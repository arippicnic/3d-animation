"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { SceneContent } from "./SceneContent";

export const PersonScene: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1f2937, #020617)",
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 25, 70], fov: 35 }}
      >
        <color attach="background" args={["#020617"]} />
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default PersonScene;
