import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorBox } from '../components/Shell.jsx';
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
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div className="ck-card" style={{ width: '100%', maxWidth: 420, padding: 'var(--pp-s-8)' }}>
        <div className="ck-eyebrow">nova senha</div>
        <h1 className="ck-h1" style={{ fontSize: 'var(--pp-fs-28)' }}>Redefinir senha</h1>
        {done ? (
          <p style={{ color: 'var(--pp-pulse)', marginTop: 16 }}>Senha atualizada! Redirecionando…</p>
        ) : !user ? (
          <ErrorBox>Link inválido ou expirado. Solicite um novo no login.</ErrorBox>
        ) : (
          <form onSubmit={submit} style={{ marginTop: 16 }}>
            <div className="ck-field"><label className="ck-label">Nova senha</label>
              <input className="ck-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
            {error && <ErrorBox>{error}</ErrorBox>}
            <button className="ck-btn ck-btn--primary" style={{ width: '100%', marginTop: 8 }} disabled={busy}>
              {busy ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
