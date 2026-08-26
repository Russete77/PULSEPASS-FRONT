import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { ErrorBox } from '../components/States.jsx';
import CampoSenha from '@pulsepass/shared/CampoSenha';
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
      <div className="pp-card pp-authcard">
        <div className="pp-eyebrow">nova senha</div>
        <h1 className="pp-t-title pp-mt-2">Redefinir senha</h1>

        {done ? (
          <p className="pp-accent pp-mt-4">Senha atualizada! Redirecionando…</p>
        ) : !user ? (
          <ErrorBox>Link inválido ou expirado. Solicite um novo na tela de login.</ErrorBox>
        ) : (
          <form onSubmit={submit} className="pp-mt-4">
            {/* Aqui ver o que se digita importa mais do que em qualquer lugar:
                é uma senha nova, que a pessoa ainda não decorou. */}
            <CampoSenha
              id="redefinirs-1" rotulo="Nova senha" autoComplete="new-password" autoFocus
              valor={password} aoMudar={(e) => setPassword(e.target.value)}
            />
            {error && <ErrorBox>{error}</ErrorBox>}
            <button className="pp-btn pp-btn--primary pp-btn--block pp-btn--lg pp-mt-2" disabled={busy}>
              {busy ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </Page>
  );
}
