import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Eyebrow, Screen, Title } from '@/components/ui';
import { api } from '@/lib/api';
import { brl } from '@/lib/format';
import { useActiveEvent } from '@/lib/useActiveEvent';
import { C, R, S } from '@/theme/tokens';

type Item = { id: string; name: string; category: string; price_cents: number; stock?: number | null };
type BarOrder = { id: string; total_cents: number; pickup_code: string; bar_order_items?: { name: string; quantity: number }[] };

export default function Bar() {
  const router = useRouter();
  const { event, loading: evLoading } = useActiveEvent();
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<BarOrder[]>([]);

  const load = useCallback(() => {
    if (!event) return;
    api
      .getMenu(event.slug)
      .then((d: { items: Item[] }) => {
        setItems(d.items);
        setStatus('done');
      })
      .catch((e: Error) => {
        setError(e.message);
        setStatus('error');
      });
    api.myBarOrders().then((h) => setHistory(h as BarOrder[])).catch(() => {});
  }, [event]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const total = useMemo(
    () => items.reduce((s, it) => s + (cart[it.id] ?? 0) * it.price_cents, 0),
    [cart, items],
  );
  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  function setQty(id: string, delta: number) {
    setCart((p) => {
      const next = Math.max(0, (p[id] ?? 0) + delta);
      return { ...p, [id]: next };
    });
  }

  async function checkout() {
    if (!event || count === 0) return;
    setPlacing(true);
    setError('');
    try {
      const order = await api.createBarOrder(
        event.slug,
        Object.entries(cart)
          .filter(([, q]) => q > 0)
          .map(([menu_item_id, quantity]) => ({ menu_item_id, quantity })),
      );
      setCart({});
      setSuccess(`Pedido confirmado! Retire com o código ${order.pickup_code}.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPlacing(false);
    }
  }

  if (evLoading || status === 'loading') {
    return (
      <Screen>
        <ActivityIndicator color={C.pulse} style={{ marginTop: 60 }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: S.x5, paddingBottom: 120, gap: S.x3 }}
        ListHeaderComponent={
          <View style={{ marginBottom: S.x4 }}>
            <Eyebrow>bar · pedido sem fila</Eyebrow>
            <Title>Cardápio</Title>
            <Text style={styles.event}>{event?.title}</Text>
            {success ? <Text style={styles.success}>{success}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {history.length > 0 && (
              <View style={styles.history}>
                <Text style={styles.histTitle}>Meus pedidos</Text>
                {history.slice(0, 5).map((o) => (
                  <View key={o.id} style={styles.histRow}>
                    <Text style={styles.histCode}>{o.pickup_code}</Text>
                    <Text style={styles.histMeta}>
                      {(o.bar_order_items ?? []).reduce((a, i) => a + i.quantity, 0)} itens · {brl(o.total_cents)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const sold = item.stock === 0;
          return (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.cat}>{item.category}{sold ? ' · esgotado' : ''}</Text>
                <Text style={styles.price}>{brl(item.price_cents)}</Text>
              </View>
              <View style={styles.stepper}>
                <Pressable style={styles.stepBtn} onPress={() => setQty(item.id, -1)}>
                  <Text style={styles.stepTxt}>−</Text>
                </Pressable>
                <Text style={styles.qty}>{cart[item.id] ?? 0}</Text>
                <Pressable style={styles.stepBtn} disabled={sold} onPress={() => setQty(item.id, +1)}>
                  <Text style={styles.stepTxt}>+</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      {count > 0 && (
        <View style={styles.bar}>
          <Button
            label={placing ? 'Pagando…' : `Pagar com saldo · ${brl(total)} (${count})`}
            onPress={checkout}
            loading={placing}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  event: { color: C.fg3, marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.glass2,
    borderWidth: 1,
    borderColor: C.edge2,
    borderRadius: R.md,
    padding: S.x4,
  },
  name: { color: C.fg, fontSize: 15, fontWeight: '600' },
  cat: { color: C.fg4, fontSize: 11, marginTop: 2 },
  price: { color: C.pulse, fontFamily: 'monospace', fontWeight: '700', marginTop: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: S.x3 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: R.sm,
    backgroundColor: C.glass2,
    borderWidth: 1,
    borderColor: C.edge2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTxt: { color: C.fg, fontSize: 20, lineHeight: 22 },
  qty: { color: C.fg, minWidth: 22, textAlign: 'center', fontVariant: ['tabular-nums'] },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: S.x4, backgroundColor: C.ink900, borderTopWidth: 1, borderTopColor: C.edge1 },
  success: { color: C.pulse, marginTop: S.x3 },
  error: { color: '#FF6B61', marginTop: S.x3 },
  history: { marginTop: S.x4, gap: S.x2 },
  histTitle: { color: C.fg3, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  histRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  histCode: { color: C.pulse, fontFamily: 'monospace' },
  histMeta: { color: C.fg3, fontSize: 13 },
});
