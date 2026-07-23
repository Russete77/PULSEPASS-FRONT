// ─────────────────────────────────────────────────────────────
// PulsePass · utilidades de cartão de crédito — FONTE ÚNICA.
// Validação/formatação client-side. NUNCA armazena o cartão; só ajuda
// o usuário a digitar certo antes de enviar ao backend (que tokeniza).
// ─────────────────────────────────────────────────────────────

export function onlyDigits(s) {
  return String(s ?? '').replace(/\D+/g, '');
}

/** Detecta a bandeira a partir do número (prefixos comuns BR). */
export function detectBrand(number) {
  const n = onlyDigits(number);
  if (/^4/.test(n)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'MASTERCARD';
  if (/^3[47]/.test(n)) return 'AMEX';
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(n)) return 'ELO';
  if (/^(606282|3841)/.test(n)) return 'HIPERCARD';
  if (/^3(0[0-5]|[68])/.test(n)) return 'DINERS';
  return 'UNKNOWN';
}

/** Validação de Luhn (dígito verificador). */
export function luhnValid(number) {
  const n = onlyDigits(number);
  if (n.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = Number(n[i]);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

/** Formata "1234567890123456" → "1234 5678 9012 3456". */
export function formatCardNumber(number) {
  return onlyDigits(number).slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
}

/** Valida validade. Aceita ano com 2 ou 4 dígitos; retorna ano com 4. */
export function expiryValid(mm, yy) {
  const m = Number(mm);
  if (!(m >= 1 && m <= 12)) return false;
  const yNum = Number(yy);
  const yyyy = yNum < 100 ? 2000 + yNum : yNum;
  if (!yyyy) return false;
  const endOfMonth = new Date(yyyy, m, 1); // 1º dia após o mês de validade
  return endOfMonth > new Date();
}

export function toExpiryYear4(yy) {
  const yNum = Number(onlyDigits(yy));
  return String(yNum < 100 ? 2000 + yNum : yNum);
}

/** Valida o cartão completo. Retorna { valid, errors }. */
export function validateCard({ number, expiryMonth, expiryYear, ccv, holderName }) {
  const errors = {};
  if (!luhnValid(number)) errors.number = 'Número de cartão inválido';
  if (!expiryValid(expiryMonth, expiryYear)) errors.expiry = 'Validade inválida';
  const cvvLen = onlyDigits(ccv).length;
  if (cvvLen < 3 || cvvLen > 4) errors.ccv = 'CVV inválido';
  if (!holderName || holderName.trim().length < 2) errors.holderName = 'Nome do titular inválido';
  return { valid: Object.keys(errors).length === 0, errors };
}
