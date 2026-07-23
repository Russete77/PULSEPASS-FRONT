import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Eyebrow, Screen, Title } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { C, R, S } from '@/theme/tokens';

type Mode = 'login' | 'signup' | 'forgot';

export default function Login() {
  const { signIn, signUp, resetPassword, signInWithProvider, authEnabled } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [fullName, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true); setError(''); setInfo('');
    try {
      if (mode === 'forgot') {
        const { error: err } = await resetPassword(email);
        if (err) throw err;
        setInfo('Enviamos um link de redefinição para o seu e-mail.');
      } else if (mode === 'login') {
        const { error: err } = await signIn(email, password);
        if (err) throw err;
      } else {
        const { error: err, needsConfirmation } = await signUp(email, password, { fullName, cpf, phone });
        if (err) throw err;
        if (needsConfirmation) setInfo('Conta criada! Confirme seu e-mail para entrar.');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally { setBusy(false); }
  }

  async function social(provider: 'google' | 'apple') {
    setError('');
    const { error: err } = await signInWithProvider(provider);
    if (err) setError(err.message);
  }

  const titles: Record<Mode, string> = { login: 'Sinta o pulso', signup: 'Crie sua conta', forgot: 'Recuperar senha' };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <Eyebrow>{mode === 'signup' ? 'criar conta' : mode === 'forgot' ? 'recuperar' : 'entrar'}</Eyebrow>
          <Title>{titles[mode]}</Title>
          <Text style={styles.sub}>Ticketeria, carteira cashless e bar sem fila.</Text>

          {!authEnabled && <Text style={styles.error}>Auth desativado: configure EXPO_PUBLIC_SUPABASE_* no .env</Text>}
          {info ? <Text style={styles.info}>{info}</Text> : null}

          {mode !== 'forgot' && (
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
              <View style={{ flex: 1 }}><Button label="Google" variant="glass" onPress={() => social('google')} disabled={!authEnabled} /></View>
              <View style={{ flex: 1 }}><Button label="Apple" variant="glass" onPress={() => social('apple')} disabled={!authEnabled} /></View>
            </View>
          )}

          {mode === 'signup' && (
            <>
              <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor={C.fg4} value={fullName} onChangeText={setName} />
              <TextInput style={styles.input} placeholder="CPF" placeholderTextColor={C.fg4} keyboardType="number-pad" value={cpf} onChangeText={setCpf} />
              <TextInput style={styles.input} placeholder="Telefone / WhatsApp" placeholderTextColor={C.fg4} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            </>
          )}
          <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={C.fg4} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          {mode !== 'forgot' && (
            <TextInput style={styles.input} placeholder="Senha" placeholderTextColor={C.fg4} secureTextEntry value={password} onChangeText={setPassword} />
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={{ height: 8 }} />
          <Button
            label={mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar link'}
            onPress={submit} loading={busy} disabled={!authEnabled}
          />

          {mode === 'login' && (
            <>
              <Button label="Esqueci minha senha" variant="ghost" onPress={() => { setMode('forgot'); setError(''); setInfo(''); }} />
              <Button label="Não tenho conta" variant="ghost" onPress={() => { setMode('signup'); setError(''); setInfo(''); }} />
            </>
          )}
          {mode !== 'login' && (
            <Button label="Voltar ao login" variant="ghost" onPress={() => { setMode('login'); setError(''); setInfo(''); }} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: S.x6 },
  sub: { color: C.fg3, marginBottom: S.x6 },
  input: {
    height: 50, backgroundColor: C.glass1, borderWidth: 1, borderColor: C.edge2,
    borderRadius: R.md, paddingHorizontal: S.x4, color: C.fg, marginBottom: S.x3, fontSize: 15,
  },
  error: { color: '#FF6B61', marginVertical: S.x2 },
  info: { color: C.pulse, marginVertical: S.x2 },
});
