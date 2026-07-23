import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase, authEnabled } from '@/lib/supabase';

const WEB = process.env.EXPO_PUBLIC_WEB_URL ?? 'http://localhost:5173';

type Result = { error: Error | null };
type SignUpResult = { error: Error | null; needsConfirmation?: boolean };

type AuthValue = {
  session: Session | null;
  user: Session['user'] | null;
  loading: boolean;
  authEnabled: boolean;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (email: string, password: string, extra: { fullName: string; cpf?: string; phone?: string }) => Promise<SignUpResult>;
  signInWithProvider: (provider: 'google' | 'apple') => Promise<Result>;
  resetPassword: (email: string) => Promise<Result>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authEnabled || !supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthValue = {
    session,
    user: session?.user ?? null,
    loading,
    authEnabled,

    signIn: async (email, password) => {
      if (!supabase) return { error: new Error('Auth desativado') };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    },

    signUp: async (email, password, { fullName, cpf, phone }) => {
      if (!supabase) return { error: new Error('Auth desativado') };
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, cpf: cpf || null, phone: phone || null } },
      });
      return { error, needsConfirmation: !error && !data.session };
    },

    // OAuth nativo: abre o navegador, recebe o deep link e troca o código pela sessão (PKCE)
    signInWithProvider: async (provider) => {
      if (!supabase) return { error: new Error('Auth desativado') };
      const redirectTo = Linking.createURL('auth-callback');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider, options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data?.url) return { error: error ?? new Error('OAuth indisponível') };

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (res.type !== 'success' || !res.url) return { error: null }; // usuário cancelou

      const url = new URL(res.url);
      const code = url.searchParams.get('code');
      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
        return { error: exErr };
      }
      // fallback fluxo implícito (#access_token=...)
      const hash = res.url.includes('#') ? res.url.split('#')[1] : '';
      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        const { error: sErr } = await supabase.auth.setSession({ access_token, refresh_token });
        return { error: sErr };
      }
      return { error: new Error('Não foi possível concluir o login social') };
    },

    // Reset de senha: link aponta para o site do Cliente (pulse-front)
    resetPassword: async (email) => {
      if (!supabase) return { error: new Error('Auth desativado') };
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${WEB}/redefinir-senha` });
      return { error };
    },

    signOut: async () => { await supabase?.auth.signOut(); },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth precisa de <AuthProvider>');
  return ctx;
}
