/**
 * Sample data fixtures and runtime generators for the "Try with Sample File"
 * empty-state button in each of the seven tools.
 *
 * Design principles:
 *
 *   1. NO network calls. Every sample is constructed from in-bundle data or
 *      synthesized on the fly via the same browser APIs the tool itself uses
 *      (pdf-lib, Canvas, encoders). This keeps the bundle small AND lets the
 *      sample exercise the real processing path.
 *
 *   2. Realistic, not random. The bytes we feed look like a plausible
 *      real-world payload — a tiny invoice template, a single-page PDF
 *      with structured text, a CSV with intentional GBK-encoded bytes — so
 *      the demoed result reads like "the tool already worked on real data".
 *
 *   3. Crawler-friendly. Each sample loader is a plain function that runs
 *      client-side; the static HTML page itself stays cacheable and the
 *      Google bot can crawl the page text without ever clicking the button.
 *
 * Per-tool exports below. Each loader returns a File-like object (or a
 * structured object for the invoice form). They throw on environments
 * without the relevant Web API rather than degrading silently.
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/** Tag string surfaced in metadata so accidental real-data confusion is impossible. */
export const SAMPLE_TAG = "sample.all-in-one.333654.xyz";

// ---------------------------------------------------------------------------
// Image Optimizer — Canvas-rendered demo PNG
// ---------------------------------------------------------------------------

/**
 * Synthesize a 1024×768 PNG that looks like a magazine photo: a warm
 * gradient backdrop with overlaid grid + label text. Round-trips through
 * the real optimizer pipeline so the user sees an authentic 60-80%
 * compression result.
 */
export async function buildSampleImageFile(): Promise<File> {
  if (typeof document === "undefined") {
    throw new Error("buildSampleImageFile requires a browser environment");
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");

  // Warm cream → coral diagonal gradient.
  const grad = ctx.createLinearGradient(0, 0, 1024, 768);
  grad.addColorStop(0, "#faf9f5");
  grad.addColorStop(0.5, "#efe9de");
  grad.addColorStop(1, "#cc785c");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 768);

  // Editorial grid overlay (1.5 px lines, 64 px cells) to add high-frequency
  // detail so JPEG/WebP compression has real entropy to chew on.
  ctx.strokeStyle = "rgba(24,23,21,0.06)";
  ctx.lineWidth = 1.5;
  for (let x = 0; x <= 1024; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 768);
    ctx.stroke();
  }
  for (let y = 0; y <= 768; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Coral accent diamond — gives the image a focal subject so the
  // compression demo isn't reduced to a flat gradient with no detail loss.
  ctx.fillStyle = "rgba(204,120,92,0.92)";
  ctx.beginPath();
  ctx.moveTo(512, 280);
  ctx.lineTo(700, 384);
  ctx.lineTo(512, 488);
  ctx.lineTo(324, 384);
  ctx.closePath();
  ctx.fill();

  // Headline text using a serif fallback chain.
  ctx.fillStyle = "#181715";
  ctx.font = '600 56px "Cormorant Garamond", "Georgia", serif';
  ctx.textAlign = "center";
  ctx.fillText("All-in-One Toolbox", 512, 600);

  ctx.font = '400 22px "JetBrains Mono", "Menlo", monospace';
  ctx.fillStyle = "#65656d";
  ctx.fillText(SAMPLE_TAG, 512, 640);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))),
      "image/png",
      1.0,
    );
  });
  return new File([blob], "all-in-one-sample-photo.png", {
    type: "image/png",
    lastModified: Date.now(),
  });
}

// ---------------------------------------------------------------------------
// PDF tools — pdf-lib generated single-page documents
// ---------------------------------------------------------------------------

interface BuildSamplePdfOptions {
  title?: string;
  pageCount?: number;
  /** When >1, emits a multi-page document used by the merge/split sample. */
  variant?: "a" | "b";
}

/**
 * Generate a small PDF with editorial typography and a structured paragraph
 * block so watermark/merge previews look credible. The result is wrapped in
 * a File so it slots straight into the existing upload handlers.
 */
export async function buildSamplePdfFile(
  options: BuildSamplePdfOptions = {},
): Promise<File> {
  const { title = "Sample Document", pageCount = 2, variant = "a" } = options;

  const doc = await PDFDocument.create();
  doc.setTitle(title);
  doc.setAuthor("All-in-One Toolbox");
  doc.setSubject(SAMPLE_TAG);
  doc.setProducer("pdf-lib · runtime sample generator");

  const helv = await doc.embedFont(StandardFonts.HelveticaBold);
  const helvReg = await doc.embedFont(StandardFonts.Helvetica);

  for (let i = 1; i <= pageCount; i += 1) {
    const page = doc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // Eyebrow label.
    page.drawText(`ALL-IN-ONE · ${variant === "a" ? "DOCUMENT A" : "DOCUMENT B"}`, {
      x: 56,
      y: height - 64,
      size: 10,
      font: helv,
      color: rgb(0.4, 0.4, 0.42),
    });

    // Title.
    page.drawText(`${title} — Page ${i} of ${pageCount}`, {
      x: 56,
      y: height - 110,
      size: 22,
      font: helv,
      color: rgb(0.094, 0.09, 0.082),
    });

    // Body paragraph (line-wrapped manually because pdf-lib has no native
    // wrapping; the test phrase is deliberately verbose to give the watermark
    // and merge previews realistic-looking page content).
    const lines = [
      "This is an auto-generated sample document used by the All-in-One Toolbox",
      "preview flow. It contains zero personally identifiable information and",
      "is regenerated in your browser every time the sample button is clicked.",
      "",
      `Document variant: ${variant.toUpperCase()}`,
      `Generated at: ${new Date().toISOString()}`,
      `Pages in this run: ${pageCount}`,
      "",
      "The watermark and merge demonstrations operate on these bytes the same",
      "way they would operate on any PDF you supplied. No information is sent",
      "to a server. When you upload your own file, this sample is discarded.",
    ];
    lines.forEach((line, idx) => {
      page.drawText(line, {
        x: 56,
        y: height - 160 - idx * 22,
        size: 12,
        font: helvReg,
        color: rgb(0.18, 0.18, 0.2),
      });
    });

    // Footer.
    page.drawText(SAMPLE_TAG, {
      x: 56,
      y: 56,
      size: 9,
      font: helvReg,
      color: rgb(0.55, 0.55, 0.58),
    });
    page.drawRectangle({
      x: 56,
      y: 72,
      width: width - 112,
      height: 0.5,
      color: rgb(0.85, 0.85, 0.87),
    });
  }

  const bytes = await doc.save();
  // Copy into a plain ArrayBuffer slice so the File constructor receives
  // a BlobPart with no SharedArrayBuffer ambiguity (TypeScript-strict).
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  const blob = new Blob([ab], { type: "application/pdf" });
  return new File([blob], `all-in-one-sample-${variant}.pdf`, {
    type: "application/pdf",
    lastModified: Date.now(),
  });
}

// ---------------------------------------------------------------------------
// Data sanitizer — CSV with deliberate GBK garble for the encoding fixer demo
// ---------------------------------------------------------------------------

/**
 * Build a small CSV that intentionally encodes Chinese column headers and
 * values in GBK rather than UTF-8. When parsed naively, the data appears
 * garbled — which is exactly the scenario the sanitizer is designed to
 * surface and repair, making the demo a high-fidelity reproduction.
 */
export function buildSampleSanitizerFile(): File {
  // GBK-encoded bytes for: "订单号,客户名称,城市,金额\n"
  // followed by three rows. We store the encoded bytes as a Uint8Array so the
  // browser parser will hit them as raw GBK and the auto-detector can show
  // its strength.
  const header = encodeGbk("订单号,客户名称,城市,金额");
  const row1 = encodeGbk("ORD-0001,张伟,北京,1280.50");
  const row2 = encodeGbk("ORD-0002,李娜,上海,3450.00");
  const row3 = encodeGbk("ORD-0003,王芳,深圳,890.75");
  const newline = new Uint8Array([0x0a]);

  const total =
    header.byteLength +
    row1.byteLength +
    row2.byteLength +
    row3.byteLength +
    4; // 4 newlines

  const out = new Uint8Array(total);
  let offset = 0;
  const append = (chunk: Uint8Array) => {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  };
  append(header);
  append(newline);
  append(row1);
  append(newline);
  append(row2);
  append(newline);
  append(row3);
  append(newline);

  const blob = new Blob([out], { type: "text/csv" });
  return new File([blob], "sample-gbk-orders.csv", {
    type: "text/csv",
    lastModified: Date.now(),
  });
}

/**
 * Tiny GBK encoder for the small whitelist of characters we use in the
 * sample CSV. Each entry was obtained from the canonical GBK code page
 * (GB18030 / GBK 1.0). This avoids bundling a full encoding library while
 * still producing genuine GBK bytes a sanitizer detector will recognize.
 */
function encodeGbk(s: string): Uint8Array {
  const table: Record<string, number[]> = {
    "订": [0xb6, 0xa9],
    "单": [0xb5, 0xa5],
    "号": [0xba, 0xc5],
    "客": [0xbf, 0xcd],
    "户": [0xbb, 0xa7],
    "名": [0xc3, 0xfb],
    "称": [0xb3, 0xc6],
    "城": [0xb3, 0xc7],
    "市": [0xca, 0xd0],
    "金": [0xbd, 0xf0],
    "额": [0xb6, 0xee],
    "张": [0xd5, 0xc5],
    "伟": [0xce, 0xb0],
    "李": [0xc0, 0xee],
    "娜": [0xc4, 0xc8],
    "王": [0xcd, 0xf5],
    "芳": [0xb7, 0xbc],
    "北": [0xb1, 0xb1],
    "京": [0xbe, 0xa9],
    "上": [0xc9, 0xcf],
    "海": [0xba, 0xa3],
    "深": [0xc9, 0xee],
    "圳": [0xdb, 0xda],
  };
  const out: number[] = [];
  for (const ch of s) {
    const mapped = table[ch];
    if (mapped) {
      out.push(...mapped);
    } else {
      const code = ch.charCodeAt(0);
      if (code < 0x80) {
        out.push(code);
      } else {
        // Fall back to a question mark for any character we did not pre-encode.
        out.push(0x3f);
      }
    }
  }
  return new Uint8Array(out);
}

// ---------------------------------------------------------------------------
// Invoice generator — pre-filled form payload
// ---------------------------------------------------------------------------

export interface SampleInvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface SampleInvoicePayload {
  invoiceNumber: string;
  currency: "USD" | "EUR" | "GBP" | "CNY" | "JPY";
  issueDate: string;
  dueDate: string;
  fromCompany: string;
  fromAddress: string;
  fromCity: string;
  fromCountry: string;
  fromEmail: string;
  toCompany: string;
  toAddress: string;
  toCity: string;
  toCountry: string;
  toEmail: string;
  items: SampleInvoiceLineItem[];
  taxRate: number;
  discount: number;
  paymentTerms: string;
  notes: string;
}

export function getSampleInvoice(locale: "en" | "zh"): SampleInvoicePayload {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 30);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  if (locale === "zh") {
    return {
      invoiceNumber: `INV-${today.getFullYear()}-0042`,
      currency: "CNY",
      issueDate: fmt(today),
      dueDate: fmt(due),
      fromCompany: "All-in-One Toolbox 工作室",
      fromAddress: "宇宙路 333 号 654 室",
      fromCity: "上海",
      fromCountry: "中国",
      fromEmail: "hello@333654.xyz",
      toCompany: "示例客户有限公司",
      toAddress: "样品大道 100 号",
      toCity: "深圳",
      toCountry: "中国",
      toEmail: "client@example.com",
      items: [
        {
          description: "纯前端 PDF 处理咨询（4 工时）",
          quantity: 4,
          unitPrice: 800,
        },
        {
          description: "数据清洗工具集成部署",
          quantity: 1,
          unitPrice: 2400,
        },
        {
          description: "二维码批量生成脚本",
          quantity: 1,
          unitPrice: 600,
        },
      ],
      taxRate: 6,
      discount: 200,
      paymentTerms: "净 30 天",
      notes: "本发票为 All-in-One Toolbox 示例数据，仅用于产品演示用途。",
    };
  }

  return {
    invoiceNumber: `INV-${today.getFullYear()}-0042`,
    currency: "USD",
    issueDate: fmt(today),
    dueDate: fmt(due),
    fromCompany: "All-in-One Toolbox Studio",
    fromAddress: "333 Cosmos Lane, Suite 654",
    fromCity: "Singapore",
    fromCountry: "Singapore",
    fromEmail: "hello@333654.xyz",
    toCompany: "Sample Client LLC",
    toAddress: "100 Demo Avenue",
    toCity: "Brooklyn, NY",
    toCountry: "United States",
    toEmail: "client@example.com",
    items: [
      {
        description: "Pure-frontend PDF processing consult (4 hrs)",
        quantity: 4,
        unitPrice: 120,
      },
      {
        description: "Data sanitizer integration & deploy",
        quantity: 1,
        unitPrice: 360,
      },
      {
        description: "QR code batch generation script",
        quantity: 1,
        unitPrice: 90,
      },
    ],
    taxRate: 7,
    discount: 30,
    paymentTerms: "Net 30",
    notes:
      "This invoice is an All-in-One Toolbox sample dataset — used for product demonstration only.",
  };
}

// ---------------------------------------------------------------------------
// QR Code — sample payload strings keyed by locale
// ---------------------------------------------------------------------------

export function getSampleQrPayload(locale: "en" | "zh"): string {
  if (locale === "zh") {
    return "https://333654.xyz/zh/tools/qrcode-generator?utm_source=sample";
  }
  return "https://333654.xyz/tools/qrcode-generator?utm_source=sample";
}

// ---------------------------------------------------------------------------
// Word → PDF — synthetic post-success state (we cannot run the backend in a
// preview, so the sample button surfaces a frozen "conversion already done"
// state pointing to a bundled sample PDF.)
// ---------------------------------------------------------------------------
export interface WordPdfSampleResult {
  /** Mock original filename label. */
  originalName: string;
  /** Mock original size in bytes. */
  originalSize: number;
  /** Mock generated PDF blob the user can actually download. */
  pdfBlob: Blob;
  /** Mock conversion time in milliseconds. */
  elapsedMs: number;
}

export async function buildSampleWordPdfResult(): Promise<WordPdfSampleResult> {
  const pdfFile = await buildSamplePdfFile({
    title: "Quarterly Report — Sample",
    pageCount: 1,
    variant: "a",
  });
  const pdfBlob = new Blob([await pdfFile.arrayBuffer()], {
    type: "application/pdf",
  });
  return {
    originalName: "quarterly-report-sample.docx",
    originalSize: 234_567,
    pdfBlob,
    elapsedMs: 1_842,
  };
}

// ---------------------------------------------------------------------------
// WeChat Chat Generator — pre-built viral chat sequence
// ---------------------------------------------------------------------------

import type { ChatMessage } from "./wechatTypes";

interface WechatSamplePayload {
  nickname: string;
  messages: ChatMessage[];
}

/**
 * Lighthearted, PG-rated sample conversation: a designer realising at
 * lunchtime that their colleague secretly shipped the 8th tool overnight.
 * Both locales share the same beats so the demo lands evenly.
 */
export function getWechatSample(locale: "en" | "zh"): WechatSamplePayload {
  const newId = (): string =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `sample-${Math.random().toString(36).slice(2, 10)}`;

  if (locale === "zh") {
    return {
      nickname: "设计师小芮",
      messages: [
        { id: newId(), sender: "other", type: "time",  content: "今天 09:42" },
        { id: newId(), sender: "other", type: "text",  content: "你周末偷偷把第八款工具上线了？" },
        { id: newId(), sender: "me",    type: "text",  content: "嗯啊，凌晨四点的产物" },
        { id: newId(), sender: "me",    type: "text",  content: "微信聊天记录生成器，给设计稿用" },
        { id: newId(), sender: "other", type: "text",  content: "🤯 我刚还在 Figma 里手描" },
        { id: newId(), sender: "other", type: "text",  content: "现在告诉我浏览器五秒就能生成？" },
        { id: newId(), sender: "me",    type: "text",  content: "是的而且零上传" },
        { id: newId(), sender: "other", type: "time",  content: "今天 14:30" },
        { id: newId(), sender: "other", type: "text",  content: "我重画的 30 张稿子……" },
        { id: newId(), sender: "me",    type: "text",  content: "我请你吃饭" },
        { id: newId(), sender: "other", type: "text",  content: "成交" },
      ],
    };
  }

  return {
    nickname: "Riley · Design",
    messages: [
      { id: newId(), sender: "other", type: "time",  content: "Today 09:42" },
      { id: newId(), sender: "other", type: "text",  content: "Did you secretly ship the 8th tool over the weekend?" },
      { id: newId(), sender: "me",    type: "text",  content: "Yep — finished at 4am" },
      { id: newId(), sender: "me",    type: "text",  content: "It's a WeChat chat mockup generator. For design decks." },
      { id: newId(), sender: "other", type: "text",  content: "🤯 I have been hand-tracing these in Figma" },
      { id: newId(), sender: "other", type: "text",  content: "And you're telling me five seconds in the browser?" },
      { id: newId(), sender: "me",    type: "text",  content: "Yes. And zero upload." },
      { id: newId(), sender: "other", type: "time",  content: "Today 14:30" },
      { id: newId(), sender: "other", type: "text",  content: "Thirty redrawn frames worth of work…" },
      { id: newId(), sender: "me",    type: "text",  content: "Lunch is on me" },
      { id: newId(), sender: "other", type: "text",  content: "Deal" },
    ],
  };
}
