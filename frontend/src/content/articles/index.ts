/**
 * Long-form bilingual article content surfaced beneath each tool's
 * interactive surface. Each entry meets a 1,200-word floor in both EN
 * and ZH and is organised into three sections:
 *
 *   1. industry          — standards / compliance / context
 *   2. underTheHood      — pure-frontend engineering deep dive
 *   3. troubleshooting   — long-tail support guide
 *
 * The shape is consumed by <ToolArticle> in src/components/ToolArticle.tsx.
 */

import type { ToolArticleContent } from "@/components/ToolArticle";
import type { ToolSlug } from "@/lib/toolRegistry";

import wordToPdf from "./word-to-pdf";
import excelToPdf from "./excel-to-pdf";
import pdfMergeSplit from "./pdf-merge-split";
import pdfWatermark from "./pdf-watermark";
import invoiceGenerator from "./invoice-generator";
import imageOptimizer from "./image-optimizer";
import qrcodeGenerator from "./qrcode-generator";
import wechatGenerator from "./wechat-generator";
import dataSanitizer from "./data-sanitizer";

export type ArticleLocale = "en" | "zh";

export type BilingualArticle = Record<ArticleLocale, ToolArticleContent>;

const REGISTRY: Record<ToolSlug, BilingualArticle> = {
  "word-to-pdf": wordToPdf,
  "excel-to-pdf": excelToPdf,
  "pdf-merge-split": pdfMergeSplit,
  "pdf-watermark": pdfWatermark,
  "invoice-generator": invoiceGenerator,
  "image-optimizer": imageOptimizer,
  "qrcode-generator": qrcodeGenerator,
  "wechat-generator": wechatGenerator,
  "data-sanitizer": dataSanitizer,
};

export function getArticle(slug: ToolSlug, locale: ArticleLocale): ToolArticleContent {
  return REGISTRY[slug][locale];
}
