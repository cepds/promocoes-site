const fs = require('fs');
const { spawnSync } = require('child_process');

const errors = [];
const warnings = [];

function fail(message) { errors.push(message); }
function warn(message) { warnings.push(message); }
function exists(path) { return fs.existsSync(path); }
function isHttps(value) {
  try { return new URL(String(value || '')).protocol === 'https:'; }
  catch { return false; }
}

const requiredFiles = [
  'public/index.html',
  'public/style.css',
  'public/enhancements.css',
  'public/commerce.css',
  'public/catalog-policy.js',
  'public/search-engine.js',
  'public/home-discovery.js',
  'public/comparator-discovery.js',
  'public/categorias-descoberta.json',
  'public/enxoval.json',
  'public/img/cama-ilustrativo.svg',
  'public/img/mesa-ilustrativo.svg',
  'public/img/banho-ilustrativo.svg',
  'scripts/awin-feed-lib.cjs',
  'scripts/sync-awin-feed.mjs',
  'scripts/verify-products.mjs',
  'scripts/verify-products-lib.cjs',
  'scripts/check-verified-catalog.cjs',
  'public/ofertas-verificadas.json',
  'public/lojas-casa.json',
  'public/fetch-fallback.js',
  'public/app.js',
  'public/enhancements.js',
  'public/auto-refresh.js',
  'public/sw.js',
  'public/manifest.webmanifest',
  'public/produto.html',
  'public/produto.js',
  'public/produto-enhancements.js',
  'public/admin.html',
  'public/admin.js',
  'data/ofertas.json',
  'firebase.json',
  '.firebaserc'
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`Arquivo obrigatório ausente: ${file}`);
}

const jsFiles = [
  'public/catalog-policy.js',
  'public/search-engine.js',
  'public/home-discovery.js',
  'public/comparator-discovery.js',
  'scripts/awin-feed-lib.cjs',
  'scripts/sync-awin-feed.mjs',
  'scripts/verify-products.mjs',
  'scripts/verify-products-lib.cjs',
  'scripts/check-verified-catalog.cjs',
  'public/fetch-fallback.js',
  'public/app.js',
  'public/enhancements.js',
  'public/auto-refresh.js',
  'public/sw.js',
  'public/produto.js',
  'public/produto-enhancements.js',
  'public/admin.js'
];

for (const file of jsFiles) {
  if (!exists(file)) continue;
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) fail(`Erro de sintaxe em ${file}: ${result.stderr || result.stdout}`);
}

let data = null;
if (exists('data/ofertas.json')) {
  try {
    data = JSON.parse(fs.readFileSync('data/ofertas.json', 'utf8'));
  } catch (error) {
    fail(`data/ofertas.json inválido: ${error.message}`);
  }
}

if (data) {
  if (!Array.isArray(data.ofertas)) fail('data/ofertas.json: campo ofertas precisa ser uma lista.');
  const offers = Array.isArray(data.ofertas) ? data.ofertas : [];
  const active = offers.filter(o => o && o.ativa !== false);
  const ids = new Set();
  const urls = new Set();

  for (const [index, o] of active.entries()) {
    const prefix = `Oferta ativa #${index + 1}`;
    if (!o.id) fail(`${prefix}: id ausente.`);
    if (!o.nome) fail(`${prefix}: nome ausente.`);
    if (!o.categoria) fail(`${prefix}: categoria ausente.`);
    if (!o.loja) fail(`${prefix}: loja ausente.`);
    if (!(Number(o.precoAtual) > 0)) fail(`${prefix}: precoAtual inválido.`);
    if (!isHttps(o.url)) fail(`${prefix}: URL do produto precisa ser HTTPS.`);
    const approvedHosts=new Set(["loja.electrolux.com.br","www.magazineluiza.com.br","m.magazineluiza.com.br","www.tramontina.com.br","www.carrefour.com.br","www.madeiramadeira.com.br","br-store.acer.com","www.kabum.com.br","produto.mercadolivre.com.br","www.mercadolivre.com.br","www.philco.com.br","parceiros.wap.ind.br","www.brastemp.com.br","www.cuisinartbrasil.com.br","www.mobly.com.br","www.tokstok.com.br","www.camicado.com.br","www.karsten.com.br","www.artex.com.br","www.zelo.com.br","www.altenburg.com.br"]);
    try { if (!approvedHosts.has(new URL(String(o.url)).hostname)) fail(`${prefix}: domínio da loja não autorizado (${o.url}).`); } catch { /* Erro de URL já registrado acima. */ }
    if (!isHttps(o.imagem)) fail(`${prefix}: imagem precisa ser HTTPS.`);

    const id = String(o.id || '').trim();
    if (id) {
      if (ids.has(id)) fail(`${prefix}: id duplicado (${id}).`);
      ids.add(id);
    }

    const normalizedUrl = String(o.url || '').split('?')[0].replace(/\/$/, '');
    if (normalizedUrl) {
      if (urls.has(normalizedUrl)) fail(`${prefix}: URL duplicada (${normalizedUrl}).`);
      urls.add(normalizedUrl);
    }

    const blob = `${o.voltagem || ''} ${o.nome || ''} ${o.observacoes || ''}`.toLowerCase();
    const explicit127 = /\b(110|127)\s*v\b/.test(blob);
    const compatible220 = /\b220\s*v\b|bivolt/.test(blob);
    if (explicit127 && !compatible220) fail(`${prefix}: produto 110V/127V exclusivo não permitido.`);
  }

  if (Number(data.total) !== active.length) {
    fail(`Campo total (${data.total}) não confere com ofertas ativas (${active.length}).`);
  }

  const targetCategories = ['Sofás','TVs','Celulares','Informática','Geladeiras','Máquinas de lavar','Air Fryers','Móveis','Ferramentas','Cozinha','Climatização','Games'];
  const counts = new Map(targetCategories.map(category => [category, 0]));
  active.forEach(o => {
    const category = String(o.categoria || '').trim();
    if (counts.has(category)) counts.set(category, counts.get(category) + 1);
  });
  for (const category of targetCategories) {
    const count = counts.get(category) || 0;
    if (count < 10) warn(`${category}: ${count}/10 ofertas ativas. A automação deve priorizar esta categoria.`);
  }

  const stale = active.filter(o => {
    const d = o.ultimaVerificacao ? new Date(o.ultimaVerificacao) : null;
    return !d || Number.isNaN(d.getTime()) || Date.now() - d.getTime() > 18 * 60 * 60 * 1000;
  }).length;
  if (stale) warn(`${stale} oferta(s) sem verificação nas últimas 18 horas.`);
  if (!data.geradoEm) warn('Campo geradoEm ausente.');
}

try {
  const directory=JSON.parse(fs.readFileSync("public/lojas-casa.json","utf8"));
  const source=JSON.parse(fs.readFileSync("data/lojas-casa.json","utf8"));
  if (JSON.stringify(directory)!==JSON.stringify(source)) fail("Diretórios de lojas divergem.");
  if (!Array.isArray(directory.lojas) || directory.lojas.length<8) fail("Diretório precisa de ao menos 8 lojas.");
  const hosts=new Set([
    "www.mobly.com.br","www.madeiramadeira.com.br","www.tokstok.com.br",
    "www.camicado.com.br","www.karsten.com.br","www.artex.com.br",
    "www.zelo.com.br","www.altenburg.com.br"
  ]);
  for(const store of directory.lojas||[]){
    try {const u=new URL(store.url);
      if(u.protocol!=="https:"||!hosts.has(u.hostname)) fail("URL da loja não autorizada: "+store.nome);
    }catch{fail("URL inválida para loja: "+store.nome)}
    if(!store.nome||!Array.isArray(store.categoria)||!store.categoria.length)fail("Metadados incompletos da loja: "+store.id);
  }
}catch(e){fail("Erro no diretório de lojas: "+e.message)}
try {
  const category=JSON.parse(fs.readFileSync('public/categorias-descoberta.json','utf8'));
  const copy=JSON.parse(fs.readFileSync('data/categorias-descoberta.json','utf8'));
  if (JSON.stringify(category)!==JSON.stringify(copy)) fail("Categorias de descoberta estão diferentes.");
  if (!Array.isArray(category.categorias)||category.categorias.length<36) fail("Diretório de categorias precisa de 36 itens.");
  const unique=new Set();
  for (const item of category.categorias || []) {
    if(!item.id||!item.nome||!item.grupo||!item.consulta)fail("Categoria incompleta no diretório.");
    if(unique.has(item.id))fail("Categoria duplicada: "+item.id);
    unique.add(item.id);
  }
}catch(error){fail("Diretório de categorias inválido: "+error.message)}

try {
  const local=JSON.parse(fs.readFileSync('public/enxoval.json','utf8'));
  const source=JSON.parse(fs.readFileSync('data/enxoval.json','utf8'));
  if (JSON.stringify(local)!==JSON.stringify(source)) fail('Enxoval em public e data divergentes.');
  const list=Array.isArray(local.ofertas)?local.ofertas:[];
  if (list.length<6) fail('Enxoval sem os seis produtos pesquisados.');
  const ids=new Set();
  for(const o of list){
    if(ids.has(o.id))fail('ID de enxoval repetido: '+o.id);
    ids.add(o.id);
    if(o.categoria!=='Cama, mesa e banho')fail('Categoria de enxoval incorreta.');
    if(!o.imagemIlustrativa)fail('Produto sem foto deve identificar imagem ilustrativa.');
    if(!isHttps(o.url)||new URL(o.url).hostname!=='www.karsten.com.br')fail('URL de enxoval desconhecida.');
    if(!(Number(o.precoAtual)>0))fail('Enxoval com preço ausente.');
    if(!isHttps(o.imagem))fail('Enxoval com imagem inválida.');
  }
}catch(error){fail('Falha de integridade no enxoval: '+error.message)}

try {
  const v=JSON.parse(fs.readFileSync("public/ofertas-verificadas.json","utf8"));
  if(v.versao!==2||!Array.isArray(v.ofertas)||v.total!==v.ofertas.length)
    fail("A vitrine publica precisa usar somente o catalogo verificado (versao 2).");
  const policy=require("../public/catalog-policy.js");
  for(const offer of v.ofertas||[]){
    if(!policy.isConfirmedAvailable(offer))
      fail("Vitrine com produto sem preco e estoque confirmado: "+offer.id);
  }
}catch(error){fail("Catalogo verificado invalido: "+error.message)}

if (warnings.length) {
  console.log('\nAvisos:');
  warnings.forEach(w => console.log(`- ${w}`));
}

if (errors.length) {
  console.error('\nVALIDAÇÃO FALHOU:');
  errors.forEach(e => console.error(`- ${e}`));
  console.error('\nDeploy cancelado para proteger o site.');
  process.exit(1);
}

console.log('Validação concluída: nenhum erro bloqueante encontrado.');
