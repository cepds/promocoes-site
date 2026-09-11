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
