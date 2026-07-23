// App.jsx — PulsePass DS canvas root (organized by role)

function IPhoneShell({ children }) {
  return (
    <div style={{
      width: 410, height: 864,
      borderRadius: 54,
      padding: 10,
      background: 'linear-gradient(180deg, #1a1a1f 0%, #0a0a0c 100%)',
      position: 'relative',
      boxShadow:
        'inset 0 0 0 1.5px rgba(255,255,255,0.08), inset 0 0 0 4px #0a0a0c, inset 0 0 0 5px rgba(255,255,255,0.06), 0 40px 80px -20px rgba(0,0,0,0.7), 0 0 30px rgba(0,255,133,0.05)',
    }}>
      <div style={{
        width: '100%', height: '100%',
        borderRadius: 44, overflow: 'hidden', position: 'relative',
        background: '#06070A',
      }}>
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          width: 124, height: 36, borderRadius: 999,
          background: '#000', zIndex: 100,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
        }}/>
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      {/* ════════════════ INTRO ════════════════ */}
      <DCSection
        id="intro"
        title="PulsePass · Design System"
        subtitle="Sistema operacional de eventos — ticketeria + guest list + cashless · Premium glass · 53 telas mockadas por role"
      >
        <DCArtboard id="intro-hero" label="Hero" width={1560} height={420}>
          <div className="pp-aurora" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: '0 60px', color: '#fff', fontFamily: 'var(--pp-font-body)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
              <div className="pp-eyebrow">v3 · Premium glass · multi-role</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 88, lineHeight: 0.95, letterSpacing: '-0.045em', marginTop: 18 }}>
                Sinta o pulso<br/>
                <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: '#00FF85' }}>do evento.</span>
              </div>
              <div style={{ maxWidth: 600, marginTop: 20, fontSize: 18, lineHeight: 1.5, color: 'rgba(255,255,255,0.7)' }}>
                Quatro roles · uma plataforma. Cliente, Promoter, Produtora e ADM PulsePass — cada um com sua interface, devices e permissões.
              </div>
              <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
                <PButton variant="primary" size="lg" icon={<ArrowIcon/>}>Explorar roles</PButton>
                <PButton variant="glass" size="lg">Foundation</PButton>
              </div>
            </div>
            <div style={{ width: 480, position: 'relative', zIndex: 2 }}>
              <BrandLockup tag="PASS"/>
              <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { v: '53', l: 'telas', c: '#00FF85' },
                  { v: '4', l: 'roles', c: '#A78BFA' },
                  { v: '5', l: 'engines', c: '#22D3EE' },
                  { v: '38', l: 'tokens', c: '#FF3D88' },
                ].map(s => (
                  <div key={s.l} style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
                    <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 30, color: s.c, letterSpacing: '-0.02em' }}>{s.v}</div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DCArtboard>
      </DCSection>

      {/* ════════════════ ROLES (architecture) ════════════════ */}
      <DCSection
        id="roles"
        title="Roles & Permissões"
        subtitle="A arquitetura de acesso — quem vê o quê, em qual device, com qual auth"
      >
        <DCArtboard id="roles-map" label="00 · Arquitetura de Roles" width={1560} height={1080}>
          <RolesMap/>
        </DCArtboard>
        <DCArtboard id="roles-login" label="00b · Login multi-role (detect)" width={430} height={884}>
          <IPhoneShell><MultiRoleLoginScreen/></IPhoneShell>
        </DCArtboard>
      </DCSection>

      {/* ════════════════ FOUNDATION ════════════════ */}
      <DCSection
        id="foundation"
        title="Foundation"
        subtitle="Brand · Color · Type · Spacing · Radius · Elevation · Glass · Components"
      >
        <DCArtboard id="brand" label="01 · Brand" width={760} height={460}><BrandCard/></DCArtboard>
        <DCArtboard id="palette" label="02 · Color" width={760} height={780}><PaletteCard/></DCArtboard>
        <DCArtboard id="type" label="03 · Type" width={760} height={680}><TypographyCard/></DCArtboard>
        <DCArtboard id="system" label="04 · System" width={760} height={620}><SystemCard/></DCArtboard>
        <DCArtboard id="components" label="05 · Components" width={760} height={1080}><ComponentsCard/></DCArtboard>
      </DCSection>

      {/* ════════════════ ROLE 1 · CLIENTE ════════════════ */}
      <DCSection
        id="cliente"
        title="Role 1 · Cliente"
        subtitle="Participante final · iPhone super-app · 17 telas — descobrir, comprar, vibrar, pagar, transferir"
      >
        <DCArtboard id="c-onboard" label="A · Onboarding / Login" width={430} height={884}>
          <IPhoneShell><OnboardingScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-home" label="B · Home Discover" width={430} height={884}>
          <IPhoneShell><HomeScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-catalog" label="C · Catálogo (cidade + categoria)" width={430} height={884}>
          <IPhoneShell><CatalogScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-search" label="D · Busca / Resultados" width={430} height={884}>
          <IPhoneShell><SearchScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-event" label="E · Página do Evento" width={430} height={884}>
          <IPhoneShell><EventScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-seatmap" label="E2 · Mapa de assentos numerado" width={1216} height={856}>
          <IPadFrame><SeatMapScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="c-casa" label="F · Casa · Perfil do Produtor" width={430} height={884}>
          <IPhoneShell><CasaProfileScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-pix" label="G · Checkout Pix" width={430} height={884}>
          <IPhoneShell><CheckoutPixScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-success" label="H · Compra confirmada" width={430} height={884}>
          <IPhoneShell><OrderSuccessScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-mytickets" label="I · Meus Ingressos" width={430} height={884}>
          <IPhoneShell><MyTicketsScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-ticket" label="J · Ingresso QR rotativo" width={430} height={884}>
          <IPhoneShell><TicketScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-transfer" label="K · Transferir Ingresso" width={430} height={884}>
          <IPhoneShell><TransferTicketScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-wallet" label="L · Carteira Cashless" width={430} height={884}>
          <IPhoneShell><WalletScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-recharge" label="M · Recarregar" width={430} height={884}>
          <IPhoneShell><RechargeScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-order" label="N · Pedido no bar (super app)" width={430} height={884}>
          <IPhoneShell><OrderAheadScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-map" label="O · Mapa do evento (live)" width={430} height={884}>
          <IPhoneShell><LiveMapScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-withdraw" label="P · Saque saldo residual" width={430} height={884}>
          <IPhoneShell><WithdrawScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-loyalty" label="Q · Loyalty · Pulse+ Points" width={430} height={884}>
          <IPhoneShell><LoyaltyScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-notif" label="R · Notificações" width={430} height={884}>
          <IPhoneShell><NotificationsScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="c-profile" label="S · Perfil · Tier · Achievements" width={430} height={884}>
          <IPhoneShell><ProfileScreen/></IPhoneShell>
        </DCArtboard>
      </DCSection>

      {/* ════════════════ ROLE 2 · PROMOTER (AZList core) ════════════════ */}
      <DCSection
        id="promoter"
        title="Role 2 · Promoter"
        subtitle="AZList killer · vende lista, ganha comissão · mobile-first + link público"
      >
        <DCArtboard id="p-mode" label="T · Promoter mode (mobile)" width={430} height={884}>
          <IPhoneShell><PromoterScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="p-public" label="U · Inscrição pública (link)" width={430} height={884}>
          <IPhoneShell><GuestSignupScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="w-tables" label="U2 · App do Garçom · suas mesas" width={430} height={884}>
          <IPhoneShell><WaiterScreen/></IPhoneShell>
        </DCArtboard>
        <DCArtboard id="w-order" label="U3 · App do Garçom · comanda na mesa" width={430} height={884}>
          <IPhoneShell><WaiterOrderScreen/></IPhoneShell>
        </DCArtboard>
      </DCSection>

      {/* ════════════════ ROLE 3 · PRODUTORA ════════════════ */}
      <DCSection
        id="produtora"
        title="Role 3 · Produtora"
        subtitle="Casa / Organização · iPad cockpit · 13 telas — criar, operar, faturar, fechar"
      >
        <DCArtboard id="pr-multi" label="V · Multi-evento (organização)" width={1216} height={856}>
          <IPadFrame><MultiEventScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-dash" label="W · Dashboard ao vivo" width={1216} height={856}>
          <IPadFrame><ProducerDashboard/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-wizard" label="X · Criar Evento (wizard)" width={1216} height={856}>
          <IPadFrame><EventWizardScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-marketing" label="Y · Marketing · Promo codes · Push" width={1216} height={856}>
          <IPadFrame><MarketingScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-pdv" label="Z · PDV Cashless · Bar" width={1216} height={856}>
          <IPadFrame><PDVScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-totem" label="Z2 · Totem de Autoatendimento" width={1216} height={856}>
          <IPadFrame><TotemScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-stock" label="Z3 · Estoque & CMV" width={1216} height={856}>
          <IPadFrame><StockScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-kds" label="AA · KDS · Cozinha" width={1216} height={856}>
          <IPadFrame><KDSScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-reserv" label="AB · Reservas · Mesas (planta)" width={1216} height={856}>
          <IPadFrame><ReservationsScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-box" label="AC · Box Office · maquininha" width={1216} height={856}>
          <IPadFrame><BoxOfficeScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-door" label="AD · Porta · Scanner check-in" width={1216} height={856}>
          <IPadFrame><DoorScannerScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-list" label="AE · Gestão de Guest List" width={1216} height={856}>
          <IPadFrame><GuestListManagerScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-promo" label="AF · Promoters · Ranking & comissão" width={1216} height={856}>
          <IPadFrame><PromoterManagerScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-finance" label="AG · Financeiro · Saque & antecipação" width={1216} height={856}>
          <IPadFrame><FinancialScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-closing" label="AH · Fechamento de Caixa" width={1216} height={856}>
          <IPadFrame><CashierClosingScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-report" label="AI · Relatório Excel · 9 abas" width={1216} height={856}>
          <IPadFrame><SalesReportScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-team" label="AJ · Time & Staff · permissões granulares" width={1216} height={856}>
          <IPadFrame><TeamStaffScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-brand" label="AK · Branding white-label · domínio próprio" width={1216} height={856}>
          <IPadFrame><BrandingScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="pr-api" label="AL · API & Webhooks · integrações" width={1216} height={856}>
          <IPadFrame><ApiWebhooksScreen/></IPadFrame>
        </DCArtboard>
      </DCSection>

      {/* ════════════════ ROLE 4 · ADM PULSEPASS ════════════════ */}
      <DCSection
        id="adm"
        title="Role 4 · ADM PulsePass"
        subtitle="Super-admin da plataforma · acesso restrito SSO+WebAuthn · visão multi-tenant de tudo"
      >
        <DCArtboard id="a-platform" label="AJ · Visão da Plataforma (multi-tenant)" width={1216} height={856}>
          <IPadFrame><AdmPlatformScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="a-orgs" label="AK · Organizações · 248 orgs · health" width={1216} height={856}>
          <IPadFrame><AdmOrgsScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="a-fraud" label="AL · Antifraude · ML ao vivo" width={1216} height={856}>
          <IPadFrame><AdmFraudScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="a-support" label="AM · Suporte · Inbox + Pulse AI" width={1216} height={856}>
          <IPadFrame><AdmSupportScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="a-audit" label="AN · Audit log · WORM imutável" width={1216} height={856}>
          <IPadFrame><AdmAuditScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="a-flags" label="AO · Feature flags · rollout controlado" width={1216} height={856}>
          <IPadFrame><AdmFlagsScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="a-taxes" label="AP · Taxas & planos · split rules" width={1216} height={856}>
          <IPadFrame><AdmTaxesScreen/></IPadFrame>
        </DCArtboard>
        <DCArtboard id="a-finance" label="AQ · Financeiro da plataforma · MRR/cohort" width={1216} height={856}>
          <IPadFrame><AdmFinanceScreen/></IPadFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
