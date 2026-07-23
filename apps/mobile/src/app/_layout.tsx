import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { C } from '@/theme/tokens';

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    // Rotas públicas (sem login): tela de login e inscrição em lista (deep link de promoter).
    const PUBLIC = ['login', 'lista'];
    const isPublic = PUBLIC.includes(segments[0] as string);
    if (!user && !isPublic) router.replace('/login');
    else if (user && segments[0] === 'login') router.replace('/(tabs)');
  }, [user, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.ink950 } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="evento/[slug]" options={{ presentation: 'card' }} />
      <Stack.Screen name="checkout/[orderId]" options={{ presentation: 'card' }} />
      <Stack.Screen name="ingresso/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="lista/[code]" options={{ presentation: 'card' }} />
      <Stack.Screen name="recarga" options={{ presentation: 'modal' }} />
      <Stack.Screen name="pedidos" options={{ presentation: 'card' }} />
    </Stack>
  );
}

export default function RootLayout() {
  // Fontes da marca (mesmas do web: Space Grotesk display + Inter texto).
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: C.ink950, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.pulse} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.ink950 }}>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
