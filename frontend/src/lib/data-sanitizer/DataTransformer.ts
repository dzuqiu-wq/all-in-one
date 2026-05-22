import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type {
  DataCell,
  ParseResult,
  EncodingType,
  TransformOptions,
  ExportFormat,
} from './types';
import { EncodingDecoder } from './EncodingDecoder';

const DEFAULT_OPTIONS: TransformOptions = {
  includeHeaders: true,
  prettyPrint: true,
  dateFormat: 'YYYY-MM-DD',
};

export class DataTransformer {
  private encodingDecoder: EncodingDecoder;

  constructor(encodingDecoder: EncodingDecoder) {
    this.encodingDecoder = encodingDecoder;
  }

  async parse(file: File, encoding: EncodingType): Promise<ParseResult> {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();

    const detectedEncoding = encoding === 'auto'
      ? this.encodingDecoder.autoDetect(bytes).encoding
      : encoding;

    const rawText = this.encodingDecoder.decode(bytes, detectedEncoding);

    let result: ParseResult;

    if (fileName.endsWith('.csv')) {
      result = this.parseCSV(rawText, file.name, detectedEncoding);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      result = this.parseExcel(bytes, file.name, detectedEncoding);
    } else {
      throw new Error('Unsupported file format');
    }

    return result;
  }

  private parseCSV(rawText: string, fileName: string, encoding: EncodingType): ParseResult {
    const parsed = Papa.parse<string[]>(rawText, {
      header: false,
      skipEmptyLines: true,
    });

    if (parsed.errors && parsed.errors.length > 0) {
      console.warn('CSV parse warnings:', parsed.errors);
    }

    const rows: string[][] = parsed.data || [];

    if (rows.length === 0) {
      return {
        headers: [],
        data: [],
        rowCount: 0,
        colCount: 0,
        rawText,
        encoding,
        fileName,
      };
    }

    const headers = rows[0].map((h, idx) => h.trim() || `Column_${idx + 1}`);
    const data = this.convertToDataMatrix(rows.slice(1));

    return {
      headers,
      data,
      rowCount: rows.length - 1,
      colCount: headers.length,
      rawText,
      encoding,
      fileName,
    };
  }

  private parseExcel(bytes: Uint8Array, fileName: string, encoding: EncodingType): ParseResult {
    const workbook = XLSX.read(bytes, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

    const sheetData = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 });

    if (sheetData.length === 0) {
      return {
        headers: [],
        data: [],
        rowCount: 0,
        colCount: 0,
        rawText: '',
        encoding,
        fileName,
      };
    }

    const headers = sheetData[0].map((h, idx) => {
      const header = String(h ?? '').trim();
      return header || `Column_${idx + 1}`;
    });

    const rows = sheetData.slice(1);
    const data = this.convertToDataMatrix(rows);

    return {
      headers,
      data,
      rowCount: rows.length,
      colCount: headers.length,
      rawText: JSON.stringify(sheetData),
      encoding,
      fileName,
    };
  }

  private convertToDataMatrix(rows: (string | number | boolean | null | undefined)[][]): DataCell[][] {
    return rows.map(row =>
      row.map(cell => this.convertToDataCell(cell))
    );
  }

  private convertToDataCell(value: string | number | boolean | null | undefined): DataCell {
    if (value === null || value === undefined || value === '') {
      return { value: null, type: 'null' };
    }

    if (typeof value === 'number' || (!isNaN(Number(value)) && String(value).trim() !== '')) {
      const num = typeof value === 'number' ? value : Number(value);
      if (!isNaN(num) && isFinite(num)) {
        return { value: num, type: 'number' };
      }
    }

    if (typeof value === 'boolean') {
      return { value, type: 'boolean' };
    }

    const strValue = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(strValue) || /^\d{2}\/\d{2}\/\d{4}/.test(strValue)) {
      return { value: strValue, type: 'date' };
    }

    return { value: strValue, type: 'string' };
  }

  async toExcel(result: ParseResult, options: TransformOptions = DEFAULT_OPTIONS): Promise<Blob> {
    const { headers, data } = result;

    const wsData: (string | number | boolean | null)[][] = [];

    if (options.includeHeaders) {
      wsData.push([...headers]);
    }

    for (const row of data) {
      wsData.push(row.map(cell => cell.value));
    }

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const xlsxBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

    return new Blob([xlsxBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  toCSV(result: ParseResult, options: TransformOptions = DEFAULT_OPTIONS): Blob {
    const { headers, data } = result;

    const rows: string[][] = [];

    if (options.includeHeaders) {
      rows.push(headers);
    }

    for (const row of data) {
      rows.push(row.map(cell => String(cell.value ?? '')));
    }

    const csvText = Papa.unparse(rows, {
      quotes: true,
      delimiter: ',',
      newline: '\n',
    });

    return new Blob([csvText], { type: 'text/csv;charset=utf-8' });
  }

  toJSON(result: ParseResult, options: TransformOptions = DEFAULT_OPTIONS): Blob {
    const { headers, data } = result;

    const jsonArray = data.map(row => {
      const obj: Record<string, string | number | boolean | null> = {};
      headers.forEach((header, idx) => {
        obj[header] = row[idx]?.value ?? null;
      });
      return obj;
    });

    const jsonText = options.prettyPrint
      ? JSON.stringify(jsonArray, null, 2)
      : JSON.stringify(jsonArray);

    return new Blob([jsonText], { type: 'application/json;charset=utf-8' });
  }

  toMarkdown(result: ParseResult, options: TransformOptions = DEFAULT_OPTIONS): Blob {
    const { headers, data } = result;
    const lines: string[] = [];

    lines.push(`| ${headers.join(' | ')} |`);
    lines.push(`| ${headers.map(() => '---').join(' | ')} |`);

    for (const row of data) {
      const cells = row.map(cell => {
        const value = String(cell.value ?? '');
        return value.replace(/\|/g, '\\|');
      });
      lines.push(`| ${cells.join(' | ')} |`);
    }

    const markdownText = lines.join('\n');
    return new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
  }

  getPreview(result: ParseResult, limit: number = 20): ParseResult {
    return {
      ...result,
      data: result.data.slice(0, limit),
      rowCount: Math.min(result.rowCount, limit),
    };
  }

  async export(result: ParseResult, format: ExportFormat, options?: TransformOptions): Promise<Blob> {
    switch (format) {
      case 'xlsx':
        return this.toExcel(result, options);
      case 'csv':
        return this.toCSV(result, options);
      case 'json':
        return this.toJSON(result, options);
      case 'markdown':
        return this.toMarkdown(result, options);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  getFileName(originalName: string, format: ExportFormat): string {
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const extensions: Record<ExportFormat, string> = {
      xlsx: '.xlsx',
      csv: '.csv',
      json: '.json',
      markdown: '.md',
    };
    return `${baseName}_clean${extensions[format]}`;
  }
}