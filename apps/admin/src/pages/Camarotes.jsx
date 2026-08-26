import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * Camarotes & reservas — a visão "planta baixa" da noite.
 *
 * Layout segue o mockup ReservationsScreen do design system: pills de status
 * no topo (livres/ocupadas/reservadas), as mesas como cartões coloridos por
 * estado e a fila de reservas com ações. Sem planta com coordenadas: a mesa
 * não tem posição x/y no banco, então o "mapa" é uma grade — o que importa
 * do mockup é a cor dizer o estado de longe, e isso a grade entrega.
 */
const EMPTY = { name: '', area: 'Camarote', capacity: '', min_reais: '' };

/** "há 2h47" — o número que decide qual mesa cobrar e qual liberar. */
function ocupadaHa(iso) {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return min < 60 ? `${min}min` : `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;
}

const RES_LABEL = { requested: 'Solicitada', confirmed: 'Confirmada', seated: 'Na mesa', rejected: 'Recusada', cancelled: 'Liberada' };

/* Cores de estado da mesa — mesmas famílias do mockup (verde livre, âmbar
   ocupada, violeta reservada), sempre via token v4. */
const ESTADO = {
  livre: { rotulo: 'livre', cor: 'var(--pp-pulse)', borda: 'rgba(11,232,125,0.35)', fundo: 'rgba(11,232,125,0.07)' },
  ocupada: { rotulo: 'ocupada', cor: 'var(--pp-amber)', borda: 'rgba(255,184,0,0.4)', fundo: 'rgba(255,184,0,0.08)' },
  reservada: { rotulo: 'reservada', cor: 'var(--pp-violet)', borda: 'rgba(167,139,250,0.4)', fundo: 'rgba(167,139,250,0.08)' },
};

export default function Camarotes() {
  const { id } = useParams();
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [board, setBoard] = useState([]); // consumo aberto por mesa (garçom)
  const [mesaAberta, setMesaAberta] = useState(null); // painel de itens expandido
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  // Reserva lançada pela casa: id da mesa alvo + os campos que a rota aceita.
  const [reservando, setReservando] = useState(null);
  const [reserva, setReserva] = useState({ name: '', contact: '', party_size: '' });

  const load = useCallback(() => {
    Promise.all([
      api.listTables(id),
      api.listReservations(id),
      // O quadro do garçom traz o consumo em aberto por mesa. Se falhar
      // (ex.: permissão), a tela vive sem ele — consumo é bônus, não base.
      api.waiterBoard(id).catch(() => []),
    ])
      .then(([t, r, b]) => { setTables(t); setReservations(r); setBoard(b); setStatus('done'); })
      .catch((e) => { setError(e.message); setStatus('error'); });
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  /**
   * Reserva por telefone/WhatsApp — o caso mais comum da casa, que até agora
   * só entrava pela página pública. Nasce como solicitação e cai na mesma
   * fila de aprovação da reserva feita pelo cliente: a casa confirma logo em
   * seguida, e a mesa nunca fica reservada sem alguém ter decidido isso.
   */
  async function lancarReserva(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.reservarMesa(reservando, {
        name: reserva.name.trim(),
        contact: reserva.contact.trim() || undefined,
        party_size: reserva.party_size !== '' ? Math.round(Number(reserva.party_size)) : undefined,
      });
      setReservando(null); setReserva({ name: '', contact: '', party_size: '' });
      load();
    } catch (err) {
      // A rota exige evento publicado. Em rascunho ela responde "camarote
      // indisponível", que no cockpit soa como defeito da mesa — o texto
      // abaixo diz o que realmente falta fazer.
      setError(/indispon/i.test(err.message)
        ? 'Publique o evento antes de lançar reservas — a rota de reserva só aceita evento no ar.'
        : err.message);
    } finally { setSaving(false); }
  }

  async function create(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.createTable(id, {
        name: form.name.trim(), area: form.area.trim() || 'Camarote',
        capacity: form.capacity !== '' ? Math.round(Number(form.capacity)) : null,
        min_spend_cents: form.min_reais !== '' ? Math.round(Number(form.min_reais) * 100) : 0,
      });
      setForm(EMPTY); load();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  }
  async function removeTable(t) {
    if (!window.confirm(`Excluir "${t.name}"?`)) return;
    try { await api.deleteTable(t.id); load(); } catch (e) { setError(e.message); }
  }
  async function setRes(r, s) {
    try { await api.setReservation(r.id, s); load(); } catch (e) { setError(e.message); }
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;

  /* Estado de cada mesa derivado das reservas. A reserva referencia a mesa
     pelo join (event_tables.name) — o endpoint não devolve table_id — então
     o casamento é por nome. Dentro de um evento o nome é o identificador
     que a própria casa usa; nome duplicado é erro de cadastro, não caso de
     uso. */
  const porMesa = new Map();
  for (const r of reservations) {
    const nome = r.event_tables?.name;
    if (!nome) continue;
    if (r.status === 'seated' && !porMesa.has(nome)) porMesa.set(nome, { estado: 'ocupada', reserva: r });
    else if (r.status === 'confirmed' && !porMesa.has(nome)) porMesa.set(nome, { estado: 'reservada', reserva: r });
  }
  const consumoPorMesa = new Map(board.map((m) => [m.id, m]));
  const estadoDe = (t) => porMesa.get(t.name)?.estado ?? 'livre';
  const contagem = { livre: 0, ocupada: 0, reservada: 0 };
  for (const t of tables) contagem[estadoDe(t)] += 1;

  const pendentes = reservations.filter((r) => r.status === 'requested');

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />

      {/* Cabeçalho do mockup: título à esquerda, pills de status à direita —
          é o resumo que se lê de longe no meio da operação. */}
      <div className="ck-between ck-ai-end pp-wrap ck-gap-3">
        <div>
          <div className="ck-eyebrow">azlist · camarotes</div>
          <h1 className="ck-h1">Camarotes & reservas</h1>
          <p className="ck-sub ck-mb-0">
            Cadastre camarotes/mesas com consumação mínima e aprove as solicitações de reserva.
          </p>
        </div>
        {tables.length > 0 && (
          <div className="ck-flex ck-gap-3">
            {[['Livres', 'livre'], ['Ocupadas', 'ocupada'], ['Reservadas', 'reservada']].map(([l, k]) => (
              <div key={k} className="ck-caixa--sm" style={{ background: ESTADO[k].fundo, borderColor: ESTADO[k].borda }}>
                <div className="ck-eyebrow">{l}</div>
                <div className="pp-mono ck-w-bold ck-t-section" style={{ color: ESTADO[k].cor }}>{contagem[k]}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      {/* Reserva lançada pela casa, aberta a partir do cartão da mesa. */}
      {reservando && (
        <form onSubmit={lancarReserva} className="ck-card ck-w-read ck-mt-4">
          <div className="ck-between ck-mb-3">
            <strong>Reservar {tables.find((t) => t.id === reservando)?.name}</strong>
            <button type="button" className="ck-iconbtn" onClick={() => { setReservando(null); setError(''); }}
              aria-label="Cancelar reserva">
              <Icon name="close" size={13} />
            </button>
          </div>
          <div className="ck-row">
            <div className="ck-field ck-m-0 ck-flex1 ck-fit--lg">
              <label className="ck-label" htmlFor="res-nome">Nome de quem reservou</label>
              <input id="res-nome" className="ck-input" required minLength={2} autoComplete="name"
                value={reserva.name} onChange={(e) => setReserva((r) => ({ ...r, name: e.target.value }))} />
            </div>
            <div className="ck-field ck-m-0 ck-flex1 ck-fit">
              <label className="ck-label" htmlFor="res-contato">Contato (telefone/WhatsApp)</label>
              <input id="res-contato" className="ck-input" type="tel" autoComplete="tel"
                value={reserva.contact} onChange={(e) => setReserva((r) => ({ ...r, contact: e.target.value }))} />
            </div>
            <div className="ck-field ck-m-0 ck-input--num">
              <label className="ck-label" htmlFor="res-pessoas">Pessoas</label>
              <input id="res-pessoas" className="ck-input" type="number" min="1" inputMode="numeric"
                value={reserva.party_size} onChange={(e) => setReserva((r) => ({ ...r, party_size: e.target.value }))} />
            </div>
          </div>
          <p className="ck-sub ck-m-0 ck-mt-2 ck-mb-3 ck-t-support">
            Entra como solicitação e aparece na fila abaixo — confirme para ocupar a mesa.
          </p>
          <button className={`ck-btn ck-btn--primary ${saving ? 'is-loading' : ''}`} disabled={saving}>
            {saving ? 'Lançando…' : 'Lançar reserva'}
          </button>
        </form>
      )}

      {/* A "planta": cada mesa é um cartão colorido pelo estado. */}
      {tables.length === 0 ? (
        <div className="ck-empty ck-mt-5">
          <p className="ck-m-0 ck-mb-1">Nenhum camarote cadastrado.</p>
          <p className="ck-m-0 ck-t-support">Adicione o primeiro no formulário abaixo.</p>
        </div>
      ) : (
        <div className="ck-grid--sm ck-mt-5">
          {tables.map((t) => {
            const est = ESTADO[estadoDe(t)];
            const info = porMesa.get(t.name);
            const consumo = consumoPorMesa.get(t.id);
            return (
              <div key={t.id} className="ck-rel ck-p-4 ck-gap-3 ck-camarote" style={{ background: est.fundo, border: `1.5px solid ${est.borda}` }}>
                <div className="ck-between ck-ai-start">
                  <div>
                    <div className="ck-w-bold">{t.name}</div>
                    <div className="pp-muted-2 ck-meta">
                      {t.area}{t.capacity ? ` · ${t.capacity}p` : ''}
                    </div>
                  </div>
                  <div className="ck-flex ck-gap-1">
                    {/* Reservar só faz sentido em mesa livre — oferecer o
                        botão numa mesa ocupada convida ao erro de reservar
                        por cima de quem já está sentado. */}
                    {estadoDe(t) === 'livre' && (
                      <button className="ck-iconbtn ck-iconbtn--sm" onClick={() => { setReservando(t.id); setError(''); }}
                        title={`Reservar ${t.name}`} aria-label={`Reservar ${t.name}`}>
                        <Icon name="plus" size={13} />
                      </button>
                    )}
                    <button className="ck-iconbtn ck-iconbtn--sm" onClick={() => removeTable(t)} title={`Excluir ${t.name}`} aria-label={`Excluir ${t.name}`}>
                      <Icon name="close" size={13} />
                    </button>
                  </div>
                </div>
                <div className="ck-mt-auto">
                  {info ? (
                    <>
                      <div className="ck-t-support ck-w-semi">{info.reserva.name}</div>
                      <div className="ck-t-label pp-mono pp-muted-2 ck-mt-1">
                        {info.reserva.party_size ? `${info.reserva.party_size} pessoas` : ''}
                        {info.estado === 'ocupada' && info.reserva.seated_at ? ` · há ${ocupadaHa(info.reserva.seated_at)}` : ''}
                      </div>
                    </>
                  ) : (
                    <div className="ck-t-support pp-muted-2">
                      {t.min_spend_cents ? `consumação ${brl(t.min_spend_cents)}` : 'sem consumação mínima'}
                    </div>
                  )}
                  {/* Consumo em aberto vem do quadro do garçom (pedidos pagos
                      ainda não retirados) — é o número que diz se a mesa
                      "já se pagou". */}
                  {consumo?.consumo_cents > 0 && (
                    <button
                      onClick={() => setMesaAberta(mesaAberta === t.id ? null : t.id)}
                      aria-expanded={mesaAberta === t.id}
                      title={`Ver o que a ${t.name} consumiu`}
                      className="ck-linkbtn ck-mt-1 ck-t-support pp-mono ck-c-pulse">
                      {brl(consumo.consumo_cents)} em aberto
                    </button>
                  )}
                </div>

                {/* Painel da mesa: o quadro do garçom já devolve os ITENS,
                    não só o total — a tela usava metade do que recebia. Quem
                    está no salão precisa disso para responder "o que já veio?"
                    sem abrir o app do garçom. O valor por pessoa sai da
                    reserva; sem party_size ele some, em vez de dividir por 1
                    e afirmar que a mesa inteira é de uma pessoa só. */}
                {mesaAberta === t.id && consumo && (
                  <div className="ck-total ck-mt-1">
                    {consumo.itens?.length > 0 ? (
                      <ul className="ck-lista ck-gap-1 ck-grade">
                        {consumo.itens.map((linha, i) => (
                          <li key={`${t.id}-item-${i}`} className="ck-t-support ck-c-fg2">{linha}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="ck-t-support pp-muted-2">Sem itens detalhados.</div>
                    )}
                    {info?.reserva?.party_size > 1 && (
                      <div className="ck-t-label pp-mono pp-muted-2 ck-mt-2">
                        {brl(Math.round(consumo.consumo_cents / info.reserva.party_size))} por pessoa
                        {' '}({info.reserva.party_size})
                      </div>
                    )}
                  </div>
                )}

                <span className="ck-eyebrow ck-camarote__estado" style={{ color: est.cor }}>
                  {est.rotulo}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Cadastro de mesa/camarote. */}
      <h2 className="ck-secao">Novo camarote</h2>
      <form onSubmit={create} className="ck-card ck-w-read">
        <div className="ck-row">
          <div className="ck-field ck-m-0">
            <label htmlFor="camarotes-1" className="ck-label">Nome</label>
            <input id="camarotes-1" className="ck-input" value={form.name} onChange={set('name')} required placeholder="Camarote A" />
          </div>
          <div className="ck-field ck-m-0">
            <label htmlFor="camarotes-2" className="ck-label">Área</label>
            <input id="camarotes-2" className="ck-input" value={form.area} onChange={set('area')} placeholder="Camarote" />
          </div>
          <div className="ck-field ck-m-0">
            <label htmlFor="camarotes-3" className="ck-label">Capacidade</label>
            <input id="camarotes-3" className="ck-input" type="number" min="1" value={form.capacity} onChange={set('capacity')} placeholder="—" />
          </div>
          <div className="ck-field ck-m-0">
            <label htmlFor="camarotes-4" className="ck-label">Consumação mín. (R$)</label>
            <input id="camarotes-4" className="ck-input" type="number" min="0" step="0.01" value={form.min_reais} onChange={set('min_reais')} placeholder="0,00" />
          </div>
        </div>
        <button className="ck-btn ck-btn--primary ck-mt-3" disabled={saving || !form.name.trim()}>
          {saving ? 'Adicionando…' : '+ Adicionar camarote'}
        </button>
      </form>

      {/* Fila de reservas. As pendentes primeiro no título: são elas que
          têm gente esperando resposta no WhatsApp. */}
      <h2 className="ck-secao">
        Solicitações de reserva
        {pendentes.length > 0 && (
          <span className="ck-badge ck-badge--warning ck-ml-3 ck-vmid">
            {pendentes.length} aguardando
          </span>
        )}
      </h2>
      <div className="ck-card ck-card--flush">
        <table className="ck-table">
          <thead><tr><th>Cliente</th><th>Camarote</th><th>Pessoas</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.name}
                  {/* A ocasião muda o atendimento: mesa de aniversário ganha
                      o bolo na hora certa. Fica ao lado do nome, não escondida
                      num campo de observação que ninguém abre no meio da
                      noite. */}
                  {r.ocasiao && <span className="ck-ocasiao">{r.ocasiao}</span>}
                  <div className="pp-muted-2 ck-t-support">{r.contact}</div>
                </td>
                <td>{r.event_tables?.name ?? '—'}</td>
                <td>{r.party_size ?? '—'}</td>
                <td>
                  <span className={`ck-badge ${
                    r.status === 'seated' ? 'ck-badge--live'
                      : r.status === 'confirmed' ? 'ck-badge--published'
                        : r.status === 'rejected' ? 'ck-badge--draft' : ''}`}>
                    {RES_LABEL[r.status] ?? r.status}
                  </span>
                  {/* "Confirmada" e "chegou" são perguntas diferentes.
                      Confirmada e vazia às 2h é mesa que pode ser liberada;
                      ocupada há três horas é mesa que já consumiu. */}
                  {r.seated_at && (
                    <div className="ck-ocupada">há {ocupadaHa(r.seated_at)}</div>
                  )}
                </td>
                <td className="ck-right">
                  <div className="ck-flex ck-gap-2 ck-jc-end pp-wrap">
                    {r.status === 'requested' && (
                      <>
                        <button className="ck-btn ck-btn--primary ck-btn--sm" onClick={() => setRes(r, 'confirmed')}>Confirmar</button>
                        <button className="ck-btn ck-btn--glass ck-btn--sm" onClick={() => setRes(r, 'rejected')}>Recusar</button>
                      </>
                    )}
                    {r.status === 'confirmed' && (
                      <button className="ck-btn ck-btn--primary ck-btn--sm" onClick={() => setRes(r, 'seated')}>
                        Chegou
                      </button>
                    )}
                    {r.status === 'seated' && (
                      <button className="ck-btn ck-btn--glass ck-btn--sm" onClick={() => setRes(r, 'cancelled')}>
                        Liberar mesa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {reservations.length === 0 && <tr><td colSpan={5} className="pp-muted">Nenhuma solicitação ainda. Divulgue a página pública do evento para receber pedidos de reserva.</td></tr>}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
