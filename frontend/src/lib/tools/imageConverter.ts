/**
 * Pure client-side image format converter built on the platform's
 * Canvas 2D + createImageBitmap APIs. No polyfills, no dependencies,
 * no network calls.
 *
 * Supported formats are the three the HTML spec guarantees are encodable
 * by canvas.toBlob() across every modern browser: PNG, JPEG, and WebP.
 * AVIF is intentionally omitted because canvas.toBlob() encoding is not
 * universally available as of 2026.
 */

export type ImageFormat = "png" | "jpeg" | "webp";

export function mimeForFormat(format: ImageFormat): string {
  return `image/${format}`;
}

export function extensionForFormat(format: ImageFormat): string {
  return format === "jpeg" ? ".jpg" : `.${format}`;
}

/**
 * Convert an image File to another format via Canvas.
 * Returns a Blob in the target format.
 *
 * Quality is ignored for PNG (lossless). For JPEG/WebP, quality is 0..1.
 */
export async function convertImage(
  file: File,
  targetFormat: ImageFormat,
  quality: number = 0.92,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.drawImage(bitmap, 0, 0);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Failed to encode image")),
        mimeForFormat(targetFormat),
        quality,
      );
    });
  } finally {
    bitmap.close();
  }
}
