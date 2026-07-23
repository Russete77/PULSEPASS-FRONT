import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Eyebrow, Screen, Title } from '@/components/ui';
import { api } from '@/lib/api';
import { eventDate } from '@/lib/format';
import { C, R, S } from '@/theme/tokens';

type Ev = {
  id: string; title: string; slug: string; venue_name?: string;
  city: string; state: string; starts_at: string;
};

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState<Ev[]>([]);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    const id = setTimeout(() => {
      api
        .listEvents(q.trim() || undefined)
        .then((d: Ev[]) => {
          setEvents(d);
          setStatus('done');
        })
        .catch((e: Error) => {
          setError(e.message);
          setStatus('error');
        });
    }, 300);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <Screen>
      <View style={styles.header}>
        <Eyebrow>descubra · vibra · pague</Eyebrow>
        <Title>Eventos</Title>
        <TextInput
          style={styles.search}
          value={q}
          onChangeText={setQ}
          placeholder="Buscar eventos…"
          placeholderTextColor={C.fg4}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {status === 'loading' && <ActivityIndicator color={C.pulse} style={{ marginTop: 40 }} />}
      {status === 'error' && (
        <Text style={styles.error}>Não consegui carregar ({error}). Backend rodando?</Text>
      )}

      {status === 'done' && (
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ padding: S.x5, gap: S.x4 }}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum evento publicado ainda.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/evento/${item.slug}`)}>
              <View style={styles.cover}>
                <Text style={styles.coverTxt}>{item.title.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ padding: S.x4, gap: 4 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.meta}>
                  {eventDate(item.starts_at)} · {item.venue_name ? `${item.venue_name}, ` : ''}
                  {item.city}/{item.state}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: S.x5, paddingTop: S.x2 },
  search: {
    marginTop: S.x3, height: 44, borderRadius: R.md, borderWidth: 1, borderColor: C.edge2,
    backgroundColor: C.glass1, paddingHorizontal: S.x4, color: C.fg,
  },
  card: { backgroundColor: C.glass2, borderWidth: 1, borderColor: C.edge2, borderRadius: R.lg, overflow: 'hidden' },
  cover: { height: 150, backgroundColor: C.ink800, alignItems: 'center', justifyContent: 'center' },
  coverTxt: { color: C.fg4, fontSize: 32, fontWeight: '700' },
  cardTitle: { color: C.fg, fontSize: 18, fontWeight: '600' },
  meta: { color: C.fg3, fontSize: 13 },
  error: { color: '#FF6B61', padding: S.x5 },
  empty: { color: C.fg3, textAlign: 'center', marginTop: 40 },
});
