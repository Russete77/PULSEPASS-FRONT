import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { eventDate } from '../lib/format.js';

/**
 * Inscrição pública na lista do promoter — a cara do produto pro convidado.
 *
 * Layout segue o mockup GuestSignupScreen do design system: chip flutuante
 * do promoter no topo, herói tipográfico com o nome do evento em destaque e
 * o formulário num cartão de vidro com confirmação visual campo a campo.
 * A capa do evento (cover_url — obrigatória para publicar, ver identity)
 * entra como fundo do herói, atenuada para a tipografia continuar legível.
 */
export default function GuestSignup() {
  const { code } = useParams();
  const [list, setList] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [acompanhantes, setAcompanhantes] = useState(0);
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
      // party_size conta a PESSOA + os acompanhantes. O backend já aceitava
      // isso desde a migration de acompanhantes; faltava a tela oferecer.
      const r = await api.listSignup(code, { ...form, party_size: 1 + acompanhantes });
      setDone(r);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (status === 'loading') return <Page><Loading /></Page>;
  if (status === 'error') return <Page><ErrorBox>{error}</ErrorBox></Page>;

  const promoter = list.promoter;
  // Validação só visual (o backend revalida): o check verde por campo é o
  // que faz o formulário parecer "andando" — direto do mockup.
  const okNome = form.name.trim().length >= 2;
  const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const okFone = form.phone.trim().length >= 8;

  const regra = promoter.list_type === 'free_until'
    ? `Grátis até ${promoter.free_until ? new Date(promoter.free_until).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}`
    : promoter.list_type === 'birthday' ? 'Lista de aniversário'
      : promoter.list_type === 'vip' ? 'Lista VIP' : null;

  return (
    <Page>
      <div className="pp-reveal-group pp-folha">

        {/* Chip do promoter flutuando no topo, centralizado. A pessoa chegou
            aqui por um link de alguém que ela conhece — é esse nome que faz
            o convite parecer convite, e não anúncio. */}
        <div className="pp-row pp-centro">
          <div className="pp-convite-chip">
            <div className="pp-avatar pp-avatar--sm" aria-hidden="true">
              {promoter.name.trim().charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="pp-eyebrow">convite de</div>
              <div className="pp-convite-chip__nome">{promoter.name}</div>
            </div>
          </div>
        </div>

        {/* Herói tipográfico: data em eyebrow, nome do evento no degrau de
            cartaz, local embaixo — a ordem do mockup. A capa do evento entra
            como fundo atenuado; sem capa, o herói continua só tipográfico. */}
        <div className="pp-convite-hero">
          {list.event?.cover_url && (
            <div aria-hidden="true" className="pp-convite-hero__capa"
              style={{ backgroundImage: `url(${list.event.cover_url})` }} />
          )}
          <div className="pp-eyebrow pp-accent">
            {eventDate(list.event?.starts_at)}
          </div>
          {/* O nome do evento no papel de herói — o mesmo degrau da página
              do evento. Antes era um clamp inventado só para esta tela. */}
          <h1 className="pp-t-hero">{list.event?.title}</h1>
          {(list.event?.venue_name || list.event?.city) && (
            <p className="pp-muted pp-t-support pp-mt-3">
              {list.event?.venue_name}
              {list.event?.venue_name && list.event?.city ? ' · ' : ''}
              {list.event?.city ? `${list.event.city}/${list.event.state}` : ''}
            </p>
          )}
        </div>

        {/* Cartão de vidro com o formulário. */}
        <div className="pp-card pp-authcard pp-mt-6">
          <div className="pp-t-section">Entre na lista de {promoter.name}</div>
          {regra && (
            <span className="pp-badge pp-badge--pulse pp-mt-3">{regra}</span>
          )}

          {done ? (
            <div className="pp-success">
              <div className="pp-success__icon"><Icon name="check" size={30} strokeWidth={2.5} /></div>
              <h2>Você está na lista!</h2>
              <p className="pp-muted">
                {done.name}, sua inscrição com {promoter.name} está confirmada
                {done.party_size > 1 ? ` para ${done.party_size} pessoas` : ''}.
                Chegue cedo e apresente seu nome/documento na porta.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="pp-stack pp-mt-5">
              <CampoComCheck id="guestsignu-1" label="Nome completo" valido={okNome}>
                <input id="guestsignu-1" className="pp-input" name="name" autoComplete="name"
                  value={form.name} onChange={set('name')} required minLength={2} />
              </CampoComCheck>
              <CampoComCheck id="guestsignu-2" label="E-mail" valido={okEmail}>
                <input id="guestsignu-2" className="pp-input" type="email" autoComplete="email"
                  inputMode="email" autoCapitalize="off" autoCorrect="off" spellCheck="false"
                  value={form.email} onChange={set('email')} />
              </CampoComCheck>
              <CampoComCheck id="guestsignu-3" label="Telefone / WhatsApp" valido={okFone}>
                <input id="guestsignu-3" className="pp-input" type="tel" autoComplete="tel"
                  inputMode="tel" value={form.phone} onChange={set('phone')} placeholder="(11) 90000-0000" />
              </CampoComCheck>

              {/* Acompanhantes.
                  A porta conta PESSOAS, não nomes: quem chega com mais dois
                  sem ter avisado vira discussão na entrada. Declarar aqui é o
                  que faz a lista bater com a fila. */}
              <div className="pp-field">
                <span className="pp-label" id="lbl-acomp">Vai levar alguém?</span>
                <div className="pp-cluster-2" role="group" aria-labelledby="lbl-acomp">
                  {[0, 1, 2, 3].map((n) => (
                    <button key={n} type="button"
                      className={`pp-chip ${acompanhantes === n ? 'pp-chip--active' : ''}`}
                      aria-pressed={acompanhantes === n}
                      onClick={() => setAcompanhantes(n)}>
                      {n === 0 ? 'Só eu' : `+${n}`}
                    </button>
                  ))}
                </div>
                {acompanhantes > 0 && (
                  <p className="pp-muted pp-t-support pp-mt-2">
                    Vocês entram como {1 + acompanhantes} pessoas na lista de {promoter.name}.
                  </p>
                )}
              </div>

              {error && <ErrorBox>{error}</ErrorBox>}
              <button className={`pp-btn pp-btn--primary pp-btn--block pp-btn--lg ${busy ? 'is-loading' : ''}`}
                disabled={busy || !okNome}>
                {acompanhantes > 0 ? `Entrar na lista · ${1 + acompanhantes} pessoas` : 'Entrar na lista'}
              </button>
              <p className="pp-muted pp-tc pp-t-support pp-m0">
                Sem pagamento agora — apresente seu nome e documento na porta.
              </p>
            </form>
          )}
        </div>
      </div>
    </Page>
  );
}

/**
 * Campo com check de preenchimento à direita, como no mockup: borda esverdeia
 * e o check aparece quando o valor está ok. Só feedback — quem valida de
 * verdade é o backend.
 */
function CampoComCheck({ id, label, valido, children }) {
  return (
    <div className="pp-field">
      <label htmlFor={id} className="pp-label">{label}</label>
      <div className="pp-relativo">
        {children}
        {valido && (
          <span aria-hidden="true" className="pp-campo-ok">
            <Icon name="check" size={16} strokeWidth={2.5} />
          </span>
        )}
      </div>
    </div>
  );
}
