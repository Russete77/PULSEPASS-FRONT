import { createApiClient } from '@pulsepass/shared';
import { supabase } from './supabase';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const { request } = createApiClient({
  baseUrl: BASE,
  getToken: async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? null;
  },
});

type CardPayload = {
  paymentMethod?: 'pix' | 'card';
  installmentCount?: number;
  couponCode?: string;
  card?: { holderName: string; number: string; expiryMonth: string; expiryYear: string; ccv: string };
  holderInfo?: { name: string; email?: string; cpfCnpj: string; postalCode: string; addressNumber: string; phone?: string };
};

export const api = {
  listEvents: (q?: string) => request(`/events${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getEvent: (slug: string) => request(`/events/${slug}`),
  getMenu: (slug: string) => request(`/events/${slug}/menu`),

  // guest list (público — sem auth)
  getList: (code: string) => request(`/lists/${code}`),
  listHit: (code: string) => request(`/lists/${code}/hit`, { method: 'POST' }),
  listSignup: (code: string, body: { name: string; email?: string; phone?: string }) =>
    request(`/lists/${code}/signup`, { method: 'POST', body }),

  // pedidos (compra de ingresso)
  createOrder: (eventSlug: string, items: { ticket_tier_id: string; quantity: number; half?: boolean }[], extra?: CardPayload) =>
    request('/orders', { method: 'POST', auth: true, body: { eventSlug, items, ...(extra ?? {}) } }),
  listOrders: () => request('/orders', { auth: true }),
  getOrder: (id: string) => request(`/orders/${id}`, { auth: true }),
  refundOrder: (id: string) => request(`/orders/${id}/refund`, { method: 'POST', auth: true }),
  simulateOrderPaid: (id: string) =>
    request(`/orders/${id}/simulate-paid`, { method: 'POST', auth: true }),

  // carteira
  getWallet: (eventId?: string) => request(`/wallet${eventId ? `?eventId=${eventId}` : ''}`, { auth: true }),
  refundWallet: (eventId?: string) => request(`/wallet/refund${eventId ? `?eventId=${eventId}` : ''}`, { method: 'POST', auth: true }),
  createTopup: (
    amount_cents: number,
    eventId?: string,
    extra?: {
      paymentMethod?: 'pix' | 'card';
      installmentCount?: number;
      card?: { holderName: string; number: string; expiryMonth: string; expiryYear: string; ccv: string };
      holderInfo?: { name: string; email?: string; cpfCnpj: string; postalCode: string; addressNumber: string; phone?: string };
    },
  ) =>
    request('/wallet/topups', { method: 'POST', auth: true, body: { amount_cents, eventId, ...(extra ?? {}) } }),
  getTopup: (id: string) => request(`/wallet/topups/${id}`, { auth: true }),
  simulateTopupPaid: (id: string) =>
    request(`/wallet/topups/${id}/simulate-paid`, { method: 'POST', auth: true }),

  // bar
  createBarOrder: (eventSlug: string, items: { menu_item_id: string; quantity: number; notes?: string }[]) =>
    request('/bar-orders', { method: 'POST', auth: true, body: { eventSlug, items } }),
  myBarOrders: () => request('/bar-orders', { auth: true }),

  // ingressos
  myTickets: () => request('/tickets', { auth: true }),
  getTicket: (id: string) => request(`/tickets/${id}`, { auth: true }),
  transferTicket: (id: string, toEmail: string) =>
    request(`/tickets/${id}/transfer`, { method: 'POST', auth: true, body: { toEmail } }),
};
