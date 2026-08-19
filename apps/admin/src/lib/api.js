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
  // Taxa da plataforma (padrao + excecao por produtora)
  platformBilling: () => request('/platform/billing'),
  setDefaultFee: (fee_bps) => request('/platform/billing/default-fee', { method: 'PATCH', body: { fee_bps } }),
  setOrgFee: (orgId, fee_bps) => request(`/platform/billing/orgs/${orgId}/fee`, { method: 'PATCH', body: { fee_bps } }),
  // Transparencia do repasse (visao da produtora)
  repasse: (orgId) => request(`/admin/organizations/${orgId}/repasse`),
  // Subconta Asaas: a produtora abre a conta sem sair do cockpit.
  createAsaasSubaccount: (orgId, dados) =>
    request(`/admin/organizations/${orgId}/asaas-subaccount`, { method: 'POST', body: dados }),
  refreshAsaasSubaccount: (orgId) =>
    request(`/admin/organizations/${orgId}/asaas-subaccount/refresh`, { method: 'POST' }),
  createOrg: (name, cnpj) => request('/admin/organizations', { method: 'POST', body: { name, cnpj } }),

  listEvents: () => request('/admin/events'),
  createEvent: (payload) => request('/admin/events', { method: 'POST', body: payload }),
  getEvent: (id) => request(`/admin/events/${id}`),
  setStatus: (id, status) => request(`/admin/events/${id}/status`, { method: 'PATCH', body: { status } }),
  dashboard: (id) => request(`/admin/events/${id}/dashboard`),

  /**
   * Envia a capa do evento.
   * O arquivo vai DIRETO do navegador ao Storage com uma URL assinada — nao
   * passa pela nossa API. Imagem de 5 MB subindo por la ocuparia processo que
   * devia estar validando ingresso na porta.
   */
  uploadCover: async (id, file) => {
    const { signed_url, path } = await request(`/admin/events/${id}/cover-upload`, {
      method: 'POST', body: { content_type: file.type },
    });
    const envio = await fetch(signed_url, {
      method: 'PUT', headers: { 'content-type': file.type }, body: file,
    });
    if (!envio.ok) throw new Error('Nao foi possivel enviar a imagem. Tente de novo.');
    return request(`/admin/events/${id}/cover`, { method: 'POST', body: { path } });
  },
  removeCover: (id) => request(`/admin/events/${id}/cover`, { method: 'DELETE' }),

  // ── Marca da produtora (white-label) ──
  getBranding: (orgId) => request(`/admin/organizations/${orgId}/branding`),
  setBranding: (orgId, body) => request(`/admin/organizations/${orgId}/branding`, { method: 'PATCH', body }),
  // Mesmo caminho da capa: a imagem vai DIRETO ao Storage, sem passar pela
  // API. O backend só decide quem pode enviar e sob qual caminho.
  uploadLogo: async (orgId, file) => {
    const { signed_url, path } = await request(`/admin/organizations/${orgId}/logo-upload`, {
      method: 'POST', body: { content_type: file.type },
    });
    const envio = await fetch(signed_url, {
      method: 'PUT', headers: { 'content-type': file.type }, body: file,
    });
    if (!envio.ok) throw new Error('Nao foi possivel enviar o logo. Tente de novo.');
    return request(`/admin/organizations/${orgId}/logo`, { method: 'POST', body: { path } });
  },
  removeLogo: (orgId) => request(`/admin/organizations/${orgId}/logo`, { method: 'DELETE' }),
  reconciliation: (id) => request(`/admin/events/${id}/reconciliation`),

  // gate = qual portaria validou. O schema e a RPC sempre aceitaram; o front
  // é que nunca enviava — e sem isso o log de movimento não diz POR ONDE.
  checkIn: (id, input, direction, gate) => request(`/admin/events/${id}/checkin`, {
    method: 'POST', body: { input, ...(direction ? { direction } : {}), ...(gate ? { gate } : {}) },
  }),
  // Modo offline na porta
  manifest: (id) => request(`/admin/events/${id}/manifest`),
  occupancy: (id) => request(`/admin/events/${id}/occupancy`),
  checkInBatch: (id, scans) => request(`/admin/events/${id}/checkin-batch`, { method: 'POST', body: { scans } }),
  eventMenu: (id) => request(`/admin/events/${id}/menu`),
  walletLookup: (id, email) => request(`/admin/events/${id}/wallet-lookup?email=${encodeURIComponent(email)}`),
  // A chave de idempotência é UMA por comanda: se a rede cair depois que o
  // servidor cobrou, o retry com a mesma chave devolve o MESMO pedido em vez
  // de debitar a carteira de novo. Quem gera e renova a chave é a tela.
  pdvCharge: (id, email, items, idemKey, station) =>
    request(`/admin/events/${id}/pdv-charge`, {
      method: 'POST',
      body: { email, items, ...(station ? { station } : {}) },
      ...(idemKey ? { headers: { 'Idempotency-Key': idemKey } } : {}),
    }),

  // promoters / guest list
  createPromoter: (id, name, commission_cents, email, goal_checkins, extra = {}) =>
    request(`/admin/events/${id}/promoters`, { method: 'POST', body: { name, commission_cents, email, goal_checkins, ...extra } }),
  listPromoters: (id) => request(`/admin/events/${id}/promoters`),
  promoterGuests: (promoterId) => request(`/admin/promoters/${promoterId}/guests`),
  eventGuests: (id) => request(`/admin/events/${id}/guests`),
  // Resumo em PESSOAS (grupos +N): a métrica certa para dimensionar a porta.
  guestsSummary: (id) => request(`/admin/events/${id}/guests/summary`),
  // people = quantas pessoas do convite estão entrando agora (grupo +N).
  checkinGuest: (guestId, people = 1) =>
    request(`/admin/guests/${guestId}/checkin`, { method: 'POST', body: { people } }),
  commissionPaid: (promoterId, paid = true) =>
    request(`/admin/promoters/${promoterId}/commission-paid`, { method: 'POST', body: { paid } }),

  // Equipe (RBAC)
  listStaff: (id) => request(`/admin/events/${id}/staff`),
  permissoesCatalogo: () => request('/admin/permissoes'),
  setStaffPermissoes: (id, staffId, permissoes) =>
    request(`/admin/events/${id}/staff/${staffId}/permissoes`, { method: 'PATCH', body: { permissoes } }),

  // ── Serviço de bar: cozinha, garçom, totem ──
  kds: (id) => request(`/admin/events/${id}/kds`),

  // ── Turno de caixa ──
  turnoAberto: (id) => request(`/admin/events/${id}/turno`),
  abrirTurno: (id, body) => request(`/admin/events/${id}/turno`, { method: 'POST', body }),
  listarTurnos: (id) => request(`/admin/events/${id}/turnos`),
  fecharTurno: (turnoId, body) => request(`/admin/turnos/${turnoId}/fechar`, { method: 'POST', body }),
  advanceBarOrder: (orderId, para, station) =>
    request(`/admin/bar-orders/${orderId}/status`, {
      method: 'PATCH', body: { para, ...(station ? { station } : {}) },
    }),
  waiterBoard: (id) => request(`/admin/events/${id}/waiter`),
  placeWaiterOrder: (id, payload) =>
    request(`/admin/events/${id}/waiter-orders`, { method: 'POST', body: payload }),
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
  // Reserva lançada pela casa (telefone/WhatsApp). Usa a MESMA rota pública
  // da reserva pelo app: nasce como 'requested' e passa pela confirmação,
  // igual à do cliente. Rota alternativa só pra casa seria um segundo caminho
  // de escrita na mesma tabela, com as regras fatalmente divergindo.
  reservarMesa: (tableId, body) => request(`/tables/${tableId}/reserve`, { method: 'POST', body }),
  ledgerCheck: (id) => request(`/admin/events/${id}/ledger-check`),

  // Fila de espera do evento (quem aguarda e quem ja foi convidado)
  eventWaitlist: (id) => request(`/admin/events/${id}/waitlist`),

  // Notas fiscais (NFS-e)
  eventFiscal: (id) => request(`/admin/events/${id}/fiscal`),
  issueInvoice: (id, order_id) =>
    request(`/admin/events/${id}/fiscal/issue`, { method: 'POST', body: { order_id } }),

  // Trilha de auditoria e casos de fraude do evento
  eventAudit: (id, opts = {}) => {
    const q = new URLSearchParams();
    if (opts.action) q.set('action', opts.action);
    if (opts.money) q.set('money', '1');
    const s = q.toString();
    return request(`/admin/events/${id}/audit${s ? `?${s}` : ''}`);
  },
  eventFraudCases: (id) => request(`/admin/events/${id}/fraud-cases`),
  resolveFraudCase: (caseId) => request(`/admin/fraud-cases/${caseId}/resolve`, { method: 'POST' }),

  // Cupons de desconto (Sympla)
  listCoupons: (id) => request(`/admin/events/${id}/coupons`),
  createCoupon: (id, body) => request(`/admin/events/${id}/coupons`, { method: 'POST', body }),

  // Campanhas de e-mail — tamanho do segmento é consultado, nunca estimado.
  marketingSegments: (id) => request(`/admin/events/${id}/marketing/segments`),
  listCampaigns: (id) => request(`/admin/events/${id}/marketing/campaigns`),
  createCampaign: (id, body) => request(`/admin/events/${id}/marketing/campaigns`, { method: 'POST', body }),
  sendCampaign: (campaignId) => request(`/admin/marketing/campaigns/${campaignId}/send`, { method: 'POST' }),
  setCouponActive: (couponId, active) => request(`/admin/coupons/${couponId}`, { method: 'PATCH', body: { active } }),
  deleteCoupon: (couponId) => request(`/admin/coupons/${couponId}`, { method: 'DELETE' }),

  // Carteira Asaas da produtora (split/repasse)
  setOrgWallet: (orgId, asaas_wallet_id) =>
    request(`/admin/organizations/${orgId}/asaas-wallet`, { method: 'PATCH', body: { asaas_wallet_id } }),

  // ── Integrações da produtora: chaves de API e webhooks ──
  //
  // Duas rotas devolvem SEGREDO, e só uma vez na vida: `criarChaveApi` traz
  // `chave`, `criarWebhook` e `rotacionarWebhookSecret` trazem `secret`. Não
  // existe rota de "mostrar de novo" — o banco guarda hash/cifra. Quem chamar
  // estes três é responsável por entregar o valor à pessoa na hora; jogar a
  // resposta fora é perder a chave.
  listarChavesApi: (orgId) => request(`/admin/organizations/${orgId}/api-keys`),
  criarChaveApi: (orgId, { nome, escopos }) =>
    request(`/admin/organizations/${orgId}/api-keys`, { method: 'POST', body: { nome, escopos } }),
  revogarChaveApi: (orgId, chaveId) =>
    request(`/admin/organizations/${orgId}/api-keys/${chaveId}`, { method: 'DELETE' }),

  // Devolve { assinaturas, entregas, eventos } — o catálogo de eventos vem
  // junto de propósito: a tela não mantém uma cópia própria da lista.
  listarWebhooks: (orgId) => request(`/admin/organizations/${orgId}/webhooks`),
  criarWebhook: (orgId, { url, eventos }) =>
    request(`/admin/organizations/${orgId}/webhooks`, { method: 'POST', body: { url, eventos } }),
  pausarWebhook: (orgId, assinaturaId, ativa) =>
    request(`/admin/organizations/${orgId}/webhooks/${assinaturaId}`, { method: 'PATCH', body: { ativa } }),
  removerWebhook: (orgId, assinaturaId) =>
    request(`/admin/organizations/${orgId}/webhooks/${assinaturaId}`, { method: 'DELETE' }),
  rotacionarWebhookSecret: (orgId, assinaturaId) =>
    request(`/admin/organizations/${orgId}/webhooks/${assinaturaId}/secret`, { method: 'POST' }),
  reprocessarWebhook: (orgId, assinaturaId) =>
    request(`/admin/organizations/${orgId}/webhooks/${assinaturaId}/reprocessar`, { method: 'POST' }),
};
