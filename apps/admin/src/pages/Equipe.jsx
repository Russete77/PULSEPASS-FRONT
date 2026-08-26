import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import Confirmar from '@pulsepass/shared/Confirmar';
import { api } from '../lib/api.js';

const ROLES = [
  { value: 'manager', label: 'Gerente (tudo do evento)' },
  { value: 'door', label: 'Porta (check-in)' },
  { value: 'bar', label: 'Bar / PDV' },
];
const ROLE_CURTO = { manager: 'Gerente', door: 'Porta', bar: 'Bar' };

/** Rótulos legíveis. "boxoffice:refund" não diz nada a quem não escreveu o código. */
const ROTULO = {
  'door:checkin': 'Fazer check-in na porta',
  'door:reentry': 'Autorizar reentrada',
  'door:guests': 'Ver e marcar a lista de convidados',
  'bar:pdv': 'Operar o PDV do bar',
  'bar:kds': 'Ver a fila da cozinha',
  'bar:waiter': 'Lançar pedido em mesa',
  'bar:menu': 'Editar o cardápio',
  'boxoffice:sell': 'Vender na bilheteria',
  'boxoffice:refund': 'Estornar venda da bilheteria',
  'tables:manage': 'Gerir camarotes e reservas',
  'coupons:manage': 'Criar e desativar cupons',
  'finance:view': 'Ver o financeiro do evento',
  'finance:withdraw': 'Solicitar repasse',
};

const inicialDe = (m) => (m?.profiles?.full_name || m?.profiles?.email || '?').trim()[0]?.toUpperCase() ?? '?';

export default function Equipe() {
  const { id } = useParams();
  const [staff, setStaff] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('door');
  const [busy, setBusy] = useState(false);
  const [aRemover, setARemover] = useState(null);   // membro aguardando confirmação
  const [catalogo, setCatalogo] = useState([]);    // as 13 permissões
  const [abertoId, setAbertoId] = useState(null);  // membro selecionado no detalhe

  async function load() {
    try { setStaff(await api.listStaff(id)); setStatus('done'); }
    catch (e) { setError(e.message); setStatus('error'); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);
  // O catálogo vem do servidor: repetir a lista aqui a faria divergir da que
  // o banco aceita no primeiro dia em que alguém acrescentar uma permissão.
  useEffect(() => { api.permissoesCatalogo().then(setCatalogo).catch(() => {}); }, []);

  // Sem seleção (ou seleção removida), o detalhe mostra o primeiro da lista —
  // é o comportamento do mockup: a tela nunca fica com o painel vazio à toa.
  const selecionado = useMemo(
    () => staff.find((s) => s.id === abertoId) ?? staff[0] ?? null,
    [staff, abertoId],
  );

  async function add(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api.addStaff(id, email.trim(), role);
      setEmail('');
      await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function remove(staffId) {
    await api.removeStaff(id, staffId);
    if (abertoId === staffId) setAbertoId(null);
    await load();
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">evento · equipe {staff.length > 0 && `· ${staff.length} pessoa${staff.length === 1 ? '' : 's'}`}</div>
      <h1 className="ck-h1">Quem opera <span className="pp-accent">com você</span></h1>
      <p className="ck-sub">Delegue acesso por papel: gerente, porta ou bar. O dono sempre tem acesso total.</p>

      {/* Convite: a ação principal da tela, acima da lista como no mockup. */}
      <div className="ck-panel ck-w-read">
        <form onSubmit={add} className="ck-flex ck-gap-3 pp-wrap ck-ai-end">
          <div className="ck-field ck-m-0 ck-flex1 ck-fit--lg">
            <label htmlFor="equipe-1" className="ck-label">E-mail (já cadastrado no PulsePass)</label>
            <input id="equipe-1" className="ck-input" type="email" autoComplete="email" inputMode="email" autoCapitalize="off" autoCorrect="off" spellCheck="false" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="pessoa@email.com" />
          </div>
          <div className="ck-field ck-m-0">
            <label htmlFor="equipe-2" className="ck-label">Papel</label>
            <select id="equipe-2" className="ck-select" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <button className="ck-btn ck-btn--primary" disabled={busy || !email.trim()}>
            <Icon name="plus" size={16} /> {busy ? 'Adicionando…' : 'Convidar'}
          </button>
        </form>
        {error && <ErrorBox>{error}</ErrorBox>}
      </div>

      {staff.length === 0 ? (
        <div className="pp-empty ck-mt-5">
          <div className="pp-empty__icon"><Icon name="users" size={28} /></div>
          <div className="pp-empty__title">Ninguém na equipe ainda</div>
          <p>Só o dono opera o evento. Convide a primeira pessoa no formulário acima.</p>
        </div>
      ) : (
        /* Lista + detalhe, a divisão do TeamStaffScreen. */
        <div className="ck-team ck-mt-5">
          <nav className="ck-panel ck-p-0 ck-hidden" aria-label="Membros da equipe">
            {staff.map((s) => (
              <button
                key={s.id} type="button"
                className={`ck-member ${selecionado?.id === s.id ? 'is-on' : ''}`}
                aria-current={selecionado?.id === s.id}
                onClick={() => setAbertoId(s.id)}
              >
                <span className="ck-avatar" aria-hidden="true">{inicialDe(s)}</span>
                <span className="pp-grow ck-min0">
                  <span className="pp-truncate ck-block ck-w-semi ck-t-support">
                    {s.profiles?.full_name || s.profiles?.email}
                  </span>
                  <span className="pp-muted ck-meta">
                    {ROLE_CURTO[s.role] ?? s.role}
                    {s.permissoes?.length ? ` · +${s.permissoes.length} permiss${s.permissoes.length === 1 ? 'ão' : 'ões'}` : ''}
                  </span>
                </span>
                <Icon name="chevronRight" size={14} aria-hidden="true" />
              </button>
            ))}
          </nav>

          {selecionado && (
            <DetalheMembro
              key={selecionado.id}
              eventId={id}
              membro={selecionado}
              catalogo={catalogo}
              onSalvo={load}
              onRemover={() => setARemover(selecionado)}
            />
          )}
        </div>
      )}

      {/* Tirar alguém da equipe DURANTE o evento derruba o acesso na hora: o
          porteiro para de validar ingresso no meio da fila. Por isso o
          diálogo diz o papel, e não só o nome. */}
      <Confirmar
        aberto={!!aRemover}
        titulo="Remover da equipe?"
        descricao={
          `${aRemover?.profiles?.full_name || aRemover?.profiles?.email} perde o acesso de `
          + `"${ROLES.find((r) => r.value === aRemover?.role)?.label ?? aRemover?.role}" imediatamente. `
          + 'Se o evento estiver rolando, a tela dessa pessoa para de funcionar na hora — '
          + 'toda chamada verifica a equipe no banco, então remover aqui já corta o acesso, '
          + 'mesmo que ela continue com o app aberto. '
          + 'Você pode adicionar de volta depois.'
        }
        confirmar="Remover acesso"
        onConfirmar={() => remove(aRemover.id)}
        onFechar={() => setARemover(null)}
      />
    </Shell>
  );
}

/**
 * Detalhe do membro: perfil + matriz de permissões INLINE (antes era modal).
 *
 * A matriz existe porque o papel sozinho força escolhas ruins: para o gerente
 * de bar ver o financeiro, era preciso promovê-lo a manager — e aí ele passava
 * a poder despublicar o evento.
 */
function DetalheMembro({ eventId, membro, catalogo, onSalvo, onRemover }) {
  const [marcadas, setMarcadas] = useState(membro.permissoes ?? []);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const alternar = (p) => setMarcadas((m) => (m.includes(p) ? m.filter((x) => x !== p) : [...m, p]));
  // Dirty = há diferença entre o rascunho e o que está salvo no servidor.
  const originais = membro.permissoes ?? [];
  const mudou = marcadas.length !== originais.length || marcadas.some((p) => !originais.includes(p));

  async function salvar() {
    setSalvando(true); setErro('');
    try { await api.setStaffPermissoes(eventId, membro.id, marcadas); await onSalvo(); }
    catch (e) { setErro(e.message); } finally { setSalvando(false); }
  }

  const nome = membro.profiles?.full_name || membro.profiles?.email;

  return (
    <section className="pp-stack pp-stack-4" aria-label={`Detalhe de ${nome}`}>
      {/* Perfil — cabeçalho do detalhe no desenho do mockup. Sem "online",
          "2FA" ou "última atividade": o backend não devolve nada disso. */}
      <div className="ck-panel pp-row ck-gap-4 pp-wrap">
        <span className="ck-avatar ck-avatar--lg" aria-hidden="true">{inicialDe(membro)}</span>
        <div className="pp-grow ck-fit">
          <div className="ck-display ck-w-bold ck-t-section">{nome}</div>
          <div className="pp-mono pp-muted ck-meta">{membro.profiles?.email}</div>
          <div className="ck-mt-2">
            <span className="ck-badge">{ROLES.find((r) => r.value === membro.role)?.label ?? membro.role}</span>
          </div>
        </div>
        {/* Ação destrutiva não pode ter a mesma cara de "Salvar": quem opera
            com pressa clica pela posição. */}
        <button className="ck-btn ck-btn--danger ck-btn--sm" onClick={onRemover}>Remover</button>
      </div>

      {/* Matriz granular */}
      <div className="ck-panel">
        <div className="pp-between">
          <div className="ck-panel__title">Permissões · matriz granular</div>
          <span className="pp-mono pp-muted ck-t-support">
            {marcadas.length} de {catalogo.length} ativas
          </span>
        </div>
        <p className="pp-muted ck-t-support ck-m-0 ck-mt-1 ck-mb-4">
          O papel <b>{ROLES.find((r) => r.value === membro.role)?.label ?? membro.role}</b> já
          dá o acesso padrão. Marque só o que essa pessoa precisa ALÉM disso.
        </p>

        <div className="ck-permgrid">
          {catalogo.map((p) => (
            <label key={p} className={`ck-perm ${marcadas.includes(p) ? 'is-on' : ''}`}>
              <input type="checkbox" checked={marcadas.includes(p)} onChange={() => alternar(p)} />
              <span>
                {ROTULO[p] ?? p}
                <em className="ck-perm__code">{p}</em>
              </span>
            </label>
          ))}
        </div>

        {erro && <ErrorBox>{erro}</ErrorBox>}

        <div className="pp-row ck-mt-4 ck-jc-end">
          {mudou && (
            <button className="ck-btn ck-btn--ghost ck-btn--sm" onClick={() => setMarcadas(originais)} disabled={salvando}>
              Descartar
            </button>
          )}
          <button className="ck-btn ck-btn--primary" onClick={salvar} disabled={salvando || !mudou}>
            {salvando ? 'Salvando…' : `Salvar${marcadas.length > 0 ? ` · ${marcadas.length}` : ''}`}
          </button>
        </div>
      </div>
    </section>
  );
}
