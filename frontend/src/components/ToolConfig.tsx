"use client";

import { useLocale } from "next-intl";
import { FileText, Image as ImageIcon, QrCode, Merge } from "lucide-react";
import type { ComponentType } from "react";

export const ToolIcons: Record<string, ComponentType<{ className?: string }>> = {
  FileText,
  Image: ImageIcon,
  QrCode,
  Merge,
};

export interface ToolItem {
  name: string;
  href: string;
  iconName: keyof typeof ToolIcons;
  category: "document" | "utility";
  type: "client" | "server";
  description: string;
}

export function useToolHref(path: string): string {
  const locale = useLocale();
  return `/${locale}${path}`;
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
];
