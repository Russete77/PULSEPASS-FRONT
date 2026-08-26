import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorBox } from '../components/Shell.jsx';
import CampoSenha from '@pulsepass/shared/CampoSenha';
import { useAuth } from '../context/AuthContext.jsx';

export default function RedefinirSenha() {
  const { updatePassword, user } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { error: err } = await updatePassword(password);
      if (err) throw err;
      setDone(true);
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } catch (err) {
      setError(err.message ?? 'Não foi possível redefinir');
    } finally { setBusy(false); }
  }

  return (
    <div className="ck-p-5 ck-centro">
      <div className="ck-card ck-full ck-w-form ck-p-6">
        <div className="ck-eyebrow">nova senha</div>
        <h1 className="ck-h1">Redefinir senha</h1>
        {done ? (
          <p className="ck-c-pulse ck-mt-4">Senha atualizada! Redirecionando…</p>
        ) : !user ? (
          <ErrorBox>Link inválido ou expirado. Solicite um novo no login.</ErrorBox>
        ) : (
          <form onSubmit={submit} className="ck-mt-4">
            <CampoSenha
              id="redefinirs-1" className="ck-input" classeRotulo="ck-label" classeCampo="ck-field"
              rotulo="Nova senha" autoComplete="new-password" autoFocus
              valor={password} aoMudar={(e) => setPassword(e.target.value)}
            />
            {error && <ErrorBox>{error}</ErrorBox>}
            <button className="ck-btn ck-btn--primary ck-full ck-mt-2" disabled={busy}>
              {busy ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
