import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBox } from '../components/Shell.jsx';
import CampoSenha from '@pulsepass/shared/CampoSenha';

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


  const titles = { login: 'Entrar', signup: 'Criar conta', forgot: 'Recuperar senha' };

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div className="ck-card" style={{ width: '100%', maxWidth: 420, padding: 'var(--pp-s-8)' }}>
        <div className="ck-eyebrow">cockpit · produtora</div>
        <h1 className="ck-h1" style={{ fontSize: 'var(--pp-fs-28)' }}>{titles[mode]}</h1>

        {!authEnabled && <ErrorBox>Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env</ErrorBox>}
        {info && <div className="ck-error" style={{ background: 'rgba(0,255,133,0.08)', borderColor: 'rgba(0,255,133,0.3)', color: 'var(--pp-pulse)' }}>{info}</div>}

        {/* name + autoComplete não são enfeite: sem eles o gerenciador de senha
            não oferece preencher nem se oferece pra salvar — e a produtora
            digita e-mail e senha na mão toda vez que abre o cockpit. */}
        <form onSubmit={submit} style={{ marginTop: 16 }}>
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
          <button className="ck-btn ck-btn--primary" style={{ width: '100%', marginTop: 8 }} disabled={busy || !authEnabled}>
            {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar link'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', color: 'var(--pp-fg-3)', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {mode === 'login' && (
            <>
              <button className="ck-btn ck-btn--ghost" style={{ height: 'auto', padding: 0 }} onClick={() => { setMode('forgot'); setError(''); setInfo(''); }}>Esqueci minha senha</button>
              <span>Não tem conta? <button className="ck-btn ck-btn--ghost" style={{ height: 'auto', padding: 0, color: 'var(--pp-pulse)' }} onClick={() => { setMode('signup'); setError(''); setInfo(''); }}>Criar</button></span>
            </>
          )}
          {mode !== 'login' && (
            <button className="ck-btn ck-btn--ghost" style={{ height: 'auto', padding: 0, color: 'var(--pp-pulse)' }} onClick={() => { setMode('login'); setError(''); setInfo(''); }}>Voltar ao login</button>
          )}
        </div>
      </div>
    </div>
  );
}
