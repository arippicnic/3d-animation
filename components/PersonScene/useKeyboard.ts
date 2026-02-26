"use client";

import { useEffect, useRef } from "react";

export type KeyboardState = {
  ArrowUp: boolean;
  ArrowDown: boolean;
  ArrowLeft: boolean;
  ArrowRight: boolean;
};

export const useKeyboard = () => {
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
