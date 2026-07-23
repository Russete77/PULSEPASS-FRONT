import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, authEnabled } from '../lib/supabase.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authEnabled) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    authEnabled,

    signInWithPassword: (email, password) => supabase.auth.signInWithPassword({ email, password }),

    // signUp com CPF/telefone no metadata; retorna se exige confirmação de e-mail
    signUp: async (email, password, { fullName, cpf, phone } = {}) => {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, cpf: cpf || null, phone: phone || null } },
      });
      return { error, needsConfirmation: !error && !data.session };
    },

    signInWithProvider: (provider) =>
      supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } }),

    resetPassword: (email) =>
      supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/redefinir-senha` }),

    updatePassword: (password) => supabase.auth.updateUser({ password }),

    signOut: () => supabase.auth.signOut(),
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth deve estar dentro de <AuthProvider>');
  return ctx;
};
