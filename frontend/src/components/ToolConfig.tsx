"use client";

import { FileText, Image, QrCode, Merge } from "lucide-react";
import type { ComponentType } from "react";

export const ToolIcons: Record<string, ComponentType<{ className?: string }>> = {
  FileText,
  Image,
  QrCode,
  Merge,
};

export interface ToolItem {
  name: string;
  href: string;
  iconName: keyof typeof ToolIcons;
}

// Tool configuration for navigation
export const tools: ToolItem[] = [
  { name: "Word ↔ PDF", href: "/tools/word-to-pdf", iconName: "FileText" },
  { name: "PDF Merge/Split", href: "/tools/pdf-merge-split", iconName: "Merge" },
  { name: "Image Optimizer", href: "/tools/image-optimizer", iconName: "Image" },
  { name: "QR Code Generator", href: "/tools/qrcode-generator", iconName: "QrCode" },
];