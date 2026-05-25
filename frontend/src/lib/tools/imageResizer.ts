/**
 * Pure client-side image resizer built on the platform's Canvas 2D +
 * createImageBitmap APIs. No polyfills, no dependencies, no network.
 *
 * Two responsibilities:
 *   - calculateAspectFit: pure math for aspect-ratio-preserving fit.
 *   - resizeImage: Canvas-based redraw that returns a Blob in the
 *     source's MIME type using high-quality smoothing.
 */

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Compute the largest size that fits source within (maxWidth, maxHeight)
 * preserving aspect ratio. Does not upscale (ratio is clamped to 1).
 */
export function calculateAspectFit(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number,
): Dimensions {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight, 1);
  return {
    width: Math.round(srcWidth * ratio),
    height: Math.round(srcHeight * ratio),
  };
}

/**
 * Resize an image File to specified dimensions, returning a Blob in the
 * same format as the source. Quality affects JPEG/WebP only (PNG ignored).
 */
export async function resizeImage(
  file: File,
  width: number,
  height: number,
  quality: number = 0.92,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    // Use high quality smoothing for resize
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    const mime = file.type || "image/png";
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Failed to encode image")),
        mime,
        quality,
      );
    });
  } finally {
    bitmap.close();
  }
}
