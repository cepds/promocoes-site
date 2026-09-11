const fs = require('fs');

const path = 'data/ofertas.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const now = new Date().toISOString();
const offers = Array.isArray(data.ofertas) ? data.ofertas : [];
const ids = new Set(offers.map(o => String(o.id || '')));
const urls = new Set(offers.map(o => String(o.url || '').split('?')[0].replace(/\/$/, '')));

function scoreClass(score) {
  return score >= 75 ? 'Excelente' : score >= 58 ? 'Boa' : score >= 42 ? 'Interessante' : 'Normal';
}

const candidates = [
  {
    id: 'electrolux-it70s-481l-bivolt-oficial',
    nome: 'Geladeira Electrolux Frost Free Inverter 481L AutoSense SmartBivolt IT70S',
    categoria: 'Geladeiras',
    loja: 'Loja Oficial Electrolux',
    seloLoja: 'Loja Oficial',
    precoAtual: 4099,
    precoAnterior: 4749,
    desconto: 13,
    cupom: 'Não informado', cashback: 'Não informado',
    frete: 'Consulte na loja', freteValor: null, freteGratis: false, cepFrete: '72620-405', precoComFrete: null,
    voltagem: 'Bivolt',
    url: 'https://loja.electrolux.com.br/geladeira-electrolux-frost-free-inverter-481l-efficient-com-autosense-smartbivolt-duplex-cor-inox-look--it70s-/p',
    imagem: 'https://electrolux.vtexassets.com/arquivos/ids/292196-640-640?aspect=true&format=auto&height=640&v=639102196893570000&width=640',
    observacoes: 'Preço, disponibilidade e SmartBivolt confirmados na Loja Oficial Electrolux em 11/09/2026.',
    scoreOferta: 54
  },
  {
    id: 'electrolux-eaf45-56l-220v-oficial',
    nome: 'Air Fryer Electrolux por Rita Lobo 5,6L Digital EAF45 220V',
    categoria: 'Air Fryers',
    loja: 'Loja Oficial Electrolux',
    seloLoja: 'Loja Oficial',
    precoAtual: 399.9,
    precoAnterior: 589.9,
    desconto: 32,
    cupom: 'Não informado', cashback: 'Não informado',
    frete: 'Consulte na loja', freteValor: null, freteGratis: false, cepFrete: '72620-405', precoComFrete: null,
    voltagem: '220V',
    url: 'https://loja.electrolux.com.br/air-fryer-electrolux-por-rita-lobo5-6l-experience-eaf45/p',
    imagem: 'https://lojarcell.vtexassets.com/arquivos/ids/191731/fritadeira-eletrica-electrolux-5-6l-eaf45-1400w-cinza-220v-3.jpg.jpg?v=638804906924230000',
    observacoes: 'Preço e variante 220V confirmados na Loja Oficial Electrolux em 11/09/2026. Imagem corresponde ao modelo EAF45.',
    scoreOferta: 72
  },
  {
    id: 'wap-air-fryer-family-4l-220v-oficial',
    nome: 'Fritadeira Elétrica WAP Air Fryer Family 4L 1500W 220V',
    categoria: 'Air Fryers',
    loja: 'Loja WAP',
    seloLoja: 'Loja Oficial',
    precoAtual: 236.97,
    precoAnterior: 599.9,
    desconto: 60,
    cupom: 'Não informado', cashback: 'Não informado',
    frete: 'Consulte na loja', freteValor: null, freteGratis: false, cepFrete: '72620-405', precoComFrete: null,
    voltagem: '220V',
    url: 'https://parceiros.wap.ind.br/fritadeira-eletrica-wap-air-fryer-family-4l/p',
    imagem: 'https://www.guimepa.com.br/cdn/shop/files/airfry-fritadeira-sem-_leo-4l-220v-1500w-wap-1129522-fw009532-4.jpg?v=1757503326',
    observacoes: 'Preço à vista e referência FW009532 (220V) confirmados em página da WAP em 11/09/2026. Imagem corresponde ao mesmo modelo 220V.',
    scoreOferta: 88
  },
  {
    id: 'tramontina-ravena-5p-27899286-oficial',
    nome: 'Jogo de Panelas Tramontina Ravena Starflon Max 5 Peças',
    categoria: 'Cozinha',
    loja: 'Tramontina Store',
    seloLoja: 'Loja Oficial',
    precoAtual: 239,
    precoAnterior: 572,
    desconto: 56,
    cupom: 'Cupom disponível', cashback: 'Não informado',
    frete: 'Frete grátis', freteValor: 0, freteGratis: true, cepFrete: '72620-405', precoComFrete: 239,
    voltagem: null,
    url: 'https://www.tramontina.com.br/jogo-de-panelas-tramontina-ravena-em-aluminio-com-revestimento-interno-e-externo-antiaderente-starflon-max-5-pecas/27899286.html',
    imagem: 'https://precolandia.vtexassets.com/arquivos/ids/243112/Jogo-de-Panelas-5-Pecas-com-Tampa-De-Vidro-Ravena-Azul-Tramontina-precolandia-089672-1d.jpg?v=638472412754600000',
    observacoes: 'Preço à vista, desconto, disponibilidade e referência 27899286 confirmados na Tramontina Store em 11/09/2026. Frete grátis anunciado pela loja; imagem corresponde ao conjunto Ravena.',
    scoreOferta: 92
  }
];

let added = 0;
for (const c of candidates) {
  const normalizedUrl = c.url.split('?')[0].replace(/\/$/, '');
  if (ids.has(c.id) || urls.has(normalizedUrl)) continue;
  const offer = {
    ...c,
    ativa: true,
    dataEncontrada: now,
    ultimaVerificacao: now,
    historicoPrecos: [{ data: now, preco: c.precoAtual, freteValor: c.freteValor, precoComFrete: c.precoComFrete }],
    menorPrecoHistorico: c.precoAtual,
    precoMedioHistorico: c.precoAtual,
    classificacaoOferta: scoreClass(c.scoreOferta),
    variacaoPreco: null,
    ultimaQuedaPreco: null
  };
  offers.push(offer);
  ids.add(c.id); urls.add(normalizedUrl); added++;
  data.logAlteracoes = Array.isArray(data.logAlteracoes) ? data.logAlteracoes : [];
  data.logAlteracoes.push({ data: now, tipo: 'adicionado', produto: c.nome, id: c.id, detalhe: `Oferta verificada adicionada de ${c.loja}.` });
}

data.logAlteracoes = (Array.isArray(data.logAlteracoes) ? data.logAlteracoes : []).slice(-200);
data.ofertas = offers;
data.total = offers.filter(o => o && o.ativa !== false).length;
data.geradoEm = now;
fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log(`Catálogo atualizado: ${added} nova(s) oferta(s), ${data.total} ativa(s).`);
