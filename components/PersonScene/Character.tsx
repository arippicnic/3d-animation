"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Quaternion, Vector3 } from "three";
import { useKeyboard } from "./useKeyboard";
import { PersonModel } from "./PersonModel";

const FLOOR_HALF_SIZE = 30;

export type CharacterProps = {
  groupRef: React.RefObject<THREE.Group | null>;
};

export const Character: React.FC<CharacterProps> = ({ groupRef }) => {
  const keys = useKeyboard();
  const moveSpeed = 4;
  const [isMoving, setIsMoving] = useState(false);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } = keys.current;

    const moveDirection = new Vector3(0, 0, 0);

    if (ArrowUp) moveDirection.z -= 1;
    if (ArrowDown) moveDirection.z += 1;
    if (ArrowLeft) moveDirection.x -= 1;
    if (ArrowRight) moveDirection.x += 1;

    const hasMovement = moveDirection.lengthSq() > 0;

    if (hasMovement) {
      moveDirection.normalize();

      const forward = new Vector3(0, 0, -1);
      const targetDir = moveDirection.clone().normalize();
      const targetQuat = new Quaternion().setFromUnitVectors(
        forward,
        targetDir,
      );

      group.quaternion.slerp(targetQuat, 1 - Math.exp(-10 * delta));

      const nextPosition = group.position
        .clone()
        .addScaledVector(moveDirection, moveSpeed * delta);

      nextPosition.x = THREE.MathUtils.clamp(
        nextPosition.x,
        -FLOOR_HALF_SIZE,
        FLOOR_HALF_SIZE,
      );
      nextPosition.z = THREE.MathUtils.clamp(
        nextPosition.z,
        -FLOOR_HALF_SIZE,
        FLOOR_HALF_SIZE,
      );

      nextPosition.y = 0;
      group.position.copy(nextPosition);
    } else {
      group.position.y = 0;
    }

    if (isMoving !== hasMovement) {
      setIsMoving(hasMovement);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <PersonModel isMoving={isMoving} rotation={[0, Math.PI, 0]} />
    </group>
  );
};
