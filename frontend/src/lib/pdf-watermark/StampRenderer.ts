import type { StampConfig, ArcTextChar, StarVertex } from './types';

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
 * Physical clearance factor — vertical gap between outer and inner rings
 * must be >= fontSize * CLEARANCE_FACTOR to safely accommodate glyphs.
 */
const CLEARANCE_FACTOR = 1.4;

interface StampGeometry {
  centerX: number;
  centerY: number;
  // --- Border radii ---
  outerA: number;   // outer semi-major axis (x)
  outerB: number;   // outer semi-minor axis (y)
  innerA: number;   // inner semi-major axis (x)
  innerB: number;   // inner semi-minor axis (y)
  // --- Explicit boundary Y values (canvas coords) ---
  outerTop: number;     // centerY - outerB  (smallest Y = top of stamp)
  outerBottom: number;  // centerY + outerB
  innerTop: number;     // centerY - innerB  (inner ring top)
  innerBottom: number;  // centerY + innerB
  // --- Derived safe text-band ---
  // Midpoint radius for arc text — guaranteed to sit in the dead center
  // of the gap, never touching outer or inner border.
  textArcA: number;
  textArcB: number;
  // Font sizes
  arcFontSize: number;
  bottomFontSize: number;
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

  /**
   * ============================================================
   * GEOMETRY — single source of truth for all layout decisions.
   * ============================================================
   * Key invariants enforced here:
   *   (1) Vertical gap (outerB - innerB) >= arcFontSize * CLEARANCE_FACTOR
   *       → forces innerB to shrink when gap is too small.
   *   (2) Text arc radius = (outerR + innerR) / 2 — dead-center midpoint.
   *   (3) All Y coordinates verified: outerTop = centerY - outerB (y goes down in canvas).
   */
  private buildGeometry(): StampGeometry {
    const size = this.config.size;
    const centerX = size / 2;
    const centerY = size / 2;

    const arcFontSize = size * 0.1;
    const bottomFontSize = size * 0.08;

    let outerA: number;
    let outerB: number;
    // innerA/B will be adjusted if the gap is too small
    let innerA: number;
    let innerB: number;

    switch (this.config.shape) {
      case 'circle': {
        outerA = size / 2 - 2;
        outerB = outerA;            // semi-minor = semi-major
        // Start from config ratio, then enforce clearance
        let rawInnerA = outerA * this.config.innerCircleRadius;
        let rawInnerB = rawInnerA;   // circle: innerB = innerA
        const minGap = arcFontSize * CLEARANCE_FACTOR;
        if (outerB - rawInnerB < minGap) {
          rawInnerB = outerB - minGap;
          rawInnerA = rawInnerB;
        }
        innerA = rawInnerA;
        innerB = rawInnerB;
        break;
      }
      case 'oval': {
        outerA = size / 2 - 2;
        outerB = outerA * 0.6;
        // raw inner ring from config ratio
        let rawInnerA = outerA * this.config.innerCircleRadius;
        let rawInnerB = outerB * this.config.innerCircleRadius;
        const minGap = arcFontSize * CLEARANCE_FACTOR;
        // Enforce vertical gap for top-arc clearance
        if (outerB - rawInnerB < minGap) {
          rawInnerB = outerB - minGap;
          // Keep oval aspect ratio for innerB
          rawInnerA = rawInnerB / 0.6;
        }
        // Enforce horizontal gap for arc text width
        if (outerA - rawInnerA < minGap) {
          rawInnerA = outerA - minGap;
        }
        innerA = rawInnerA;
        innerB = rawInnerB;
        break;
      }
      case 'rect': {
        const half = (size * 0.8) / 2;
        outerA = half;
        outerB = half;
        let rawInnerHalf = half * this.config.innerCircleRadius;
        const minGap = arcFontSize * CLEARANCE_FACTOR;
        // For rect, gap is just the inset: half - rawInnerHalf
        if (half - rawInnerHalf < minGap) {
          rawInnerHalf = half - minGap;
        }
        innerA = rawInnerHalf;
        innerB = rawInnerHalf;
        break;
      }
    }

    // Verify Y arithmetic: outerTop = centerY - outerB (canvas y goes down)
    const outerTop = centerY - outerB;
    const outerBottom = centerY + outerB;
    const innerTop = centerY - innerB;
    const innerBottom = centerY + innerB;

    // Text arc radius = exact midpoint of outer and inner rings.
    // This guarantees glyphs sit in dead-center of the gap.
    const textArcA = (outerA + innerA) / 2;
    const textArcB = (outerB + innerB) / 2;

    return {
      centerX,
      centerY,
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
    };
  }

  /**
   * ============================================================
   * ELLIPTICAL ARC TEXT — Circle (a=b) and Oval (a≠b) unified
   * ============================================================
   * Distribution:
   *   - Centered on top vertical axis (-π/2)
   *   - startAngle = -π/2 - totalSpan/2
   *   - Uniform step = totalSpan / (charCount - 1)
   *
   * Tangent vector: (-a·sin t, b·cos t)
   * Glyph rotation (perpendicular to tangent):
   *   rotation = atan2(b·cos t, a·sin t) + π/2
   */
  private calculateEllipseArcPositions(
    text: string,
    a: number,
    b: number,
    totalSpan: number
  ): ArcTextChar[] {
    if (!text) return [];

    const chars: ArcTextChar[] = [];
    const charCount = text.length;
    const topAxis = -Math.PI / 2;

    if (charCount === 1) {
      const t = topAxis;
      return [{
        char: text[0],
        x: a * Math.cos(t),
        y: b * Math.sin(t),
        rotation: Math.atan2(b * Math.cos(t), a * Math.sin(t)) + Math.PI / 2,
      }];
    }

    const startAngle = topAxis - totalSpan / 2;
    const step = totalSpan / (charCount - 1);

    for (let i = 0; i < charCount; i++) {
      const t = startAngle + i * step;
      chars.push({
        char: text[i],
        x: a * Math.cos(t),
        y: b * Math.sin(t),
        rotation: Math.atan2(b * Math.cos(t), a * Math.sin(t)) + Math.PI / 2,
      });
    }

    return chars;
  }

  private generateStarVertices(
    centerX: number,
    centerY: number,
    outerRadius: number,
    innerRadius: number
  ): StarVertex[] {
    const vertices: StarVertex[] = [];
    const points = 5;
    const step = Math.PI / points;

    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      vertices.push({
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      });
    }

    return vertices;
  }

  private applyNoise(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (this.config.noiseLevel <= 0) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const totalPixels = data.length / 4;
    const noisePixels = Math.floor(totalPixels * this.config.noiseLevel * 0.1);

    for (let i = 0; i < noisePixels; i++) {
      const idx = Math.floor(Math.random() * totalPixels);
      const pixelIdx = idx * 4;

      if (Math.random() > 0.5) {
        data[pixelIdx + 3] = Math.floor(data[pixelIdx + 3] * (0.3 + Math.random() * 0.7));
      } else {
        data[pixelIdx] = Math.min(255, data[pixelIdx] + Math.floor(Math.random() * 20 - 10));
        data[pixelIdx + 1] = Math.min(255, data[pixelIdx + 1] + Math.floor(Math.random() * 20 - 10));
        data[pixelIdx + 2] = Math.min(255, data[pixelIdx + 2] + Math.floor(Math.random() * 20 - 10));
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private drawBorder(ctx: CanvasRenderingContext2D, g: StampGeometry): void {
    ctx.beginPath();

    switch (this.config.shape) {
      case 'circle':
        ctx.arc(g.centerX, g.centerY, g.outerA, 0, Math.PI * 2);
        break;
      case 'oval':
        ctx.ellipse(g.centerX, g.centerY, g.outerA, g.outerB, 0, 0, Math.PI * 2);
        break;
      case 'rect':
        ctx.rect(
          g.centerX - g.outerA,
          g.outerTop,
          g.outerA * 2,
          g.outerB * 2
        );
        break;
    }

    ctx.strokeStyle = this.config.color;
    ctx.lineWidth = this.config.borderWidth;
    ctx.stroke();
  }

  private drawInnerBorder(ctx: CanvasRenderingContext2D, g: StampGeometry): void {
    ctx.beginPath();

    switch (this.config.shape) {
      case 'circle':
        ctx.arc(g.centerX, g.centerY, g.innerA, 0, Math.PI * 2);
        break;
      case 'oval':
        ctx.ellipse(g.centerX, g.centerY, g.innerA, g.innerB, 0, 0, Math.PI * 2);
        break;
      case 'rect':
        ctx.rect(
          g.centerX - g.innerA,
          g.innerTop,
          g.innerA * 2,
          g.innerB * 2
        );
        break;
    }

    ctx.strokeStyle = this.config.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private drawStar(ctx: CanvasRenderingContext2D, g: StampGeometry): void {
    const outerRadius = this.config.size * 0.18;
    const innerRadius = outerRadius * 0.4;
    const vertices = this.generateStarVertices(g.centerX, g.centerY, outerRadius, innerRadius);

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);

    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }

    ctx.closePath();
    ctx.fillStyle = this.config.color;
    ctx.fill();
  }

  /**
   * ============================================================
   * TOP TEXT — 公司名称
   * ============================================================
   * Circle/Oval: tangent-perpendicular arc text, symmetric about -π/2.
   *   Text path radius R = (outerR + innerR) / 2 — dead-center of the gap.
   *   Gap enforced >= arcFontSize * 1.4 in buildGeometry().
   *
   * Rect: perfectly horizontal (rotation = 0), centered between outerTop & innerTop.
   *   Y = outerTop + (innerTop - outerTop) / 2  — verified midpoint, not on inner line.
   */
  private drawTopText(ctx: CanvasRenderingContext2D, g: StampGeometry): void {
    const text = this.config.companyName;
    if (!text) return;

    ctx.font = `bold ${g.arcFontSize}px sans-serif`;
    ctx.fillStyle = this.config.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (this.config.shape === 'rect') {
      // Dead-center of the gap between outer and inner top edges.
      const y = g.outerTop + (g.innerTop - g.outerTop) / 2;

      ctx.save();
      ctx.translate(g.centerX, y);
      ctx.rotate(0);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    } else {
      // Circle / Oval: arc text with adaptive span.
      const charCount = text.length;
      const spanDeg = Math.min(160, 100 + charCount * 8);
      const totalSpan = (spanDeg * Math.PI) / 180;

      const chars = this.calculateEllipseArcPositions(
        text,
        g.textArcA,
        g.textArcB,
        totalSpan
      );

      for (const { char, x, y, rotation } of chars) {
        ctx.save();
        ctx.translate(g.centerX + x, g.centerY + y);
        ctx.rotate(rotation);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }
    }
  }

  /**
   * ============================================================
   * BOTTOM TEXT — 业务专用章
   * ============================================================
   * rotation = 0, textAlign = 'center', textBaseline = 'middle'.
   *
   * Clearances enforced:
   *   - At least bottomFontSize * 0.4 from star bottom tip.
   *   - At least bottomFontSize * 0.4 from inner bottom border line.
   *
   * Circle/Oval: below star, inside inner ring.
   * Rect: midpoint between innerBottom and outerBottom.
   */
  private drawBottomText(ctx: CanvasRenderingContext2D, g: StampGeometry): void {
    const text = this.config.departmentName;
    if (!text) return;

    ctx.font = `bold ${g.bottomFontSize}px sans-serif`;
    ctx.fillStyle = this.config.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const clearance = g.bottomFontSize * 0.4;

    let y: number;

    if (this.config.shape === 'rect') {
      // Midpoint between inner bottom edge and outer bottom edge.
      // Verified: innerBottom = centerY + innerB, outerBottom = centerY + outerB.
      y = g.innerBottom + (g.outerBottom - g.innerBottom) / 2;
    } else {
      // Circle / Oval: below star, inside inner ring.
      // Star outer radius = size * 0.18, star bottom tip in canvas Y:
      const starBottomTip = g.centerY + this.config.size * 0.18;
      // Text must be at least clearance below star tip:
      const belowStar = starBottomTip + clearance;
      // And at least clearance above inner bottom line:
      const aboveInnerLine = g.innerBottom - clearance;
      // Clamp to the tighter constraint (whichever is lower):
      y = Math.min(belowStar + clearance, aboveInnerLine);
      // Re-center between the two safe boundaries:
      y = (belowStar + aboveInnerLine) / 2;
      // Hard floor: never go below star tip + clearance
      y = Math.max(y, starBottomTip + clearance);
    }

    ctx.save();
    ctx.translate(g.centerX, y);
    ctx.rotate(0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  renderToCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    const g = this.buildGeometry();

    ctx.clearRect(0, 0, this.config.size, this.config.size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    this.drawBorder(ctx, g);
    this.drawInnerBorder(ctx, g);
    this.drawStar(ctx, g);
    this.drawTopText(ctx, g);
    this.drawBottomText(ctx, g);
    this.applyNoise(ctx, this.config.size, this.config.size);
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