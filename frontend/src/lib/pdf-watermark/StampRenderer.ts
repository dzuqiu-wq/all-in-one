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

  private calculateArcTextPositions(
    text: string,
    radius: number,
    startAngle: number,
    endAngle: number
  ): ArcTextChar[] {
    if (!text) return [];

    const chars: ArcTextChar[] = [];
    const totalAngle = endAngle - startAngle;
    const charCount = text.length;
    const spacing = 0.9;
    const totalWidth = charCount * spacing;
    const startOffset = (1 - totalWidth) / 2;

    for (let i = 0; i < charCount; i++) {
      const ratio = (startOffset + i * spacing) / totalWidth;
      const angle = startAngle + ratio * totalAngle;
      const char = text[i];

      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const rotation = angle - Math.PI / 2 + Math.PI;

      chars.push({ char, x, y, rotation });
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

  private drawBorder(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    size: number
  ): void {
    ctx.beginPath();

    switch (this.config.shape) {
      case 'circle':
        ctx.arc(centerX, centerY, size / 2 - 2, 0, Math.PI * 2);
        break;
      case 'oval':
        ctx.ellipse(centerX, centerY, size / 2 - 2, size / 3 - 2, 0, 0, Math.PI * 2);
        break;
      case 'rect':
        const rectSize = size * 0.8;
        ctx.rect(centerX - rectSize / 2, centerY - rectSize / 2, rectSize, rectSize);
        break;
    }

    ctx.strokeStyle = this.config.color;
    ctx.lineWidth = this.config.borderWidth;
    ctx.stroke();
  }

  private drawInnerCircle(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    const innerRadius = radius * this.config.innerCircleRadius;

    ctx.beginPath();

    switch (this.config.shape) {
      case 'circle':
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
        break;
      case 'oval':
        ctx.ellipse(centerX, centerY, innerRadius, innerRadius * 0.7, 0, 0, Math.PI * 2);
        break;
      case 'rect':
        const rectSize = radius * this.config.innerCircleRadius * 1.6;
        ctx.rect(centerX - rectSize / 2, centerY - rectSize / 2, rectSize, rectSize);
        break;
    }

    ctx.strokeStyle = this.config.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    size: number
  ): void {
    const outerRadius = size * 0.18;
    const innerRadius = outerRadius * 0.4;
    const vertices = this.generateStarVertices(centerX, centerY, outerRadius, innerRadius);

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);

    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }

    ctx.closePath();
    ctx.fillStyle = this.config.color;
    ctx.fill();
  }

  private drawArcText(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    const chars = this.calculateArcTextPositions(
      this.config.companyName,
      radius,
      -Math.PI * 0.8,
      -Math.PI * 0.2
    );

    ctx.font = `bold ${this.config.size * 0.1}px sans-serif`;
    ctx.fillStyle = this.config.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const { char, x, y, rotation } of chars) {
      ctx.save();
      ctx.translate(centerX + x, centerY + y);
      ctx.rotate(rotation);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }

  private drawHorizontalText(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    if (!this.config.departmentName) return;

    const y = centerY + radius * 0.5;

    ctx.font = `bold ${this.config.size * 0.08}px sans-serif`;
    ctx.fillStyle = this.config.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.config.departmentName, centerX, y);
  }

  renderToCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    const size = this.config.size;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 15;

    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    this.drawBorder(ctx, centerX, centerY, size);
    this.drawInnerCircle(ctx, centerX, centerY, radius);
    this.drawStar(ctx, centerX, centerY, size);
    this.drawArcText(ctx, centerX, centerY, radius * 0.75);
    this.drawHorizontalText(ctx, centerX, centerY, radius);
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