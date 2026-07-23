// ─────────────────────────────────────────────────────────────
// PulsePass · design tokens (objetos JS) — FONTE ÚNICA.
// Espelham tokens.css (variáveis CSS). Consumidos pelo mobile (RN).
// web/admin consomem a versão CSS via @pulsepass/shared/tokens.css.
// ─────────────────────────────────────────────────────────────

// Cores
export const C = {
  // Brand
  pulse: '#00FF85',
  pulseHi: '#4DFFA8',
  pulseLo: '#00CC6A',
  pulseInk: '#003C1F',

  // Accents
  violet: '#A78BFA',
  violetHi: '#C4B5FD',
  violetLo: '#7C3AED',
  cyan: '#22D3EE',
  cyanHi: '#67E8F9',
  cyanLo: '#0891B2',
  pink: '#FF3D88',
  amber: '#FFB800',
  red: '#FF3B30',

  // Ink (base escura)
  ink950: '#06070A',
  ink900: '#0B0D12',
  ink850: '#11141B',
  ink800: '#161A23',
  ink700: '#1F2430',
  ink600: '#2A3140',
  ink500: '#3A4254',

  // Puro
  white: '#FFFFFF',
  cream: '#F5F3EE',

  // Texto sobre escuro
  fg: '#FFFFFF',
  fg2: 'rgba(255,255,255,0.74)',
  fg3: 'rgba(255,255,255,0.52)',
  fg4: 'rgba(255,255,255,0.34)',
  fg5: 'rgba(255,255,255,0.18)',

  // Glass surfaces
  glass1: 'rgba(255,255,255,0.03)',
  glass2: 'rgba(255,255,255,0.06)',
  glass3: 'rgba(255,255,255,0.10)',
  glass4: 'rgba(255,255,255,0.14)',
  glass5: 'rgba(255,255,255,0.20)',

  // Glass borders
  edge1: 'rgba(255,255,255,0.06)',
  edge2: 'rgba(255,255,255,0.10)',
  edge3: 'rgba(255,255,255,0.16)',
  edge4: 'rgba(255,255,255,0.24)',
};

// Espaçamento (grade de 4px)
export const S = { x1: 4, x2: 8, x3: 12, x4: 16, x5: 20, x6: 24, x8: 32, x10: 40, x12: 48, x16: 64 };

// Raio de borda
export const R = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

// Fontes da marca (nomes batem com @expo-google-fonts, carregados no mobile/_layout).
export const F = {
  display: 'SpaceGrotesk_700Bold',
  displayMd: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMd: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  mono: 'monospace',
};
