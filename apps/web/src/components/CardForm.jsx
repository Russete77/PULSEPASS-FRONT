import { useEffect, useMemo, useState } from 'react';
import {
  formatCardNumber, detectBrand, onlyDigits, toExpiryYear4, validateCard,
} from '@pulsepass/shared';
import { brl } from '../lib/format.js';

// Form de cartão de crédito. Controlado por callback: chama onChange(payload, valid)
// sempre que algo muda. O cartão é validado localmente e enviado ao backend, que
// tokeniza no Asaas (PAN não é armazenado por nós).
export default function CardForm({ amountCents, email, onChange }) {
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState(''); // MM/AA
  const [ccv, setCcv] = useState('');
  const [holderName, setHolderName] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [installments, setInstallments] = useState(1);
  const [touched, setTouched] = useState(false);

  const brand = useMemo(() => detectBrand(number), [number]);
  const [mm, yy] = expiry.split('/');

  const installmentOpts = useMemo(() => {
    const max = Math.min(12, Math.max(1, Math.floor(amountCents / 500))); // parcela mín. R$5
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [amountCents]);

  const validation = validateCard({ number, expiryMonth: mm, expiryYear: yy, ccv, holderName });
  const holderValid = onlyDigits(cpf).length >= 11 && onlyDigits(cep).length >= 8 && addressNumber.trim().length >= 1;
  const valid = validation.valid && holderValid;

  useEffect(() => {
    const payload = {
      installmentCount: installments,
      card: {
        holderName: holderName.trim(),
        number: onlyDigits(number),
        expiryMonth: String(Number(mm || 0)),
        expiryYear: toExpiryYear4(yy),
        ccv: onlyDigits(ccv),
      },
      holderInfo: {
        name: holderName.trim(),
        email: email || undefined,
        cpfCnpj: onlyDigits(cpf),
        postalCode: onlyDigits(cep),
        addressNumber: addressNumber.trim(),
        phone: onlyDigits(phone) || undefined,
      },
    };
    onChange?.(payload, valid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number, expiry, ccv, holderName, cpf, cep, addressNumber, phone, installments, valid]);

  function onExpiry(v) {
    const d = onlyDigits(v).slice(0, 4);
    setExpiry(d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  }

  const err = (k) => touched && validation.errors[k];

  return (
    <div style={{ display: 'grid', gap: 12, marginTop: 12 }} onBlur={() => setTouched(true)}>
      <div className="pp-field">
        <label className="pp-label">Número do cartão</label>
        <div style={{ position: 'relative' }}>
          <input
            className="pp-input"
            inputMode="numeric"
            value={formatCardNumber(number)}
            onChange={(e) => setNumber(onlyDigits(e.target.value))}
            placeholder="0000 0000 0000 0000"
            style={{ fontFamily: 'var(--pp-font-mono)', letterSpacing: 1 }}
          />
          {brand !== 'UNKNOWN' && (
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--pp-fg-3)' }}>
              {brand}
            </span>
          )}
        </div>
        {err('number') && <small style={{ color: 'var(--pp-red)' }}>{validation.errors.number}</small>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="pp-field">
          <label className="pp-label">Validade</label>
          <input className="pp-input" inputMode="numeric" value={expiry} onChange={(e) => onExpiry(e.target.value)} placeholder="MM/AA" />
          {err('expiry') && <small style={{ color: 'var(--pp-red)' }}>{validation.errors.expiry}</small>}
        </div>
        <div className="pp-field">
          <label className="pp-label">CVV</label>
          <input className="pp-input" inputMode="numeric" value={ccv} onChange={(e) => setCcv(onlyDigits(e.target.value).slice(0, 4))} placeholder="123" />
          {err('ccv') && <small style={{ color: 'var(--pp-red)' }}>{validation.errors.ccv}</small>}
        </div>
      </div>

      <div className="pp-field">
        <label className="pp-label">Nome impresso no cartão</label>
        <input className="pp-input" value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Como está no cartão" />
        {err('holderName') && <small style={{ color: 'var(--pp-red)' }}>{validation.errors.holderName}</small>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="pp-field">
          <label className="pp-label">CPF do titular</label>
          <input className="pp-input" inputMode="numeric" value={cpf} onChange={(e) => setCpf(onlyDigits(e.target.value).slice(0, 11))} placeholder="Somente números" />
        </div>
        <div className="pp-field">
          <label className="pp-label">CEP</label>
          <input className="pp-input" inputMode="numeric" value={cep} onChange={(e) => setCep(onlyDigits(e.target.value).slice(0, 8))} placeholder="00000000" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="pp-field">
          <label className="pp-label">Número (endereço)</label>
          <input className="pp-input" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} placeholder="123" />
        </div>
        <div className="pp-field">
          <label className="pp-label">Telefone (opcional)</label>
          <input className="pp-input" inputMode="numeric" value={phone} onChange={(e) => setPhone(onlyDigits(e.target.value).slice(0, 11))} placeholder="DDD + número" />
        </div>
      </div>

      {installmentOpts.length > 1 && (
        <div className="pp-field">
          <label className="pp-label">Parcelas</label>
          <select className="pp-input" value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
            {installmentOpts.map((n) => (
              <option key={n} value={n}>
                {n}x de {brl(Math.round(amountCents / n))} {n === 1 ? '(à vista)' : 'sem juros'}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
