import {
  PDFDocument,
  PDFPage,
  PDFImage,
  StandardFonts,
  rgb,
  degrees,
} from 'pdf-lib';
import type {
  WatermarkConfig,
  StampConfig,
  TextConfig,
  ProgressState,
} from './types';
import { StampRenderer } from './StampRenderer';

const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  mode: 'stamp',
  opacity: 0.3,
  rotation: -45,
  scale: 1,
  tileX: 200,
  tileY: 200,
  offsetX: 0,
  offsetY: 0,
  pages: 'all',
};

const DEFAULT_TEXT_CONFIG: TextConfig = {
  text: 'CONFIDENTIAL',
  fontSize: 48,
  fontFamily: 'Helvetica-Bold',
};

export class WatermarkProcessor {
  private stampRenderer: StampRenderer;

  constructor(stampConfig?: Partial<StampConfig>) {
    this.stampRenderer = new StampRenderer(stampConfig);
  }

  updateStampConfig(config: Partial<StampConfig>): void {
    this.stampRenderer.updateConfig(config);
  }

  getStampRenderer(): StampRenderer {
    return this.stampRenderer;
  }

  async processPDF(
    pdfBytes: ArrayBuffer,
    watermarkConfig: Partial<WatermarkConfig>,
    textConfig: Partial<TextConfig> = {},
    onProgress?: (state: ProgressState) => void
  ): Promise<Uint8Array> {
    const config = { ...DEFAULT_WATERMARK_CONFIG, ...watermarkConfig };
    const text = { ...DEFAULT_TEXT_CONFIG, ...textConfig };

    onProgress?.({
      status: 'processing',
      currentPage: 0,
      totalPages: 0,
      percent: 0,
      message: 'Loading PDF...',
    });

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    const targetPages = config.pages === 'all'
      ? pages.map((_, i) => i)
      : config.pages;

    let stampImage = null;
    if (config.mode === 'stamp' || config.mode === 'hybrid') {
      onProgress?.({
        status: 'processing',
        currentPage: 0,
        totalPages,
        percent: 10,
        message: 'Rendering stamp...',
      });

      stampImage = await this.embedStampImage(pdfDoc);
    }

    for (let i = 0; i < targetPages.length; i++) {
      const pageIndex = targetPages[i];
      const page = pages[pageIndex];

      onProgress?.({
        status: 'processing',
        currentPage: i + 1,
        totalPages,
        percent: Math.round(10 + (i / targetPages.length) * 80),
        message: `Processing page ${i + 1}/${targetPages.length}...`,
      });

      const { width, height } = page.getSize();

      if (config.mode === 'text' || config.mode === 'hybrid') {
        await this.applyTextWatermark(page, text, config, width, height, pdfDoc);
      }

      if (stampImage && (config.mode === 'stamp' || config.mode === 'hybrid')) {
        this.applyStampWatermark(page, stampImage, config, width, height);
      }
    }

    onProgress?.({
      status: 'success',
      currentPage: totalPages,
      totalPages,
      percent: 100,
      message: 'Processing complete!',
    });

    return pdfDoc.save();
  }

  private async embedStampImage(pdfDoc: PDFDocument): Promise<ReturnType<PDFDocument['embedPng']>> {
    const stampDataURL = await this.stampRenderer.renderToDataURL('image/png');

    const base64Data = stampDataURL.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return pdfDoc.embedPng(bytes);
  }

  private async applyTextWatermark(
    page: PDFPage,
    textConfig: TextConfig,
    watermarkConfig: WatermarkConfig,
    pageWidth: number,
    pageHeight: number,
    pdfDoc: PDFDocument
  ): Promise<void> {
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const textWidth = font.widthOfTextAtSize(textConfig.text, textConfig.fontSize);
    const textHeight = textConfig.fontSize;

    const positions = this.calculateTilingPositions(
      pageWidth,
      pageHeight,
      textWidth * watermarkConfig.scale,
      textHeight * watermarkConfig.scale,
      watermarkConfig.tileX,
      watermarkConfig.tileY,
      watermarkConfig.offsetX,
      watermarkConfig.offsetY
    );

    for (const pos of positions) {
      page.drawText(textConfig.text, {
        x: pos.x,
        y: pos.y,
        size: textConfig.fontSize * watermarkConfig.scale,
        font: font,
        color: rgb(0.8, 0, 0),
        opacity: watermarkConfig.opacity,
        rotate: degrees(watermarkConfig.rotation),
      });
    }
  }

  private applyStampWatermark(
    page: PDFPage,
    stampImage: PDFImage,
    watermarkConfig: WatermarkConfig,
    pageWidth: number,
    pageHeight: number
  ): void {
    const stampDims = stampImage.size();
    const scaledWidth = stampDims.width * watermarkConfig.scale;
    const scaledHeight = stampDims.height * watermarkConfig.scale;

    const positions = this.calculateTilingPositions(
      pageWidth,
      pageHeight,
      scaledWidth,
      scaledHeight,
      watermarkConfig.tileX,
      watermarkConfig.tileY,
      watermarkConfig.offsetX,
      watermarkConfig.offsetY
    );

    for (const pos of positions) {
      page.drawImage(stampImage, {
        x: pos.x,
        y: pos.y,
        width: scaledWidth,
        height: scaledHeight,
        opacity: watermarkConfig.opacity,
        rotate: degrees(watermarkConfig.rotation),
      });
    }
  }

  private calculateTilingPositions(
    pageWidth: number,
    pageHeight: number,
    itemWidth: number,
    itemHeight: number,
    tileX: number,
    tileY: number,
    offsetX: number,
    offsetY: number
  ): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = [];

    const effectiveTileX = Math.max(itemWidth + 20, tileX);
    const effectiveTileY = Math.max(itemHeight + 20, tileY);

    const padding = Math.max(itemWidth, itemHeight);
    const startX = -padding + offsetX;
    const startY = -padding + offsetY;
    const endX = pageWidth + padding;
    const endY = pageHeight + padding;

    for (let x = startX; x < endX; x += effectiveTileX) {
      for (let y = startY; y < endY; y += effectiveTileY) {
        positions.push({ x, y });
      }
    }

    return positions;
  }
}