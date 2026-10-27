/**
 * On-device photo processing for uploads.
 *
 * Phone camera photos are several MB; the Apps Script upload path
 * carries base64 and the uploader historically capped at 3 MB.
 * We downscale to a max dimension, re-encode as JPEG and bake in
 * the EXIF orientation so portraits never arrive sideways.
 */

export interface ProcessedPhoto {
  /** Raw base64 (no data: prefix), ready for apiService.uploadPhoto */
  base64: string;
  /** data: URL for instant preview */
  previewUrl: string;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
  /** true when processing failed and the original file is used as-is */
  fallback: boolean;
}

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.82;

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function loadBitmap(file: File): Promise<{ draw: CanvasImageSource; width: number; height: number; close?: () => void }> {
  // Preferred path: createImageBitmap honours EXIF orientation
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
      return { draw: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
    } catch {
      // fall through to <img> decoding
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    return { draw: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

export async function processPhotoFile(file: File): Promise<ProcessedPhoto> {
  const originalBytes = file.size;
  try {
    const { draw, width, height, close } = await loadBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const outW = Math.max(1, Math.round(width * scale));
    const outH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    ctx.drawImage(draw as any, 0, 0, outW, outH);
    close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    );
    if (!blob) throw new Error('JPEG encode failed');

    const dataUrl = await blobToDataUrl(blob);
    return {
      base64: dataUrl.split(',')[1] || '',
      previewUrl: dataUrl,
      originalBytes,
      compressedBytes: blob.size,
      width: outW,
      height: outH,
      fallback: false,
    };
  } catch {
    // Fallback: send the original file untouched (may hit the size cap)
    const dataUrl = await blobToDataUrl(file);
    return {
      base64: dataUrl.split(',')[1] || '',
      previewUrl: dataUrl,
      originalBytes,
      compressedBytes: originalBytes,
      width: 0,
      height: 0,
      fallback: true,
    };
  }
}
