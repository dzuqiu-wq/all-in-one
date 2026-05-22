// Supported encoding types
export type EncodingType = 'utf-8' | 'gbk' | 'gb2312' | 'windows-1252' | 'auto';

// Supported export formats
export type ExportFormat = 'xlsx' | 'csv' | 'json' | 'markdown';

// Data cell representation
export interface DataCell {
  value: string | number | boolean | null;
  type: 'string' | 'number' | 'boolean' | 'null' | 'date';
}

// 2D data matrix
export type DataMatrix = DataCell[][];

// Parsed file result
export interface ParseResult {
  headers: string[];
  data: DataMatrix;
  rowCount: number;
  colCount: number;
  rawText: string;
  encoding: EncodingType;
  fileName: string;
}

// Encoding detection result
export interface EncodingResult {
  success: boolean;
  encoding: EncodingType;
  confidence: number;
  fixedRate: number;
  rawText: string;
  isValid: boolean;
}

// Auto-detection info
export interface DetectedEncoding {
  encoding: EncodingType;
  confidence: number;
  reasons: string[];
}

// Export transformation options
export interface TransformOptions {
  includeHeaders: boolean;
  prettyPrint: boolean;
  dateFormat?: string;
}

// Processing state
export type ProcessingStatus = 'idle' | 'reading' | 'detecting' | 'parsing' | 'success' | 'error';

// Progress state
export interface ProcessingState {
  status: ProcessingStatus;
  percent: number;
  message: string;
  encoding?: EncodingType;
  confidence?: number;
  fixedRate?: number;
}

// Export result
export interface ExportResult {
  format: ExportFormat;
  blob: Blob;
  fileName: string;
}

// Corrupted character patterns to detect
export const CORRUPTED_PATTERNS = [
  '锟斤拷',
  '烫烫烫',
  '',
  ' ',
] as const;

// File type detection
export const SUPPORTED_EXTENSIONS = ['.csv', '.xlsx', '.xls'] as const;
export type SupportedExtension = typeof SUPPORTED_EXTENSIONS[number];