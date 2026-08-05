import { createApiClient } from '@pulsepass/shared';
import { supabase } from './supabase.js';

const BASE = import.meta.env.VITE_API_URL ?? '/api';

const client = createApiClient({
  baseUrl: BASE,
  getToken: async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? null;
  },
});

// Admin: todas as rotas exigem autenticação.
const request = (path, opts = {}) => client.request(path, { auth: true, ...opts });

export const api = {
  me: () => request('/admin/me'),

  // PulseADM (super-admin god-mode)
  platformWhoami: () => request('/platform/whoami'),
  platformStats: () => request('/platform/stats'),
  platformOrgs: () => request('/platform/orgs'),
  platformFraud: () => request('/platform/fraud'),
  platformFinance: () => request('/platform/finance'),
  platformActivity: () => request('/platform/activity'),
  createOrg: (name, cnpj) => request('/admin/organizations', { method: 'POST', body: { name, cnpj } }),

  listEvents: () => request('/admin/events'),
  createEvent: (payload) => request('/admin/events', { method: 'POST', body: payload }),
  getEvent: (id) => request(`/admin/events/${id}`),
  setStatus: (id, status) => request(`/admin/events/${id}/status`, { method: 'PATCH', body: { status } }),
  dashboard: (id) => request(`/admin/events/${id}/dashboard`),
  reconciliation: (id) => request(`/admin/events/${id}/reconciliation`),

  checkIn: (id, input, direction) => request(`/admin/events/${id}/checkin`, {
    method: 'POST', body: { input, ...(direction ? { direction } : {}) },
  }),
  // Modo offline na porta
  manifest: (id) => request(`/admin/events/${id}/manifest`),
  occupancy: (id) => request(`/admin/events/${id}/occupancy`),
  checkInBatch: (id, scans) => request(`/admin/events/${id}/checkin-batch`, { method: 'POST', body: { scans } }),
  eventMenu: (id) => request(`/admin/events/${id}/menu`),
  walletLookup: (id, email) => request(`/admin/events/${id}/wallet-lookup?email=${encodeURIComponent(email)}`),
  pdvCharge: (id, email, items) => request(`/admin/events/${id}/pdv-charge`, { method: 'POST', body: { email, items } }),

  // promoters / guest list
  createPromoter: (id, name, commission_cents, email, goal_checkins, extra = {}) =>
    request(`/admin/events/${id}/promoters`, { method: 'POST', body: { name, commission_cents, email, goal_checkins, ...extra } }),
  listPromoters: (id) => request(`/admin/events/${id}/promoters`),
  promoterGuests: (promoterId) => request(`/admin/promoters/${promoterId}/guests`),
  eventGuests: (id) => request(`/admin/events/${id}/guests`),
  // people = quantas pessoas do convite estão entrando agora (grupo +N).
  checkinGuest: (guestId, people = 1) =>
    request(`/admin/guests/${guestId}/checkin`, { method: 'POST', body: { people } }),
  commissionPaid: (promoterId, paid = true) =>
    request(`/admin/promoters/${promoterId}/commission-paid`, { method: 'POST', body: { paid } }),

  // Equipe (RBAC)
  listStaff: (id) => request(`/admin/events/${id}/staff`),
  addStaff: (id, email, role) => request(`/admin/events/${id}/staff`, { method: 'POST', body: { email, role } }),
  removeStaff: (id, staffId) => request(`/admin/events/${id}/staff/${staffId}`, { method: 'DELETE' }),

  // Cardápio do bar (Zig) + inventário
  listMenuItems: (id) => request(`/admin/events/${id}/menu-items`),
  createMenuItem: (id, body) => request(`/admin/events/${id}/menu-items`, { method: 'POST', body }),
  updateMenuItem: (itemId, body) => request(`/admin/menu-items/${itemId}`, { method: 'PATCH', body }),
  deleteMenuItem: (itemId) => request(`/admin/menu-items/${itemId}`, { method: 'DELETE' }),
  cashierReport: (id) => request(`/admin/events/${id}/cashier`),

  // Bilheteria física (venda na entrada: dinheiro / maquininha / Pix / cortesia)
  boxOfficeOpen: (id) => request(`/admin/events/${id}/box-office`),
  boxOfficeSell: (id, body) => request(`/admin/events/${id}/box-office/sales`, { method: 'POST', body }),
  boxOfficeReport: (id) => request(`/admin/events/${id}/box-office/report`),

  // Camarotes / reservas (AZList)
  listTables: (id) => request(`/admin/events/${id}/tables`),
  createTable: (id, body) => request(`/admin/events/${id}/tables`, { method: 'POST', body }),
  deleteTable: (tableId) => request(`/admin/tables/${tableId}`, { method: 'DELETE' }),
  listReservations: (id) => request(`/admin/events/${id}/reservations`),
  setReservation: (reservationId, status) => request(`/admin/reservations/${reservationId}`, { method: 'PATCH', body: { status } }),
  ledgerCheck: (id) => request(`/admin/events/${id}/ledger-check`),

  // Cupons de desconto (Sympla)
  listCoupons: (id) => request(`/admin/events/${id}/coupons`),
  createCoupon: (id, body) => request(`/admin/events/${id}/coupons`, { method: 'POST', body }),
  setCouponActive: (couponId, active) => request(`/admin/coupons/${couponId}`, { method: 'PATCH', body: { active } }),
  deleteCoupon: (couponId) => request(`/admin/coupons/${couponId}`, { method: 'DELETE' }),

  // Carteira Asaas da produtora (split/repasse)
  setOrgWallet: (orgId, asaas_wallet_id) =>
    request(`/admin/organizations/${orgId}/asaas-wallet`, { method: 'PATCH', body: { asaas_wallet_id } }),
};
