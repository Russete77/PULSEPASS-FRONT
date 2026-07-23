import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { ErrorBox } from '../components/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Página aberta pelo link de recuperação do e-mail. O Supabase detecta o token
 * na URL e cria uma sessão de recuperação; aqui o usuário define a nova senha.
 */
export default function RedefinirSenha() {
  const { updatePassword, user } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { /* sessão de recuperação é resolvida pelo AuthContext */ }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { error: err } = await updatePassword(password);
      if (err) throw err;
      setDone(true);
      setTimeout(() => navigate('/meus-ingressos', { replace: true }), 1500);
    } catch (err) {
      setError(err.message ?? 'Não foi possível redefinir');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <div className="pp-card" style={{ maxWidth: 420, margin: '0 auto', padding: 'var(--pp-s-8)' }}>
        <div className="pp-eyebrow">nova senha</div>
        <h1 style={{ fontSize: 'var(--pp-fs-28)', marginTop: 8 }}>Redefinir senha</h1>

        {done ? (
          <p style={{ color: 'var(--pp-pulse)', marginTop: 16 }}>Senha atualizada! Redirecionando…</p>
        ) : !user ? (
          <ErrorBox>Link inválido ou expirado. Solicite um novo na tela de login.</ErrorBox>
        ) : (
          <form onSubmit={submit} style={{ marginTop: 16 }}>
            <div className="pp-field">
              <label className="pp-label">Nova senha</label>
              <input className="pp-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            {error && <ErrorBox>{error}</ErrorBox>}
            <button className="pp-btn pp-btn--primary pp-btn--block pp-btn--lg" disabled={busy} style={{ marginTop: 8 }}>
              {busy ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </Page>
  );
}
