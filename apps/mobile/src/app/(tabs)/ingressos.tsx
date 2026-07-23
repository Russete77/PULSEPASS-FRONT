import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Badge, Eyebrow, Screen, Title } from '@/components/ui';
import { api } from '@/lib/api';
import { eventDate } from '@/lib/format';
import { C, R, S } from '@/theme/tokens';

type Ticket = {
  id: string; code: string; status: string;
  events?: { title: string; starts_at: string };
  ticket_tiers?: { name: string };
};

export default function Ingressos() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api
      .myTickets()
      .then((d: Ticket[]) => {
        setTickets(d);
        setStatus('done');
      })
      .catch((e: Error) => {
        setError(e.message);
        setStatus('error');
      });
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen>
      <FlatList
        data={tickets}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: S.x5, gap: S.x3 }}
        ListHeaderComponent={
          <View style={{ marginBottom: S.x4 }}>
            <Eyebrow>carteira de ingressos</Eyebrow>
            <Title>Meus ingressos</Title>
          </View>
        }
        ListEmptyComponent={
          status === 'loading' ? (
            <ActivityIndicator color={C.pulse} style={{ marginTop: 40 }} />
          ) : status === 'error' ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <Text style={styles.empty}>Você ainda não tem ingressos.</Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/ingresso/${item.id}`)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.events?.title}</Text>
              <Text style={styles.meta}>
                {item.ticket_tiers?.name} · {eventDate(item.events?.starts_at)}
              </Text>
              <Text style={styles.code}>{item.code}</Text>
            </View>
            <Badge color={item.status === 'valid' ? C.pulse : C.fg3}>
              {item.status === 'valid' ? 'Válido' : item.status}
            </Badge>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.glass2,
    borderWidth: 1,
    borderColor: C.edge2,
    borderRadius: R.lg,
    padding: S.x4,
  },
  title: { color: C.fg, fontSize: 16, fontWeight: '600' },
  meta: { color: C.fg3, fontSize: 13, marginTop: 2 },
  code: { color: C.pulse, fontFamily: 'monospace', marginTop: 6, letterSpacing: 1 },
  error: { color: '#FF6B61', textAlign: 'center', marginTop: 40 },
  empty: { color: C.fg3, textAlign: 'center', marginTop: 40 },
});
