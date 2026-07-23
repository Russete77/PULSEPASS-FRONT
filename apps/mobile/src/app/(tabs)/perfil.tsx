import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Eyebrow, Screen, Title } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { C, S } from '@/theme/tokens';

export default function Perfil() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <Screen>
      <View style={{ padding: S.x6 }}>
        <Eyebrow>conta</Eyebrow>
        <Title>Perfil</Title>

        <Card style={{ marginTop: S.x5 }}>
          <Text style={styles.label}>E-mail</Text>
          <Text style={styles.value}>{user?.email ?? '—'}</Text>
          <View style={{ height: S.x4 }} />
          <Text style={styles.label}>ID</Text>
          <Text style={styles.mono}>{user?.id ?? '—'}</Text>
        </Card>

        <View style={{ height: S.x5 }} />
        <Button label="Meus pedidos" variant="glass" onPress={() => router.push('/pedidos')} />
        <View style={{ height: S.x3 }} />
        <Button label="Sair" variant="ghost" onPress={signOut} />

        <Text style={styles.foot}>PulsePass · Fase 2 — super-app Cliente (mobile)</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: C.fg3, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  value: { color: C.fg, fontSize: 16, marginTop: 4 },
  mono: { color: C.fg2, fontFamily: 'monospace', fontSize: 12, marginTop: 4 },
  foot: { color: C.fg4, fontSize: 12, textAlign: 'center', marginTop: S.x12 },
});
