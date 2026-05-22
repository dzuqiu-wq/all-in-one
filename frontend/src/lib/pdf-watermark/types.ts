// Stamp shape types
export type StampShape = 'circle' | 'oval' | 'rect';
export type WatermarkMode = 'text' | 'stamp' | 'hybrid';
export type StarStyle = 'fivePoint' | 'solid';

// Stamp configuration for Canvas rendering
export interface StampConfig {
  shape: StampShape;
  companyName: string;
  departmentName: string;
  color: string;           // Hex color, default: #CC0000
  size: number;           // Stamp size in pixels, default: 200
  noiseLevel: number;      // 0-1, default: 0.1
  starStyle: StarStyle;
  borderWidth: number;     // Border stroke width
  innerCircleRadius: number; // Inner decorative circle ratio
}

// Text watermark configuration
export interface TextConfig {
  text: string;
  fontSize: number;       // In points
  fontFamily: string;     // Font family name
}

// Watermark processing configuration
export interface WatermarkConfig {
  mode: WatermarkMode;
  opacity: number;       // 0-1
  rotation: number;       // Degrees
  scale: number;         // 1 = 100%
  tileX: number;          // X tiling spacing in points
  tileY: number;          // Y tiling spacing in points
  offsetX: number;       // X offset in points
  offsetY: number;       // Y offset in points
  pages: 'all' | number[];
}

// Processing progress state
export interface ProgressState {
  status: 'idle' | 'processing' | 'success' | 'error';
  currentPage: number;
  totalPages: number;
  percent: number;
  message: string;
}

// Final processing result
export interface ProcessingResult {
  fileName: string;
  originalSize: number;
  processedSize: number;
  pageCount: number;
  blob: Blob;
}

// Arc text position calculation result (for circular/elliptical paths)
export interface ArcTextChar {
  char: string;
  x: number;
  y: number;
  rotation: number; // radians
}

// Five-pointed star vertex
export interface StarVertex {
  x: number;
  y: number;
}