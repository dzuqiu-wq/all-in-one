"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  FileSpreadsheet,
  FileCode,
  FileJson,
  Download,
} from "lucide-react";
import AdBanner from "@/components/AdBanner";
import { useLocalizedHref } from "@/i18n/useLocalizedHref";
import { EncodingDecoder } from "@/lib/data-sanitizer/EncodingDecoder";
import { DataTransformer } from "@/lib/data-sanitizer/DataTransformer";
import type {
  EncodingType,
  ParseResult,
  ExportFormat,
  ProcessingState,
} from "@/lib/data-sanitizer/types";

interface DataSanitizerClientProps {
  locale: string;
}

const ENCODING_OPTIONS: { value: EncodingType; label: string }[] = [
  { value: 'auto', label: 'Auto Detect' },
  { value: 'utf-8', label: 'UTF-8' },
  { value: 'gbk', label: 'GBK' },
  { value: 'gb2312', label: 'GB2312' },
  { value: 'windows-1252', label: 'Windows-1252' },
];

const PREVIEW_ROWS = 20;

export default function DataSanitizerClient({ locale }: DataSanitizerClientProps) {
  const t = useTranslations("tools.dataSanitizer");
  const homeHref = useLocalizedHref("/");

  const encodingDecoder = useMemo(() => new EncodingDecoder(), []);
  const dataTransformer = useMemo(() => new DataTransformer(encodingDecoder), [encodingDecoder]);

  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [selectedEncoding, setSelectedEncoding] = useState<EncodingType>('auto');
  const [detectedEncoding, setDetectedEncoding] = useState<EncodingType | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [fixedRate, setFixedRate] = useState<number>(1);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: 'idle',
    percent: 0,
    message: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidFile = (file: File): boolean => {
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    return validExtensions.includes(ext);
  };

  const handleFile = useCallback(async (selectedFile: File) => {
    if (!isValidFile(selectedFile)) {
      setError(t("errorInvalidFile"));
      return;
    }

    setFile(selectedFile);
    setError(null);
    setProcessingState({ status: 'reading', percent: 10, message: t("processing") });

    try {
      setProcessingState({ status: 'detecting', percent: 30, message: t("detectingEncoding") });

      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      const detected = encodingDecoder.autoDetect(bytes);
      setDetectedEncoding(detected.encoding);
      setConfidence(detected.confidence);

      const encodingToUse = selectedEncoding === 'auto' ? detected.encoding : selectedEncoding;

      setProcessingState({ status: 'parsing', percent: 50, message: t("parsing") });

      const result = await dataTransformer.parse(selectedFile, encodingToUse);
      const rate = encodingDecoder.calculateFixRate(result.rawText);

      setFixedRate(rate);
      setParseResult(result);
      setProcessingState({
        status: 'success',
        percent: 100,
        message: t("success"),
        encoding: result.encoding,
        confidence: detected.confidence,
        fixedRate: rate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorParseFailed"));
      setProcessingState({ status: 'error', percent: 0, message: t("error") });
    }
  }, [selectedEncoding, encodingDecoder, dataTransformer, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleReDecode = useCallback(async () => {
    if (!file) return;

    setProcessingState({ status: 'detecting', percent: 30, message: t("reDecoding") });

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const encodingToUse = selectedEncoding === 'auto' ? 'utf-8' : selectedEncoding;

      const result = await dataTransformer.parse(file, encodingToUse);
      const rate = encodingDecoder.calculateFixRate(result.rawText);

      setFixedRate(rate);
      setParseResult(result);

      setProcessingState({
        status: 'success',
        percent: 100,
        message: t("success"),
        encoding: result.encoding,
        fixedRate: rate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorParseFailed"));
    }
  }, [file, selectedEncoding, dataTransformer, encodingDecoder, t]);

  const handleExport = useCallback(async (format: ExportFormat) => {
    if (!parseResult) return;

    try {
      const blob = await dataTransformer.export(parseResult, format);
      const fileName = dataTransformer.getFileName(parseResult.fileName, format);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    }
  }, [parseResult, dataTransformer, t]);

  const handleReset = useCallback(() => {
    setFile(null);
    setParseResult(null);
    setDetectedEncoding(null);
    setConfidence(0);
    setFixedRate(1);
    setError(null);
    setProcessingState({ status: 'idle', percent: 0, message: '' });
  }, []);

  const previewData = useMemo(() => {
    if (!parseResult) return null;
    return dataTransformer.getPreview(parseResult, PREVIEW_ROWS);
  }, [parseResult, dataTransformer]);

  const isProcessing = processingState.status !== 'idle' && processingState.status !== 'success' && processingState.status !== 'error';

  const formatPercent = (value: number): string => `${Math.round(value * 100)}%`;
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-6xl mx-auto px-6 py-section">
        <Link
          href={homeHref}
          className="inline-flex items-center gap-2 text-body-sm text-muted hover:text-ink mb-8 no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Link>

        <div className="mb-12">
          <div className="caption-upper text-muted mb-4">{t("tag")}</div>
          <h1 className="text-display-lg font-serif text-ink mb-4">
            {t("title")}
          </h1>
          <p className="text-title-md text-body max-w-2xl leading-relaxed">
            {t("description")}
          </p>
        </div>

        <div className="mb-8">
          <AdBanner slot="datasanitizer-top" format="auto" />
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative rounded-2xl p-xxl text-center cursor-pointer
            transition-all duration-300 ease-out
            border-2 border-dashed
            ${isDragOver
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : parseResult
                ? 'border-success/50 bg-success/5'
                : 'border-hairline hover:border-primary hover:bg-surface-cream-strong'
            }
            ${isProcessing ? 'pointer-events-none opacity-70' : ''}
          `}
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, var(--color-hairline) 1px, transparent 0)
            `,
            backgroundSize: '16px 16px',
          }}
        >
          <div
            className={`
              absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300
              ${isDragOver ? 'opacity-100' : ''}
            `}
            style={{
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.3), inset 0 0 30px rgba(239, 68, 68, 0.1)',
              pointerEvents: 'none',
            }}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />

          <div className="relative z-10">
            <FileText
              className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                isDragOver ? 'text-primary' : 'text-muted'
              }`}
              strokeWidth={1.5}
            />

            <h3 className="text-title-md font-sans text-ink mb-2">
              {file ? file.name : t("dropzone")}
            </h3>

            <p className="text-body-sm text-muted">
              {file
                ? formatBytes(file.size)
                : t("supportedFormats")
              }
            </p>
          </div>
        </div>

        {file && (
          <div className="mt-6 surface-card rounded-xl p-lg">
            <div className="flex flex-wrap items-center gap-4">
              {detectedEncoding && (
                <div className="flex items-center gap-2">
                  <span className="caption-upper text-muted">{t("detectedEncoding")}:</span>
                  <span className="px-3 py-1 bg-success/10 text-success text-body-sm font-medium rounded-full">
                    {detectedEncoding.toUpperCase()} ({formatPercent(confidence)})
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="caption-upper text-muted">{t("encoding")}:</span>
                <select
                  value={selectedEncoding}
                  onChange={(e) => setSelectedEncoding(e.target.value as EncodingType)}
                  className="px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                >
                  {ENCODING_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.value) || opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleReDecode}
                disabled={isProcessing}
                className="px-4 py-2 bg-canvas border border-hairline text-ink text-body-sm rounded-md hover:border-primary transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                {t("reDecode")}
              </button>
            </div>

            {fixedRate < 1 && (
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-body-sm mb-1">
                    <span className="text-muted">{t("fixedRate")}:</span>
                    <span className={fixedRate >= 0.9 ? 'text-success' : fixedRate >= 0.7 ? 'text-yellow-600' : 'text-error'}>
                      {formatPercent(fixedRate)}
                    </span>
                  </div>
                  <div className="h-2 bg-surface-soft rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        fixedRate >= 0.9 ? 'bg-success' : fixedRate >= 0.7 ? 'bg-yellow-500' : 'bg-error'
                      }`}
                      style={{ width: `${fixedRate * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="mt-6 surface-card rounded-xl p-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-body-sm font-medium text-ink">{processingState.message}</span>
              <span className="text-body-sm text-primary ml-auto">{processingState.percent}%</span>
            </div>
            <div className="h-1.5 bg-surface-soft rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${processingState.percent}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 surface-card border border-error/30 rounded-lg p-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h5 className="font-sans font-medium text-ink mb-1">{t("errorTitle")}</h5>
                <p className="text-body-sm text-body">{error}</p>
              </div>
            </div>
          </div>
        )}

        {previewData && previewData.rowCount > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title-md font-sans text-ink">
                {t("preview")}
              </h2>
              <span className="text-body-sm text-muted">
                {t("showingRows", { shown: Math.min(previewData.rowCount, PREVIEW_ROWS), total: parseResult?.rowCount || 0 })}
              </span>
            </div>

            <div className="surface-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-body-sm">
                  <thead>
                    <tr className="bg-surface-soft border-b border-hairline">
                      {previewData.headers.map((header, idx) => (
                        <th
                          key={idx}
                          className="px-4 py-3 text-left font-sans font-medium text-ink whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.data.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="border-b border-hairline/50 hover:bg-surface-soft/50 transition-colors"
                      >
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="px-4 py-2.5 text-body text-ink whitespace-nowrap"
                          >
                            {cell.value === null ? (
                              <span className="text-muted-soft italic">—</span>
                            ) : cell.type === 'number' ? (
                              <span className="font-mono">{String(cell.value)}</span>
                            ) : (
                              String(cell.value)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {parseResult && (
          <div className="mt-8">
            <h2 className="text-title-md font-sans text-ink mb-4">
              {t("exportAs")}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={() => handleExport('xlsx')}
                className="flex flex-col items-center gap-3 p-6 rounded-xl bg-gradient-to-br from-[#FF7F50] to-[#FF6347] text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#FF7F50]/20"
              >
                <FileSpreadsheet className="w-8 h-8" strokeWidth={1.5} />
                <span className="text-body-sm font-medium">{t("downloadExcel")}</span>
              </button>

              <button
                onClick={() => handleExport('csv')}
                className="flex flex-col items-center gap-3 p-6 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FF4757] text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#FF6B6B]/20"
              >
                <FileText className="w-8 h-8" strokeWidth={1.5} />
                <span className="text-body-sm font-medium">{t("downloadCSV")}</span>
              </button>

              <button
                onClick={() => handleExport('json')}
                className="flex flex-col items-center gap-3 p-6 rounded-xl bg-gradient-to-br from-[#FF8C42] to-[#FF7F50] text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#FF8C42]/20"
              >
                <FileJson className="w-8 h-8" strokeWidth={1.5} />
                <span className="text-body-sm font-medium">{t("downloadJSON")}</span>
              </button>

              <button
                onClick={() => handleExport('markdown')}
                className="flex flex-col items-center gap-3 p-6 rounded-xl bg-gradient-to-br from-[#FF7F50] to-[#FF6347] text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#FF7F50]/20"
              >
                <FileCode className="w-8 h-8" strokeWidth={1.5} />
                <span className="text-body-sm font-medium">{t("downloadMarkdown")}</span>
              </button>
            </div>
          </div>
        )}

        {processingState.status === 'success' && parseResult && (
          <div className="mt-6 surface-card rounded-xl p-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-success" />
              <div>
                <h4 className="font-sans font-medium text-ink">{t("success")}</h4>
                <p className="text-body-sm text-muted">
                  {t("successDetail", { rows: parseResult.rowCount, cols: parseResult.colCount })}
                </p>
              </div>
            </div>
          </div>
        )}

        {parseResult && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-canvas border border-hairline text-ink text-body-sm rounded-md hover:bg-surface-card transition-colors"
            >
              {t("reset")}
            </button>
          </div>
        )}

        <div className="mt-8">
          <AdBanner slot="datasanitizer-bottom" format="rectangle" className="mx-auto max-w-[336px]" />
        </div>

        <section className="mt-section pt-xl border-t border-hairline">
          <h2 className="text-display-md font-serif text-ink mb-8">
            {t("faqTitle")}
          </h2>
          <div className="space-y-6">
            {[
              { q: t("faq1Q"), a: t("faq1A") },
              { q: t("faq2Q"), a: t("faq2A") },
              { q: t("faq3Q"), a: t("faq3A") },
            ].map((item, idx) => (
              <details key={idx} className="group surface-card rounded-lg p-lg">
                <summary className="cursor-pointer text-title-sm font-sans font-medium text-ink hover:text-primary transition-colors">
                  {item.q}
                </summary>
                <p className="mt-3 text-body-md text-body leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}