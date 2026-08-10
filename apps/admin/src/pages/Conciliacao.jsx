import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

function Row({ label, value, sub, strong, accent }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: '10px 0',
      borderBottom: '1px solid var(--pp-edge-2)', fontWeight: strong ? 700 : 400,
    }}>
      <span style={{ color: sub ? 'var(--pp-fg-3)' : 'var(--pp-fg)', fontSize: sub ? 13 : undefined }}>{label}</span>
      <span style={{ fontFamily: 'var(--pp-font-mono)', color: accent ? 'var(--pp-pulse)' : undefined }}>{value}</span>
    </div>
  );
}

export default function Conciliacao() {
  const { id } = useParams();
  const [r, setR] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    api.reconciliation(id)
      .then((d) => { setR(d); setStatus('done'); })
      .catch((e) => { setError(e.message); setStatus('error'); });
  }, [id]);

  if (status === 'loading') return <Shell><Loading /></Shell>;
  if (status === 'error') return <Shell><ErrorBox>{error}</ErrorBox></Shell>;

  // O contador recebe este relatório, não a tela: CSV com as mesmas linhas.
  function exportarCsv() {
    const linhas = [
      ['metrica', 'valor_cents'],
      ['receita_bruta_ingressos', r.tickets_gross_cents],
      ['taxa_servico_inclusa', r.service_fees_cents],
      ['descontos_cupons', r.discounts_cents],
      ['reembolsos_qtd', r.refunds_count],
      ['reembolsos', r.refunds_cents],
      ['vendas_liquidas', r.net_sales_cents],
      [`taxa_plataforma_${r.platform_fee_percent}pct`, r.platform_fee_cents],
      ['repasse_liquido_produtor', r.producer_net_cents],
      ['receita_bar_cashless', r.bar_gross_cents],
    ];
    const csv = linhas.map((l) => l.join(';')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'conciliacao.csv' });
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">financeiro · conciliação</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <h1 className="ck-h1">Conciliação do evento</h1>
        <button className="ck-btn ck-btn--glass ck-btn--sm" onClick={exportarCsv}>Exportar CSV</button>
      </div>
      <p className="ck-sub">{r.orders_paid} pedidos pagos · taxa da plataforma {r.platform_fee_percent}%</p>

      {/* Os quatro números que respondem "como foi a noite" antes da conta
          detalhada — mesma faixa de KPIs de Cardápio e Fechamento. */}
      <div className="ck-grid" style={{ maxWidth: 560, marginBottom: 16 }}>
        {[
          ['Bruto de ingressos', brl(r.tickets_gross_cents), 'var(--pp-pulse)'],
          ['Taxa da plataforma', `− ${brl(r.platform_fee_cents)}`, 'var(--pp-amber)'],
          ['Repasse ao produtor', brl(r.producer_net_cents), 'var(--pp-pulse)'],
          ['Bar (cashless)', brl(r.bar_gross_cents), 'var(--pp-fg-3)'],
        ].map(([rotulo, valor, cor]) => (
          <div key={rotulo} className="ck-card" style={{ borderTop: `2px solid ${cor}`, padding: '12px 16px' }}>
            <div className="ck-label">{rotulo}</div>
            <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 'var(--pp-fs-18)', marginTop: 4 }}>{valor}</div>
          </div>
        ))}
      </div>

      <div className="ck-card" style={{ maxWidth: 560 }}>
        <Row label="Receita bruta de ingressos" value={brl(r.tickets_gross_cents)} />
        <Row label="↳ taxa de serviço inclusa" value={brl(r.service_fees_cents)} sub />
        <Row label="↳ descontos (cupons) aplicados" value={`− ${brl(r.discounts_cents)}`} sub />
        {/* Sem o sinal de menos: o pedido estornado JÁ SAIU do bruto pago lá
            em cima. Mostrar "− R$ X" aqui fazia a soma parecer errada — e a
            versão anterior do backend caía nessa mesma armadilha, descontando
            o estorno duas vezes. A linha é contexto, não parcela. */}
        <Row label={`Reembolsos (${r.refunds_count}) — já fora do bruto`} value={brl(r.refunds_cents)} sub />
        <Row label="Vendas líquidas" value={brl(r.net_sales_cents)} strong />
        <Row label={`Taxa da plataforma (${r.platform_fee_percent}%)`} value={`− ${brl(r.platform_fee_cents)}`} />
        <Row label="Repasse líquido ao produtor" value={brl(r.producer_net_cents)} strong accent />
      </div>

      <div className="ck-card" style={{ maxWidth: 560, marginTop: 16 }}>
        <Row label="Receita de bar (cashless)" value={brl(r.bar_gross_cents)} sub />
        <p className="ck-sub" style={{ marginTop: 8 }}>
          O acerto do cashless (recargas e consumo) é separado do repasse de ingressos.
        </p>
      </div>
    </Shell>
  );
}
