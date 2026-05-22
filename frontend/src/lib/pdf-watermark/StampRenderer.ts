import type {
  StampConfig,
  ArcTextChar,
  RectTextChar,
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

  /**
   * ============================================================
   * 椭圆/正圆弧形文字轨迹算法
   * ============================================================
   * 使用椭圆参数方程: x = a*cos(θ), y = b*sin(θ)
   *
   * 关键：切线修正
   * 椭圆切线斜率 dy/dx = (b*cos(θ)) / (-a*sin(θ))
   * 法线旋转角 rotation = atan2(b*cos(θ), -a*sin(θ)) + π/2
   * （使字符严格垂直于椭圆弧度）
   */
  private calculateEllipseArcPositions(
    text: string,
    a: number,  // 横向半轴
    b: number,  // 纵向半轴
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
      const theta = startAngle + ratio * totalAngle;
      const char = text[i];

      // 椭圆参数方程: x = a*cos(θ), y = b*sin(θ)
      const x = a * Math.cos(theta);
      const y = b * Math.sin(theta);

      // 关键切线修正：计算法线旋转角
      // 椭圆一阶导数 dy/dx = (dy/dθ) / (dx/dθ) = (-b*sin(θ)) / (-a*sin(θ)) * cos(θ)?
      // 实际上: dx/dθ = -a*sin(θ), dy/dθ = b*cos(θ)
      // 切线方向向量: (-a*sin(θ), b*cos(θ))
      // 法线旋转角: rotation = atan2(dx/dθ, dy/dθ) + π/2
      // 但画布坐标系y轴向下，所以 rotation = atan2(-dx/dθ, -dy/dθ)
      // 简化为: rotation = Math.atan2(b * Math.cos(theta), a * Math.sin(theta)) + Math.PI / 2
      const rotation = Math.atan2(b * Math.cos(theta), a * Math.sin(theta)) + Math.PI / 2;

      chars.push({ char, x, y, rotation });
    }

    return chars;
  }

  /**
   * ============================================================
   * 矩形顶部边框文字轨迹算法（线性边界分发）
   * ============================================================
   * 彻底摒弃圆周极坐标，使用线性插值
   * 所有字符 rotation = 0（水平）
   */
  private calculateRectLinearPositions(
    text: string,
    rectWidth: number,
    topY: number
  ): RectTextChar[] {
    if (!text) return [];

    const chars: RectTextChar[] = [];
    const charCount = text.length;
    const charWidth = rectWidth / charCount;

    // 沿顶部边框线性平铺，从左到右
    for (let i = 0; i < charCount; i++) {
      const char = text[i];

      // 字符中心点：线性插值
      const x = (i + 0.5) * charWidth;
      const y = topY;

      // 【角度归零】：矩形顶部排列时 rotation 强制为 0
      const rotation = 0;

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
      case 'oval': {
        // 椭圆：横向半轴 a = size/2 - 2, 纵向半轴 b = a * 0.6
        const a = size / 2 - 2;
        const b = a * 0.6;
        ctx.ellipse(centerX, centerY, a, b, 0, 0, Math.PI * 2);
        break;
      }
      case 'rect': {
        const rectSize = size * 0.8;
        ctx.rect(centerX - rectSize / 2, centerY - rectSize / 2, rectSize, rectSize);
        break;
      }
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
      case 'oval': {
        const a = innerRadius;
        const b = a * 0.6;
        ctx.ellipse(centerX, centerY, a, b, 0, 0, Math.PI * 2);
        break;
      }
      case 'rect': {
        const rectSize = radius * this.config.innerCircleRadius * 1.6;
        ctx.rect(centerX - rectSize / 2, centerY - rectSize / 2, rectSize, rectSize);
        break;
      }
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

  /**
   * ============================================================
   * 弧形文字绘制 - 根据形状分发到正确的算法
   * ============================================================
   */
  private drawArcText(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    const text = this.config.companyName;
    if (!text) return;

    ctx.font = `bold ${this.config.size * 0.1}px sans-serif`;
    ctx.fillStyle = this.config.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    switch (this.config.shape) {
      case 'circle': {
        // 正圆：使用标准半径 a = b = radius
        const chars = this.calculateEllipseArcPositions(
          text,
          radius * 0.75,  // a = 横向半轴
          radius * 0.75,  // b = 纵向半轴（相等）
          -Math.PI * 0.8,
          -Math.PI * 0.2
        );
        for (const { char, x, y, rotation } of chars) {
          ctx.save();
          ctx.translate(centerX + x, centerY + y);
          ctx.rotate(rotation);
          ctx.fillText(char, 0, 0);
          ctx.restore();
        }
        break;
      }
      case 'oval': {
        // 椭圆：a ≠ b，使用真正的椭圆参数方程
        const a = radius * 0.75;  // 横向半轴
        const b = radius * 0.45;  // 纵向半轴（椭圆更扁平）
        const chars = this.calculateEllipseArcPositions(
          text,
          a,
          b,
          -Math.PI * 0.8,
          -Math.PI * 0.2
        );
        for (const { char, x, y, rotation } of chars) {
          ctx.save();
          ctx.translate(centerX + x, centerY + y);
          ctx.rotate(rotation);
          ctx.fillText(char, 0, 0);
          ctx.restore();
        }
        break;
      }
      case 'rect': {
        // 矩形：使用线性边界分发算法，彻底摒弃圆周极坐标
        const rectSize = this.config.size * 0.8;
        const borderPadding = 20;
        const availableWidth = rectSize - borderPadding * 2;
        const topY = centerY - rectSize / 2 + borderPadding;

        const chars = this.calculateRectLinearPositions(
          text,
          availableWidth,
          topY
        );

        for (const { char, x, y, rotation } of chars) {
          ctx.save();
          ctx.translate(centerX - rectSize / 2 + borderPadding + x, y);
          ctx.rotate(rotation);
          ctx.fillText(char, 0, 0);
          ctx.restore();
        }
        break;
      }
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
    this.drawArcText(ctx, centerX, centerY, radius);
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