# Awwwards Phase 3: Premium Micro-Interactions

**Date:** 2026-05-26
**Phase:** 3 of 3 (Micro-Interactions)

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Custom Cursor | Minimal dot + ring on hover | Subtle, professional |
| Magnetic Buttons | Micro-magnet (10px) + glow | Natural, refined |
| Scroll Parallax | Floating hero elements | Subtle depth |

---

## Architecture

### File Structure

```
src/
├── components/
│   └── CustomCursor.tsx           # Custom cursor component
├── hooks/
│   └── useMagneticEffect.ts        # Magnetic button hook
└── app/[locale]/
    └── HomeContent.tsx            # Add parallax to hero
```

### Component Details

#### CustomCursor

- **Default:** 12px circle, follows mouse with slight delay
- **Hover (links/buttons):** Expands to 40px ring, follows immediately
- **Click:** Brief scale pulse
- Uses `transform` for GPU-accelerated movement
- Hidden on mobile/touch devices

```tsx
// Cursor states
const cursorVariants = {
  default: { scale: 1, border: "2px solid transparent" },
  hover: { scale: 3, border: "2px solid var(--primary)" },
  clicking: { scale: 0.8 },
};
```

#### MagneticButton Hook

- Detects mouse position relative to button bounds
- Applies transform offset (max 10px) based on mouse proximity
- Smooth spring animation for natural feel
- Auto-resets when mouse leaves

```tsx
function useMagneticEffect(ref: RefObject<HTMLElement>, strength = 0.3) {
  // Returns { x, y } transform values
  // strength: how much the button moves (0-1)
}
```

#### Scroll Parallax

- Uses Framer Motion `useScroll` + `useTransform`
- Hero terminal mockup moves at 0.5x scroll speed
- Creates subtle depth without performance cost

```tsx
const { scrollYProgress } = useScroll();
const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
```

---

## Implementation Details

### CustomCursor Component

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Skip on touch devices
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role='button']")) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => setIsHovering(false);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9998] mix-blend-difference"
      style={{ x: cursorXSpring, y: cursorYSpring }}
      animate={{
        scale: isClicking ? 0.8 : isHovering ? 3 : 1,
        borderRadius: isHovering ? "50%" : "50%",
      }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="w-3 h-3 rounded-full"
        style={{
          backgroundColor: isHovering ? "transparent" : "white",
          border: isHovering ? "2px solid white" : "2px solid transparent",
        }}
      />
    </motion.div>
  );
}
```

### Magnetic Button Hook

```tsx
"use client";

import { useRef, useState } from "react";

interface MagneticOptions {
  strength?: number;
  ease?: number;
}

export function useMagneticEffect(
  options: MagneticOptions = {}
) {
  const { strength = 0.3, ease = 0.1 } = options;
  const ref = useRef<HTMLElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    setTransform({
      x: deltaX,
      y: deltaY,
    });
  };

  const handleMouseLeave = () => {
    setTransform({ x: 0, y: 0 });
  };

  return {
    ref,
    transform,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
}
```

---

## Verification Checklist

- [ ] Custom cursor appears and follows mouse
- [ ] Cursor expands on hover over interactive elements
- [ ] Magnetic buttons move toward cursor on hover
- [ ] Scroll parallax works on hero elements
- [ ] All animations are smooth (60fps)
- [ ] Mobile/touch devices show default cursor
- [ ] Build passes with no errors