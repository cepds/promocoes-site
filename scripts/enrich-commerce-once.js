const fs = require('fs');
const path = require('path');

const DATA = path.join(process.cwd(), 'data', 'ofertas.json');
const BACKUPS = path.join(process.cwd(), 'data', 'backups');
const raw = fs.readFileSync(DATA); // bytes exatos antes de qualquer alteração

function saoPauloParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(date).reduce((a, p) => (a[p.type] = p.value, a), {});
  return `${parts.year}-${parts.month}-${parts.day}-${parts.hour}${parts.minute}`;
}

fs.mkdirSync(BACKUPS, { recursive: true });
const backup = path.join(BACKUPS, `ofertas-${saoPauloParts()}.json`);
if (fs.existsSync(backup)) throw new Error(`Backup já existe: ${backup}`);
fs.writeFileSync(backup, raw);
const verify = fs.readFileSync(backup);
if (!verify.equals(raw)) throw new Error('Backup não é cópia exata; catálogo principal não será alterado.');

const data = JSON.parse(raw.toString('utf8'));
const offers = Array.isArray(data.ofertas) ? data.ofertas : [];
const byId = new Map(offers.map(o => [o.id, o]));
let changed = 0;
const now = new Date().toISOString();

function put(o, key, value) {
  if (!o || value === undefined || value === null || value === '') return false;
  if (o[key] === value) return false;
  if (o[key] !== undefined && o[key] !== null && o[key] !== '') return false; // nunca sobrescreve dado existente
  o[key] = value;
  return true;
}

function enrich(id, fields) {
  const o = byId.get(id);
  if (!o || o.ativa === false) return;
  let touched = false;
  for (const [k, v] of Object.entries(fields)) touched = put(o, k, v) || touched;
  if (touched) changed++;
}

// Modelos/especificações abaixo já estão explícitos no título/URL atualmente salvo no catálogo.
// Não há inferência por aparência, similaridade vaga ou marca genérica.
enrich('magalu-sofa-multimoveis-cr45242', { modelo: 'CR45242', modeloFabricante: 'CR45242', produtoGrupo: 'multimoveis-cr45242-260cm' });
enrich('magalu-philco-40-roku', { modelo: 'PTV40M9GR2CGB', modeloFabricante: 'PTV40M9GR2CGB', produtoGrupo: 'philco-ptv40m9gr2cgb-40-bivolt' });
enrich('magalu-lg-gbb472-476', { modelo: 'GB-B472PFSF', modeloFabricante: 'GB-B472PFSF', produtoGrupo: 'lg-gb-b472pfsf-476l-bivolt' });
enrich('meli-bosch-gsr714e-220v', { modelo: 'GSR 7-14 E', modeloFabricante: 'GSR 7-14 E', produtoGrupo: 'bosch-gsr-7-14-e-400w-220v' });
enrich('magalu-tcl-55c6k', { modelo: '55C6K', modeloFabricante: '55C6K', produtoGrupo: 'tcl-55c6k-55-bivolt' });
enrich('meli-semp-43s62', { modelo: '43S62', modeloFabricante: '43S62', produtoGrupo: 'semp-43s62-43-bivolt' });
enrich('magalu-tcl-55p7l-55-qled', { modelo: '55P7L', modeloFabricante: '55P7L', produtoGrupo: 'tcl-55p7l-55-bivolt' });
enrich('magalu-brastemp-bwf16ab-16kg-220v-ak4d73dhff', { modelo: 'BWF16AB', modeloFabricante: 'BWF16AB', produtoGrupo: 'brastemp-bwf16ab-16kg-branca-220v' });
enrich('brastemp-bwf16ab-16kg-220v', { modelo: 'BWF16AB', modeloFabricante: 'BWF16AB', produtoGrupo: 'brastemp-bwf16ab-16kg-branca-220v' });
enrich('magalu-brastemp-bwf18ab-18kg-220v-ed46jf280b', { modelo: 'BWF18AB', modeloFabricante: 'BWF18AB', produtoGrupo: 'brastemp-bwf18ab-18kg-branca-220v' });
enrich('magalu-consul-cwn16ab-16kg-220v-ckce4623fk', { modelo: 'CWN16AB', modeloFabricante: 'CWN16AB', produtoGrupo: 'consul-cwn16ab-16kg-branca-220v' });
enrich('magalu-colormaq-lca14-14kg-220v-fe46ke30e3', { modelo: 'LCA14', modeloFabricante: 'LCA14', produtoGrupo: 'colormaq-lca14-14kg-branca-220v' });
enrich('magalu-electrolux-lfc12-12kg-220v-feec5d2a10', { modelo: 'LFC12', modeloFabricante: 'LFC12', produtoGrupo: 'electrolux-lfc12-12kg-cinza-onix-220v' });
enrich('electrolux-dfn41-371l-220v', { modelo: 'DFN41', modeloFabricante: 'DFN41', produtoGrupo: 'electrolux-dfn41-371l-220v' });
enrich('electrolux-led17-17kg-220v', { modelo: 'LED17', modeloFabricante: 'LED17', produtoGrupo: 'electrolux-led17-17kg-220v' });
enrich('electrolux-led15-15kg-220v', { modelo: 'LED15', modeloFabricante: 'LED15', produtoGrupo: 'electrolux-led15-15kg-220v' });
enrich('electrolux-lfb12-12kg-220v', { modelo: 'LFB12', modeloFabricante: 'LFB12', produtoGrupo: 'electrolux-lfb12-12kg-branca-220v' });
enrich('electrolux-lee18-18kg-220v', { modelo: 'LEE18', modeloFabricante: 'LEE18', produtoGrupo: 'electrolux-lee18-18kg-220v' });
enrich('brastemp-bwt16a9-16kg-220v', { modelo: 'BWT16A9', modeloFabricante: 'BWT16A9', produtoGrupo: 'brastemp-bwt16a9-16kg-cinza-220v' });
enrich('electrolux-eaf31-airfryer-4l-220v', { modelo: 'EAF31', modeloFabricante: 'EAF31', produtoGrupo: 'electrolux-eaf31-4l-220v' });
enrich('electrolux-eaf180-airfryer-7l-220v', { modelo: 'EAF180', modeloFabricante: 'EAF180', produtoGrupo: 'electrolux-eaf180-7l-220v' });
enrich('electrolux-ji09f-ar-9000-220v', { modelo: 'JI09F/JE09F', modeloFabricante: 'JI09F/JE09F', produtoGrupo: 'electrolux-ji09f-je09f-9000-frio-220v' });
enrich('electrolux-yi12r-ar-12000-220v', { modelo: 'YI12R/YE12R', modeloFabricante: 'YI12R/YE12R', produtoGrupo: 'electrolux-yi12r-ye12r-12000-quente-frio-220v' });
enrich('magalu-samsung-ar09-ultra-ai', { modelo: 'AR09DYFZAWKNAZ', modeloFabricante: 'AR09DYFZAWKNAZ', produtoGrupo: 'samsung-ar09dyfzawknaz-9000-frio-220v' });
enrich('lg-dual-compact-18000', { modelo: 'S3NQ18KLQAC', modeloFabricante: 'S3NQ18KLQAC', produtoGrupo: 'lg-s3nq18klqac-18000-frio-220v' });

// Estoque: só transforma em campo estruturado quando a observação já afirma disponibilidade/estoque.
for (const o of offers) {
  if (o.ativa === false || o.estoqueStatus) continue;
  const obs = String(o.observacoes || '').toLocaleLowerCase('pt-BR');
  if (obs.includes('estoque disponível') || obs.includes('disponibilidade confirmada') || obs.includes('disponibilidade confirmadas')) {
    o.estoqueStatus = 'Em estoque';
    changed++;
  }
}

if (changed > 0) {
  const logs = Array.isArray(data.logAlteracoes) ? data.logAlteracoes : [];
  logs.push({
    data: now,
    tipo: 'dados_comerciais_enriquecidos',
    produto: 'Catálogo',
    id: 'catalogo',
    detalhe: `${changed} oferta(s) receberam modelo/grupo de produto e/ou estoque estruturado somente a partir de dados já confirmados no catálogo.`
  });
  data.logAlteracoes = logs.slice(-200);
  data.geradoEm = now;
  fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// Mantém no máximo 14 snapshots JSON, sem apagar README e nunca apagando o mais recente.
const backups = fs.readdirSync(BACKUPS)
  .filter(n => /^ofertas-\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(n))
  .sort();
for (const old of backups.slice(0, Math.max(0, backups.length - 14))) {
  if (path.join(BACKUPS, old) !== backup) fs.unlinkSync(path.join(BACKUPS, old));
}

console.log(`Backup exato criado: ${path.relative(process.cwd(), backup)}; ofertas enriquecidas: ${changed}`);
