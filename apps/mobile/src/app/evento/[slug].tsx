import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Eyebrow, Screen, Title } from '@/components/ui';
import CardFields, { CardData } from '@/components/CardFields';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { brl, eventDate } from '@/lib/format';
import { C, F, R, S } from '@/theme/tokens';

type Tier = {
  id: string; name: string; price_cents: number; half_price_cents?: number | null;
  max_per_order: number; available: number; status: string;
  sale_state?: string; sales_start?: string | null;
};
type Ev = {
  id: string; title: string; slug: string; description?: string;
  venue_name?: string; address?: string; city: string; state: string; starts_at: string;
  service_fee_bps?: number;
  tiers: Tier[];
};
type Order = { id: string; status: string; payment_method?: string };
type Sel = { full: number; half: number };
const EMPTY: Sel = { full: 0, half: 0 };

export default function EventoDetalhe() {
  const router = useRouter();
  const { user } = useAuth();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const [event, setEvent] = useState<Ev | null>(null);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');
  const [sel, setSel] = useState<Record<string, Sel>>({});
  const [method, setMethod] = useState<'pix' | 'card'>('pix');
  const [card, setCard] = useState<CardData | null>(null);
  const [cardValid, setCardValid] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getEvent(slug)
      .then((d) => { setEvent(d as Ev); setStatus('done'); })
      .catch((e) => { setError((e as Error).message); setStatus('error'); });
  }, [slug]);

  const subtotalCents = useMemo(
    () => (event?.tiers ?? []).reduce((s, t) => {
      const q = sel[t.id] ?? EMPTY;
      return s + q.full * t.price_cents + q.half * (t.half_price_cents ?? 0);
    }, 0),
    [sel, event],
  );
  const feeBps = event?.service_fee_bps ?? 0;
  const feeCents = Math.round((subtotalCents * feeBps) / 10000);
  const totalCents = subtotalCents + feeCents;
  const itemCount = Object.values(sel).reduce((a, s) => a + s.full + s.half, 0);

  function step(t: Tier, kind: 'full' | 'half', delta: number) {
    setSel((prev) => {
      const s = prev[t.id] ?? EMPTY;
      const combined = s.full + s.half;
      const cap = Math.min(t.max_per_order, t.available);
      let d = delta;
      if (d > 0) d = Math.min(d, cap - combined);
      return { ...prev, [t.id]: { ...s, [kind]: Math.max(0, s[kind] + d) } };
    });
  }

  async function buy() {
    if (!user) { router.push('/login'); return; }
    const items: { ticket_tier_id: string; quantity: number; half: boolean }[] = [];
    for (const t of event?.tiers ?? []) {
      const s = sel[t.id] ?? EMPTY;
      if (s.full > 0) items.push({ ticket_tier_id: t.id, quantity: s.full, half: false });
      if (s.half > 0) items.push({ ticket_tier_id: t.id, quantity: s.half, half: true });
    }
    if (items.length === 0) return;
    if (method === 'card' && (!cardValid || !card)) { setError('Preencha os dados do cartão.'); return; }

    setBusy(true); setError('');
    try {
      const extra: Record<string, unknown> = method === 'card' && card
        ? { paymentMethod: 'card', installmentCount: 1, card: card.card, holderInfo: card.holderInfo }
        : { paymentMethod: 'pix' };
      if (coupon.trim()) extra.couponCode = coupon.trim();
      const order = (await api.createOrder(slug, items, extra)) as Order;
      if (order.status === 'paid') router.replace('/(tabs)/ingressos');
      else router.replace(`/checkout/${order.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (status === 'loading') return <Screen><ActivityIndicator color={C.pulse} style={{ marginTop: 60 }} /></Screen>;
  if (status === 'error' || !event) return <Screen><Text style={styles.error}>{error || 'Evento indisponível'}</Text></Screen>;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: S.x6, paddingBottom: S.x16 }}>
        <Eyebrow>{eventDate(event.starts_at)}</Eyebrow>
        <Title>{event.title}</Title>
        <Text style={styles.meta}>
          {event.venue_name ? `${event.venue_name} · ` : ''}{event.city}/{event.state}
        </Text>
        {event.description ? <Text style={styles.desc}>{event.description}</Text> : null}

        <Text style={styles.section}>Ingressos</Text>
        {event.tiers.map((t) => {
          const s = sel[t.id] ?? EMPTY;
          const cap = Math.min(t.max_per_order, t.available);
          const combined = s.full + s.half;
          const st = t.sale_state ?? (t.available <= 0 ? 'sold_out' : 'on_sale');
          const locked = st !== 'on_sale';
          const note = st === 'upcoming' ? `Vendas a partir de ${eventDate(t.sales_start ?? undefined)}`
            : st === 'ended' ? 'Vendas encerradas'
              : st === 'sold_out' ? 'Esgotado' : undefined;
          return (
            <Card key={t.id} style={{ marginBottom: S.x3 }}>
              <StepRow
                label={t.name} price={brl(t.price_cents)} qty={s.full}
                onDec={() => step(t, 'full', -1)} onInc={() => step(t, 'full', +1)}
                decOff={s.full === 0} incOff={locked || combined >= cap} note={note}
              />
              {t.half_price_cents != null && (
                <StepRow
                  sub label="Meia-entrada" price={brl(t.half_price_cents)} qty={s.half}
                  onDec={() => step(t, 'half', -1)} onInc={() => step(t, 'half', +1)}
                  decOff={s.half === 0} incOff={locked || combined >= cap}
                />
              )}
            </Card>
          );
        })}

        {itemCount > 0 && (
          <>
            {feeCents > 0 && (
              <>
                <View style={styles.lineRow}><Text style={styles.lineLbl}>Subtotal</Text><Text style={styles.lineVal}>{brl(subtotalCents)}</Text></View>
                <View style={styles.lineRow}><Text style={styles.lineLbl}>Taxa de serviço ({(feeBps / 100).toFixed(feeBps % 100 ? 2 : 0)}%)</Text><Text style={styles.lineVal}>{brl(feeCents)}</Text></View>
              </>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLbl}>Total</Text>
              <Text style={styles.totalVal}>{brl(totalCents)}</Text>
            </View>

            <View style={{ marginTop: S.x4 }}>
              <Text style={styles.couponLbl}>Cupom de desconto (opcional)</Text>
              <TextInput
                style={styles.couponInput}
                value={coupon}
                onChangeText={(v) => setCoupon(v.toUpperCase())}
                autoCapitalize="characters"
                placeholder="Tem um cupom?"
                placeholderTextColor={C.fg4}
              />
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
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={{ height: S.x4 }} />
        <Button
          label={
            itemCount === 0 ? 'Selecione ingressos'
              : method === 'card' ? `Pagar no cartão · ${brl(totalCents)}`
                : `Pagar com Pix · ${brl(totalCents)}`
          }
          onPress={buy}
          loading={busy}
          disabled={itemCount === 0 || (method === 'card' && !cardValid)}
        />
        <Button label="Voltar" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </Screen>
  );
}

function StepRow({ label, sub, price, qty, onDec, onInc, decOff, incOff, note }: {
  label: string; sub?: boolean; price: string; qty: number;
  onDec: () => void; onInc: () => void; decOff: boolean; incOff: boolean; note?: string;
}) {
  return (
    <View style={[styles.tier, sub && { marginTop: S.x2 }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.tierName, sub && { fontSize: 13, color: C.fg3 }]}>{label}</Text>
        <Text style={styles.tierPrice}>{price}</Text>
        {note && !sub && <Text style={styles.sold}>{note}</Text>}
      </View>
      <View style={styles.stepper}>
        <Pressable style={styles.stepBtn} disabled={decOff} onPress={onDec}><Text style={styles.stepTxt}>−</Text></Pressable>
        <Text style={styles.qty}>{qty}</Text>
        <Pressable style={styles.stepBtn} disabled={incOff} onPress={onInc}><Text style={styles.stepTxt}>+</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  meta: { color: C.fg3, fontSize: 13, marginTop: 4 },
  desc: { color: C.fg2, lineHeight: 20, marginTop: S.x4 },
  section: { color: C.fg, fontFamily: F.bodyBold, fontSize: 16, marginTop: S.x6, marginBottom: S.x3 },
  tier: { flexDirection: 'row', alignItems: 'center' },
  tierName: { color: C.fg, fontFamily: F.bodyMd, fontSize: 15 },
  tierPrice: { color: C.pulse, fontFamily: F.mono, marginTop: 2 },
  sold: { color: C.red, fontSize: 12, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: S.x3 },
  stepBtn: {
    width: 36, height: 36, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.edge3, backgroundColor: C.glass2,
  },
  stepTxt: { color: C.fg, fontSize: 18 },
  qty: { color: C.fg, fontFamily: F.bodyBold, minWidth: 20, textAlign: 'center' },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: S.x2 },
  lineLbl: { color: C.fg3, fontSize: 13 },
  lineVal: { color: C.fg3, fontSize: 13 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: S.x4 },
  totalLbl: { color: C.fg2 },
  totalVal: { color: C.fg, fontFamily: F.display, fontSize: 20 },
  methodRow: { flexDirection: 'row', gap: S.x3, marginTop: S.x4 },
  method: {
    flex: 1, alignItems: 'center', paddingVertical: S.x3, borderRadius: R.md,
    borderWidth: 1, borderColor: C.edge2, backgroundColor: C.glass1,
  },
  methodOn: { backgroundColor: C.pulse, borderColor: C.pulse },
  methodTxt: { color: C.fg, fontFamily: F.bodyMd },
  couponLbl: { color: C.fg3, fontSize: 12, marginBottom: 4 },
  couponInput: {
    color: C.fg, backgroundColor: C.glass1, borderWidth: 1, borderColor: C.edge2,
    borderRadius: R.md, paddingHorizontal: S.x4, paddingVertical: S.x3, fontFamily: F.body,
  },
  error: { color: '#FF6B61', marginTop: S.x3 },
});
