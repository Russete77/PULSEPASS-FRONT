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
  getEvent: (slug) => request(`/events/${slug}`),

  createOrder: (payload) =>
    request('/orders', { method: 'POST', body: payload, auth: true }),
  listOrders: () => request('/orders', { auth: true }),
  getOrder: (id) => request(`/orders/${id}`, { auth: true }),
  refundOrder: (id) => request(`/orders/${id}/refund`, { method: 'POST', auth: true }),
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
