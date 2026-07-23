// ─────────────────────────────────────────────────────────────
// PulsePass · cliente HTTP do backend único (pulse-back) — FONTE ÚNICA.
// Cada front injeta sua baseUrl e seu getToken (origem da sessão difere
// por plataforma: import.meta.env no web/admin, process.env no mobile).
// ─────────────────────────────────────────────────────────────

/**
 * @param {object} config
 * @param {string} config.baseUrl  - ex: http://localhost:4000/api
 * @param {() => Promise<string|null>} config.getToken - access token do Supabase, ou null
 */
export function createApiClient({ baseUrl, getToken }) {
  async function authHeader() {
    const token = getToken ? await getToken() : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function request(path, { method = 'GET', body, auth = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) Object.assign(headers, await authHeader());

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(json?.error?.message ?? `Erro ${res.status}`);
    return json.data ?? json;
  }

  return { request, authHeader, baseUrl };
}
