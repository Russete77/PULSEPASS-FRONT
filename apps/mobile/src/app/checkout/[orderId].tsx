import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Button, Card, Eyebrow, Screen, Title } from '@/components/ui';
import { api } from '@/lib/api';
import { brl } from '@/lib/format';
import { C, F, R, S } from '@/theme/tokens';

const DEV = (Constants.expoConfig as any)?.extra?.dev ?? __DEV__;

type Order = {
  id: string; status: string; total_cents: number;
  pix_payload?: string; pix_qr_base64?: string;
};

export default function CheckoutPedido() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  async function refresh() {
    const data = (await api.getOrder(orderId)) as Order;
    setOrder(data);
    if (data.status === 'paid') {
      if (poll.current) clearInterval(poll.current);
      router.replace('/(tabs)/ingressos');
    }
    return data;
  }

  useEffect(() => {
    refresh().catch((e) => setError((e as Error).message));
    poll.current = setInterval(() => { refresh().catch(() => {}); }, 5000);
    return () => { if (poll.current) clearInterval(poll.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function simulate() {
    try { await api.simulateOrderPaid(orderId); await refresh(); }
    catch (e) { setError((e as Error).message); }
  }

  if (!order) {
    return (
      <Screen>
        <View style={{ padding: S.x6 }}>
          {error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator color={C.pulse} style={{ marginTop: 40 }} />}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ padding: S.x6 }}>
        <Eyebrow>checkout · pix</Eyebrow>
        <Title>Pague {brl(order.total_cents)}</Title>
        <Text style={styles.sub}>Escaneie o QR ou use o copia-e-cola. Confirmação automática.</Text>

        <Card style={{ alignItems: 'center', marginTop: S.x4 }}>
          <View style={styles.qrBox}>
            {order.pix_qr_base64 ? (
              <Image source={{ uri: `data:image/png;base64,${order.pix_qr_base64}` }} style={{ width: 200, height: 200 }} />
            ) : (
              <ActivityIndicator color={C.ink900} />
            )}
          </View>
          <Text style={styles.copyLabel}>Pix copia e cola (toque e segure para copiar)</Text>
          <Text style={styles.copyTxt} selectable numberOfLines={3}>{order.pix_payload}</Text>
          <Text style={styles.waiting}>Aguardando pagamento…</Text>
        </Card>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={{ height: S.x4 }} />
        {DEV && <Button label="(dev) Simular pago" variant="glass" onPress={simulate} />}
        <Button label="Voltar aos ingressos" variant="ghost" onPress={() => router.replace('/(tabs)/ingressos')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { color: C.fg3, marginTop: 6 },
  qrBox: { backgroundColor: C.white, padding: 12, borderRadius: R.md },
  copyLabel: { color: C.fg3, fontSize: 11, marginTop: S.x4, textAlign: 'center' },
  copyTxt: { color: C.fg2, fontFamily: F.mono, fontSize: 12, marginTop: 6, paddingHorizontal: S.x3, textAlign: 'center' },
  waiting: { color: C.fg3, marginTop: S.x4 },
  error: { color: '#FF6B61', marginTop: S.x3 },
});
