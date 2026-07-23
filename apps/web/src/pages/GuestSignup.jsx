import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { eventDate } from '../lib/format.js';

export default function GuestSignup() {
  const { code } = useParams();
  const [list, setList] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    api.getList(code)
      .then((d) => { setList(d); setStatus('done'); })
      .catch((e) => { setError(e.message); setStatus('error'); });
    api.listHit(code).catch(() => {}); // beacon de clique (funil do promoter)
  }, [code]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api.listSignup(code, form);
      setDone(r);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (status === 'loading') return <Page><Loading /></Page>;
  if (status === 'error') return <Page><ErrorBox>{error}</ErrorBox></Page>;

  return (
    <Page>
      <div className="pp-authwrap">
        <div className="pp-card pp-authcard pp-reveal">
          <div className="pp-eyebrow">lista · {list.promoter.name}</div>
          <h1>{list.event?.title}</h1>
          <p className="sub" style={{ margin: '4px 0 0' }}>
            {eventDate(list.event?.starts_at)}
            {list.event?.venue_name ? ` · ${list.event.venue_name}` : ''}
            {list.event?.city ? ` · ${list.event.city}/${list.event.state}` : ''}
          </p>

          {list.promoter.list_type && list.promoter.list_type !== 'standard' && (
            <span className="pp-badge pp-badge--pulse" style={{ marginTop: 'var(--pp-s-4)' }}>
              {list.promoter.list_type === 'free_until'
                ? `Grátis até ${list.promoter.free_until ? new Date(list.promoter.free_until).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}`
                : list.promoter.list_type === 'birthday' ? 'Lista de aniversário' : 'Lista VIP'}
            </span>
          )}

          {done ? (
            <div className="pp-success">
              <div className="pp-success__icon"><Icon name="check" size={30} strokeWidth={2.5} /></div>
              <h2>Você está na lista!</h2>
              <p className="pp-muted">
                {done.name}, sua inscrição com {list.promoter.name} está confirmada.
                Chegue cedo e apresente seu nome/documento na porta.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="pp-stack" style={{ marginTop: 'var(--pp-s-5)' }}>
              <div className="pp-field">
                <label className="pp-label">Nome completo</label>
                <input className="pp-input" value={form.name} onChange={set('name')} required minLength={2} />
              </div>
              <div className="pp-field">
                <label className="pp-label">E-mail</label>
                <input className="pp-input" type="email" value={form.email} onChange={set('email')} />
              </div>
              <div className="pp-field">
                <label className="pp-label">Telefone / WhatsApp</label>
                <input className="pp-input" value={form.phone} onChange={set('phone')} placeholder="(11) 90000-0000" />
              </div>
              {error && <ErrorBox>{error}</ErrorBox>}
              <button className={`pp-btn pp-btn--primary pp-btn--block pp-btn--lg ${busy ? 'is-loading' : ''}`} disabled={busy || form.name.trim().length < 2}>
                Entrar na lista
              </button>
            </form>
          )}
        </div>
      </div>
    </Page>
  );
}
