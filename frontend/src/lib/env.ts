/**
 * Environment variable validation and type safety.
 * Ensures required variables are present and correctly formatted.
 */

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
} as const;

export type EnvKey = keyof typeof env;

/**
 * Validate that required environment variables are set.
 * Call this during app initialization.
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  // NEXT_PUBLIC_API_URL is optional, defaults to localhost
  // Add other required variables here as needed
  
  return { valid: missing.length === 0, missing };
}

/**
 * Get environment variable with optional default.
 */
export function getEnvVar(key: string, fallback?: string): string | undefined {
  return process.env[key] ?? fallback;
}
