"use client";

import React, { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export type PersonModelProps = React.ComponentPropsWithoutRef<"group"> & {
  isMoving: boolean;
};

export const PersonModel: React.FC<PersonModelProps> = ({
  isMoving,
  ...props
}) => {
  const { scene, animations } = useGLTF("/person.glb");
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const idleAction = useRef<THREE.AnimationAction | null>(null);
  const walkAction = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    if (!animations || animations.length === 0) return;

    const mixerInstance = new THREE.AnimationMixer(scene);
    mixer.current = mixerInstance;

    const idleClip =
      animations.find((clip) => /idle/i.test(clip.name)) ?? animations[0];
    const walkClip =
      animations.find((clip) => /walk/i.test(clip.name)) ??
      animations.find((clip) => /run/i.test(clip.name)) ??
      animations[1] ??
      animations[0];

    const idle = mixerInstance.clipAction(idleClip);
    const walk = mixerInstance.clipAction(walkClip);

    idleAction.current = idle;
    walkAction.current = walk;

    idle.reset().play();
    walk.enabled = true;

    return () => {
      mixerInstance.stopAllAction();
    };
  }, [animations, scene]);

  useEffect(() => {
    const idle = idleAction.current;
    const walk = walkAction.current;
    if (!idle || !walk) return;

    const fadeDuration = 0.3;

    if (isMoving) {
      idle.fadeOut(fadeDuration);
      walk.reset().fadeIn(fadeDuration).play();
    } else {
      walk.fadeOut(fadeDuration);
      idle.reset().fadeIn(fadeDuration).play();
    }
  }, [isMoving]);

  useFrame((_, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
  });

  return <primitive object={scene} {...props} />;
};

useGLTF.preload("/person.glb");
