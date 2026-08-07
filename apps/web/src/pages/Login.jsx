import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { ErrorBox } from '../components/States.jsx';
import CampoSenha from '@pulsepass/shared/CampoSenha';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { signInWithPassword, signUp, resetPassword, authEnabled } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? '/meus-ingressos';

  const [mode, setMode] = useState('login'); // login | signup | forgot
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  function switchMode(next) {
    setMode(next);
    setError('');
    setInfo('');
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(''); setInfo('');
    try {
      if (mode === 'forgot') {
        const { error: err } = await resetPassword(email);
        if (err) throw err;
        setInfo('Enviamos um link de redefinição para o seu e-mail.');
      } else if (mode === 'login') {
        const { error: err } = await signInWithPassword(email, password);
        if (err) throw err;
        navigate(redirectTo, { replace: true });
      } else {
        const { error: err, needsConfirmation } = await signUp(email, password, { fullName, cpf, phone });
        if (err) throw err;
        if (needsConfirmation) setInfo('Conta criada! Confirme seu e-mail para entrar.');
        else navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(err.message ?? 'Falha na autenticação');
    } finally {
      setBusy(false);
    }
  }


  const titles = { login: 'Bem-vindo de volta', signup: 'Crie sua conta', forgot: 'Recuperar senha' };
  const cta = { login: 'Entrar', signup: 'Criar conta', forgot: 'Enviar link' };

  return (
    <Page>
      <div className="pp-authwrap">
        <div className="pp-card pp-authcard pp-reveal">
          <div className="pp-eyebrow">
            {mode === 'signup' ? 'criar conta' : mode === 'forgot' ? 'recuperar' : 'entrar'}
          </div>
          <h1>{titles[mode]}</h1>

          {mode !== 'forgot' && (
            <div className="pp-segmented pp-btn--block" style={{ display: 'flex', marginTop: 'var(--pp-s-4)' }}>
              <button type="button" className={`pp-grow ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>Entrar</button>
              <button type="button" className={`pp-grow ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')}>Criar conta</button>
            </div>
          )}

          {!authEnabled && (
            <div style={{ marginTop: 'var(--pp-s-4)' }}>
              <ErrorBox>Auth desativado: configure <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>.</ErrorBox>
            </div>
          )}
          {info && <div className="pp-note pp-note--pulse" style={{ marginTop: 'var(--pp-s-4)', color: 'var(--pp-pulse)' }}>{info}</div>}

          <form onSubmit={submit} className="pp-stack" style={{ marginTop: 'var(--pp-s-5)' }}>
            {/* Aqui a maioria compra pelo celular, com pressa, muitas vezes na
                fila. Cada campo declara o que é (autoComplete) e que teclado
                pedir (inputMode) — é a diferença entre tocar uma vez e digitar
                onze dígitos procurando os números num teclado de letras. */}
            {mode === 'signup' && (
              <>
                <div className="pp-field"><label className="pp-label" htmlFor="ac-nome">Nome completo</label>
                  <input id="ac-nome" name="name" autoComplete="name" className="pp-input"
                    value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
                <div className="pp-field"><label className="pp-label" htmlFor="ac-cpf">CPF</label>
                  <input id="ac-cpf" name="cpf" className="pp-input" value={cpf}
                    onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" inputMode="numeric" /></div>
                <div className="pp-field"><label className="pp-label" htmlFor="ac-fone">Telefone</label>
                  <input id="ac-fone" name="tel" type="tel" autoComplete="tel" inputMode="tel"
                    className="pp-input" value={phone}
                    onChange={(e) => setPhone(e.target.value)} placeholder="(11) 90000-0000" /></div>
              </>
            )}
            <div className="pp-field"><label className="pp-label" htmlFor="ac-email">E-mail</label>
              <input id="ac-email" name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="off" autoCorrect="off" spellCheck="false"
                autoFocus className="pp-input"
                value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            {mode !== 'forgot' && (
              <CampoSenha
                id="ac-senha"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                valor={password} aoMudar={(e) => setPassword(e.target.value)}
              />
            )}

            {error && <ErrorBox>{error}</ErrorBox>}

            <button className={`pp-btn pp-btn--primary pp-btn--block pp-btn--lg ${busy ? 'is-loading' : ''}`} disabled={busy || !authEnabled}>
              {cta[mode]}
            </button>
          </form>

          <div className="pp-authfoot">
            {mode === 'login' && (
              <>
                <button type="button" className="pp-link pp-link--muted" onClick={() => switchMode('forgot')}>Esqueci minha senha</button>
                <span>Não tem conta? <button type="button" className="pp-link" onClick={() => switchMode('signup')}>Criar agora</button></span>
              </>
            )}
            {mode !== 'login' && (
              <button type="button" className="pp-link" onClick={() => switchMode('login')}>Voltar ao login</button>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}
