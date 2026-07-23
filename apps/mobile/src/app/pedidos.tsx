import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, Eyebrow, Screen, Title } from '@/components/ui';
import { api } from '@/lib/api';
import { brl, dateTime } from '@/lib/format';
import { C, S } from '@/theme/tokens';

type Order = { id: string; status: string; total_cents: number; created_at: string; events?: { title: string } };
const LABEL: Record<string, string> = {
  paid: 'Pago', pending: 'Aguardando pagamento', expired: 'Expirado', cancelled: 'Cancelado', refunded: 'Reembolsado',
};

export default function Pedidos() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    api.listOrders()
      .then((d) => { setOrders(d as Order[]); setStatus('done'); })
      .catch((e) => { setError((e as Error).message); setStatus('error'); });
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  function refund(o: Order) {
    Alert.alert('Reembolsar pedido?', 'Os ingressos serão cancelados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Reembolsar',
        style: 'destructive',
        onPress: async () => {
          setBusy(o.id);
          try { await api.refundOrder(o.id); load(); }
          catch (e) { setError((e as Error).message); }
          finally { setBusy(null); }
        },
      },
    ]);
  }

  if (status === 'loading') {
    return <Screen><ActivityIndicator color={C.pulse} style={{ marginTop: 60 }} /></Screen>;
  }

  return (
    <Screen>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: S.x6 }}
        ListHeaderComponent={
          <View style={{ marginBottom: S.x4 }}>
            <Button label="‹ Voltar" variant="ghost" onPress={() => router.back()} />
            <Eyebrow>conta · histórico</Eyebrow>
            <Title>Meus pedidos</Title>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Você ainda não fez pedidos.</Text>}
        renderItem={({ item: o }) => (
          <Card style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{o.events?.title ?? 'Evento'}</Text>
              <Text style={styles.meta}>{dateTime(o.created_at)} · {LABEL[o.status] ?? o.status}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Text style={styles.val}>{brl(o.total_cents)}</Text>
              {o.status === 'paid' && (
                <Button label={busy === o.id ? '…' : 'Reembolsar'} variant="glass" onPress={() => refund(o)} />
              )}
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: S.x3, gap: S.x3 },
  title: { color: C.fg, fontSize: 15, fontWeight: '600' },
  meta: { color: C.fg3, fontSize: 13, marginTop: 2 },
  val: { color: C.fg, fontFamily: 'monospace' },
  empty: { color: C.fg3, textAlign: 'center', marginTop: 40 },
  error: { color: '#FF6B61', marginTop: S.x3 },
});
