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

  async function request(path, { method = 'GET', body, auth = false, headers: extra } = {}) {
    // `headers` extras existem por causa do Idempotency-Key: sem ele, um
    // timeout de rede + o operador tentando de novo é cobrança em dobro.
    const headers = { 'Content-Type': 'application/json', ...(extra ?? {}) };
    if (auth) Object.assign(headers, await authHeader());

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(json?.error?.message ?? `Erro ${res.status}`);

    // Desembrulha pela PRESENÇA da chave, não pelo valor.
    //
    // Era `json.data ?? json`, e isso quebrava toda resposta legítima de
    // `{"data": null}` — "não existe turno aberto", "nenhuma reserva", "sem
    // marca cadastrada". O ?? caía no objeto inteiro, que é truthy, e a tela
    // renderizava o ramo de "existe" com campos indefinidos: foi assim que o
    // fechamento de caixa mostrou "Turno aberto desde Invalid Date".
    return Object.prototype.hasOwnProperty.call(json, 'data') ? json.data : json;
  }

  return { request, authHeader, baseUrl };
}
