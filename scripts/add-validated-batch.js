const fs = require('fs');
const path = 'data/ofertas.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const now = new Date().toISOString();
data.ofertas = Array.isArray(data.ofertas) ? data.ofertas : [];
data.logAlteracoes = Array.isArray(data.logAlteracoes) ? data.logAlteracoes : [];

const candidates = [
  {
    id: 'magalu-midea-wave-13kg-220v-jb8djafkka',
    nome: 'Lavadora Midea Wave Agitator 13kg Branco 220V',
    categoria: 'Máquinas de lavar',
    loja: 'Webcontinental Marketplace no Magalu',
    precoAtual: 1727.90,
    precoAnterior: 1799.90,
    desconto: 4,
    voltagem: '220V',
    url: 'https://www.magazineluiza.com.br/lavadora-midea-wave-agitator-13kg-branco-220v/p/jb8djafkka/ed/lava/',
    imagem: 'https://a-static.mlcdn.com.br/90x90/lavadora-midea-wave-agitator-13kg-branco-220v/lojawebcontinentalmarketplace/mkp002648006517/01e9098f84ecceba44055cd87324ba18.jpeg',
    observacoes: 'Preço, disponibilidade e voltagem 220V verificados. Vendido e entregue por Webcontinental Marketplace.'
  },
  {
    id: 'magalu-brastemp-bwf16ab-16kg-220v-ak4d73dhff',
    nome: 'Máquina de Lavar Brastemp 16Kg BWF16AB Branca 220V',
    categoria: 'Máquinas de lavar',
    loja: 'Lojas TaQi no Magalu',
    precoAtual: 2436.66,
    precoAnterior: 2564.90,
    desconto: 5,
    voltagem: '220V',
    url: 'https://www.magazineluiza.com.br/maquina-de-lavar-roupas-brastemp-16kg-bwf16ab-branca-220-volts/p/ak4d73dhff/ed/lava/',
    imagem: 'https://m.magazineluiza.com.br/a-static/420x420/maquina-de-lavar-roupas-brastemp-16kg-bwf16ab-branca-220-volts/lojastaqi/100082852/bc92228cf77c0e84d091e5dfba7d554f.jpg',
    observacoes: 'Preço, disponibilidade e voltagem 220V verificados. Vendido e entregue por Lojas TaQi.'
  },
  {
    id: 'magalu-mueller-family-aquatec-12kg-220v-khkb67e324',
    nome: 'Lavadora Mueller Family Aquatec 12kg Preta 220V',
    categoria: 'Máquinas de lavar',
    loja: 'Friopeças no Magalu',
    precoAtual: 621.00,
    precoAnterior: 690.00,
    desconto: 10,
    voltagem: '220V',
    url: 'https://www.magazineluiza.com.br/lavadora-de-roupas-mueller-12kg-family-aquatec-preta-220-volts/p/khkb67e324/ed/mmlp/',
    imagem: 'https://m.magazineluiza.com.br/a-static/420x420/lavadora-de-roupas-mueller-12kg-family-aquatec-preta-220-volts/friopecas/155442/b1243fe5ed069a72e5b0b0d6ccd8b97d.jpeg',
    observacoes: 'Preço, disponibilidade e voltagem 220V verificados. Vendido e entregue por Friopeças.'
  },
  {
    id: 'magalu-electrolux-lfc12-12kg-220v-feec5d2a10',
    nome: 'Máquina de Lavar Frontal Electrolux LFC12 12kg Cinza Ônix 220V',
    categoria: 'Máquinas de lavar',
    loja: 'Electrolux no Magalu',
    seloLoja: 'Loja Oficial',
    precoAtual: 3048.99,
    precoAnterior: null,
    desconto: 0,
    voltagem: '220V',
    url: 'https://m.magazineluiza.com.br/maquina-de-lavar-frontal-electrolux-12kg-cinza-onix-inverter-com-agua-quente-e-lavagem-inteligente-lfc12/p/feec5d2a10/ed/lava/',
    imagem: 'https://a-static.mlcdn.com.br/420x420/maquina-de-lavar-frontal-electrolux-12kg-cinza-onix-inverter-com-agua-quente-e-lavagem-inteligente-lfc12/electrolux/310128347/12e7e6733a4536bf020729d920187ead.jpeg',
    observacoes: 'Preço e voltagem 220V verificados. Vendido e entregue pela Electrolux.'
  },
  {
    id: 'magalu-mueller-energy-8kg-220v-kac0gf324b',
    nome: 'Máquina de Lavar Mueller Energy Automática 8kg 220V',
    categoria: 'Máquinas de lavar',
    loja: 'SBVendas no Magalu',
    precoAtual: 1399.11,
    precoAnterior: 1589.90,
    desconto: 12,
    voltagem: '220V',
    url: 'https://www.magazineluiza.com.br/maquina-de-lavar-mueller-energy-automatica-8kg-ciclo-rapido-bco-220v/p/kac0gf324b/ed/lava/',
    imagem: 'https://m.magazineluiza.com.br/a-static/420x420/maquina-de-lavar-mueller-energy-automatica-8kg-ciclo-rapido-bco-220v/sanboxaudio/ti1740/8cbdeb189f7cf776137dcc20351f6ad0.jpeg',
    observacoes: 'Preço, disponibilidade e voltagem 220V verificados no anúncio.'
  },
  {
    id: 'magalu-midea-wave-15kg-220v-jg869a58c8',
    nome: 'Máquina de Lavar Midea Wave Agitator 15kg Branca 220V',
    categoria: 'Máquinas de lavar',
    loja: 'Lojas Certel no Magalu',
    precoAtual: 3092.69,
    precoAnterior: null,
    desconto: 0,
    voltagem: '220V',
    url: 'https://www.magazineluiza.com.br/maquina-de-lavar-roupa-15kg-midea-wave-agitator-branca-220v/p/jg869a58c8/ed/lava/',
    imagem: 'https://m.magazineluiza.com.br/a-static/420x420/maquina-de-lavar-roupa-15kg-midea-wave-agitator-branca-220v/lojascertel/458621/2bb9edf22c9ce2352036aa9d79b76bf8.jpg',
    observacoes: 'Preço, disponibilidade e voltagem 220V verificados. Vendido por Lojas Certel e entregue por Magalu.'
  },
  {
    id: 'magalu-lg-lava-seca-18kg-220v-ah49g03fkd',
    nome: 'Lava e Seca Smart LG 18kg Black Inox AI DD 2.0 220V',
    categoria: 'Máquinas de lavar',
    loja: 'LG no Magalu',
    seloLoja: 'Loja Oficial',
    precoAtual: 6159.12,
    precoAnterior: 6999.00,
    desconto: 12,
    voltagem: '220V',
    url: 'https://www.magazineluiza.com.br/lava-e-seca-smart-lg-18kg-black-inox-com-aidd-2-0-220v/p/ah49g03fkd/ed/ela1/',
    imagem: 'https://m.magazineluiza.com.br/a-static/420x420/lava-e-seca-smart-lg-18kg-black-inox-com-aidd-2-0-220v/lgelectronicsdobrasil/2002869/bd05227230cab22ec00e504dbacefc35.jpeg',
    observacoes: 'Preço, disponibilidade e voltagem 220V verificados. Vendido e entregue pela LG.'
  },
  {
    id: 'magalu-brastemp-bwf18ab-18kg-220v-ed46jf280b',
    nome: 'Máquina de Lavar Brastemp 18Kg BWF18AB Branca 220V',
    categoria: 'Máquinas de lavar',
    loja: 'Lojas TaQi no Magalu',
    precoAtual: 2436.66,
    precoAnterior: 2564.90,
    desconto: 5,
    voltagem: '220V',
    url: 'https://www.magazineluiza.com.br/maquina-de-lavar-roupas-automatica-brastemp-18kg-bwf18ab-branca-220-volts/p/ed46jf280b/ed/lava/',
    imagem: 'https://m.magazineluiza.com.br/a-static/420x420/maquina-de-lavar-roupas-automatica-brastemp-18kg-bwf18ab-branca-220-volts/lojastaqi/100062840/52de657c618553789712073557473b9f.jpg',
    observacoes: 'Preço, disponibilidade e voltagem 220V verificados. Vendido e entregue por Lojas TaQi.'
  },
  {
    id: 'magalu-consul-cwn16ab-16kg-220v-ckce4623fk',
    nome: 'Máquina de Lavar Consul 16Kg CWN16AB Branca 220V',
    categoria: 'Máquinas de lavar',
    loja: 'Lojas TaQi no Magalu',
    precoAtual: 2626.66,
    precoAnterior: 2764.90,
    desconto: 5,
    voltagem: '220V',
    url: 'https://www.magazineluiza.com.br/maquina-de-lavar-roupas-automatica-consul-16-kg-cwn16ab-branca-220v/p/ckce4623fk/ed/lava/',
    imagem: 'https://m.magazineluiza.com.br/a-static/420x420/maquina-de-lavar-roupas-automatica-consul-16-kg-cwn16ab-branca-220v/lojastaqi/100081558/7bccc574292b56933d583ba4318cd348.jpg',
    observacoes: 'Preço, disponibilidade e voltagem 220V verificados. Vendido e entregue por Lojas TaQi.'
  },
  {
    id: 'magalu-colormaq-lca14-14kg-220v-fe46ke30e3',
    nome: 'Máquina de Lavar Colormaq LCA14 14kg Automática 220V',
    categoria: 'Máquinas de lavar',
    loja: 'Webcontinental Marketplace no Magalu',
    precoAtual: 1989.90,
    precoAnterior: null,
    desconto: 0,
    voltagem: '220V',
    url: 'https://www.magazineluiza.com.br/maquina-de-lavar-colormaq-lca14-14kg-automatica-branco-220v/p/fe46ke30e3/ed/lava/',
    imagem: 'https://m.magazineluiza.com.br/a-static/420x420/maquina-de-lavar-colormaq-lca14-14kg-automatica-branco-220v/lojawebcontinentalmarketplace/mkp003137004064/b825c98f2a9c07d482f59d13acb6f799.jpeg',
    observacoes: 'Preço, disponibilidade e voltagem 220V verificados. Vendido e entregue por Webcontinental Marketplace.'
  }
];

const norm = value => String(value || '').split('?')[0].replace(/\/$/, '');
function score(o) {
  const discount = Math.max(0, Math.min(50, Number(o.desconto) || 0));
  const trust = o.seloLoja ? 8 : 4;
  return Math.min(100, Math.round(discount + 30 + 2 + trust));
}
function label(value) {
  return value >= 75 ? 'Excelente' : value >= 58 ? 'Boa' : value >= 42 ? 'Interessante' : 'Normal';
}

for (const c of candidates) {
  if (data.ofertas.some(o => o.id === c.id || norm(o.url) === norm(c.url))) continue;
  const s = score(c);
  const offer = {
    ...c,
    cupom: 'Não informado',
    cashback: 'Não informado',
    frete: 'Consulte na loja',
    freteValor: null,
    freteGratis: false,
    cepFrete: '72620-405',
    precoComFrete: null,
    ativa: true,
    dataEncontrada: now,
    ultimaVerificacao: now,
    historicoPrecos: [{ data: now, preco: c.precoAtual, freteValor: null, precoComFrete: null }],
    menorPrecoHistorico: c.precoAtual,
    precoMedioHistorico: c.precoAtual,
    scoreOferta: s,
    classificacaoOferta: label(s),
    variacaoPreco: null,
    ultimaQuedaPreco: null
  };
  data.ofertas.push(offer);
  data.logAlteracoes.unshift({ data: now, tipo: 'adicionado', produto: offer.nome, id: offer.id, detalhe: 'Oferta 220V validada e adicionada para completar a categoria.' });
}

data.logAlteracoes = data.logAlteracoes.slice(0, 200);
data.total = data.ofertas.filter(o => o && o.ativa !== false).length;
data.geradoEm = now;
fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
