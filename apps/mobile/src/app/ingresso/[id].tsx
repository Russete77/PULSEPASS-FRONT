import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Badge, Button, Card, Eyebrow, Screen, Title } from '@/components/ui';
import { api } from '@/lib/api';
import { eventDate } from '@/lib/format';
import { C, R, S } from '@/theme/tokens';

type Ticket = {
  id: string; code: string; qr_secret: string; status: string;
  qr_data_url?: string | null;
  events?: { title: string; venue_name?: string; city: string; state: string; starts_at: string };
  ticket_tiers?: { name: string };
};

export default function IngressoDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');

  const [transferOpen, setTransferOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .getTicket(id)
      .then((t: Ticket) => {
        setTicket(t);
        setStatus('done');
      })
      .catch((e: Error) => {
        setError(e.message);
        setStatus('error');
      });
  }, [id]);

  async function doTransfer() {
    setBusy(true);
    setMsg('');
    try {
      const res = await api.transferTicket(id, email);
      setMsg(res.message);
      if (res.delivered) setTimeout(() => router.back(), 1500);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (status === 'loading')
    return (
      <Screen>
        <ActivityIndicator color={C.pulse} style={{ marginTop: 60 }} />
      </Screen>
    );
  if (status === 'error' || !ticket)
    return (
      <Screen>
        <Text style={styles.error}>{error}</Text>
      </Screen>
    );

  return (
    <Screen>
      <View style={{ padding: S.x6 }}>
        <Button label="‹ Voltar" variant="ghost" onPress={() => router.back()} />
        <Eyebrow>ingresso · entrada</Eyebrow>
        <Title>{ticket.events?.title}</Title>
        <Text style={styles.meta}>
          {ticket.ticket_tiers?.name} · {eventDate(ticket.events?.starts_at)}
        </Text>

        <Card style={{ alignItems: 'center', marginTop: S.x5 }}>
          {/* QR real gerado no servidor (data-URL PNG); fallback visual se ausente. */}
          {ticket.qr_data_url ? (
            <Image source={{ uri: ticket.qr_data_url }} style={styles.qr} resizeMode="contain" />
          ) : (
            <View style={styles.qr}>
              <Text style={styles.qrHint}>QR</Text>
            </View>
          )}
          <Text style={styles.code}>{ticket.code}</Text>
          <Badge color={ticket.status === 'valid' ? C.pulse : C.fg3}>
            {ticket.status === 'valid' ? '● Válido' : ticket.status}
          </Badge>
          <Text style={styles.venue}>
            {ticket.events?.venue_name} · {ticket.events?.city}/{ticket.events?.state}
          </Text>
        </Card>

        <View style={{ height: S.x5 }} />
        {!transferOpen ? (
          <Button label="Transferir ingresso" variant="glass" onPress={() => setTransferOpen(true)} />
        ) : (
          <Card>
            <Text style={styles.label}>E-mail de quem vai receber</Text>
            <TextInput
              style={styles.input}
              placeholder="amigo@email.com"
              placeholderTextColor={C.fg4}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            {msg ? <Text style={styles.msg}>{msg}</Text> : null}
            <View style={{ height: S.x3 }} />
            <Button label="Enviar" onPress={doTransfer} loading={busy} disabled={!email.includes('@')} />
            <Button label="Cancelar" variant="ghost" onPress={() => setTransferOpen(false)} />
          </Card>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { color: C.fg3, marginTop: 2 },
  qr: {
    width: 220,
    height: 220,
    backgroundColor: C.white,
    borderRadius: R.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: S.x4,
  },
  qrHint: { color: '#999', fontSize: 14 },
  code: { color: C.pulse, fontFamily: 'monospace', fontSize: 20, letterSpacing: 2, marginBottom: S.x3 },
  venue: { color: C.fg3, fontSize: 13, marginTop: S.x4 },
  label: { color: C.fg3, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: {
    height: 48,
    backgroundColor: C.glass1,
    borderWidth: 1,
    borderColor: C.edge2,
    borderRadius: R.md,
    paddingHorizontal: S.x4,
    color: C.fg,
  },
  msg: { color: C.pulse, marginTop: S.x3 },
  error: { color: '#FF6B61', padding: S.x6 },
});
