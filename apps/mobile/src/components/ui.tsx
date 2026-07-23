import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, R, S, F } from '@/theme/tokens';

export function Screen({ children, scroll }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {children}
    </SafeAreaView>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'glass' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' && styles.btnPrimary,
        variant === 'glass' && styles.btnGlass,
        variant === 'ghost' && styles.btnGhost,
        (disabled || loading) && { opacity: 0.45 },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? C.pulseInk : C.fg} />
      ) : (
        <Text style={[styles.btnText, variant === 'primary' && { color: C.pulseInk }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Badge({ children, color = C.pulse }: { children: ReactNode; color?: string }) {
  return (
    <View style={[styles.badge, { borderColor: color + '66' }]}>
      <Text style={[styles.badgeText, { color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.ink950 },
  eyebrow: {
    color: C.pulse,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  title: { color: C.fg, fontSize: 28, fontFamily: F.display, letterSpacing: -0.5, marginBottom: 4 },
  card: {
    backgroundColor: C.glass2,
    borderWidth: 1,
    borderColor: C.edge2,
    borderRadius: R.lg,
    padding: S.x5,
  },
  btn: { height: 52, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: S.x6 },
  btnPrimary: { backgroundColor: C.pulse },
  btnGlass: { backgroundColor: C.glass2, borderWidth: 1, borderColor: C.edge2 },
  btnGhost: { backgroundColor: 'transparent' },
  btnText: { color: C.fg, fontFamily: F.bodyBold, fontSize: 16 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: R.pill,
    borderWidth: 1,
    backgroundColor: C.glass2,
  },
  badgeText: { fontSize: 12, fontFamily: F.bodyMd },
});
