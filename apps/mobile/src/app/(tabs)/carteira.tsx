import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, Eyebrow, Screen, Title } from '@/components/ui';
import { api } from '@/lib/api';
import { brl } from '@/lib/format';
import { useActiveEvent } from '@/lib/useActiveEvent';
import { C, R, S } from '@/theme/tokens';

type Tx = { id: string; type: string; amount_cents: number; description?: string; created_at: string };
type Wallet = { balance_cents: number; transactions: Tx[] };

export default function Carteira() {
  const router = useRouter();
  const { event, loading: evLoading } = useActiveEvent();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (!event) return;
    api
      .getWallet(event.id)
      .then((w: Wallet) => {
        setWallet(w);
        setStatus('done');
      })
      .catch((e: Error) => {
        setError(e.message);
        setStatus('error');
      });
  }, [event]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

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
        data={wallet?.transactions ?? []}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: S.x5, gap: S.x3 }}
        ListHeaderComponent={
          <View style={{ marginBottom: S.x4 }}>
            <Eyebrow>carteira cashless</Eyebrow>
            <Title>Saldo do evento</Title>
            <Text style={styles.event}>{event?.title}</Text>

            <Card style={{ marginTop: S.x4, alignItems: 'center', paddingVertical: S.x8 }}>
              <Text style={styles.balanceLabel}>Disponível</Text>
              <Text style={styles.balance}>{brl(wallet?.balance_cents)}</Text>
            </Card>

            <View style={{ height: S.x4 }} />
            <Button
              label="Recarregar"
              onPress={() =>
                router.push({ pathname: '/recarga', params: { eventId: event?.id ?? '' } })
              }
            />
            {(wallet?.balance_cents ?? 0) > 0 && (
              <Button
                label="Estornar saldo restante"
                variant="ghost"
                onPress={async () => {
                  try { await api.refundWallet(event?.id); load(); }
                  catch (e) { setError((e as Error).message); }
                }}
              />
            )}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.section}>Extrato</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Sem movimentações ainda.</Text>}
        renderItem={({ item }) => (
          <View style={styles.tx}>
            <View style={{ flex: 1 }}>
              <Text style={styles.txDesc}>{item.description ?? item.type}</Text>
              <Text style={styles.txDate}>{new Date(item.created_at).toLocaleString('pt-BR')}</Text>
            </View>
            <Text style={[styles.txAmount, { color: item.amount_cents < 0 ? C.fg2 : C.pulse }]}>
              {item.amount_cents < 0 ? '' : '+'}
              {brl(item.amount_cents)}
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  event: { color: C.fg3, marginTop: 2 },
  balanceLabel: { color: C.fg3, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  balance: { color: C.pulse, fontSize: 44, fontWeight: '800', marginTop: 6 },
  section: { color: C.fg3, marginTop: S.x6, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  tx: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.glass1,
    borderWidth: 1,
    borderColor: C.edge1,
    borderRadius: R.md,
    padding: S.x4,
  },
  txDesc: { color: C.fg, fontSize: 14 },
  txDate: { color: C.fg4, fontSize: 11, marginTop: 2 },
  txAmount: { fontWeight: '700', fontVariant: ['tabular-nums'] },
  error: { color: '#FF6B61', marginTop: S.x3 },
  empty: { color: C.fg3, textAlign: 'center', marginTop: 20 },
});
