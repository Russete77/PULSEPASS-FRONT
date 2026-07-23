import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { onlyDigits, detectBrand, formatCardNumber, toExpiryYear4, validateCard } from '@pulsepass/shared';
import { C, F, R, S } from '@/theme/tokens';

export type CardData = {
  card: { holderName: string; number: string; expiryMonth: string; expiryYear: string; ccv: string };
  holderInfo: { name: string; email?: string; cpfCnpj: string; postalCode: string; addressNumber: string };
};

// Form de cartão reutilizável (recarga e compra de ingresso). Chama
// onChange(data, valid) a cada alteração. Validação via @pulsepass/shared.
export default function CardFields({
  email,
  onChange,
}: {
  email?: string;
  onChange: (data: CardData, valid: boolean) => void;
}) {
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [ccv, setCcv] = useState('');
  const [holderName, setHolderName] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [mm, yy] = expiry.split('/');
  const brand = useMemo(() => detectBrand(number), [number]);

  const check = validateCard({ number, expiryMonth: mm, expiryYear: yy, ccv, holderName });
  const holderOk = onlyDigits(cpf).length >= 11 && onlyDigits(cep).length >= 8 && addressNumber.trim().length >= 1;
  const valid = check.valid && holderOk;

  useEffect(() => {
    onChange(
      {
        card: {
          holderName: holderName.trim(), number: onlyDigits(number),
          expiryMonth: String(Number(mm || 0)), expiryYear: toExpiryYear4(yy), ccv: onlyDigits(ccv),
        },
        holderInfo: {
          name: holderName.trim(), email,
          cpfCnpj: onlyDigits(cpf), postalCode: onlyDigits(cep), addressNumber: addressNumber.trim(),
        },
      },
      valid,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number, expiry, ccv, holderName, cpf, cep, addressNumber, valid]);

  function onExpiry(v: string) {
    const d = onlyDigits(v).slice(0, 4);
    setExpiry(d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  }

  return (
    <View style={{ gap: S.x3 }}>
      <Field label={`Número do cartão${brand !== 'UNKNOWN' ? ` · ${brand}` : ''}`}>
        <TextInput style={styles.input} keyboardType="number-pad" value={formatCardNumber(number)}
          onChangeText={(t) => setNumber(onlyDigits(t))} placeholder="0000 0000 0000 0000" placeholderTextColor={C.fg4} />
      </Field>
      <View style={{ flexDirection: 'row', gap: S.x3 }}>
        <View style={{ flex: 1 }}>
          <Field label="Validade">
            <TextInput style={styles.input} keyboardType="number-pad" value={expiry}
              onChangeText={onExpiry} placeholder="MM/AA" placeholderTextColor={C.fg4} />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="CVV">
            <TextInput style={styles.input} keyboardType="number-pad" value={ccv}
              onChangeText={(t) => setCcv(onlyDigits(t).slice(0, 4))} placeholder="123" placeholderTextColor={C.fg4} />
          </Field>
        </View>
      </View>
      <Field label="Nome impresso no cartão">
        <TextInput style={styles.input} value={holderName} onChangeText={setHolderName}
          placeholder="Como está no cartão" placeholderTextColor={C.fg4} autoCapitalize="characters" />
      </Field>
      <View style={{ flexDirection: 'row', gap: S.x3 }}>
        <View style={{ flex: 1 }}>
          <Field label="CPF do titular">
            <TextInput style={styles.input} keyboardType="number-pad" value={cpf}
              onChangeText={(t) => setCpf(onlyDigits(t).slice(0, 11))} placeholder="Somente números" placeholderTextColor={C.fg4} />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="CEP">
            <TextInput style={styles.input} keyboardType="number-pad" value={cep}
              onChangeText={(t) => setCep(onlyDigits(t).slice(0, 8))} placeholder="00000000" placeholderTextColor={C.fg4} />
          </Field>
        </View>
      </View>
      <Field label="Número (endereço)">
        <TextInput style={styles.input} value={addressNumber} onChangeText={setAddressNumber}
          placeholder="123" placeholderTextColor={C.fg4} />
      </Field>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: C.fg3, fontSize: 12, marginBottom: 4 },
  input: {
    color: C.fg, backgroundColor: C.glass1, borderWidth: 1, borderColor: C.edge2,
    borderRadius: R.md, paddingHorizontal: S.x4, paddingVertical: S.x3, fontFamily: F.body,
  },
});
