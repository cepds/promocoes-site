const fs = require('fs');
const path = 'data/ofertas.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const now = new Date().toISOString();
data.ofertas = Array.isArray(data.ofertas) ? data.ofertas : [];
data.logAlteracoes = Array.isArray(data.logAlteracoes) ? data.logAlteracoes : [];
const candidates = [
  {
    id: 'magalu-tcl-55p7l-55-qled',
    nome: 'Smart TV TCL 55” QLED 4K P7L Google TV 120Hz',
    categoria: 'TVs',
    loja: 'Loja TCL Semp no Magalu',
    precoAtual: 2939.00,
    precoAnterior: null,
    desconto: 0,
    cupom: 'Não informado',
    cashback: 'Não informado',
    frete: 'Consulte na loja',
    freteValor: null,
    freteGratis: false,
    cepFrete: '72620-405',
    precoComFrete: null,
    voltagem: 'Bivolt',
    url: 'https://www.magazineluiza.com.br/smart-tv-tcl-55-polegadas-qled-4k-p7l-wifi-bluetooth-google-tv-hdr10-120-hz-vrr-aipq-55p7l/p/hgg9efe76k/et/elit/?seller_id=lojatclsemp',
    imagem: 'https://m.magazineluiza.com.br/a-static/420x420/smart-tv-tcl-55-polegadas-qled-4k-p7l-wifi-bluetooth-google-tv-hdr10-120-hz-vrr-aipq-55p7l/lojatclsemp/33307/484606d0ab7dee5f528c29b31d8a03da.jpeg',
    ativa: true,
    dataEncontrada: now,
    ultimaVerificacao: now,
    observacoes: 'Preço e disponibilidade confirmados. Vendedor Loja TCL Semp com reputação 4,6 no Magalu e mais de 1 mil produtos vendidos. Voltagem Bivolt confirmada.',
    historicoPrecos: [{ data: now, preco: 2939.00, freteValor: null, precoComFrete: null }],
    menorPrecoHistorico: 2939.00,
    precoMedioHistorico: 2939.00,
    scoreOferta: 43,
    classificacaoOferta: 'Interessante',
    variacaoPreco: null,
    ultimaQuedaPreco: null
  },
  {
    id: 'magalu-xiaomi-redmi-15c-256gb-azul',
    nome: 'Xiaomi Redmi 15C 256GB 8GB RAM Azul',
    categoria: 'Celulares',
    loja: 'Poloimports no Magalu',
    precoAtual: 1347.83,
    precoAnterior: 1418.77,
    desconto: 5,
    cupom: 'Não informado',
    cashback: 'Não informado',
    frete: 'Consulte na loja',
    freteValor: null,
    freteGratis: false,
    cepFrete: '72620-405',
    precoComFrete: null,
    url: 'https://www.magazineluiza.com.br/xiaomi-redmi-15c-256gb-8gb-ram-tela-imersiva-hd/p/cd30ge2968/te/r15c/',
    imagem: 'https://m.magazineluiza.com.br/a-static/420x420/xiaomi-redmi-15c-256gb-8gb-ram-tela-imersiva-hd/poloimports/96a0015/c8a49973b7569c233c4e8c7623d61699.jpeg',
    ativa: true,
    dataEncontrada: now,
    ultimaVerificacao: now,
    observacoes: 'Preço e disponibilidade confirmados. Vendedor Poloimports com reputação 4,4 no Magalu, mais de 5 mil produtos vendidos e entrega pelo Magalu.',
    historicoPrecos: [{ data: now, preco: 1347.83, freteValor: null, precoComFrete: null }],
    menorPrecoHistorico: 1347.83,
    precoMedioHistorico: 1347.83,
    scoreOferta: 40,
    classificacaoOferta: 'Normal',
    variacaoPreco: null,
    ultimaQuedaPreco: null
  }
];
const norm = u => String(u || '').split('?')[0];
for (const c of candidates) {
  if (data.ofertas.some(o => o.id === c.id || norm(o.url) === norm(c.url))) continue;
  data.ofertas.push(c);
  data.logAlteracoes.unshift({ data: now, tipo: 'adicionado', produto: c.nome, id: c.id, detalhe: 'Nova oferta validada e adicionada ao catálogo.' });
}
data.logAlteracoes = data.logAlteracoes.slice(0, 200);
data.total = data.ofertas.filter(o => o.ativa !== false).length;
data.geradoEm = now;
fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
