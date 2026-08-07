import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, authEnabled } from '../lib/supabase.js';
import { api } from '../lib/api.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (!authEnabled) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Perfil + orgs + escalações: quem é essa pessoa dentro da operação.
  // Buscado uma vez por sessão e compartilhado — as telas usam pra se orientar.
  useEffect(() => {
    if (!session) { setMe(null); return; }
    let alive = true;
    api.me().then((d) => alive && setMe(d)).catch(() => {});
    return () => { alive = false; };
  }, [session]);

  // Staff escalado sem organização própria (porteiro/barman): o cockpit de
  // produtora não é dele — não tem dashboard, repasse, nem criação de evento.
  const isStaffOnly = !!me && me.organizations?.length === 0 && (me.assignments?.length ?? 0) > 0;

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    authEnabled,
    me,
    isStaffOnly,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: async (email, password, fullName) => {
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName } },
      });
      return { error, needsConfirmation: !error && !data.session };
    },
    resetPassword: (email) =>
      supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/redefinir-senha` }),
    updatePassword: (password) => supabase.auth.updateUser({ password }),
    signOut: () => supabase.auth.signOut(),
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth precisa de <AuthProvider>');
  return ctx;
};
