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
    <div className="pp-stack pp-stack-3 pp-mt-3" onBlur={() => setTouched(true)}>
      <div className="pp-field">
        <label htmlFor="cardform-1" className="pp-label">Número do cartão</label>
        <div className="pp-relativo">
          {/* Número do cartão em mono: é dado que se confere dígito a
              dígito, e é para isso que a largura fixa serve. */}
          <input id="cardform-1"
            className="pp-input pp-mono pp-cartao-num"
            inputMode="numeric"
            value={formatCardNumber(number)}
            onChange={(e) => setNumber(onlyDigits(e.target.value))}
            placeholder="0000 0000 0000 0000"
          />
          {brand !== 'UNKNOWN' && (
            <span className="pp-cartao-marca">{brand}</span>
          )}
        </div>
        {err('number') && <small className="pp-erro">{validation.errors.number}</small>}
      </div>

      <div className="pp-cols-2">
        <div className="pp-field">
          <label htmlFor="cardform-2" className="pp-label">Validade</label>
          <input id="cardform-2" className="pp-input" inputMode="numeric" value={expiry} onChange={(e) => onExpiry(e.target.value)} placeholder="MM/AA" />
          {err('expiry') && <small className="pp-erro">{validation.errors.expiry}</small>}
        </div>
        <div className="pp-field">
          <label htmlFor="cardform-3" className="pp-label">CVV</label>
          <input id="cardform-3" className="pp-input" inputMode="numeric" value={ccv} onChange={(e) => setCcv(onlyDigits(e.target.value).slice(0, 4))} placeholder="123" />
          {err('ccv') && <small className="pp-erro">{validation.errors.ccv}</small>}
        </div>
      </div>

      <div className="pp-field">
        <label htmlFor="cardform-4" className="pp-label">Nome impresso no cartão</label>
        <input id="cardform-4" className="pp-input" value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Como está no cartão" />
        {err('holderName') && <small className="pp-erro">{validation.errors.holderName}</small>}
      </div>

      <div className="pp-cols-2">
        <div className="pp-field">
          <label htmlFor="cardform-5" className="pp-label">CPF do titular</label>
          <input id="cardform-5" className="pp-input" inputMode="numeric" value={cpf} onChange={(e) => setCpf(onlyDigits(e.target.value).slice(0, 11))} placeholder="Somente números" />
        </div>
        <div className="pp-field">
          <label htmlFor="cardform-6" className="pp-label">CEP</label>
          <input id="cardform-6" className="pp-input" inputMode="numeric" value={cep} onChange={(e) => setCep(onlyDigits(e.target.value).slice(0, 8))} placeholder="00000000" />
        </div>
      </div>

      <div className="pp-cols-2">
        <div className="pp-field">
          <label htmlFor="cardform-7" className="pp-label">Número (endereço)</label>
          <input id="cardform-7" className="pp-input" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} placeholder="123" />
        </div>
        <div className="pp-field">
          <label htmlFor="cardform-8" className="pp-label">Telefone (opcional)</label>
          <input id="cardform-8" className="pp-input" inputMode="numeric" value={phone} onChange={(e) => setPhone(onlyDigits(e.target.value).slice(0, 11))} placeholder="DDD + número" />
        </div>
      </div>

      {installmentOpts.length > 1 && (
        <div className="pp-field">
          <label htmlFor="cardform-9" className="pp-label">Parcelas</label>
          <select id="cardform-9" className="pp-input" value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
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
