import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA = path.join(ROOT, 'data', 'ofertas.json');
const PATCH = path.join(ROOT, 'data', 'automation-patch.json');
const BACKUPS = path.join(ROOT, 'data', 'backups');
const STATS = path.join(ROOT, 'data', 'catalog-stats.json');
const TARGETS = ['Sofás','TVs','Celulares','Informática','Geladeiras','Máquinas de lavar','Air Fryers','Móveis','Ferramentas','Cozinha','Climatização','Games'];

function nowIso(){ return new Date().toISOString(); }
function saoPauloStamp(){
  const parts = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
  const g=t=>parts.find(p=>p.type===t)?.value||'';
  return `${g('year')}-${g('month')}-${g('day')}-${g('hour')}${g('minute')}`;
}
function num(v){ const n=Number(v); return Number.isFinite(n)?n:null; }
function https(v){ try{return new URL(String(v)).protocol==='https:'}catch{return false} }
function offerKey(o){ return String(o?.id||o?.url||''); }
function historyStats(o){
  const h=Array.isArray(o.historicoPrecos)?o.historicoPrecos:[];
  const vals=h.map(x=>num(x?.preco)).filter(v=>v&&v>0);
  const cur=num(o.precoAtual); if(!vals.length&&cur) vals.push(cur);
  return {min:vals.length?Math.min(...vals):cur,avg:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:cur};
}
function basicScore(o){
  const d=Math.max(0,Math.min(45,num(o.desconto)||0));
  const trust=o.seloLoja?15:5;
  const ship=o.freteGratis===true?15:(num(o.freteValor)!==null?8:3);
  const st=historyStats(o), cur=num(o.precoAtual)||0;
  let hist=10;
  if(st.min&&cur){const pct=(cur-st.min)/st.min*100;hist=pct<=1?25:pct<=5?20:pct<=10?14:7;}
  return Math.max(0,Math.min(100,Math.round(d+trust+ship+hist)));
}
function classif(s){ return s>=75?'Excelente':s>=58?'Boa':s>=42?'Interessante':'Normal'; }
function ensureHistory(o, stamp, previous){
  if(!Array.isArray(o.historicoPrecos)) o.historicoPrecos=[];
  const freight = num(o.freteValor);
  const total = num(o.precoComFrete);
  const cur = num(o.precoAtual);
  if(!cur) return;
  const last=o.historicoPrecos.at(-1);
  const changed=!last || Number(last.preco)!==cur || (last.freteValor??null)!==(freight??null) || (last.precoComFrete??null)!==(total??null);
  if(changed) o.historicoPrecos.push({data:stamp,preco:cur,freteValor:freight,precoComFrete:total});
  o.historicoPrecos=o.historicoPrecos.slice(-60);
  const st=historyStats(o); o.menorPrecoHistorico=st.min; o.precoMedioHistorico=st.avg;
  if(previous!=null && cur<previous){ o.variacaoPreco=cur-previous; o.ultimaQuedaPreco={data:stamp,valorAnterior:previous,valorNovo:cur}; }
}
function validateNew(o){
  for(const k of ['id','nome','categoria','loja','precoAtual','url','imagem']) if(o[k]===undefined||o[k]===null||o[k]==='') throw new Error(`Nova oferta sem ${k}: ${o.id||o.nome||'sem id'}`);
  if(!(num(o.precoAtual)>0)) throw new Error(`Preço inválido: ${o.id}`);
  if(!https(o.url)||!https(o.imagem)) throw new Error(`URL/imagem não HTTPS: ${o.id}`);
  const blob=`${o.voltagem||''} ${o.nome||''} ${o.observacoes||''}`.toLowerCase();
  if(/\b(110|127)\s*v\b/.test(blob)&&!/\b220\s*v\b|bivolt/.test(blob)) throw new Error(`Oferta 110/127V exclusiva: ${o.id}`);
}

const raw=fs.readFileSync(DATA);
fs.mkdirSync(BACKUPS,{recursive:true});
const backup=path.join(BACKUPS,`ofertas-${saoPauloStamp()}.json`);
if(fs.existsSync(backup)) throw new Error(`Backup já existe: ${path.basename(backup)}`);
fs.writeFileSync(backup,raw);
if(!fs.existsSync(backup)||!fs.readFileSync(backup).equals(raw)) throw new Error('Falha ao criar backup exato; catálogo principal não será alterado.');

const data=JSON.parse(raw.toString('utf8'));
const patch=fs.existsSync(PATCH)?JSON.parse(fs.readFileSync(PATCH,'utf8')):{adds:[],updates:[]};
const adds=Array.isArray(patch.adds)?patch.adds:[];
const updates=Array.isArray(patch.updates)?patch.updates:[];
const stamp=nowIso();
const offers=Array.isArray(data.ofertas)?data.ofertas:[];
const logs=Array.isArray(data.logAlteracoes)?data.logAlteracoes:[];
const byId=new Map(offers.map((o,i)=>[String(o.id||''),i]));
const byUrl=new Map(offers.map((o,i)=>[String(o.url||'').split('?')[0].replace(/\/$/,''),i]));
let material=0;

for(const u of updates){
  let idx=-1;
  if(u.id&&byId.has(String(u.id))) idx=byId.get(String(u.id));
  else if(u.url){const k=String(u.url).split('?')[0].replace(/\/$/,''); if(byUrl.has(k)) idx=byUrl.get(k);}
  if(idx<0) continue;
  const o=offers[idx]; const previous=num(o.precoAtual);
  const before=JSON.stringify(o);
  Object.assign(o,u.fields||{});
  o.ultimaVerificacao=u.ultimaVerificacao||stamp;
  ensureHistory(o,stamp,previous);
  if(o.scoreOferta==null) o.scoreOferta=basicScore(o);
  if(!o.classificacaoOferta) o.classificacaoOferta=classif(num(o.scoreOferta)||0);
  if(JSON.stringify(o)!==before){
    material++;
    const cur=num(o.precoAtual);
    const tipo=previous!=null&&cur!=null&&cur<previous?'preco_baixou':previous!=null&&cur!=null&&cur>previous?'preco_subiu_removido':'atualizado';
    logs.push({data:stamp,tipo,produto:o.nome,id:o.id,detalhe:u.detalhe||'Oferta revalidada/atualizada.'});
  }
}

for(const input of adds){
  const o=structuredClone(input); validateNew(o);
  const urlKey=String(o.url).split('?')[0].replace(/\/$/,'');
  if(byId.has(String(o.id))||byUrl.has(urlKey)) continue;
  o.ativa=o.ativa!==false; o.dataEncontrada=o.dataEncontrada||stamp; o.ultimaVerificacao=o.ultimaVerificacao||stamp;
  ensureHistory(o,stamp,null);
  if(o.scoreOferta==null) o.scoreOferta=basicScore(o);
  if(!o.classificacaoOferta) o.classificacaoOferta=classif(num(o.scoreOferta)||0);
  offers.push(o); byId.set(String(o.id),offers.length-1); byUrl.set(urlKey,offers.length-1); material++;
  logs.push({data:stamp,tipo:'adicionado',produto:o.nome,id:o.id,detalhe:o.observacoes||'Nova oferta confirmada.'});
}

if(material>0){
  data.ofertas=offers;
  data.total=offers.filter(o=>o&&o.ativa!==false).length;
  data.logAlteracoes=logs.slice(-200);
  data.geradoEm=stamp;
  fs.writeFileSync(DATA,JSON.stringify(data,null,2)+'\n');
}

const active=offers.filter(o=>o&&o.ativa!==false);
const counts=Object.fromEntries(TARGETS.map(c=>[c,0])); const stores=Object.fromEntries(TARGETS.map(c=>[c,[]]));
for(const o of active){ if(Object.prototype.hasOwnProperty.call(counts,o.categoria)){counts[o.categoria]++; stores[o.categoria].push(o.loja);} }
const stat={geradoEm:stamp,totalAtivas:active.length,categorias:{}};
for(const c of TARGETS) stat.categorias[c]={ativas:counts[c],faltam:Math.max(0,10-counts[c]),lojasDistintas:new Set(stores[c]).size};
fs.writeFileSync(STATS,JSON.stringify(stat,null,2)+'\n');

const files=fs.readdirSync(BACKUPS).filter(x=>/^ofertas-\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(x)).sort();
for(const f of files.slice(0,Math.max(0,files.length-14))) fs.unlinkSync(path.join(BACKUPS,f));
console.log(JSON.stringify({backup:path.basename(backup),material,total:data.total??active.length,counts},null,2));
