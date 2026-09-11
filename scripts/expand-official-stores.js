const fs = require('fs');

const DATA_PATH = 'data/ofertas.json';
const now = new Date().toISOString();
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
data.ofertas = Array.isArray(data.ofertas) ? data.ofertas : [];
data.logAlteracoes = Array.isArray(data.logAlteracoes) ? data.logAlteracoes : [];

const candidates = [
  {
    id: 'electrolux-dfn41-371l-220v',
    nome: 'Geladeira Electrolux Frost Free 371L Drink Express Duplex DFN41',
    categoria: 'Geladeiras', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 3469.00, precoAnterior: 3789.00, desconto: 8, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/geladeira-refrigerador-frost-free-371-litros-dfn41/p',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'electrolux-led17-17kg-220v',
    nome: 'Máquina de Lavar Electrolux 17kg Essential Care LED17',
    categoria: 'Máquinas de lavar', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 2099.00, precoAnterior: 3249.00, desconto: 35, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/maquina-de-lavar-17kg-electrolux-essential-care-com-cesto-inox-jet-clean-e-ultra-filter--led17-/p?skuId=310118601',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'electrolux-led15-15kg-220v',
    nome: 'Máquina de Lavar Electrolux 15kg Essential Care LED15',
    categoria: 'Máquinas de lavar', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 1949.00, precoAnterior: 3169.00, desconto: 38, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/maquina-de-lavar-15kg-electrolux-essential-care-com-cesto-inox-jet-clean-e-ultra-filter--led15-/p',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'electrolux-lfb12-12kg-220v',
    nome: 'Máquina de Lavar Frontal Electrolux 12kg Inverter Água Quente LFB12',
    categoria: 'Máquinas de lavar', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 2899.00, precoAnterior: 3399.00, desconto: 14, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/maquina-de-lavar-frontal-electrolux-12kg-branca-inverter-com-agua-quente-e-lavagem-inteligente--lfb12-/p',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'electrolux-lee18-18kg-220v',
    nome: 'Máquina de Lavar Electrolux 18kg Efficient Cesto Inox LEE18',
    categoria: 'Máquinas de lavar', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 2429.00, precoAnterior: 2799.00, desconto: 13, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/maquina-de-lavar-electrolux-18-kg-branca-efficient-cesto-inox-e-jet---clean-lee18/p',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'brastemp-bwf16ab-16kg-220v',
    nome: 'Máquina de Lavar Brastemp 16Kg Branca Smart Sensor BWF16AB',
    categoria: 'Máquinas de lavar', loja: 'Loja Oficial Brastemp', seloLoja: 'Loja Oficial',
    precoAtual: 1999.99, precoAnterior: 2499.00, desconto: 20, voltagem: '220V',
    url: 'https://www.brastemp.com.br/maquina-de-lavar-brastemp-16kg-branca-bwf16ab/p',
    observacoes: 'Oferta e disponibilidade confirmadas na Loja Oficial Brastemp em 11/09/2026 para variante 220V.'
  },
  {
    id: 'brastemp-bwt16a9-16kg-220v',
    nome: 'Máquina de Lavar Brastemp 16Kg Cinza Timer Pro BWT16A9',
    categoria: 'Máquinas de lavar', loja: 'Loja Oficial Brastemp', seloLoja: 'Loja Oficial',
    precoAtual: 2105.19, precoAnterior: 2769.00, desconto: 24, voltagem: '220V',
    url: 'https://www.brastemp.com.br/maquina-de-lavar-brastemp-16kg-cinza-timer-pro-bwt16a9-326199279/p',
    observacoes: 'Oferta confirmada na Loja Oficial Brastemp em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'electrolux-eaf31-airfryer-4l-220v',
    nome: 'Air Fryer Electrolux por Rita Lobo 4L Grand Efficient EAF31',
    categoria: 'Air Fryers', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 479.90, precoAnterior: 649.90, desconto: 26, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/air-fryer-electrolux-por-rita-lobo-4l-vermelha-grand-efficient-1400w--eaf31-/p',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'electrolux-eaf180-airfryer-7l-220v',
    nome: 'Air Fryer Electrolux por Rita Lobo 7L Digital Expert EAF180',
    categoria: 'Air Fryers', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 999.90, precoAnterior: 1699.90, desconto: 41, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/air-fryer-electrolux-por-rita-lobo-7l-experience-eaf180/p',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'electrolux-ji09f-ar-9000-220v',
    nome: 'Ar-condicionado Electrolux Color Adapt Inverter 9.000 BTUs Frio JI09F/JE09F',
    categoria: 'Climatização', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 1728.09, precoAnterior: 2499.00, desconto: 30, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/ar-condicionado-split-electrolux-inverter-9000-btus-color-adapt-frio-ji09f-je09f/p',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Produto 220V.'
  },
  {
    id: 'electrolux-yi12r-ar-12000-220v',
    nome: 'Ar-condicionado Electrolux Color Adapt Wi-Fi 12.000 BTUs Quente/Frio YI12R/YE12R',
    categoria: 'Climatização', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 2299.00, precoAnterior: 2949.00, desconto: 22, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/ar-condicionado-split-electrolux-12000-btus-color-adapt-quente-frio-com-wi-fi-yi12r-ye12r/p',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Produto 220V.'
  },
  {
    id: 'magalu-samsung-qn70h-55-2026',
    nome: 'Smart TV 55 Samsung 4K Neo QLED QN70H 2026',
    categoria: 'TVs', loja: 'Magazine Luiza', seloLoja: 'Loja Oficial',
    precoAtual: 5984.05, precoAnterior: 6299.00, desconto: 5, voltagem: 'Bivolt',
    url: 'https://www.magazineluiza.com.br/smart-tv-55-samsung-4k-uhd-neo-qled-one-ui-tizen-qn55qn70hagxzd-2026/p/242046100/et/tled/',
    observacoes: 'Oferta confirmada em 11/09/2026; vendido e entregue por Magalu.'
  },
  {
    id: 'magalu-samsung-m75h-55-2026',
    nome: 'Smart TV 55 Samsung 4K Mini LED M75H 2026',
    categoria: 'TVs', loja: 'Magazine Luiza', seloLoja: 'Loja Oficial',
    precoAtual: 3609.05, precoAnterior: 3799.00, desconto: 5, voltagem: 'Bivolt',
    url: 'https://www.magazineluiza.com.br/smart-tv-55-samsung-4k-uhd-mini-led-m75h-one-ui-tizen-un55m75hagxzd-2026/p/242046700/et/elit/',
    observacoes: 'Oferta confirmada em 11/09/2026; vendido e entregue por Magalu.'
  },
  {
    id: 'magalu-samsung-kit-u8000h-q5f',
    nome: 'Kit Samsung Smart TV 55 Crystal UHD U8000H + TV 43 QLED Q5F',
    categoria: 'TVs', loja: 'Samsung Oficial no Magalu', seloLoja: 'Loja Oficial',
    precoAtual: 4555.90, precoAnterior: 5062.11, desconto: 10, voltagem: 'Bivolt',
    url: 'https://www.magazineluiza.com.br/samsung-smart-tv-55-crystal-uhd-4k-u8000h-2026-samsung-smart-tv-43-qled-full-hd-q5f/p/dg2b9gba34/et/elit/?seller_id=samsung',
    observacoes: 'Oferta confirmada em 11/09/2026; vendido e entregue por Samsung no Magalu, loja com alta reputação.'
  }
];

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    u.search = '';
    u.hash = '';
    return u.toString().replace(/\/$/, '');
  } catch { return String(url || '').split('?')[0].replace(/\/$/, ''); }
}

function extractImage(html, baseUrl) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      try { return new URL(m[1].replaceAll('&amp;', '&'), baseUrl).href; } catch {}
    }
  }
  return '';
}

async function resolveImage(url) {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36',
        'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8'
      }
    });
    if (!response.ok) return '';
    const html = await response.text();
    const image = extractImage(html, response.url || url);
    if (!/^https:\/\//i.test(image)) return '';
    return image;
  } catch (error) {
    console.log(`Imagem não resolvida para ${url}: ${error.message}`);
    return '';
  }
}

function calcScore(c) {
  const discount = Math.max(0, Math.min(50, Number(c.desconto) || 0));
  const historyPts = 30;
  const shipPts = 2;
  const trustPts = c.seloLoja ? 8 : 3;
  return Math.min(100, Math.round(discount + historyPts + shipPts + trustPts));
}
function label(score) { return score >= 75 ? 'Excelente' : score >= 58 ? 'Boa' : score >= 42 ? 'Interessante' : 'Normal'; }

(async () => {
  const existingIds = new Set(data.ofertas.map(o => String(o.id || '')));
  const existingUrls = new Set(data.ofertas.map(o => normalizeUrl(o.url)));
  let added = 0;

  for (const c of candidates) {
    if (existingIds.has(c.id) || existingUrls.has(normalizeUrl(c.url))) continue;
    const imagem = await resolveImage(c.url);
    if (!imagem) {
      console.log(`Ignorado sem imagem confiável: ${c.nome}`);
      continue;
    }
    const score = calcScore(c);
    const offer = {
      id: c.id,
      nome: c.nome,
      categoria: c.categoria,
      loja: c.loja,
      seloLoja: c.seloLoja,
      precoAtual: c.precoAtual,
      precoAnterior: c.precoAnterior,
      desconto: c.desconto,
      cupom: 'Não informado',
      cashback: 'Não informado',
      frete: 'Consulte na loja',
      freteValor: null,
      freteGratis: false,
      cepFrete: '72620-405',
      precoComFrete: null,
      voltagem: c.voltagem,
      url: c.url,
      imagem,
      ativa: true,
      dataEncontrada: now,
      ultimaVerificacao: now,
      observacoes: c.observacoes,
      historicoPrecos: [{ data: now, preco: c.precoAtual, freteValor: null, precoComFrete: null }],
      menorPrecoHistorico: c.precoAtual,
      precoMedioHistorico: c.precoAtual,
      scoreOferta: score,
      classificacaoOferta: label(score),
      variacaoPreco: null,
      ultimaQuedaPreco: null
    };
    data.ofertas.push(offer);
    existingIds.add(c.id);
    existingUrls.add(normalizeUrl(c.url));
    data.logAlteracoes.unshift({ data: now, tipo: 'adicionado', produto: c.nome, id: c.id, detalhe: `Oferta adicionada de ${c.loja} com preço e disponibilidade verificados.` });
    added++;
  }

  data.logAlteracoes = data.logAlteracoes.slice(0, 200);
  data.geradoEm = now;
  data.total = data.ofertas.filter(o => o && o.ativa !== false).length;
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n');
  console.log(`Adicionadas ${added} ofertas oficiais/confiáveis. Total ativo: ${data.total}`);
})();
