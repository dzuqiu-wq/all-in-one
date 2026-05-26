"use client";

import { useRef, useState, type RefObject } from "react";

interface MagneticOptions {
  strength?: number;
}

interface MagneticReturn {
  ref: RefObject<HTMLElement | null>;
  style: { transform: string };
  handlers: {
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
  };
}

export function useMagneticEffect(
  options: MagneticOptions = {}
): MagneticReturn {
  const { strength = 0.3 } = options;
  const ref = useRef<HTMLElement | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    setTransform({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setTransform({ x: 0, y: 0 });
  };

  return {
    ref: ref as RefObject<HTMLElement | null>,
    style: {
      transform: `translate(${transform.x}px, ${transform.y}px)`,
    },
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
}