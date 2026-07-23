import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Eyebrow, Screen, Title } from '@/components/ui';
import { api } from '@/lib/api';
import { eventDate } from '@/lib/format';
import { C, F, R, S } from '@/theme/tokens';

type List = {
  promoter: { name: string; list_type?: string; free_until?: string | null };
  event?: { title: string; starts_at: string; venue_name?: string; city?: string; state?: string };
};

export default function ListaSignup() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const [list, setList] = useState<List | null>(null);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ name: string } | null>(null);

  useEffect(() => {
    api.getList(code)
      .then((d) => { setList(d as List); setStatus('done'); })
      .catch((e) => { setError((e as Error).message); setStatus('error'); });
    api.listHit(code).catch(() => {}); // beacon de clique (funil do promoter)
  }, [code]);

  async function submit() {
    if (name.trim().length < 2) return;
    setBusy(true); setError('');
    try {
      const r = (await api.listSignup(code, { name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined })) as { name: string };
      setDone(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (status === 'loading') return <Screen><ActivityIndicator color={C.pulse} style={{ marginTop: 60 }} /></Screen>;
  if (status === 'error' || !list) return <Screen><Text style={styles.error}>{error || 'Lista indisponível'}</Text></Screen>;

  return (
    <Screen>
      <View style={{ padding: S.x6 }}>
        <Eyebrow>lista · {list.promoter.name}</Eyebrow>
        <Title>{list.event?.title}</Title>
        <Text style={styles.meta}>
          {eventDate(list.event?.starts_at)}
          {list.event?.venue_name ? ` · ${list.event.venue_name}` : ''}
          {list.event?.city ? ` · ${list.event.city}/${list.event.state}` : ''}
        </Text>

        {list.promoter.list_type && list.promoter.list_type !== 'standard' && (
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>
              {list.promoter.list_type === 'free_until'
                ? `Grátis até ${list.promoter.free_until ? new Date(list.promoter.free_until).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}`
                : list.promoter.list_type === 'birthday' ? 'Lista de aniversário' : 'Lista VIP'}
            </Text>
          </View>
        )}

        {done ? (
          <Card style={{ alignItems: 'center', marginTop: S.x6, paddingVertical: S.x8 }}>
            <Text style={{ fontSize: 44 }}>✓</Text>
            <Text style={styles.okTitle}>Você está na lista!</Text>
            <Text style={styles.okSub}>
              {done.name}, sua inscrição com {list.promoter.name} está confirmada.
              Chegue cedo e apresente seu nome/documento na porta.
            </Text>
            <View style={{ height: S.x4 }} />
            <Button label="Fechar" variant="glass" onPress={() => router.replace('/(tabs)')} />
          </Card>
        ) : (
          <View style={{ marginTop: S.x5, gap: S.x3 }}>
            <Field label="Nome completo">
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor={C.fg4} />
            </Field>
            <Field label="E-mail">
              <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address"
                autoCapitalize="none" placeholder="voce@email.com" placeholderTextColor={C.fg4} />
            </Field>
            <Field label="Telefone / WhatsApp">
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad"
                placeholder="(11) 90000-0000" placeholderTextColor={C.fg4} />
            </Field>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={{ height: S.x2 }} />
            <Button label={busy ? 'Confirmando…' : 'Entrar na lista'} onPress={submit} loading={busy} disabled={name.trim().length < 2} />
          </View>
        )}
      </View>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  meta: { color: C.fg3, fontSize: 13, marginTop: 4 },
  label: { color: C.fg3, fontSize: 12, marginBottom: 4 },
  input: {
    color: C.fg, backgroundColor: C.glass1, borderWidth: 1, borderColor: C.edge2,
    borderRadius: R.md, paddingHorizontal: S.x4, paddingVertical: S.x3, fontFamily: F.body,
  },
  okTitle: { color: C.pulse, fontFamily: F.display, fontSize: 20, marginTop: S.x3 },
  okSub: { color: C.fg2, textAlign: 'center', marginTop: S.x3, lineHeight: 20 },
  badge: {
    alignSelf: 'flex-start', marginTop: S.x3, backgroundColor: C.glass2,
    borderWidth: 1, borderColor: C.pulse, borderRadius: R.pill, paddingHorizontal: S.x3, paddingVertical: 4,
  },
  badgeTxt: { color: C.pulse, fontSize: 12, fontFamily: F.bodyMd },
  error: { color: '#FF6B61', marginTop: S.x3 },
});
