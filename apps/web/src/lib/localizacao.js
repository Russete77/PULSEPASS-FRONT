/**
 * Descobrir em que cidade a pessoa está — sem serviço externo.
 *
 * O navegador entrega latitude e longitude, não o nome da cidade. O caminho
 * usual é mandar as coordenadas para um geocodificador de terceiros, o que
 * significa: chave de API, custo por consulta, mais um ponto de falha na
 * primeira tela do produto, e as coordenadas exatas de cada visitante saindo
 * do nosso domínio.
 *
 * Aqui a conta é feita no próprio aparelho: acha-se a cidade mais próxima
 * dentro de uma tabela local. Para escolher "eventos em qual cidade", isso é
 * exato o suficiente — e é exatamente a pergunta que precisamos responder.
 */

/** Capitais e grandes praças de evento. Fonte: IBGE (sedes municipais). */
const CIDADES = [
  { city: 'São Paulo', state: 'SP', lat: -23.5505, lon: -46.6333 },
  { city: 'Rio de Janeiro', state: 'RJ', lat: -22.9068, lon: -43.1729 },
  { city: 'Belo Horizonte', state: 'MG', lat: -19.9167, lon: -43.9345 },
  { city: 'Brasília', state: 'DF', lat: -15.7939, lon: -47.8828 },
  { city: 'Curitiba', state: 'PR', lat: -25.4284, lon: -49.2733 },
  { city: 'Porto Alegre', state: 'RS', lat: -30.0346, lon: -51.2177 },
  { city: 'Salvador', state: 'BA', lat: -12.9777, lon: -38.5016 },
  { city: 'Recife', state: 'PE', lat: -8.0476, lon: -34.8770 },
  { city: 'Fortaleza', state: 'CE', lat: -3.7319, lon: -38.5267 },
  { city: 'Florianópolis', state: 'SC', lat: -27.5954, lon: -48.5480 },
  { city: 'Goiânia', state: 'GO', lat: -16.6869, lon: -49.2648 },
  { city: 'Manaus', state: 'AM', lat: -3.1190, lon: -60.0217 },
  { city: 'Belém', state: 'PA', lat: -1.4558, lon: -48.5039 },
  { city: 'Vitória', state: 'ES', lat: -20.3155, lon: -40.3128 },
  { city: 'Natal', state: 'RN', lat: -5.7945, lon: -35.2110 },
  { city: 'João Pessoa', state: 'PB', lat: -7.1195, lon: -34.8450 },
  { city: 'Maceió', state: 'AL', lat: -9.6498, lon: -35.7089 },
  { city: 'Campo Grande', state: 'MS', lat: -20.4697, lon: -54.6201 },
  { city: 'Cuiabá', state: 'MT', lat: -15.6014, lon: -56.0979 },
  { city: 'São Luís', state: 'MA', lat: -2.5297, lon: -44.3028 },
  { city: 'Teresina', state: 'PI', lat: -5.0892, lon: -42.8019 },
  { city: 'Aracaju', state: 'SE', lat: -10.9472, lon: -37.0731 },
  { city: 'Campinas', state: 'SP', lat: -22.9099, lon: -47.0626 },
  { city: 'Ribeirão Preto', state: 'SP', lat: -21.1775, lon: -47.8103 },
  { city: 'Santos', state: 'SP', lat: -23.9608, lon: -46.3336 },
  { city: 'Sorocaba', state: 'SP', lat: -23.5015, lon: -47.4526 },
  { city: 'Niterói', state: 'RJ', lat: -22.8832, lon: -43.1034 },
  { city: 'Uberlândia', state: 'MG', lat: -18.9186, lon: -48.2772 },
  { city: 'Londrina', state: 'PR', lat: -23.3045, lon: -51.1696 },
  { city: 'Joinville', state: 'SC', lat: -26.3044, lon: -48.8456 },
  { city: 'Caxias do Sul', state: 'RS', lat: -29.1685, lon: -51.1796 },
  { city: 'Balneário Camboriú', state: 'SC', lat: -26.9906, lon: -48.6348 },
];

const RAIO_TERRA_KM = 6371;
const rad = (g) => (g * Math.PI) / 180;

/** Distância em km entre dois pontos (haversine). */
export function distanciaKm(aLat, aLon, bLat, bLon) {
  const dLat = rad(bLat - aLat);
  const dLon = rad(bLon - aLon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * RAIO_TERRA_KM * Math.asin(Math.sqrt(h));
}

/** Cidade mais próxima das coordenadas, com a distância até ela. */
export function cidadeMaisProxima(lat, lon) {
  let melhor = null;
  for (const c of CIDADES) {
    const d = distanciaKm(lat, lon, c.lat, c.lon);
    if (!melhor || d < melhor.distancia_km) melhor = { ...c, distancia_km: Math.round(d) };
  }
  return melhor;
}

const CHAVE = 'pp:cidade';

/** Cidade que a pessoa escolheu antes. Escolha manual manda sobre GPS. */
export function cidadeSalva() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? JSON.parse(bruto) : null;
  } catch { return null; }
}

export function salvarCidade(cidade) {
  try { localStorage.setItem(CHAVE, JSON.stringify(cidade)); } catch { /* modo anônimo */ }
}

export function esquecerCidade() {
  try { localStorage.removeItem(CHAVE); } catch { /* noop */ }
}

/**
 * Pede a localização ao navegador.
 *
 * Nunca lança: negar a permissão é uma resposta legítima e comum, não um
 * erro. Quem nega continua com a vitrine inteira e o seletor manual — o que
 * não pode acontecer é a primeira tela quebrar por causa disso.
 */
export function detectarCidade({ timeoutMs = 8000 } = {}) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(cidadeMaisProxima(pos.coords.latitude, pos.coords.longitude)),
      () => resolve(null),
      { timeout: timeoutMs, maximumAge: 30 * 60 * 1000, enableHighAccuracy: false },
    );
  });
}

export const CIDADES_CONHECIDAS = CIDADES;
