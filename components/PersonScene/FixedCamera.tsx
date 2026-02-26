"use client";

import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";

export const FixedCamera: React.FC = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 25, 70);
    camera.lookAt(0, 5, 0);
  }, [camera]);

  return null;
};
