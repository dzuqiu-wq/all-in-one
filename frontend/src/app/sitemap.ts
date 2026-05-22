import { MetadataRoute } from "next";

const BASE_URL = "https://333654.xyz";

// All routes for sitemap
const routes = [
  // Homepage - both locales
  { path: "/", locale: "en" },
  { path: "/zh", locale: "zh" },
  // Tools - both locales
  { path: "/tools/word-to-pdf", locale: "en" },
  { path: "/zh/tools/word-to-pdf", locale: "zh" },
  { path: "/tools/pdf-merge-split", locale: "en" },
  { path: "/zh/tools/pdf-merge-split", locale: "zh" },
  { path: "/tools/image-optimizer", locale: "en" },
  { path: "/zh/tools/image-optimizer", locale: "zh" },
  { path: "/tools/qrcode-generator", locale: "en" },
  { path: "/zh/tools/qrcode-generator", locale: "zh" },
  // Legal pages
  { path: "/privacy", locale: "en" },
  { path: "/zh/privacy", locale: "zh" },
  { path: "/terms", locale: "en" },
  { path: "/zh/terms", locale: "zh" },
  { path: "/cookies", locale: "en" },
  { path: "/zh/cookies", locale: "zh" },
  { path: "/about", locale: "en" },
  { path: "/zh/about", locale: "zh" },
  // Resources
  { path: "/docs", locale: "en" },
  { path: "/zh/docs", locale: "zh" },
  { path: "/changelog", locale: "en" },
  { path: "/zh/changelog", locale: "zh" },
  { path: "/api", locale: "en" },
  { path: "/zh/api", locale: "zh" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route.path === "/" ? 1.0 : route.path.startsWith("/zh") ? 0.8 : 0.9,
  }));
}