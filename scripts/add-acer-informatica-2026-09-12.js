const fs = require('fs');

const DATA_PATH = 'data/ofertas.json';
const now = new Date().toISOString();
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
data.ofertas = Array.isArray(data.ofertas) ? data.ofertas : [];
data.logAlteracoes = Array.isArray(data.logAlteracoes) ? data.logAlteracoes : [];

const candidates = [
  {
    id: 'acer-anv15-52-77bg-rtx4050', nome: 'Notebook Gamer Acer Nitro V15 ANV15-52-77BG Core i7 16GB 512GB RTX 4050',
    categoria: 'Informática', loja: 'Loja Oficial Acer', seloLoja: 'Loja Oficial', modelo: 'ANV15-52-77BG', modeloFabricante: 'ANV15-52-77BG', produtoGrupo: 'acer-anv15-52-77bg-16gb-512gb-rtx4050',
    precoAtual: 8999.00, precoAnterior: 11999.00, precoPix: 8999.00, precoAvista: 8999.00, precoCartao: 10226.14, parcelas: 12, valorParcela: 852.17,
    condicaoPagamento: 'R$ 8.999,00 no PIX ou à vista no cartão; R$ 10.226,14 em até 12x de R$ 852,17', desconto: 25, voltagem: 'Bivolt', estoqueStatus: 'Em estoque',
    url: 'https://br-store.acer.com/notebook-acer-nitro-v15-anv15-52-77bg-intel-core-i7-16gb-ram-512gb-ssd-rtx-4050-tela-15-6-windows-11-preto-nh-u0cal-004/p',
    observacoes: 'Preço, disponibilidade e fonte bivolt 100–240V confirmados na Loja Oficial Acer em 12/09/2026.'
  },
  {
    id: 'acer-ag15-71p-73d2', nome: 'Notebook Acer Aspire GO 15 AG15-71P-73D2 Core i7 16GB 512GB Windows 11 Pro',
    categoria: 'Informática', loja: 'Loja Oficial Acer', seloLoja: 'Loja Oficial', modelo: 'AG15-71P-73D2', modeloFabricante: 'AG15-71P-73D2', produtoGrupo: 'acer-ag15-71p-73d2-16gb-512gb',
    precoAtual: 6511.12, precoAnterior: 8999.00, precoPix: 6511.12, precoAvista: 6511.12, precoCartao: 7399.00, parcelas: 12, valorParcela: 616.58,
    condicaoPagamento: 'R$ 6.511,12 no PIX ou à vista no cartão; R$ 7.399,00 em até 12x de R$ 616,58', desconto: 27, voltagem: 'Bivolt', estoqueStatus: 'Em estoque',
    url: 'https://br-store.acer.com/notebook-acer-ag15-71p-73d2--ci713620h--16gb--512gb-ssd--wnprc64--green--fhd-15-6-nx-jg7al-006/p',
    observacoes: 'Preço, disponibilidade e fonte bivolt 100–240V confirmados na Loja Oficial Acer em 12/09/2026.'
  },
  {
    id: 'acer-a16-71m-55h0', nome: 'Notebook Acer Aspire 16 A16-71M-55H0 Core Ultra 5 16GB 512GB',
    categoria: 'Informática', loja: 'Loja Oficial Acer', seloLoja: 'Loja Oficial', modelo: 'A16-71M-55H0', modeloFabricante: 'A16-71M-55H0', produtoGrupo: 'acer-a16-71m-55h0-16gb-512gb',
    precoAtual: 5499.00, precoAnterior: 6599.00, precoPix: 5499.00, precoAvista: 5499.00, precoCartao: 6248.86, parcelas: 12, valorParcela: 520.73,
    condicaoPagamento: 'R$ 5.499,00 no PIX ou à vista no cartão; R$ 6.248,86 em até 12x de R$ 520,73', desconto: 16, voltagem: 'Bivolt', estoqueStatus: 'Em estoque',
    url: 'https://br-store.acer.com/notebook-acer-a16-71m-55h0--cu5115u--16gb--512gb-ssd--wnhpsl64--gray--lcd-16-nx-jqlal-001/p',
    observacoes: 'Preço, disponibilidade e fonte bivolt 100–240V confirmados na Loja Oficial Acer em 12/09/2026.'
  },
  {
    id: 'acer-ag15-51p-52bh', nome: 'Notebook Acer Aspire GO 15 AG15-51P-52BH Core 5 8GB 512GB',
    categoria: 'Informática', loja: 'Loja Oficial Acer', seloLoja: 'Loja Oficial', modelo: 'AG15-51P-52BH', modeloFabricante: 'AG15-51P-52BH', produtoGrupo: 'acer-ag15-51p-52bh-8gb-512gb',
    precoAtual: 4999.00, precoAnterior: 7999.00, precoPix: 4999.00, precoAvista: 4999.00, precoCartao: 5680.68, parcelas: 12, valorParcela: 473.39,
    condicaoPagamento: 'R$ 4.999,00 no PIX ou à vista no cartão; R$ 5.680,68 em até 12x de R$ 473,39', desconto: 37, voltagem: 'Bivolt', estoqueStatus: 'Em estoque',
    url: 'https://br-store.acer.com/notebook-acer-aspire-go-15-ag15-51p-52bh-intel-core-5-8gb-ram-512gb-ssd-tela-15-3-windows-11-azul-nx-jgfal-007/p',
    observacoes: 'Preço, disponibilidade e fonte bivolt 100–240V confirmados na Loja Oficial Acer em 12/09/2026.'
  },
  {
    id: 'acer-ag15-71p-753g', nome: 'Notebook Acer Aspire GO 15 AG15-71P-753G Core i7 8GB 256GB Linux',
    categoria: 'Informática', loja: 'Loja Oficial Acer', seloLoja: 'Loja Oficial', modelo: 'AG15-71P-753G', modeloFabricante: 'AG15-71P-753G', produtoGrupo: 'acer-ag15-71p-753g-8gb-256gb',
    precoAtual: 5809.56, precoAnterior: 7499.00, precoPix: 5809.56, precoAvista: 5809.56, precoCartao: 6601.77, parcelas: 12, valorParcela: 550.14,
    condicaoPagamento: 'R$ 5.809,56 no PIX ou à vista no cartão; R$ 6.601,77 em até 12x de R$ 550,14', desconto: 22, voltagem: 'Bivolt', estoqueStatus: 'Em estoque',
    url: 'https://br-store.acer.com/notebook-acer-aspire-go-15-ag15-71p-753g-intel-core-i7-8gb-ram-256gb-ssd-tela-15-6-linux-verde-nx-jh6al-008/p',
    observacoes: 'Preço, disponibilidade e fonte bivolt 100–240V confirmados na Loja Oficial Acer em 12/09/2026.'
  },
  {
    id: 'acer-ag15-71pt-72el', nome: 'Notebook Acer Aspire GO 15 Touch AG15-71PT-72EL Core i7 16GB 512GB',
    categoria: 'Informática', loja: 'Loja Oficial Acer', seloLoja: 'Loja Oficial', modelo: 'AG15-71PT-72EL', modeloFabricante: 'AG15-71PT-72EL', produtoGrupo: 'acer-ag15-71pt-72el-16gb-512gb-touch',
    precoAtual: 5799.00, precoAnterior: 7999.00, precoPix: 5799.00, precoAvista: 5799.00, precoCartao: 6589.77, parcelas: 12, valorParcela: 549.14,
    condicaoPagamento: 'R$ 5.799,00 no PIX ou à vista no cartão; R$ 6.589,77 em até 12x de R$ 549,14', desconto: 27, voltagem: 'Bivolt', estoqueStatus: 'Em estoque',
    url: 'https://br-store.acer.com/notebook-acer-ag15-71pt-72el-ci713620h-16gb-512gb-ssd-windows-11-home-green-fhd-15-6-nx-jgcal-002/p',
    observacoes: 'Preço, disponibilidade e fonte bivolt 100–240V confirmados na Loja Oficial Acer em 12/09/2026.'
  },
  {
    id: 'acer-anv15-41-r6j0', nome: 'Notebook Gamer Acer Nitro V15 ANV15-41-R6J0 Ryzen 7 8GB 512GB RTX 4050',
    categoria: 'Informática', loja: 'Loja Oficial Acer', seloLoja: 'Loja Oficial', modelo: 'ANV15-41-R6J0', modeloFabricante: 'ANV15-41-R6J0', produtoGrupo: 'acer-anv15-41-r6j0-8gb-512gb-rtx4050',
    precoAtual: 5999.00, precoAnterior: 7999.00, precoPix: 5999.00, precoAvista: 5999.00, precoCartao: 6817.05, parcelas: 12, valorParcela: 568.08,
    condicaoPagamento: 'R$ 5.999,00 no PIX ou à vista no cartão; R$ 6.817,05 em até 12x de R$ 568,08', desconto: 25, voltagem: 'Bivolt', estoqueStatus: 'Em estoque',
    url: 'https://br-store.acer.com/notebook-acer-anv15-41-r6j0--r77735hs--8gb--512gb-ssd--rtx4050--agpos--black--fhd-15-6-nh-u20al-004/p',
    observacoes: 'Preço, disponibilidade e fonte bivolt 100–240V confirmados na Loja Oficial Acer em 12/09/2026.'
  },
  {
    id: 'acer-anv16-72-7327', nome: 'Notebook Gamer Acer Nitro V16 ANV16-72-7327 Core 7 32GB 1TB RTX 5060',
    categoria: 'Informática', loja: 'Loja Oficial Acer', seloLoja: 'Loja Oficial', modelo: 'ANV16-72-7327', modeloFabricante: 'ANV16-72-7327', produtoGrupo: 'acer-anv16-72-7327-32gb-1tb-rtx5060',
    precoAtual: 10999.00, precoAnterior: 16999.00, precoPix: 10999.00, precoAvista: 10999.00, precoCartao: 12498.86, parcelas: 12, valorParcela: 1041.57,
    condicaoPagamento: 'R$ 10.999,00 no PIX ou à vista no cartão; R$ 12.498,86 em até 12x de R$ 1.041,57', desconto: 35, voltagem: 'Bivolt', estoqueStatus: 'Em estoque',
    url: 'https://br-store.acer.com/notebook-acer-nitro-anv16-72-7327--c7240h--rtx-5060--32gb--1tb-ssd--wnhasl64--black--lcd-16-nh-qunal-001/p',
    observacoes: 'Preço, disponibilidade e fonte bivolt 100–240V confirmados na Loja Oficial Acer em 12/09/2026.'
  },
  {
    id: 'acer-phn16-73-76h8', nome: 'Notebook Gamer Acer Predator Helios Neo 16 AI PHN16-73-76H8 Ultra 7 32GB 512GB RTX 5070',
    categoria: 'Informática', loja: 'Loja Oficial Acer', seloLoja: 'Loja Oficial', modelo: 'PHN16-73-76H8', modeloFabricante: 'PHN16-73-76H8', produtoGrupo: 'acer-phn16-73-76h8-32gb-512gb-rtx5070',
    precoAtual: 12499.00, precoAnterior: 14999.00, precoPix: 12499.00, precoAvista: 12499.00, precoCartao: 14203.41, parcelas: 12, valorParcela: 1183.61,
    condicaoPagamento: 'R$ 12.499,00 no PIX ou à vista no cartão; R$ 14.203,41 em até 12x de R$ 1.183,61', desconto: 16, voltagem: 'Bivolt', estoqueStatus: 'Em estoque',
    url: 'https://br-store.acer.com/notebook-acer-phn16-73-76h8--cu7255hx--32gb--512gb-ssd--8g-gddr7--rtx-5070--wnhasl64--black--lcd-16-nh-u2pal-004/p',
    observacoes: 'Preço, disponibilidade e fonte bivolt 100–240V confirmados na Loja Oficial Acer em 12/09/2026.'
  },
  {
    id: 'acer-a515-45-r478', nome: 'Notebook Acer Aspire 5 A515-45-R478 Ryzen 5 16GB 512GB Linux',
    categoria: 'Informática', loja: 'Loja Oficial Acer', seloLoja: 'Loja Oficial', modelo: 'A515-45-R478', modeloFabricante: 'A515-45-R478', produtoGrupo: 'acer-a515-45-r478-16gb-512gb',
    precoAtual: 4999.00, precoAnterior: 6999.00, precoPix: 4999.00, precoAvista: 4999.00, precoCartao: 5680.68, parcelas: 12, valorParcela: 473.39,
    condicaoPagamento: 'R$ 4.999,00 no PIX ou à vista no cartão; R$ 5.680,68 em até 12x de R$ 473,39', desconto: 28, voltagem: 'Bivolt', estoqueStatus: 'Em estoque',
    url: 'https://br-store.acer.com/notebook-acer-aspire-5-a515-45-r478-amd-ryzen-5-16gb-ram-512gb-ssd-tela-15-6-linux-prata-nx-aydal-00r/p',
    observacoes: 'Preço, disponibilidade e fonte bivolt 100–240V confirmados na Loja Oficial Acer em 12/09/2026.'
  },
  {
    id: 'acer-ag15-71p-747n', nome: 'Notebook Acer Aspire GO 15 AG15-71P-747N Core i7 16GB 512GB Linux',
    categoria: 'Informática', loja: 'Loja Oficial Acer', seloLoja: 'Loja Oficial', modelo: 'AG15-71P-747N', modeloFabricante: 'AG15-71P-747N', produtoGrupo: 'acer-ag15-71p-747n-16gb-512gb',
    precoAtual: 4499.00, precoAnterior: 6999.00, precoPix: 4499.00, precoAvista: 4499.00, precoCartao: 5112.50, parcelas: 12, valorParcela: 426.04,
    condicaoPagamento: 'R$ 4.499,00 no PIX ou à vista no cartão; R$ 5.112,50 em até 12x de R$ 426,04', desconto: 35, voltagem: 'Bivolt', estoqueStatus: 'Em estoque',
    url: 'https://br-store.acer.com/notebook-acer-ag15-71pt-747n-ci713620h-16gb-512gb-ssd-agpos-green-15-6-nx-fhdjh6al-004/p',
    observacoes: 'Preço, disponibilidade e fonte bivolt 100–240V confirmados na Loja Oficial Acer em 12/09/2026.'
  },
  {
    id: 'acer-ag15-71p-54j6', nome: 'Notebook Acer Aspire GO 15 AG15-71P-54J6 Core i5 8GB 256GB Linux',
    categoria: 'Informática', loja: 'Loja Oficial Acer', seloLoja: 'Loja Oficial', modelo: 'AG15-71P-54J6', modeloFabricante: 'AG15-71P-54J6', produtoGrupo: 'acer-ag15-71p-54j6-8gb-256gb',
    precoAtual: 4499.00, precoAnterior: 5999.00, precoPix: 4499.00, precoAvista: 4499.00, precoCartao: 5112.50, parcelas: 12, valorParcela: 426.04,
    condicaoPagamento: 'R$ 4.499,00 no PIX ou à vista no cartão; R$ 5.112,50 em até 12x de R$ 426,04', desconto: 25, voltagem: 'Bivolt', estoqueStatus: 'Em estoque',
    url: 'https://br-store.acer.com/notebook-acer-ag15-71p-54j6--ci513420h--8gb--256gb-ssd--agpos--gray--fhd-15-6-nx-jh7al-004/p',
    observacoes: 'Preço, disponibilidade e fonte bivolt 100–240V confirmados na Loja Oficial Acer em 12/09/2026.'
  }
];

function normalizeUrl(url) {
  try { const u = new URL(url); u.hash = ''; return `${u.origin}${u.pathname}`.replace(/\/$/, ''); }
  catch { return String(url || '').split('?')[0].replace(/\/$/, ''); }
}
function extractImage(html, baseUrl) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i
  ];
  for (const re of patterns) { const m = html.match(re); if (m?.[1]) { try { return new URL(m[1].replaceAll('&amp;', '&'), baseUrl).href; } catch {} } }
  return '';
}
async function resolveImage(url) {
  try {
    const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 Chrome/140 Safari/537.36', 'accept-language': 'pt-BR,pt;q=0.9' } });
    if (!response.ok) return '';
    const html = await response.text();
    return extractImage(html, response.url || url);
  } catch { return ''; }
}
function score(c) {
  const discount = Math.max(0, Math.min(50, Number(c.desconto) || 0));
  return Math.min(100, Math.round(discount + 30 + 8 + 4));
}
function label(s) { return s >= 75 ? 'Excelente' : s >= 58 ? 'Boa' : s >= 42 ? 'Interessante' : 'Normal'; }

(async () => {
  const ids = new Set(data.ofertas.map(o => o.id));
  const urls = new Set(data.ofertas.map(o => normalizeUrl(o.url)));
  let added = 0;
  for (const c of candidates) {
    if (ids.has(c.id) || urls.has(normalizeUrl(c.url))) continue;
    const imagem = await resolveImage(c.url);
    if (!/^https:\/\//i.test(imagem)) { console.log(`Ignorado sem imagem HTTPS: ${c.id}`); continue; }
    const s = score(c);
    const offer = {
      ...c, imagem, frete: 'Consulte na loja', freteValor: null, freteGratis: false, cepFrete: '72620-405', precoComFrete: null,
      ativa: true, dataEncontrada: now, ultimaVerificacao: now,
      historicoPrecos: [{ data: now, preco: c.precoAtual, freteValor: null, precoComFrete: null }],
      menorPrecoHistorico: c.precoAtual, precoMedioHistorico: c.precoAtual,
      scoreOferta: s, classificacaoOferta: label(s), variacaoPreco: null, ultimaQuedaPreco: null
    };
    data.ofertas.push(offer); ids.add(c.id); urls.add(normalizeUrl(c.url)); added++;
    data.logAlteracoes.push({ data: now, tipo: 'adicionado', produto: c.nome, id: c.id, detalhe: 'Oferta verificada em Loja Oficial Acer em 12/09/2026.' });
  }
  if (!added) { console.log('Nenhuma nova oferta Acer para adicionar.'); return; }
  data.logAlteracoes = data.logAlteracoes.slice(-200);
  data.geradoEm = now;
  data.total = data.ofertas.filter(o => o.ativa !== false).length;
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Adicionadas ${added} ofertas Acer em Informática.`);
})();
