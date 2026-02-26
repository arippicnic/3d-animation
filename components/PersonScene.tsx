 "use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { RepeatWrapping, Vector3 } from "three";
import { Quaternion } from "three";

type KeyboardState = {
  ArrowUp: boolean;
  ArrowDown: boolean;
  ArrowLeft: boolean;
  ArrowRight: boolean;
};

const useKeyboard = () => {
  const keys = useRef<KeyboardState>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key in keys.current) {
        keys.current[event.key as keyof KeyboardState] = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key in keys.current) {
        keys.current[event.key as keyof KeyboardState] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keys;
};

type PersonModelProps = React.ComponentPropsWithoutRef<"group"> & {
  isMoving: boolean;
};

const PersonModel: React.FC<PersonModelProps> = ({ isMoving, ...props }) => {
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

const Ground: React.FC = () => {
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

type CharacterProps = {
  groupRef: React.RefObject<THREE.Group | null>;
};

const FLOOR_HALF_SIZE = 30;

const Character: React.FC<CharacterProps> = ({ groupRef }) => {
  const keys = useKeyboard();
  const moveSpeed = 4;
  const [isMoving, setIsMoving] = useState(false);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } = keys.current;

    const moveDirection = new Vector3(0, 0, 0);

    if (ArrowUp) {
      moveDirection.z -= 1;
    }

    if (ArrowDown) {
      moveDirection.z += 1;
    }

    if (ArrowLeft) {
      moveDirection.x -= 1;
    }

    if (ArrowRight) {
      moveDirection.x += 1;
    }

    const hasMovement = moveDirection.lengthSq() > 0;

    if (hasMovement) {
      moveDirection.normalize();

      const forward = new Vector3(0, 0, -1);
      const targetDir = moveDirection.clone().normalize();

      const targetQuat = new Quaternion().setFromUnitVectors(
        forward,
        targetDir,
);

// smooth rotate
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
      <PersonModel isMoving={isMoving} />
    </group>
  );
};

type CameraLightProps = {
  target: React.RefObject<THREE.Group | null>;
};

const CameraLight: React.FC<CameraLightProps> = ({ target }) => {
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

const FixedCamera: React.FC = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 25, 70);
    camera.lookAt(0, 5, 0);
  }, [camera]);

  return null;
};

const SceneContent: React.FC = () => {
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

const PersonScene: React.FC = () => {
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
