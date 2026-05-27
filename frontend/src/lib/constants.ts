/**
 * Site-wide constants — single source of truth for canonical URL, contact
 * channels, and bilingual brand strings. Imported by metadata, footer,
 * about page, JSON-LD blocks, and system status panel.
 */

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://333654.xyz";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const CONTACT = {
  general: "hello@333654.xyz",
  privacy: "privacy@333654.xyz",
  business: "hello@333654.xyz",
  abuse: "abuse@333654.xyz",
} as const;

export const SOCIAL = {
  github: "https://github.com/dzuqiu-wq/all-in-one",
} as const;

export const ORG = {
  name: "All-in-One Toolbox",
  legalName: "All-in-One Toolbox Indie Studio",
  foundingYear: 2025,
  license: "MIT",
} as const;
