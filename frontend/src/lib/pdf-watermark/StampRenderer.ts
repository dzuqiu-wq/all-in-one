import type { StampConfig, ArcTextChar, StarVertex } from './types';

/**
 * Default stamp configuration.
 * Shape: 'circle' | 'oval' | 'rect'
 */
const DEFAULT_CONFIG: StampConfig = {
  shape: 'circle',
  companyName: '公司名称',
  departmentName: '业务专用章',
  color: '#CC0000',
  size: 200,
  noiseLevel: 0.1,
  starStyle: 'fivePoint',
  borderWidth: 3,
  innerCircleRadius: 0.85,
};

/**
 * StampGeometry — single source of truth for all dimensions.
 *
 * Design constraints enforced here:
 *   - Outer ring: outerA = size/2 - 4; circle/rect → outerB = outerA;
 *                 oval → outerB = outerA * 0.65
 *   - Font clearance: gap = fontSize * 1.5  (minimum whitespace for text band)
 *   - Inner ring is reactively shrunk so the gap is always satisfied.
 *   - textArcA/B = exact midpoint between outer and inner rings.
 *
 * All Y coordinates use canvas convention (y increases downward):
 *   outerTop    = centerY - outerB
 *   outerBottom = centerY + outerB
 *   innerTop    = centerY - innerB
 *   innerBottom = centerY + innerB
 */
interface StampGeometry {
  centerX: number;
  centerY: number;
  size: number;

  // Outer ring semi-axes
  outerA: number;
  outerB: number;
  // Inner ring semi-axes
  innerA: number;
  innerB: number;

  // Absolute Y boundary values
  outerTop: number;
  outerBottom: number;
  innerTop: number;
  innerBottom: number;

  // Text path midpoints — glyphs orbit here, never touching either ring
  textArcA: number;
  textArcB: number;

  // Font sizes
  arcFontSize: number;
  bottomFontSize: number;
  // Minimum guaranteed vertical gap between outer and inner rings
  gap: number;
}

export class StampRenderer {
  private config: StampConfig;

  constructor(config: Partial<StampConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  updateConfig(config: Partial<StampConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): Readonly<StampConfig> {
    return { ...this.config };
  }

  // ================================================================
  // GEOMETRY
  // ================================================================

  private buildGeometry(): StampGeometry {
    const { size } = this.config;
    const centerX = size / 2;
    const centerY = size / 2;

    // Font size: 9.5% of stamp size — gives good legibility at all resolutions.
    const arcFontSize = size * 0.095;
    const bottomFontSize = size * 0.078;

    // Minimum vertical whitespace required for the text band.
    // 1.8× font height ensures glyphs sit cleanly between rings with breathing room.
    const gap = arcFontSize * 1.8;

    // Outer ring semi-axes
    const outerA = size / 2 - 4;
    let outerB: number;
    let innerA: number;
    let innerB: number;

    switch (this.config.shape) {
      case 'circle':
      case 'rect':
        outerB = outerA;
        // Inner ring is shrunk until the gap requirement is met.
        innerA = outerA - gap;
        innerB = outerB - gap;
        break;

      case 'oval':
        outerB = outerA * 0.65;
        // Shrink inner ring to satisfy the vertical gap.
        innerB = outerB - gap;
        innerA = outerA - gap;
        break;

      // unreachable
      default:
        outerB = outerA;
        innerA = outerA - gap;
        innerB = outerB - gap;
    }

    // Verify Y arithmetic (canvas y increases downward).
    const outerTop    = centerY - outerB;
    const outerBottom = centerY + outerB;
    const innerTop    = centerY - innerB;
    const innerBottom = centerY + innerB;

    // Text path radius: exact midpoint of outer and inner rings.
    // Glyphs orbit here — guaranteed to be centered in the blank gap.
    const textArcA = (outerA + innerA) / 2;
    const textArcB = (outerB + innerB) / 2;

    return {
      centerX,
      centerY,
      size,
      outerA,
      outerB,
      innerA,
      innerB,
      outerTop,
      outerBottom,
      innerTop,
      innerBottom,
      textArcA,
      textArcB,
      arcFontSize,
      bottomFontSize,
      gap,
    };
  }

  // ================================================================
  // ELLIPTIC ARC TEXT — Circle (a=b) and Oval (a≠b) unified
  // ================================================================
  //
  // Ellipse parametric: x = a·cos(t), y = b·sin(t)
  //
  // Definitive Invariant Normal Formula:
  //   rotation = atan2(a·sin(t), b·cos(t)) + π/2
  //
  //   For a circle (a = b): atan2(sin t, cos t) + π/2 = t + π/2
  //   → glyph heads point exactly outward (away from center), flowing
  //     clockwise from left to right across the top arc.
  //
  // Distribution:
  //   - Centered on top vertical axis (-π/2)
  //   - startAngle = -π/2 - totalSpan/2
  //   - step       = totalSpan / (charCount - 1)

  private calculateArcPositions(
    text: string,
    a: number,
    b: number,
    totalSpan: number
  ): ArcTextChar[] {
    if (!text) return [];

    const charCount = text.length;
    const topAxis = -Math.PI / 2;

    if (charCount === 1) {
      const t = topAxis;
      return [{
        char: text[0],
        x: a * Math.cos(t),
        y: b * Math.sin(t),
        rotation: Math.atan2(a * Math.sin(t), b * Math.cos(t)) + Math.PI / 2,
      }];
    }

    const startAngle = topAxis - totalSpan / 2;
    const step = totalSpan / (charCount - 1);
    const chars: ArcTextChar[] = [];

    for (let i = 0; i < charCount; i++) {
      const t = startAngle + i * step;
      chars.push({
        char: text[i],
        x: a * Math.cos(t),
        y: b * Math.sin(t),
        rotation: Math.atan2(a * Math.sin(t), b * Math.cos(t)) + Math.PI / 2,
      });
    }

    return chars;
  }

  // ================================================================
  // STAR
  // ================================================================

  private generateStarVertices(cx: number, cy: number, or: number, ir: number): StarVertex[] {
    const verts: StarVertex[] = [];
    const pts = 5;
    const step = Math.PI / pts;

    for (let i = 0; i < pts * 2; i++) {
      const r = i % 2 === 0 ? or : ir;
      const angle = i * step - Math.PI / 2;
      verts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    }

    return verts;
  }

  // ================================================================
  // NOISE
  // ================================================================

  private applyNoise(ctx: CanvasRenderingContext2D, sz: number): void {
    if (this.config.noiseLevel <= 0) return;

    const data = ctx.getImageData(0, 0, sz, sz).data;
    const total = data.length / 4;
    const np = Math.floor(total * this.config.noiseLevel * 0.1);

    for (let i = 0; i < np; i++) {
      const idx = Math.floor(Math.random() * total) * 4;
      if (Math.random() > 0.5) {
        data[idx + 3] = Math.floor(data[idx + 3] * (0.3 + Math.random() * 0.7));
      } else {
        data[idx]     = Math.min(255, data[idx]     + Math.floor(Math.random() * 20 - 10));
        data[idx + 1] = Math.min(255, data[idx + 1] + Math.floor(Math.random() * 20 - 10));
        data[idx + 2] = Math.min(255, data[idx + 2] + Math.floor(Math.random() * 20 - 10));
      }
    }

    ctx.putImageData(ctx.getImageData(0, 0, sz, sz), 0, 0);
  }

  // ================================================================
  // BORDER DRAWING — fully isolated save/restore
  // ================================================================

  private drawOuterBorder(ctx: CanvasRenderingContext2D, g: StampGeometry): void {
    ctx.save();
    ctx.beginPath();

    switch (this.config.shape) {
      case 'circle':
        ctx.arc(g.centerX, g.centerY, g.outerA, 0, Math.PI * 2);
        break;
      case 'oval':
        ctx.ellipse(g.centerX, g.centerY, g.outerA, g.outerB, 0, 0, Math.PI * 2);
        break;
      case 'rect':
        ctx.rect(g.centerX - g.outerA, g.outerTop, g.outerA * 2, g.outerB * 2);
        break;
    }

    ctx.strokeStyle = this.config.color;
    ctx.lineWidth = this.config.borderWidth;
    ctx.stroke();
    ctx.restore();
  }

  private drawInnerBorder(ctx: CanvasRenderingContext2D, g: StampGeometry): void {
    ctx.save();
    ctx.beginPath();

    switch (this.config.shape) {
      case 'circle':
        ctx.arc(g.centerX, g.centerY, g.innerA, 0, Math.PI * 2);
        break;
      case 'oval':
        ctx.ellipse(g.centerX, g.centerY, g.innerA, g.innerB, 0, 0, Math.PI * 2);
        break;
      case 'rect':
        ctx.rect(g.centerX - g.innerA, g.innerTop, g.innerA * 2, g.innerB * 2);
        break;
    }

    ctx.strokeStyle = this.config.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  private drawStar(ctx: CanvasRenderingContext2D, g: StampGeometry): void {
    const outerRadius = g.size * 0.18;
    const innerRadius = outerRadius * 0.4;
    const verts = this.generateStarVertices(g.centerX, g.centerY, outerRadius, innerRadius);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
    ctx.closePath();
    ctx.fillStyle = this.config.color;
    ctx.fill();
    ctx.restore();
  }

  // ================================================================
  // TOP TEXT — 公司名称
  // ================================================================
  //
  // Circle  → orbit pattern: rotate first, then translate(0, -textRadius)
  // Oval    → explicit ellipse parametric coords + normalAngle rotation
  // Rect    → pure linear midpoint, rotation=0, no trig at all

  private drawTopText(ctx: CanvasRenderingContext2D, g: StampGeometry): void {
    const text = this.config.companyName;
    if (!text) return;

    const { shape } = this.config;

    if (shape === 'rect') {
      // ── RECTANGLE: linear midpoint ───────────────────────────────
      // Y = outerTop + (innerTop - outerTop) / 2
      //   = (outerTop + innerTop) / 2
      // Verified: outerTop = centerY - outerB, innerTop = centerY - innerB
      const textY = g.outerTop + (g.innerTop - g.outerTop) / 2;

      ctx.save();
      ctx.font = `bold ${g.arcFontSize}px sans-serif`;
      ctx.fillStyle = this.config.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(g.centerX, textY);
      ctx.rotate(0);                  // fully horizontal
      ctx.fillText(text, 0, 0);
      ctx.restore();

    } else {
      // ── CIRCLE & OVAL: tangent-perpendicular arc ───────────────
      const charCount = text.length;
      const spanDeg = Math.min(160, 100 + charCount * 8);
      const totalSpan = (spanDeg * Math.PI) / 180;

      const chars = this.calculateArcPositions(
        text,
        g.textArcA,
        g.textArcB,
        totalSpan
      );

      // Lock font + alignment ONCE on a parent save scope.
      // Per-glyph save/restore handles the translate/rotate matrix.
      ctx.save();
      ctx.font = `bold ${g.arcFontSize}px sans-serif`;
      ctx.fillStyle = this.config.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (const c of chars) {
        ctx.save();
        // 1. Translate to the absolute character coordinate on the ring.
        ctx.translate(g.centerX + c.x, g.centerY + c.y);
        // 2. Rotate the context so the glyph aligns with the local curve normal.
        ctx.rotate(c.rotation);
        // 3. Draw the single character at the localized origin (0, 0).
        ctx.fillText(c.char, 0, 0);
        ctx.restore();
      }

      ctx.restore();
    }
  }

  // ================================================================
  // BOTTOM TEXT — 业务专用章
  // ================================================================
  //
  // Always rotation = 0, textAlign = 'center', textBaseline = 'middle'.
  //
  // Rect:       Y = innerBottom + (outerBottom - innerBottom) / 2
  // Circle/Oval: centered between star bottom tip and inner ring bottom.

  private drawBottomText(ctx: CanvasRenderingContext2D, g: StampGeometry): void {
    const text = this.config.departmentName;
    if (!text) return;

    const { shape } = this.config;
    const clearance = g.bottomFontSize * 0.4;   // minimum padding from border lines
    let y: number;

    if (shape === 'rect') {
      // Y = innerBottom + (outerBottom - innerBottom) / 2
      y = g.innerBottom + (g.outerBottom - g.innerBottom) / 2;

    } else {
      // Circle / Oval: inside the inner ring, below the star.
      // Star outer radius = size * 0.18
      // Star bottom tip in canvas Y:
      const starBottom = g.centerY + g.size * 0.18;
      // Safe lower bound: inner bottom line minus clearance
      const safeBottom = g.innerBottom - clearance;
      // Safe upper bound: star bottom tip plus clearance
      const safeTop = starBottom + clearance;
      // Re-center between the two safe boundaries
      y = (safeTop + safeBottom) / 2;
      // Hard floor: never overlap the star
      y = Math.max(y, safeTop);
    }

    ctx.save();
    ctx.font = `bold ${g.bottomFontSize}px sans-serif`;
    ctx.fillStyle = this.config.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(g.centerX, y);
    ctx.rotate(0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  // ================================================================
  // PUBLIC RENDER API
  // ================================================================

  renderToCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    const g = this.buildGeometry();

    // High-DPI lock: physical resolution == CSS resolution
    canvas.width = g.size;
    canvas.height = g.size;

    // Day-1 clear
    ctx.clearRect(0, 0, g.size, g.size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw layers in order — each fully isolated with save/restore
    this.drawOuterBorder(ctx, g);
    this.drawInnerBorder(ctx, g);
    this.drawStar(ctx, g);
    this.drawTopText(ctx, g);
    this.drawBottomText(ctx, g);
    this.applyNoise(ctx, g.size);
  }

  renderToImageData(): ImageData {
    const canvas = document.createElement('canvas');
    canvas.width = this.config.size;
    canvas.height = this.config.size;
    this.renderToCanvas(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    return ctx.getImageData(0, 0, this.config.size, this.config.size);
  }

  async renderToBlob(type = 'image/png', quality = 1): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = this.config.size;
    canvas.height = this.config.size;
    this.renderToCanvas(canvas);
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create blob'))),
        type,
        quality
      );
    });
  }

  async renderToDataURL(type = 'image/png', quality = 1): Promise<string> {
    const blob = await this.renderToBlob(type, quality);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}