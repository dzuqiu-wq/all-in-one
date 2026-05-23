"use client";

import { FileText, Image as ImageIcon, QrCode, Merge, Stamp, Wrench, Receipt, MessageCircle } from "lucide-react";
import type { ComponentType } from "react";
import { useLocalizedHref } from "@/i18n/useLocalizedHref";

export const ToolIcons: Record<string, ComponentType<{ className?: string }>> = {
  FileText,
  Image: ImageIcon,
  QrCode,
  Merge,
  Stamp,
  Wrench,
  Receipt,
  MessageCircle,
};

export interface ToolItem {
  name: string;
  href: string;
  iconName: keyof typeof ToolIcons;
  category: "document" | "utility";
  type: "client" | "server";
  description: string;
}

/**
 * @deprecated Prefer `useLocalizedHref` from "@/i18n/useLocalizedHref".
 * Kept here only for backward compatibility with previously generated code.
 */
export function useToolHref(path: string): string {
  return useLocalizedHref(path);
}

export const tools: ToolItem[] = [
  {
    name: "Word → PDF",
    href: "/tools/word-to-pdf",
    iconName: "FileText",
    category: "document",
    type: "server",
    description: "Convert Word documents to PDF with server-side LibreOffice processing.",
  },
  {
    name: "PDF Merge & Split",
    href: "/tools/pdf-merge-split",
    iconName: "Merge",
    category: "document",
    type: "client",
    description: "Combine or split PDF files entirely in your browser. No upload required.",
  },
  {
    name: "PDF Watermark & Stamp",
    href: "/tools/pdf-watermark",
    iconName: "Stamp",
    category: "document",
    type: "client",
    description: "Add text watermarks or electronic stamps to PDFs. Pure browser processing.",
  },
  {
    name: "Invoice Generator",
    href: "/tools/invoice-generator",
    iconName: "Receipt",
    category: "document",
    type: "client",
    description: "Generate professional business invoices with automatic calculations. Export to PDF.",
  },
  {
    name: "Image Optimizer",
    href: "/tools/image-optimizer",
    iconName: "Image",
    category: "utility",
    type: "client",
    description: "Compress images and convert to WebP format with zero server dependency.",
  },
  {
    name: "QR Code Generator",
    href: "/tools/qrcode-generator",
    iconName: "QrCode",
    category: "utility",
    type: "client",
    description: "Generate customizable QR codes for URLs, text, and contact information.",
  },
  {
    name: "Data Sanitizer",
    href: "/tools/data-sanitizer",
    iconName: "Wrench",
    category: "utility",
    type: "client",
    description: "Auto-detect and fix CSV/Excel encoding issues. Export to multiple formats.",
  },
  {
    name: "WeChat Chat Generator",
    href: "/tools/wechat-generator",
    iconName: "MessageCircle",
    category: "utility",
    type: "client",
    description: "Build pixel-perfect WeChat chat mockups for design reviews and editorial illustration.",
  },
];
