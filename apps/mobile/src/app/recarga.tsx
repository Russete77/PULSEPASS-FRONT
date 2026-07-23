import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Eyebrow, Screen, Title } from '@/components/ui';
import CardFields, { CardData } from '@/components/CardFields';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { brl } from '@/lib/format';
import { C, F, R, S } from '@/theme/tokens';

const PRESETS = [2000, 5000, 10000, 20000];

type Topup = { id: string; amount_cents: number; status?: string; pix?: { payload: string; qr_base64: string } };

export default function Recarga() {
  const router = useRouter();
  const { user } = useAuth();
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const [amount, setAmount] = useState(5000);
  const [method, setMethod] = useState<'pix' | 'card'>('pix');
  const [card, setCard] = useState<CardData | null>(null);
  const [cardValid, setCardValid] = useState(false);
  const [topup, setTopup] = useState<Topup | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    if (method === 'card' && (!cardValid || !card)) { setError('Preencha os dados do cartão corretamente.'); return; }
    setBusy(true);
    setError('');
    try {
      if (method === 'card' && card) {
        const t = (await api.createTopup(amount, eventId || undefined, {
          paymentMethod: 'card', installmentCount: 1, card: card.card, holderInfo: card.holderInfo,
        })) as Topup;
        if (t.status === 'paid') { router.back(); return; }
        setError('Pagamento em processamento. Confira a carteira em instantes.');
      } else {
        const t = (await api.createTopup(amount, eventId || undefined)) as Topup;
        setTopup(t);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDev() {
    if (!topup) return;
    try { await api.simulateTopupPaid(topup.id); router.back(); }
    catch (e) { setError((e as Error).message); }
  }

  // Polling do status da recarga PIX — confirma sozinho quando o pagamento cai.
  useEffect(() => {
    if (!topup || topup.status === 'paid') return;
    const iv = setInterval(async () => {
      try {
        const t = (await api.getTopup(topup.id)) as Topup;
        if (t.status === 'paid') { clearInterval(iv); router.back(); }
      } catch { /* ignora erros de polling */ }
    }, 5000);
    return () => clearInterval(iv);
  }, [topup, router]);

  return (
    <Screen>
      <View style={{ padding: S.x6 }}>
        <Eyebrow>recarga · {method}</Eyebrow>
        <Title>Recarregar carteira</Title>

        {!topup ? (
          <>
            <View style={styles.presets}>
              {PRESETS.map((v) => (
                <Pressable key={v} style={[styles.preset, amount === v && styles.presetOn]} onPress={() => setAmount(v)}>
                  <Text style={[styles.presetTxt, amount === v && { color: C.pulseInk }]}>{brl(v)}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.methodRow}>
              <Pressable style={[styles.method, method === 'pix' && styles.methodOn]} onPress={() => setMethod('pix')}>
                <Text style={[styles.methodTxt, method === 'pix' && { color: C.pulseInk }]}>Pix</Text>
              </Pressable>
              <Pressable style={[styles.method, method === 'card' && styles.methodOn]} onPress={() => setMethod('card')}>
                <Text style={[styles.methodTxt, method === 'card' && { color: C.pulseInk }]}>Cartão</Text>
              </Pressable>
            </View>

            {method === 'card' && (
              <View style={{ marginTop: S.x4 }}>
                <CardFields email={user?.email} onChange={(d, v) => { setCard(d); setCardValid(v); }} />
              </View>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={{ height: S.x4 }} />
            <Button
              label={method === 'card' ? `Pagar no cartão · ${brl(amount)}` : `Gerar Pix · ${brl(amount)}`}
              onPress={generate}
              loading={busy}
              disabled={method === 'card' && !cardValid}
            />
            <Button label="Cancelar" variant="ghost" onPress={() => router.back()} />
          </>
        ) : (
          <Card style={{ alignItems: 'center', marginTop: S.x4 }}>
            <Text style={styles.payValue}>{brl(topup.amount_cents)}</Text>
            <View style={styles.qrBox}>
              {topup.pix?.qr_base64 ? (
                <Image source={{ uri: `data:image/png;base64,${topup.pix.qr_base64}` }} style={{ width: 180, height: 180 }} />
              ) : (
                <ActivityIndicator color={C.ink900} />
              )}
            </View>
            <Text style={styles.copyLabel}>Pix copia e cola (toque e segure para copiar)</Text>
            <Text style={styles.copyTxt} selectable numberOfLines={3}>{topup.pix?.payload}</Text>
            <Text style={styles.waiting}>Aguardando pagamento…</Text>
            <View style={{ height: S.x4, width: '100%' }} />
            {__DEV__ && <Button label="(dev) Simular pago" variant="glass" onPress={confirmDev} />}
          </Card>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: S.x3, marginTop: S.x5 },
  preset: {
    paddingVertical: S.x4, paddingHorizontal: S.x5, borderRadius: R.md,
    borderWidth: 1, borderColor: C.edge2, backgroundColor: C.glass1,
  },
  presetOn: { backgroundColor: C.pulse, borderColor: C.pulse },
  presetTxt: { color: C.fg, fontFamily: F.bodyBold },
  methodRow: { flexDirection: 'row', gap: S.x3, marginTop: S.x5 },
  method: {
    flex: 1, alignItems: 'center', paddingVertical: S.x3, borderRadius: R.md,
    borderWidth: 1, borderColor: C.edge2, backgroundColor: C.glass1,
  },
  methodOn: { backgroundColor: C.pulse, borderColor: C.pulse },
  methodTxt: { color: C.fg, fontFamily: F.bodyMd },
  payValue: { color: C.fg, fontSize: 28, fontFamily: F.display, marginBottom: S.x4 },
  qrBox: { backgroundColor: C.white, padding: 12, borderRadius: R.md },
  copyLabel: { color: C.fg3, fontSize: 11, marginTop: S.x4, textAlign: 'center' },
  copyTxt: { color: C.fg2, fontFamily: F.mono, fontSize: 12, marginTop: 6, paddingHorizontal: S.x3, textAlign: 'center' },
  waiting: { color: C.fg3, marginTop: S.x4 },
  error: { color: '#FF6B61', marginTop: S.x3 },
});
