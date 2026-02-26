"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { Ground } from "./Ground";
import { Character } from "./Character";
import { CameraLight } from "./CameraLight";
import { FixedCamera } from "./FixedCamera";

export const SceneContent: React.FC = () => {
  const characterRef = useRef<THREE.Group>(null);

  return (
    <>
      <Ground />
      <Character groupRef={characterRef} />
      <CameraLight target={characterRef} />
      <FixedCamera />
    </>
  );
};
