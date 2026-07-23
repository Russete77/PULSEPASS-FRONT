import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox, Empty } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

export default function CamarotesPublic() {
  const { slug } = useParams();
  const [tables, setTables] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [form, setForm] = useState({ name: '', contact: '', party_size: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    api.listEventTables(slug)
      .then((d) => { setTables(d.tables); setStatus('done'); })
      .catch((e) => { setError(e.message); setStatus('error'); });
  }, [slug]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function reserve(t) {
    setBusy(true); setError('');
    try {
      await api.reserveTable(t.id, {
        name: form.name.trim(),
        contact: form.contact.trim() || undefined,
        party_size: form.party_size !== '' ? Math.round(Number(form.party_size)) : null,
      });
      setDone(t.id); setOpenId(null); setForm({ name: '', contact: '', party_size: '' });
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  if (status === 'loading') return <Page><Loading /></Page>;
  if (status === 'error') return <Page><ErrorBox>{error}</ErrorBox></Page>;

  return (
    <Page>
      <div className="pp-stack pp-stack-5 pp-reveal" style={{ maxWidth: 560 }}>
        <div>
          <Link to={`/eventos/${slug}`} className="pp-btn pp-btn--glass pp-btn--sm" style={{ marginBottom: 'var(--pp-s-4)' }}>
            <Icon name="arrowLeft" size={16} /> Voltar ao evento
          </Link>
          <div className="pp-eyebrow">reserva</div>
          <h1>Camarotes &amp; mesas</h1>
          <p className="sub" style={{ margin: '4px 0 0' }}>Solicite sua reserva — a produtora confirma o pedido.</p>
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}
        {tables.length === 0 && (
          <Empty>
            <div className="pp-empty__icon"><Icon name="sofa" size={30} /></div>
            <div className="pp-empty__title">Sem camarotes por enquanto</div>
            <p>Este evento ainda não abriu camarotes ou mesas.</p>
          </Empty>
        )}

        {tables.map((t) => (
          <div key={t.id} className="pp-card pp-card--pad">
            <div className="pp-between" style={{ alignItems: 'flex-start' }}>
              <div className="pp-row" style={{ alignItems: 'flex-start' }}>
                <div className="pp-order__thumb"><Icon name="sofa" size={20} /></div>
                <div>
                  <div style={{ fontWeight: 600, fontFamily: 'var(--pp-font-display)', fontSize: 'var(--pp-fs-16)' }}>{t.name}</div>
                  <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-13)', marginTop: 3 }}>
                    {t.area}{t.capacity ? ` · até ${t.capacity} pessoas` : ''}
                  </div>
                  {t.min_spend_cents ? (
                    <div className="pp-price" style={{ fontSize: 'var(--pp-fs-13)', marginTop: 4 }}>
                      consumação mín. {brl(t.min_spend_cents)}
                    </div>
                  ) : null}
                </div>
              </div>
              {done === t.id ? (
                <span className="pp-badge pp-badge--pulse"><Icon name="check" size={13} /> Solicitada</span>
              ) : (
                <button className="pp-btn pp-btn--glass pp-btn--sm" onClick={() => setOpenId(openId === t.id ? null : t.id)}>
                  {openId === t.id ? 'Cancelar' : 'Reservar'}
                </button>
              )}
            </div>

            {openId === t.id && (
              <div className="pp-stack" style={{ marginTop: 'var(--pp-s-4)' }}>
                <div className="pp-field"><label className="pp-label">Seu nome</label>
                  <input className="pp-input" value={form.name} onChange={set('name')} required minLength={2} /></div>
                <div className="pp-field"><label className="pp-label">Contato (WhatsApp/e-mail)</label>
                  <input className="pp-input" value={form.contact} onChange={set('contact')} placeholder="(11) 90000-0000" /></div>
                <div className="pp-field"><label className="pp-label">Nº de pessoas</label>
                  <input className="pp-input" type="number" min="1" value={form.party_size} onChange={set('party_size')} /></div>
                <button className={`pp-btn pp-btn--primary pp-btn--block ${busy ? 'is-loading' : ''}`} disabled={busy || form.name.trim().length < 2} onClick={() => reserve(t)}>
                  Solicitar reserva
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Page>
  );
}
