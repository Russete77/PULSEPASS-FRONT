import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBox } from '../components/Shell.jsx';
import { BrandWordmark } from '@pulsepass/shared/Logo';
import CampoSenha from '@pulsepass/shared/CampoSenha';

/* Título por modo, com a assinatura serifada do design-system. Os cards de
   "detectamos seus acessos" e os métodos Face ID/e-mail do mockup NÃO entram:
   o backend não detecta papel por CPF nem tem WebAuthn — só e-mail e senha. */
const TITULO = {
  login: <>Quem opera, <span className="pp-accent">entra por aqui.</span></>,
  signup: <>Sua produtora <span className="pp-accent">começa agora.</span></>,
  forgot: <>Vamos <span className="pp-accent">recuperar o acesso.</span></>,
};

export default function Login() {
  const { signIn, signUp, resetPassword, authEnabled } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? '/';

  const [mode, setMode] = useState('login'); // login | signup | forgot
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(''); setInfo('');
    try {
      if (mode === 'forgot') {
        const { error: err } = await resetPassword(email);
        if (err) throw err;
        setInfo('Link de redefinição enviado para o seu e-mail.');
      } else if (mode === 'login') {
        const { error: err } = await signIn(email, password);
        if (err) throw err;
        navigate(redirectTo, { replace: true });
      } else {
        const { error: err, needsConfirmation } = await signUp(email, password, fullName);
        if (err) throw err;
        if (needsConfirmation) setInfo('Conta criada! Confirme seu e-mail para entrar.');
        else navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(err.message ?? 'Falha na autenticação');
    } finally { setBusy(false); }
  }

  const trocar = (m) => { setMode(m); setError(''); setInfo(''); };

  return (
    <div className="ck-login">
      {/* Atmosfera da marca — o mesmo fundo aurora das telas do cliente. */}
      <div className="pp-aurora-fixed" aria-hidden="true" />

      <div className="ck-login__box pp-reveal">
        {/* Marca centrada, como no mockup de identificação. */}
        <div className="ck-login__brand">
          <BrandWordmark size={48} tag="OS" fontSize={26} />
          <div>
            <div className="ck-eyebrow">cockpit · produtora</div>
            <h1 className="ck-login__title">{TITULO[mode]}</h1>
          </div>
        </div>

        <div className="ck-card" style={{ padding: 'var(--pp-s-6)' }}>
          {!authEnabled && <ErrorBox>Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env</ErrorBox>}
          {info && <div className="ck-error" style={{ background: 'rgba(0,255,133,0.08)', borderColor: 'rgba(0,255,133,0.3)', color: 'var(--pp-pulse)' }}>{info}</div>}

          {/* name + autoComplete não são enfeite: sem eles o gerenciador de senha
              não oferece preencher nem se oferece pra salvar — e a produtora
              digita e-mail e senha na mão toda vez que abre o cockpit. */}
          <form onSubmit={submit}>
            {mode === 'signup' && (
              <div className="ck-field"><label className="ck-label" htmlFor="lg-nome">Nome</label>
                <input id="lg-nome" name="name" autoComplete="name" className="ck-input"
                  value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
            )}
            <div className="ck-field"><label className="ck-label" htmlFor="lg-email">E-mail</label>
              {/* autoCapitalize/autoCorrect off: sem isso o iOS capitaliza a
                  primeira letra do e-mail e o login falha sem dizer por quê. */}
              <input id="lg-email" name="email" type="email" autoComplete="email"
                autoFocus inputMode="email" className="ck-input"
                autoCapitalize="off" autoCorrect="off" spellCheck="false"
                value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            {mode !== 'forgot' && (
              /* current-password no login, new-password no cadastro: é o que faz
                 o navegador sugerir senha forte só onde faz sentido. */
              <CampoSenha
                id="lg-senha" className="ck-input" classeRotulo="ck-label" classeCampo="ck-field"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                valor={password} aoMudar={(e) => setPassword(e.target.value)}
              />
            )}
            {error && <ErrorBox>{error}</ErrorBox>}
            {/* CTA em bloco, o peso do botão "Continuar" do mockup. */}
            <button className="ck-btn ck-btn--primary" style={{ width: '100%', marginTop: 8, height: 52 }} disabled={busy || !authEnabled}>
              {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar no cockpit' : mode === 'signup' ? 'Criar conta' : 'Enviar link'}
            </button>
          </form>

          <div className="pp-authfoot" style={{ marginTop: 12, textAlign: 'center', color: 'var(--pp-fg-3)', fontSize: 14, display: 'flex', flexDirection: 'column' }}>
            {mode === 'login' && (
              <>
                <button className="pp-link pp-link--muted" onClick={() => trocar('forgot')}>Esqueci minha senha</button>
                <span>Não tem conta? <button className="pp-link" onClick={() => trocar('signup')}>Criar</button></span>
              </>
            )}
            {mode !== 'login' && (
              <button className="pp-link" onClick={() => trocar('login')}>Voltar ao login</button>
            )}
          </div>
        </div>

        {/* O caminho do cliente, no lugar do lembrete "Produtora ou ADM?" do
            mockup — aqui é o inverso: quem compra ingresso não é daqui. */}
        <p className="pp-muted-2" style={{ textAlign: 'center', fontSize: 'var(--pp-fs-12)', marginTop: 'var(--pp-s-5)' }}>
          Procurando seus ingressos? Este é o cockpit da produtora — compre e
          acesse ingressos no app PulsePass.
        </p>
      </div>
    </div>
  );
}
