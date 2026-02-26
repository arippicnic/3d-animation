 "use client";

import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { RepeatWrapping, Vector3 } from "three";

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

type PersonModelProps = React.ComponentPropsWithoutRef<"group">;

const PersonModel: React.FC<PersonModelProps> = (props) => {
  const { scene } = useGLTF("/person.glb");

  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

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

const Character: React.FC<CharacterProps> = ({ groupRef }) => {
  const keys = useKeyboard();
  const moveSpeed = 4;

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

    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize();

      const angle = Math.atan2(moveDirection.x, -moveDirection.z);
      group.rotation.y = angle;

      group.position.addScaledVector(moveDirection, moveSpeed * delta);
    }

    group.position.y = 0;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <PersonModel />
    </group>
  );
};

type ThirdPersonCameraProps = {
  target: React.RefObject<THREE.Group | null>;
};

const ThirdPersonCamera: React.FC<ThirdPersonCameraProps> = ({ target }) => {
  const { camera } = useThree();
  const offset = useMemo(() => new Vector3(0, 3, 7), []);
  const desiredPosition = useMemo(() => new Vector3(), []);

  useFrame((_, delta) => {
    const targetGroup = target.current;
    if (!targetGroup) return;

    desiredPosition.copy(targetGroup.position).add(offset);

    const t = 1 - Math.pow(0.001, delta * 60);
    camera.position.lerp(desiredPosition, t);

    const tx = targetGroup.position.x;
    const ty = targetGroup.position.y + 1.5;
    const tz = targetGroup.position.z;
    camera.lookAt(tx, ty, tz);
  });

  return null;
};

const SceneContent: React.FC = () => {
  const characterRef = useRef<THREE.Group>(null);

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[6, 10, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Ground />
      <Character groupRef={characterRef} />
      <ThirdPersonCamera target={characterRef} />
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
        camera={{ position: [0, 3, 8], fov: 45 }}
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
