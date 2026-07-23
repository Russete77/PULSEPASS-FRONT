// Tipos de @pulsepass/shared (para consumidores TypeScript, ex: mobile).

// ── format ──
export function brl(cents?: number): string;
export function eventDate(iso?: string): string;
export function dateTime(iso?: string): string;
export function toDatetimeLocal(d?: Date): string;

// ── tokens ──
export const C: Record<string, string>;
export const S: Record<string, number>;
export const R: Record<string, number>;
export const F: {
  display: string;
  displayMd: string;
  body: string;
  bodyMd: string;
  bodyBold: string;
  mono: string;
};

// ── api client ──
export type RequestOpts = { method?: string; body?: unknown; auth?: boolean };
export interface ApiClient {
  request: <T = any>(path: string, opts?: RequestOpts) => Promise<T>;
  authHeader: () => Promise<Record<string, string>>;
  baseUrl: string;
}
export function createApiClient(config: {
  baseUrl: string;
  getToken: () => Promise<string | null>;
}): ApiClient;

// ── card ──
export function onlyDigits(s?: string): string;
export function detectBrand(number?: string): string;
export function luhnValid(number?: string): boolean;
export function formatCardNumber(number?: string): string;
export function expiryValid(mm?: string | number, yy?: string | number): boolean;
export function toExpiryYear4(yy?: string | number): string;
export function validateCard(card: {
  number?: string; expiryMonth?: string; expiryYear?: string; ccv?: string; holderName?: string;
}): { valid: boolean; errors: Record<string, string> };
