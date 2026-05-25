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
import powerpointToPdf from "./powerpoint-to-pdf";
import pdfMergeSplit from "./pdf-merge-split";
import pdfWatermark from "./pdf-watermark";
import invoiceGenerator from "./invoice-generator";
import imageOptimizer from "./image-optimizer";
import qrcodeGenerator from "./qrcode-generator";
import wechatGenerator from "./wechat-generator";
import dataSanitizer from "./data-sanitizer";
import jsonFormatter from "./json-formatter";
import base64 from "./base64";
import hashGenerator from "./hash-generator";
import imageConverter from "./image-converter";

export type ArticleLocale = "en" | "zh";

export type BilingualArticle = Record<ArticleLocale, ToolArticleContent>;

const REGISTRY: Record<ToolSlug, BilingualArticle> = {
  "word-to-pdf": wordToPdf,
  "excel-to-pdf": excelToPdf,
  "powerpoint-to-pdf": powerpointToPdf,
  "pdf-merge-split": pdfMergeSplit,
  "pdf-watermark": pdfWatermark,
  "invoice-generator": invoiceGenerator,
  "image-optimizer": imageOptimizer,
  "qrcode-generator": qrcodeGenerator,
  "wechat-generator": wechatGenerator,
  "data-sanitizer": dataSanitizer,
  "json-formatter": jsonFormatter,
  "base64": base64,
  "hash-generator": hashGenerator,
  "image-converter": imageConverter,
};

export function getArticle(slug: ToolSlug, locale: ArticleLocale): ToolArticleContent {
  return REGISTRY[slug][locale];
}
