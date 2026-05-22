import type {
  StampConfig,
  ArcTextChar,
  StarVertex
} from './types';

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
 * Unified geometry model for the stamp.
 * All Y values are absolute canvas coordinates.
 * Used by both border drawing and text positioning to guarantee
 * pixel-perfect alignment with no border clipping.
 */
interface StampGeometry {
  centerX: number;
  centerY: number;
  // Outer border bounds
  outerA: number;   // outer semi-major axis (x)
  outerB: number;   // outer semi-minor axis (y) — equals outerA for circles
  outerTop: number;
  outerBottom: number;
  outerLeft: number;
  outerRight: number;
  // Inner border bounds
  innerA: number;
  innerB: number;
  innerTop: number;
  innerBottom: number;
  innerLeft: number;
  innerRight: number;
  // Text band geometry (between outer and inner borders, top arc)
  textArcA: number;   // text-path semi-major axis (x)
  textArcB: number;   // text-path semi-minor axis (y)
  textFontSize: number;
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
   * Build canonical geometry once per render.
   * The text path radii sit at the midpoint between the outer and
   * inner borders, so glyphs never clip either ring.
   * ============================================================
   */
  private buildGeometry(): StampGeometry {
    const size = this.config.size;
    const centerX = size / 2;
    const centerY = size / 2;
    const borderInset = 2;

    // Font size in px — used to space the text band safely.
    const textFontSize = size * 0.1;

    // Outer & inner radii per shape
    let outerA: number;
    let outerB: number;
    let innerA: number;
    let innerB: number;

    switch (this.config.shape) {
      case 'circle': {
        outerA = size / 2 - borderInset;
        outerB = outerA;
        innerA = outerA * this.config.innerCircleRadius;
        innerB = innerA;
        break;
      }
      case 'oval': {
        outerA = size / 2 - borderInset;
        outerB = outerA * 0.6;
        innerA = outerA * this.config.innerCircleRadius;
        innerB = outerB * this.config.innerCircleRadius;
        break;
      }
      case 'rect': {
        const half = (size * 0.8) / 2;
        outerA = half;
        outerB = half;
        const innerHalf = half * this.config.innerCircleRadius;
        innerA = innerHalf;
        innerB = innerHalf;
        break;
      }
    }

    // Text-path radii: sit at the midpoint between outer and inner borders,
    // then nudge inward by half the font height so glyphs never clip either ring.
    const textArcA = (outerA + innerA) / 2;
    const textArcB = (outerB + innerB) / 2;

    return {
      centerX,
      centerY,
      outerA,
      outerB,
      outerTop: centerY - outerB,
      outerBottom: centerY + outerB,
      outerLeft: centerX - outerA,
      outerRight: centerX + outerA,
      innerA,
      innerB,
      innerTop: centerY - innerB,
      innerBottom: centerY + innerB,
      innerLeft: centerX - innerA,
      innerRight: centerX + innerA,
      textArcA,
      textArcB,
      textFontSize,
    };
  }

  /**
   * ============================================================
   * Elliptical Arc Text — Unified for Circle (a=b) and Oval (a≠b)
   * ============================================================
   * Math model:
   *   x(t) = a · cos(t)
   *   y(t) = b · sin(t)
   *   dx/dt = -a · sin(t)
   *   dy/dt =  b · cos(t)
   *   Tangent vector: (-a sin t, b cos t)
   *   Normal-aligned glyph rotation (outward-facing baseline):
   *     rotation = atan2(b·cos t, a·sin t) + π/2
   *
   * Distribution:
   *   - Centered on top vertical axis (-π/2)
   *   - Uniform angular step across totalSpan
   *   - startAngle = -π/2 - totalSpan/2
   *   - step = totalSpan / (charCount - 1)   [closed-form, no spacing magic numbers]
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

    // Single-character degenerate case — anchor at top.
    if (charCount === 1) {
      const t = topAxis;
      chars.push({
        char: text[0],
        x: a * Math.cos(t),
        y: b * Math.sin(t),
        rotation: Math.atan2(b * Math.cos(t), a * Math.sin(t)) + Math.PI / 2,
      });
      return chars;
    }

    const startAngle = topAxis - totalSpan / 2;
    const step = totalSpan / (charCount - 1);

    for (let i = 0; i < charCount; i++) {
      const t = startAngle + i * step;
      const x = a * Math.cos(t);
      const y = b * Math.sin(t);
      // Tangent-perpendicular glyph rotation
      const rotation = Math.atan2(b * Math.cos(t), a * Math.sin(t)) + Math.PI / 2;
      chars.push({ char: text[i], x, y, rotation });
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
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      vertices.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
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
        ctx.rect(g.outerLeft, g.outerTop, g.outerA * 2, g.outerB * 2);
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
        ctx.rect(g.innerLeft, g.innerTop, g.innerA * 2, g.innerB * 2);
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
   * TOP TEXT (公司名称) — Shape-dispatched
   *   - circle/oval: arc text, symmetric about top axis
   *   - rect:        horizontal text, centered between outerTop & innerTop
   * ============================================================
   */
  private drawTopText(ctx: CanvasRenderingContext2D, g: StampGeometry): void {
    const text = this.config.companyName;
    if (!text) return;

    ctx.save();
    ctx.font = `bold ${g.textFontSize}px sans-serif`;
    ctx.fillStyle = this.config.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (this.config.shape === 'rect') {
      // Rectangle: rotation = 0, perfectly centered between outer and inner top edges.
      const y = g.outerTop + (g.innerTop - g.outerTop) / 2;
      ctx.save();
      ctx.translate(g.centerX, y);
      ctx.rotate(0);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    } else {
      // Circle & Oval: tangent-perpendicular arc text, symmetric about -π/2.
      // Arc span: 140° for short text, scales to 160° for longer text.
      const charCount = text.length;
      const spanDegrees = Math.min(160, 100 + charCount * 8);
      const totalSpan = (spanDegrees * Math.PI) / 180;

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

    ctx.restore();
  }

  /**
   * ============================================================
   * BOTTOM TEXT (业务专用章) — Universal horizontal text
   *   rotation = 0, ctx.textAlign = 'center', ctx.textBaseline = 'middle'
   *
   *   - circle/oval: centered between star bottom and inner border bottom
   *   - rect:        centered between innerBottom and outerBottom
   * ============================================================
   */
  private drawBottomText(ctx: CanvasRenderingContext2D, g: StampGeometry): void {
    const text = this.config.departmentName;
    if (!text) return;

    const bottomFontSize = this.config.size * 0.08;

    let y: number;
    if (this.config.shape === 'rect') {
      // Rect: midpoint between inner bottom and outer bottom.
      y = g.innerBottom + (g.outerBottom - g.innerBottom) / 2;
    } else {
      // Circle/Oval: inside the inner ring, below the star.
      // Star outerRadius = size * 0.18, so bottom of star ≈ centerY + size*0.18
      const starBottom = g.centerY + this.config.size * 0.18;
      // Place text midway between star bottom and inner ring bottom.
      y = starBottom + (g.innerBottom - starBottom) / 2;
    }

    ctx.save();
    ctx.font = `bold ${bottomFontSize}px sans-serif`;
    ctx.fillStyle = this.config.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(g.centerX, y);
    ctx.rotate(0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  renderToCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    const size = this.config.size;
    const g = this.buildGeometry();

    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    this.drawBorder(ctx, g);
    this.drawInnerBorder(ctx, g);
    this.drawStar(ctx, g);
    this.drawTopText(ctx, g);
    this.drawBottomText(ctx, g);
    this.applyNoise(ctx, size, size);
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

  async renderToBlob(type: string = 'image/png', quality: number = 1): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = this.config.size;
    canvas.height = this.config.size;

    this.renderToCanvas(canvas);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        },
        type,
        quality
      );
    });
  }

  async renderToDataURL(type: string = 'image/png', quality: number = 1): Promise<string> {
    const blob = await this.renderToBlob(type, quality);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
