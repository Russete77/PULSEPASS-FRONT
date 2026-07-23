// ─────────────────────────────────────────────────────────────
// PulsePass · helpers de formatação — FONTE ÚNICA (compartilhada).
// Consumida por web/, admin/ e mobile/ via @pulsepass/shared.
// ─────────────────────────────────────────────────────────────

/** Formata centavos em BRL. Ex: 1990 → "R$ 19,90". */
export function brl(cents) {
  return (Number(cents ?? 0) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/** Data de evento — formato amigável. Ex: "sex., 12 de jun., 22:00". */
export function eventDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Timestamp administrativo — inclui ano. Ex: "12 de jun. de 2026, 22:00". */
export function dateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Valor para campos de data/hora (<input type="datetime-local">). */
export function toDatetimeLocal(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
