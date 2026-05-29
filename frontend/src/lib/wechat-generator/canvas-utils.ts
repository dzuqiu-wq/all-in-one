/**
 * Wechat Article Cover Generator - Canvas Utilities
 */

import { WECHAT_DIMENSIONS } from "./template-config";

export function createWechatCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = WECHAT_DIMENSIONS.width;
  canvas.height = WECHAT_DIMENSIONS.height;
  return canvas;
}

export function drawGradientBackground(
  ctx: CanvasRenderingContext2D,
  gradient: CanvasGradient
): void {
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WECHAT_DIMENSIONS.width, WECHAT_DIMENSIONS.height);
}

export function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  fontSize: number
): void {
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textBaseline = "top";
  const words = text.split("");
  let line = "";
  for (const char of words) {
    const testLine = line + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== "") {
      ctx.fillText(line, x, y);
      line = char;
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string = "image/png",
  quality: number = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      type,
      quality
    );
  });
}
