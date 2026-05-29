/**
 * Wechat Article Cover Generator - Template Configuration
 */

export interface WechatTemplate {
  id: string;
  name: string;
  nameZh: string;
  background: string;
  overlayColor: string;
  pattern: "gradient" | "solid" | "mesh";
}

export const WECHAT_TEMPLATES: WechatTemplate[] = [
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    nameZh: "赛博朋克",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
    overlayColor: "rgba(0, 255, 255, 0.15)",
    pattern: "gradient",
  },
  {
    id: "minimal",
    name: "Minimal",
    nameZh: "极简主义",
    background: "linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%)",
    overlayColor: "rgba(0, 0, 0, 0.05)",
    pattern: "solid",
  },
  {
    id: "warm-gradient",
    name: "Warm Gradient",
    nameZh: "暖色渐变",
    background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    overlayColor: "rgba(255, 255, 255, 0.3)",
    pattern: "gradient",
  },
  {
    id: "dark-elegant",
    name: "Dark Elegant",
    nameZh: "暗色优雅",
    background: "linear-gradient(135deg, #2c3e50 0%, #1a1a2e 100%)",
    overlayColor: "rgba(255, 255, 255, 0.1)",
    pattern: "gradient",
  },
  {
    id: "vibrant",
    name: "Vibrant",
    nameZh: "活力四射",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    overlayColor: "rgba(255, 255, 255, 0.2)",
    pattern: "gradient",
  },
];

export const WECHAT_DIMENSIONS = {
  width: 900,
  height: 383,
  padding: 60,
} as const;

export function getTemplateById(id: string): WechatTemplate | undefined {
  return WECHAT_TEMPLATES.find((t) => t.id === id);
}
