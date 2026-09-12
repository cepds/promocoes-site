const fs = require('fs');
const path = require('path');

const DATA_PATH = 'data/ofertas.json';
const BACKUP_DIR = 'data/backups';
const now = new Date().toISOString();

function saoPauloStamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(date).reduce((acc, p) => (acc[p.type] = p.value, acc), {});
  return `${parts.year}-${parts.month}-${parts.day}-${parts.hour}${parts.minute}`;
}

function backupCurrentCatalog() {
  const original = fs.readFileSync(DATA_PATH, 'utf8');
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const backupPath = path.join(BACKUP_DIR, `ofertas-${saoPauloStamp()}.json`);
  if (fs.existsSync(backupPath)) throw new Error(`Backup já existe: ${backupPath}`);
  fs.writeFileSync(backupPath, original, 'utf8');
  if (fs.readFileSync(backupPath, 'utf8') !== original) throw new Error('Backup não confere com o catálogo atual.');
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(name => /^ofertas-\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(name))
    .sort().reverse();
  for (const old of backups.slice(14)) {
    try { fs.unlinkSync(path.join(BACKUP_DIR, old)); } catch (e) { console.warn(`Não foi possível remover backup antigo ${old}: ${e.message}`); }
  }
  console.log(`Backup criado: ${backupPath}`);
  return backupPath;
}

backupCurrentCatalog();

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
data.ofertas = Array.isArray(data.ofertas) ? data.ofertas : [];
data.logAlteracoes = Array.isArray(data.logAlteracoes) ? data.logAlteracoes : [];

const candidates = [
  {
    id: 'electrolux-dfn41-371l-220v', nome: 'Geladeira Electrolux Frost Free 371L Drink Express Duplex DFN41',
    categoria: 'Geladeiras', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 3469.00, precoAnterior: 3789.00, desconto: 8, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/geladeira-refrigerador-frost-free-371-litros-dfn41/p',
    modelo: 'DFN41', produtoGrupo: 'electrolux-dfn41-371l-220v',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'electrolux-led17-17kg-220v', nome: 'Máquina de Lavar Electrolux 17kg Essential Care LED17',
    categoria: 'Máquinas de lavar', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 2099.00, precoAnterior: 3249.00, desconto: 35, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/maquina-de-lavar-17kg-electrolux-essential-care-com-cesto-inox-jet-clean-e-ultra-filter--led17-/p?skuId=310118601',
    modelo: 'LED17', produtoGrupo: 'electrolux-led17-17kg-220v',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'electrolux-led15-15kg-220v', nome: 'Máquina de Lavar Electrolux 15kg Essential Care LED15',
    categoria: 'Máquinas de lavar', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 1949.00, precoAnterior: 3169.00, desconto: 38, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/maquina-de-lavar-15kg-electrolux-essential-care-com-cesto-inox-jet-clean-e-ultra-filter--led15-/p',
    modelo: 'LED15', produtoGrupo: 'electrolux-led15-15kg-220v',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'electrolux-lfb12-12kg-220v', nome: 'Máquina de Lavar Frontal Electrolux 12kg Inverter Água Quente LFB12',
    categoria: 'Máquinas de lavar', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 2899.00, precoAnterior: 3399.00, desconto: 14, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/maquina-de-lavar-frontal-electrolux-12kg-branca-inverter-com-agua-quente-e-lavagem-inteligente--lfb12-/p',
    modelo: 'LFB12', produtoGrupo: 'electrolux-lfb12-12kg-220v',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'electrolux-lee18-18kg-220v', nome: 'Máquina de Lavar Electrolux 18kg Efficient Cesto Inox LEE18',
    categoria: 'Máquinas de lavar', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 2429.00, precoAnterior: 2799.00, desconto: 13, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/maquina-de-lavar-electrolux-18-kg-branca-efficient-cesto-inox-e-jet---clean-lee18/p',
    modelo: 'LEE18', produtoGrupo: 'electrolux-lee18-18kg-220v',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'brastemp-bwf16ab-16kg-220v', nome: 'Máquina de Lavar Brastemp 16Kg Branca Smart Sensor BWF16AB',
    categoria: 'Máquinas de lavar', loja: 'Loja Oficial Brastemp', seloLoja: 'Loja Oficial',
    precoAtual: 1999.99, precoAnterior: 2499.00, desconto: 20, voltagem: '220V',
    url: 'https://www.brastemp.com.br/maquina-de-lavar-brastemp-16kg-branca-bwf16ab/p',
    modelo: 'BWF16AB', produtoGrupo: 'brastemp-bwf16ab-16kg-branca-220v',
    observacoes: 'Oferta e disponibilidade confirmadas na Loja Oficial Brastemp em 11/09/2026 para variante 220V.'
  },
  {
    id: 'brastemp-bwt16a9-16kg-220v', nome: 'Máquina de Lavar Brastemp 16Kg Cinza Timer Pro BWT16A9',
    categoria: 'Máquinas de lavar', loja: 'Loja Oficial Brastemp', seloLoja: 'Loja Oficial',
    precoAtual: 2105.19, precoAnterior: 2769.00, desconto: 24, voltagem: '220V',
    url: 'https://www.brastemp.com.br/maquina-de-lavar-brastemp-16kg-cinza-timer-pro-bwt16a9-326199279/p',
    modelo: 'BWT16A9', produtoGrupo: 'brastemp-bwt16a9-16kg-cinza-220v',
    observacoes: 'Oferta confirmada na Loja Oficial Brastemp em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'electrolux-eaf31-airfryer-4l-220v', nome: 'Air Fryer Electrolux por Rita Lobo 4L Grand Efficient EAF31',
    categoria: 'Air Fryers', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 479.90, precoAnterior: 649.90, desconto: 26, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/air-fryer-electrolux-por-rita-lobo-4l-vermelha-grand-efficient-1400w--eaf31-/p',
    modelo: 'EAF31', produtoGrupo: 'electrolux-eaf31-4l-220v',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'electrolux-eaf180-airfryer-7l-220v', nome: 'Air Fryer Electrolux por Rita Lobo 7L Digital Expert EAF180',
    categoria: 'Air Fryers', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 999.90, precoAnterior: 1699.90, desconto: 41, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/air-fryer-electrolux-por-rita-lobo-7l-experience-eaf180/p',
    modelo: 'EAF180', produtoGrupo: 'electrolux-eaf180-7l-220v',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Página oferece variante 220V.'
  },
  {
    id: 'electrolux-ji09f-ar-9000-220v', nome: 'Ar-condicionado Electrolux Color Adapt Inverter 9.000 BTUs Frio JI09F/JE09F',
    categoria: 'Climatização', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 1728.09, precoAnterior: 2499.00, desconto: 30, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/ar-condicionado-split-electrolux-inverter-9000-btus-color-adapt-frio-ji09f-je09f/p',
    modelo: 'JI09F/JE09F', produtoGrupo: 'electrolux-ji09f-je09f-9000-frio-220v',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Produto 220V.'
  },
  {
    id: 'electrolux-yi12r-ar-12000-220v', nome: 'Ar-condicionado Electrolux Color Adapt Wi-Fi 12.000 BTUs Quente/Frio YI12R/YE12R',
    categoria: 'Climatização', loja: 'Loja Oficial Electrolux', seloLoja: 'Loja Oficial',
    precoAtual: 2299.00, precoAnterior: 2949.00, desconto: 22, voltagem: '220V',
    url: 'https://loja.electrolux.com.br/ar-condicionado-split-electrolux-12000-btus-color-adapt-quente-frio-com-wi-fi-yi12r-ye12r/p',
    modelo: 'YI12R/YE12R', produtoGrupo: 'electrolux-yi12r-ye12r-12000-quente-frio-220v',
    observacoes: 'Oferta confirmada na Loja Oficial Electrolux em 11/09/2026. Produto 220V.'
  },
  {
    id: 'magalu-samsung-qn70h-55-2026', nome: 'Smart TV 55 Samsung 4K Neo QLED QN70H 2026',
    categoria: 'TVs', loja: 'Magazine Luiza', seloLoja: 'Loja Oficial',
    precoAtual: 5984.05, precoAnterior: 6299.00, desconto: 5, voltagem: 'Bivolt',
    url: 'https://www.magazineluiza.com.br/smart-tv-55-samsung-4k-uhd-neo-qled-one-ui-tizen-qn55qn70hagxzd-2026/p/242046100/et/tled/',
    observacoes: 'Oferta confirmada em 11/09/2026; vendido e entregue por Magalu.'
  },
  {
    id: 'magalu-samsung-m75h-55-2026', nome: 'Smart TV 55 Samsung 4K Mini LED M75H 2026',
    categoria: 'TVs', loja: 'Magazine Luiza', seloLoja: 'Loja Oficial',
    precoAtual: 3609.05, precoAnterior: 3799.00, desconto: 5, voltagem: 'Bivolt',
    url: 'https://www.magazineluiza.com.br/smart-tv-55-samsung-4k-uhd-mini-led-m75h-one-ui-tizen-un55m75hagxzd-2026/p/242046700/et/elit/',
    observacoes: 'Oferta confirmada em 11/09/2026; vendido e entregue por Magalu.'
  },
  {
    id: 'magalu-samsung-kit-u8000h-q5f', nome: 'Kit Samsung Smart TV 55 Crystal UHD U8000H + TV 43 QLED Q5F',
    categoria: 'TVs', loja: 'Samsung Oficial no Magalu', seloLoja: 'Loja Oficial',
    precoAtual: 4555.90, precoAnterior: 5062.11, desconto: 10, voltagem: 'Bivolt',
    url: 'https://www.magazineluiza.com.br/samsung-smart-tv-55-crystal-uhd-4k-u8000h-2026-samsung-smart-tv-43-qled-full-hd-q5f/p/dg2b9gba34/et/elit/?seller_id=samsung',
    observacoes: 'Oferta confirmada em 11/09/2026; vendido e entregue por Samsung no Magalu, loja com alta reputação.'
  },
  {
    id: 'brastemp-brm52mk-415l-inox-220v', nome: 'Geladeira Brastemp Frost Free Duplex 415L Inox BRM52MK 220V',
    categoria: 'Geladeiras', loja: 'Loja Oficial Brastemp', seloLoja: 'Loja Oficial',
    precoAtual: 3299.99, precoAnterior: 4129.00, desconto: 20, voltagem: '220V',
    precoCartao: 3299.99, parcelas: 7, valorParcela: 471.43, condicaoPagamento: 'Até 7x sem juros',
    url: 'https://www.brastemp.com.br/geladeira-brastemp-duplex-415l-inox/p',
    modelo: 'BRM52MK', produtoGrupo: 'brastemp-brm52mk-415l-inox-220v', estoqueStatus: 'Em estoque',
    observacoes: 'Preço e variante 220V confirmados na Loja Oficial Brastemp em 12/09/2026.'
  },
  {
    id: 'brastemp-brm51mb-415l-branca-220v', nome: 'Geladeira Brastemp Frost Free Duplex 415L Branca BRM51MB 220V',
    categoria: 'Geladeiras', loja: 'Loja Oficial Brastemp', seloLoja: 'Loja Oficial',
    precoAtual: 3199.00, precoAnterior: 3349.00, desconto: 4, voltagem: '220V',
    precoCartao: 3199.00, parcelas: 7, valorParcela: 457.00, condicaoPagamento: 'Até 7x de R$ 457,00 sem juros',
    url: 'https://www.brastemp.com.br/geladeira-brastemp-frost-free-duplex-415-litros-branca-brm51mb-326199552/p',
    modelo: 'BRM51MB', produtoGrupo: 'brastemp-brm51mb-415l-branca-220v', estoqueStatus: 'Em estoque',
    observacoes: 'Preço, parcelamento e variante 220V confirmados na Loja Oficial Brastemp em 12/09/2026.'
  },
  {
    id: 'brastemp-bfo4vbr-fogao-4b-220v', nome: 'Fogão Brastemp 4 Bocas Inox Mesa de Vidro Dupla Chama e Grill BFO4VBR 220V',
    categoria: 'Cozinha', loja: 'Loja Oficial Brastemp', seloLoja: 'Loja Oficial',
    precoAtual: 2553.04, precoAnterior: 3739.00, desconto: 32, voltagem: '220V',
    precoPix: 2553.04, precoAvista: 2553.04, precoCartao: 2632.00, parcelas: 8, valorParcela: 329.00,
    condicaoPagamento: 'R$ 2.553,04 no Pix; cartão em até 8x de R$ 329,00 sem juros',
    url: 'https://www.brastemp.com.br/fogao-brastemp-4-bocas-inox-com-mesa-de-vidro-dupla-chama-e-grill-eletrico-bfo4vbr/p',
    modelo: 'BFO4VBR', produtoGrupo: 'brastemp-bfo4vbr-4b-inox-220v', estoqueStatus: 'Em estoque',
    observacoes: 'Preço Pix, preço no cartão, parcelamento e variante 220V confirmados na Loja Oficial Brastemp em 12/09/2026.'
  },
  {
    id: 'wap-grand-family-5l-fw009536-220v', nome: 'Fritadeira Elétrica WAP Air Fryer Grand Family 5L 1500W 220V',
    categoria: 'Air Fryers', loja: 'Loja WAP', seloLoja: 'Loja Oficial',
    precoAtual: 278.91, precoAnterior: 629.90, desconto: 52, voltagem: '220V',
    precoPix: 278.91, precoAvista: 278.91, precoCartao: 299.90, parcelas: 5, valorParcela: 59.98,
    condicaoPagamento: 'R$ 278,91 à vista; ou R$ 299,90 em até 5x de R$ 59,98',
    url: 'https://loja.wap.ind.br/fritadeira-eletrica-wap-air-fryer-grand-family-5l/p',
    modelo: 'FW009536', modeloFabricante: 'FW009536', ean: '7899831312733', produtoGrupo: 'wap-fw009536-grand-family-5l-220v', estoqueStatus: 'Em estoque',
    observacoes: 'Preço, parcelamento, EAN e variante 220V confirmados na Loja WAP em 12/09/2026.'
  },
  {
    id: 'wap-prosdocimo-af01-fw013083-220v', nome: 'Fritadeira Elétrica WAP Air Fryer Prosdocimo 4,5L AF01 220V',
    categoria: 'Air Fryers', loja: 'Loja WAP', seloLoja: 'Loja Oficial',
    precoAtual: 282.65, precoAnterior: 379.90, desconto: 20, voltagem: '220V',
    precoPix: 282.65, precoAvista: 282.65, precoCartao: 303.92, parcelas: 6, valorParcela: 50.65,
    condicaoPagamento: 'R$ 282,65 à vista; ou R$ 303,92 em até 6x de R$ 50,65',
    url: 'https://loja.wap.ind.br/fritadeira-eletrica-wap-airfry-prosdocimo-4-5l-af01/p',
    modelo: 'FW013083', modeloFabricante: 'FW013083', ean: '7899831345380', produtoGrupo: 'wap-fw013083-prosdocimo-af01-45l-220v', estoqueStatus: 'Em estoque',
    observacoes: 'Preço, parcelamento, EAN e variante 220V confirmados na Loja WAP em 12/09/2026.'
  },
  {
    id: 'wap-prosdocimo-af02-6l-220v', nome: 'Fritadeira Elétrica WAP Air Fryer Prosdocimo 6L AF02 220V',
    categoria: 'Air Fryers', loja: 'Loja WAP', seloLoja: 'Loja Oficial',
    precoAtual: 464.91, precoAnterior: 499.90, desconto: 7, voltagem: '220V',
    precoPix: 464.91, precoAvista: 464.91, precoCartao: 499.90, parcelas: 9, valorParcela: 55.54,
    condicaoPagamento: 'R$ 464,91 à vista; ou R$ 499,90 em até 9x de R$ 55,54',
    url: 'https://loja.wap.ind.br/fritadeira-eletrica-wap-airfry-prosdocimo-6l-af02/p',
    modelo: 'AF02', produtoGrupo: 'wap-prosdocimo-af02-6l-220v', estoqueStatus: 'Em estoque',
    observacoes: 'Preço, parcelamento e variante 220V confirmados na Loja WAP em 12/09/2026.'
  },
  {
    id: 'wap-oven-digital-waod2-12l-220v', nome: 'Fritadeira Elétrica WAP Oven Digital Black WAOD2 12L 220V',
    categoria: 'Air Fryers', loja: 'Loja WAP', seloLoja: 'Loja Oficial',
    precoAtual: 929.91, precoAnterior: 999.90, desconto: 7, voltagem: '220V',
    precoPix: 929.91, precoAvista: 929.91, precoCartao: 999.90, parcelas: 10, valorParcela: 99.99,
    condicaoPagamento: 'R$ 929,91 à vista; ou R$ 999,90 em até 10x de R$ 99,99',
    url: 'https://loja.wap.ind.br/fritadeira-eletrica-wap-oven-digital-black-inox-waod2/p',
    modelo: 'WAOD2', produtoGrupo: 'wap-waod2-12l-220v', estoqueStatus: 'Em estoque',
    observacoes: 'Preço, parcelamento e variante 220V confirmados na Loja WAP em 12/09/2026.'
  },
  {
    id: 'wap-barbecue-digital-220v', nome: 'Fritadeira Elétrica e Churrasqueira WAP Air Fryer Barbecue Digital 220V',
    categoria: 'Air Fryers', loja: 'Loja WAP', seloLoja: 'Loja Oficial',
    precoAtual: 1562.33, precoAnterior: 2099.90, desconto: 20, voltagem: '220V',
    precoPix: 1562.33, precoAvista: 1562.33, precoCartao: 1679.92, parcelas: 10, valorParcela: 167.99,
    condicaoPagamento: 'R$ 1.562,33 à vista; ou R$ 1.679,92 em até 10x de R$ 167,99',
    url: 'https://loja.wap.ind.br/fritadeira-eletrica-wap-air-fryer-barbecue-digital/p',
    modelo: 'Air Fryer Barbecue Digital', produtoGrupo: 'wap-air-fryer-barbecue-digital-220v', estoqueStatus: 'Em estoque',
    observacoes: 'Preço, parcelamento e variante 220V confirmados na Loja WAP em 12/09/2026.'
  },
  {
    id: 'tramontina-glenz-28699610-5p', nome: 'Jogo de Panelas Tramontina Glenz Starflon Crystals 5 Peças',
    categoria: 'Cozinha', loja: 'Tramontina Store', seloLoja: 'Loja Oficial',
    precoAtual: 679.00, precoAnterior: 1334.00, desconto: 46,
    precoPix: 679.00, precoAvista: 679.00, precoCartao: 714.74, parcelas: 10, valorParcela: 71.47,
    condicaoPagamento: 'R$ 679,00 à vista; ou R$ 714,74 em até 10x de R$ 71,47 sem juros',
    url: 'https://www.tramontina.com.br/jogo-de-panelas-tramontina-glenz-em-aluminio-com-revestimento-interno-em-starflon-crystals-e-externo-esmaltado-cinza-stone-05-pecas/28699610.html',
    modelo: '28699610', modeloFabricante: '28699610', produtoGrupo: 'tramontina-glenz-28699610-5p', estoqueStatus: 'Em estoque',
    observacoes: 'Preço à vista, parcelamento e SKU 28699610 confirmados na Tramontina Store em 12/09/2026.'
  }
];

function normalizeUrl(url) {
  try { const u = new URL(url); u.search = ''; u.hash = ''; return u.toString().replace(/\/$/, ''); }
  catch { return String(url || '').split('?')[0].replace(/\/$/, ''); }
}

function extractImage(html, baseUrl) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i
  ];
  for (const re of patterns) { const m = html.match(re); if (m?.[1]) { try { return new URL(m[1].replaceAll('&amp;', '&'), baseUrl).href; } catch {} } }
  return '';
}

async function resolveImage(url) {
  try {
    const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36', 'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8' } });
    if (!response.ok) return '';
    const html = await response.text();
    const image = extractImage(html, response.url || url);
    if (!/^https:\/\//i.test(image)) return '';
    return image;
  } catch (error) { console.log(`Imagem não resolvida para ${url}: ${error.message}`); return ''; }
}

function calcScore(c) {
  const discount = Math.max(0, Math.min(50, Number(c.desconto) || 0));
  const shipPts = c.freteGratis ? 12 : 2;
  const trustPts = c.seloLoja ? 8 : 3;
  return Math.min(100, Math.round(discount + 30 + shipPts + trustPts));
}
function label(score) { return score >= 75 ? 'Excelente' : score >= 58 ? 'Boa' : score >= 42 ? 'Interessante' : 'Normal'; }

(async () => {
  const existingIds = new Set(data.ofertas.map(o => String(o.id || '')));
  const existingUrls = new Set(data.ofertas.map(o => normalizeUrl(o.url)));
  let added = 0;

  for (const c of candidates) {
    if (existingIds.has(c.id) || existingUrls.has(normalizeUrl(c.url))) continue;
    const imagem = await resolveImage(c.url);
    if (!imagem) { console.log(`Ignorado sem imagem confiável: ${c.nome}`); continue; }
    const score = calcScore(c);
    const offer = {
      id: c.id, nome: c.nome, categoria: c.categoria, loja: c.loja, seloLoja: c.seloLoja,
      ean: c.ean, gtin: c.gtin, codigoBarras: c.codigoBarras, modelo: c.modelo, modeloFabricante: c.modeloFabricante || c.modelo,
      produtoGrupo: c.produtoGrupo, precoAtual: c.precoAtual, precoAnterior: c.precoAnterior, precoPix: c.precoPix,
      precoAvista: c.precoAvista, precoCartao: c.precoCartao, parcelas: c.parcelas, valorParcela: c.valorParcela,
      condicaoPagamento: c.condicaoPagamento, desconto: c.desconto, cupom: c.cupom || 'Não informado', cashback: c.cashback || 'Não informado',
      frete: c.frete || 'Consulte na loja', freteValor: c.freteValor ?? null, freteGratis: c.freteGratis === true,
      cepFrete: '72620-405', precoComFrete: c.precoComFrete ?? null, prazoEntrega: c.prazoEntrega,
      estoqueStatus: c.estoqueStatus, voltagem: c.voltagem, url: c.url, imagem, ativa: true,
      dataEncontrada: now, ultimaVerificacao: now, observacoes: c.observacoes,
      historicoPrecos: [{ data: now, preco: c.precoAtual, freteValor: c.freteValor ?? null, precoComFrete: c.precoComFrete ?? null }],
      menorPrecoHistorico: c.precoAtual, precoMedioHistorico: c.precoAtual, scoreOferta: score,
      classificacaoOferta: label(score), variacaoPreco: null, ultimaQuedaPreco: null
    };
    Object.keys(offer).forEach(k => offer[k] === undefined && delete offer[k]);
    data.ofertas.push(offer);
    existingIds.add(c.id); existingUrls.add(normalizeUrl(c.url));
    data.logAlteracoes.unshift({ data: now, tipo: 'adicionado', produto: c.nome, id: c.id, detalhe: `Oferta adicionada de ${c.loja} com preço e disponibilidade verificados.` });
    added++;
  }

  data.logAlteracoes = data.logAlteracoes.slice(0, 200);
  data.geradoEm = now;
  data.total = data.ofertas.filter(o => o && o.ativa !== false).length;
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n');
  console.log(`Adicionadas ${added} ofertas oficiais/confiáveis. Total ativo: ${data.total}`);
})();
