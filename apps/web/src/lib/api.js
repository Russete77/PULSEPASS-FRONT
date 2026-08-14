import { createApiClient } from '@pulsepass/shared';
import { supabase } from './supabase.js';

const BASE = import.meta.env.VITE_API_URL ?? '/api';

const { request } = createApiClient({
  baseUrl: BASE,
  getToken: async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? null;
  },
});

export const api = {
  listEvents: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v),
    ).toString();
    return request(`/events${qs ? `?${qs}` : ''}`);
  },
  // Cidades com evento no ar — alimenta o seletor da vitrine.
  listCities: () => request('/events/cidades'),
  getEvent: (slug) => request(`/events/${slug}`),
  // Página pública da produtora: marca + agenda publicada dela.
  getCasa: (slug) => request(`/casas/${slug}`),

  // ── Assento marcado ──
  // O mapa é público — quem ainda não tem conta precisa ver o que sobrou
  // antes de decidir criar uma. O token vai junto quando existe (authHeader
  // devolve {} sem sessão) só para o servidor marcar quais lugares são seus.
  seatMap: (slug) => request(`/events/${slug}/assentos`, { auth: true }),
  holdSeats: (slug, seatIds) =>
    request(`/events/${slug}/assentos/reservar`, { method: 'POST', auth: true, body: { seat_ids: seatIds } }),
  releaseSeats: (slug) =>
    request(`/events/${slug}/assentos/soltar`, { method: 'POST', auth: true }),

  createOrder: (payload) =>
    request('/orders', { method: 'POST', body: payload, auth: true }),
  listOrders: () => request('/orders', { auth: true }),
  getOrder: (id) => request(`/orders/${id}`, { auth: true }),
  refundOrder: (id) => request(`/orders/${id}/refund`, { method: 'POST', auth: true }),
  // Reenvio do ingresso: o cliente resolve sozinho em vez de abrir suporte.
  resendTickets: (id) => request(`/orders/${id}/resend-tickets`, { method: 'POST', auth: true }),
  // Fila de espera de lote esgotado (publico: nao exige login).
  joinWaitlist: (slug, body) =>
    request(`/events/${slug}/waitlist`, { method: 'POST', body }),
  simulatePaid: (id) =>
    request(`/orders/${id}/simulate-paid`, { method: 'POST', auth: true }),

  myTickets: () => request('/tickets', { auth: true }),
  getTicket: (id) => request(`/tickets/${id}`, { auth: true }),
  getTicketQrToken: (id) => request(`/tickets/${id}/qr-token`, { auth: true }),
  transferTicket: (id, toEmail) =>
    request(`/tickets/${id}/transfer`, { method: 'POST', body: { toEmail }, auth: true }),

  // Carteira cashless (saldo, recarga via Asaas, extrato)
  getWallet: (eventId) => request(`/wallet${eventId ? `?eventId=${eventId}` : ''}`, { auth: true }),
  refundWallet: () => request('/wallet/refund', { method: 'POST', auth: true }),
  createTopup: (body) => request('/wallet/topups', { method: 'POST', body, auth: true }),
  getTopup: (id) => request(`/wallet/topups/${id}`, { auth: true }),
  simulateTopupPaid: (id) => request(`/wallet/topups/${id}/simulate-paid`, { method: 'POST', auth: true }),

  // Bar cashless — pedir no app (OrderAhead)
  getEventMenu: (slug) => request(`/events/${slug}/menu`),
  createBarOrder: (body) => request('/bar-orders', { method: 'POST', body, auth: true }),
  listBarOrders: () => request('/bar-orders', { auth: true }),

  // Perfil de quem está logado.
  // Mora sob /admin por acidente histórico — o router é o do cockpit da
  // produtora, mas esta rota específica só passa por requireAuth (nenhum papel
  // exigido) e é o ÚNICO ponto da API que devolve o profile do usuário.
  // Resposta: { profile: { id, full_name, role, email }, organizations, assignments }.
  me: () => request('/admin/me', { auth: true }),

  // Portal do promoter (self-service)
  promoterMe: () => request('/promoter/me', { auth: true }),
  promoterGuests: (promoterId) => request(`/promoter/promoters/${promoterId}/guests`, { auth: true }),

  // Camarotes (público)
  listEventTables: (slug) => request(`/tables/event/${slug}`),
  reserveTable: (tableId, body) => request(`/tables/${tableId}/reserve`, { method: 'POST', body }),

  // Guest list (público — sem auth)
  getList: (code) => request(`/lists/${code}`),
  listHit: (code) => request(`/lists/${code}/hit`, { method: 'POST' }),
  listSignup: (code, body) => request(`/lists/${code}/signup`, { method: 'POST', body }),
};

export { BASE as API_BASE };
