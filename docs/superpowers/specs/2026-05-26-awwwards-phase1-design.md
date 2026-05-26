# Awwwards Phase 1: Experiential Infrastructure

**Date:** 2026-05-26
**Phase:** 1 of 3 (Motion & Smooth Scroll)

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Smooth Scroll | Lenis + React Provider | React-friendly, shareable instance |
| Page Transition | Fade + Slide Up + Stagger | Classic, elegant, suitable for B2B |
| Transition Scope | Global wrapper | Unified experience, minimal maintenance |
| Animation Sync | Framer Motion auto-sync | Seamless integration, least code |

---

## Architecture

### File Structure

```
src/
├── components/
│   └── SmoothScrollProvider.tsx    # Lenis Context Provider
├── animations/
│   ├── pageTransition.tsx          # Global page transition
│   └── fadeSlideUp.ts              # Reusable animation variants
└── app/[locale]/layout.tsx         # Inject SmoothScrollProvider
```

### Component Details

#### SmoothScrollProvider

- Wraps entire application
- Provides Lenis instance via React Context
- Handles scroll RAF loop automatically
- Supports SSR (skips initialization on server)

#### PageTransition

- Uses `<AnimatePresence>` + `<motion.div>`
- Triggers on route changes
- Configurable via children props

#### Animation Parameters

| Property | Value |
|----------|-------|
| Base duration | 400ms |
| Easing | ease-out (0.25, 0.1, 0.25, 1) |
| Stagger delay | 100ms per item |
| Initial opacity | 0 |
| Initial translateY | 30px |
| Final opacity | 1 |
| Final translateY | 0 |

---

## Constraints

1. **SSG Compatibility:** Must preserve 36 static routes
2. **Performance:** No WebGL, CSS + Framer Motion only
3. **State Machine:** Do not break Zustand stores or html2canvas logic
4. **Build:** `npm run build` must exit with code 0

---

## Verification Plan

1. `npm run build` — verify 36 SSG pathways build successfully
2. Manual test: scroll feels fluid, no jank
3. Manual test: page transitions animate on route change
4. Verify tool pages load correctly with animation