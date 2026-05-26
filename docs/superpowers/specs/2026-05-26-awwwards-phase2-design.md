# Awwwards Phase 2: Typographic Brutalism & Spatial Layouts

**Date:** 2026-05-26
**Phase:** 2 of 3 (Typography & Spatial Layouts)

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hero Typography | Brutalist `clamp(3rem,10vw,10rem)` | Dramatic, eye-catching |
| Tool Cards | Bento Grid + Glassmorphism | Modern, Awwwards-worthy |
| Grain Overlay | Subtle `opacity: 0.02-0.03` | Cinematic texture |

---

## Architecture

### File Structure

```
src/
├── components/
│   └── GrainOverlay.tsx           # Fixed SVG grain overlay
├── app/[locale]/
│   └── HomeContent.tsx            # Hero + Bento Grid redesign
└── styles/
    └── bento.css                   # Bento grid utilities
```

### Component Details

#### GrainOverlay

- Fixed position SVG noise pattern
- `pointer-events-none` so it doesn't block interactions
- `opacity-[0.02-0.03]` for subtle texture
- Works across both light and dark themes

#### Hero Section (HomeContent)

- **Headline:** `text-[clamp(3rem,10vw,10rem)]`
- **Weight contrast:** Thin (300) headline + Bold (700) accent word
- **Layout:** Overlap text with decorative elements
- **Stagger animation:** Each word animates in sequence

#### Tool Cards → Bento Grid

- **Category leader cards:** 2 columns wide (featured tools)
- **Standard cards:** 1 column
- **Glassmorphism:** `backdrop-blur-md bg-white/40 border border-white/20`
- **Hover state:** Scale up, subtle glow, shadow lift
- **Stagger animation:** Cards animate in with 100ms delay

---

## Implementation Details

### Hero Typography

```tsx
<h1 className="text-[clamp(3rem,10vw,10rem)] font-light leading-[0.9] tracking-tight">
  {t("home.headline")}
  <span className="font-bold text-primary">{t("home.headlineAccent")}</span>
</h1>
```

### Bento Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {categoryTools.map((tool, i) => (
    <div
      key={tool.slug}
      className={i === 0 ? "md:col-span-2" : ""} // Lead card spans 2 cols
    >
      <BentoToolCard tool={tool} />
    </div>
  ))}
</div>
```

### Glassmorphism Card

```tsx
<div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-xl p-6">
  {/* Card content */}
</div>
```

### Grain Overlay (CSS)

```css
.film-grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,...");
  z-index: 9999;
}
```

---

## Verification Checklist

1. Hero text is dramatically large and impactful
2. Tool cards form a Bento layout (first card wider)
3. Cards have glassmorphism effect
4. Grain overlay adds subtle texture
5. All animations work smoothly
6. Build passes with no errors
7. Responsive on mobile/tablet/desktop