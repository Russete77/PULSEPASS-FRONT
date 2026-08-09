import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import Confirmar from '@pulsepass/shared/Confirmar';
import { api } from '../lib/api.js';

const ROLES = [
  { value: 'manager', label: 'Gerente (tudo do evento)' },
  { value: 'door', label: 'Porta (check-in)' },
  { value: 'bar', label: 'Bar / PDV' },
];

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
  const [abrindoPerms, setAbrindoPerms] = useState(null);

  async function load() {
    try { setStaff(await api.listStaff(id)); setStatus('done'); }
    catch (e) { setError(e.message); setStatus('error'); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);
  // O catálogo vem do servidor: repetir a lista aqui a faria divergir da que
  // o banco aceita no primeiro dia em que alguém acrescentar uma permissão.
  useEffect(() => { api.permissoesCatalogo().then(setCatalogo).catch(() => {}); }, []);

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
    await load();
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">evento · equipe</div>
      <h1 className="ck-h1">Equipe do evento</h1>
      <p className="ck-sub">Delegue acesso por papel: gerente, porta ou bar. O dono sempre tem acesso total.</p>

      <div className="ck-card" style={{ maxWidth: 560 }}>
        <form onSubmit={add} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="ck-field" style={{ flex: '1 1 220px', margin: 0 }}>
            <label htmlFor="equipe-1" className="ck-label">E-mail (já cadastrado no PulsePass)</label>
            <input id="equipe-1" className="ck-input" type="email" autoComplete="email" inputMode="email" autoCapitalize="off" autoCorrect="off" spellCheck="false" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="pessoa@email.com" />
          </div>
          <div className="ck-field" style={{ margin: 0 }}>
            <label htmlFor="equipe-2" className="ck-label">Papel</label>
            <select id="equipe-2" className="ck-select" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <button className="ck-btn ck-btn--primary" disabled={busy || !email.trim()}>
            {busy ? 'Adicionando…' : 'Adicionar'}
          </button>
        </form>
        {error && <ErrorBox>{error}</ErrorBox>}
      </div>

      <div className="ck-card" style={{ maxWidth: 560, marginTop: 16 }}>
        {staff.length === 0 ? (
          <p style={{ color: 'var(--pp-fg-3)' }}>Ninguém na equipe ainda. Só o dono opera o evento.</p>
        ) : (
          <table className="ck-table">
            <thead><tr><th>Pessoa</th><th>Papel</th><th></th></tr></thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.profiles?.full_name || s.profiles?.email}
                    <br /><span style={{ color: 'var(--pp-fg-4)', fontSize: 12 }}>{s.profiles?.email}</span>
                  </td>
                  <td>
                    {ROLES.find((r) => r.value === s.role)?.label ?? s.role}
                    {/* Quantas permissões extras a pessoa tem além do papel.
                        O papel dá o padrão; isto é o ajuste fino por cima. */}
                    <button className="ck-permlink" onClick={() => setAbrindoPerms(s)}>
                      {s.permissoes?.length
                        ? `${s.permissoes.length} de ${catalogo.length} permissões`
                        : 'só o papel padrão'}
                    </button>
                  </td>
                  {/* Ação destrutiva não pode ter a mesma cara de "Ativar" ou
                      "Editar": quem opera com pressa clica pela posição. */}
                  <td>
                    <button className="ck-btn ck-btn--danger-soft" onClick={() => setARemover(s)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Tirar alguém da equipe DURANTE o evento derruba o acesso na hora: o
          porteiro para de validar ingresso no meio da fila. Por isso o
          diálogo diz o papel, e não só o nome. */}
      {abrindoPerms && (
        <Permissoes
          eventId={id} membro={abrindoPerms} catalogo={catalogo}
          onFechar={() => setAbrindoPerms(null)}
          onSalvo={() => { setAbrindoPerms(null); load(); }}
        />
      )}

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

/**
 * Matriz de permissões.
 *
 * Existe porque o papel sozinho força escolhas ruins: para o gerente de bar
 * ver o financeiro, era preciso promovê-lo a manager — e aí ele passava a
 * poder despublicar o evento. Ou alguém empresta a conta da produtora, que é
 * como o controle de acesso morre de verdade na noite do evento.
 */
function Permissoes({ eventId, membro, catalogo, onFechar, onSalvo }) {
  const [marcadas, setMarcadas] = useState(membro.permissoes ?? []);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const alternar = (p) => setMarcadas((m) => (m.includes(p) ? m.filter((x) => x !== p) : [...m, p]));

  async function salvar() {
    setSalvando(true); setErro('');
    try { await api.setStaffPermissoes(eventId, membro.id, marcadas); onSalvo(); }
    catch (e) { setErro(e.message); } finally { setSalvando(false); }
  }

  return (
    <div className="pp-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div className="pp-modal pp-modal--lg" role="dialog" aria-modal="true"
        aria-label={`Permissões de ${membro.profiles?.full_name || membro.profiles?.email}`}>
        <div className="pp-modal__head">
          <h2 className="pp-modal__title">
            Permissões · {membro.profiles?.full_name || membro.profiles?.email}
          </h2>
        </div>
        <div className="pp-modal__body">
          <p style={{ color: 'var(--pp-fg-3)', fontSize: 14, margin: '0 0 16px' }}>
            O papel <b>{ROLES.find((r) => r.value === membro.role)?.label ?? membro.role}</b> já
            dá o acesso padrão. Marque abaixo só o que essa pessoa precisa ALÉM disso.
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
        </div>
        <div className="pp-modal__foot">
          <button className="pp-btn pp-btn--ghost" onClick={onFechar} disabled={salvando}>Cancelar</button>
          <button className={`pp-btn pp-btn--primary ${salvando ? 'is-loading' : ''}`}
            onClick={salvar} disabled={salvando}>
            Salvar {marcadas.length > 0 ? `· ${marcadas.length}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
