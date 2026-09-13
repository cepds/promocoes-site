const fs = require('fs');
const path = require('path');

const catalogPath = path.join('data','ofertas.json');
const raw = fs.readFileSync(catalogPath,'utf8');
const data = JSON.parse(raw);
const now = new Date();
const iso = now.toISOString();

function saoPauloStamp(d){
  const parts = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(d);
  const get = t => parts.find(p=>p.type===t)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}-${get('hour')}${get('minute')}`;
}

const backupDir = path.join('data','backups');
fs.mkdirSync(backupDir,{recursive:true});
const backupPath = path.join(backupDir,`ofertas-${saoPauloStamp(now)}.json`);
if (fs.existsSync(backupPath)) throw new Error(`Backup já existe: ${backupPath}`);
fs.writeFileSync(backupPath, raw, 'utf8');
if (fs.readFileSync(backupPath,'utf8') !== raw) throw new Error('Falha de integridade no backup; catálogo principal não será alterado.');

function addLog(tipo, produto, id, detalhe){
  data.logAlteracoes = Array.isArray(data.logAlteracoes) ? data.logAlteracoes : [];
  data.logAlteracoes.push({data:iso,tipo,produto,id,detalhe});
  data.logAlteracoes = data.logAlteracoes.slice(-200);
}
function recalcHistory(o){
  const h = Array.isArray(o.historicoPrecos) ? o.historicoPrecos.filter(x=>Number(x.preco)>0) : [];
  o.historicoPrecos = h.slice(-60);
  if (o.historicoPrecos.length){
    const values=o.historicoPrecos.map(x=>Number(x.preco));
    o.menorPrecoHistorico=Math.min(...values);
    o.precoMedioHistorico=Number((values.reduce((a,b)=>a+b,0)/values.length).toFixed(2));
  }
}
function recordPrice(o, price){
  o.historicoPrecos = Array.isArray(o.historicoPrecos) ? o.historicoPrecos : [];
  const last=o.historicoPrecos[o.historicoPrecos.length-1];
  if (!last || Number(last.preco)!==Number(price)) o.historicoPrecos.push({data:iso,preco:Number(price),freteValor:null,precoComFrete:null});
  recalcHistory(o);
}
function deactivateForHigherPrice(id,newPrice,extra={}){
  const o=(data.ofertas||[]).find(x=>x.id===id);
  if(!o) return;
  const old=Number(o.precoAtual);
  o.precoAtual=Number(newPrice);
  Object.assign(o,extra);
  o.ativa=false;
  o.ultimaVerificacao=iso;
  o.variacaoPreco=Number((newPrice-old).toFixed(2));
  recordPrice(o,newPrice);
  addLog('preco_subiu_removido',o.nome,o.id,`Preço verificado subiu de R$ ${old.toFixed(2)} para R$ ${Number(newPrice).toFixed(2)}; oferta desativada conforme regra de retenção.`);
}

// Verificações em lojas oficiais realizadas em 13/09/2026.
deactivateForHigherPrice('brastemp-bwf16ab-16kg-220v',2152.00,{
  precoCartao:2152.00,parcelas:8,valorParcela:269.00,
  condicaoPagamento:'R$ 2.152,00 em até 8x de R$ 269,00 sem juros',
  observacoes:'Preço e variante 220V revalidados na Loja Oficial Brastemp em 13/09/2026; preço promocional anterior encerrou.'
});
deactivateForHigherPrice('brastemp-brm52mk-415l-inox-220v',3300.29,{
  precoPix:3300.29,precoAvista:3300.29,precoCartao:3473.99,parcelas:10,valorParcela:347.39,
  condicaoPagamento:'R$ 3.300,29 no Pix; R$ 3.473,99 em até 10x de R$ 347,39 sem juros',
  observacoes:'Preço e variante 220V revalidados na Loja Oficial Brastemp em 13/09/2026; preço efetivo ficou acima do promocional registrado.'
});
deactivateForHigherPrice('brastemp-bfo4vbr-fogao-4b-220v',2696.86,{
  precoPix:2696.86,precoAvista:2696.86,precoCartao:2869.00,parcelas:8,valorParcela:358.62,
  condicaoPagamento:'R$ 2.696,86 no Pix; R$ 2.869,00 em até 8x de R$ 358,62 sem juros',
  observacoes:'Preço e variante 220V revalidados na Loja Oficial Brastemp em 13/09/2026; página também indicou indisponibilidade para o CEP consultado e o preço subiu acima do promocional registrado.'
});

const newOffer={
  id:'electrolux-ji24r-je24r-24000-qf-220v',
  nome:'Ar-Condicionado Split Electrolux Inverter 24.000 BTUs Color Adapt Quente/Frio JI24R/JE24R',
  categoria:'Climatização',
  loja:'Loja Oficial Electrolux',
  seloLoja:'Loja Oficial',
  modelo:'JI24R/JE24R',
  modeloFabricante:'JI24R/JE24R',
  produtoGrupo:'electrolux-ji24r-je24r-24000-quente-frio-220v',
  precoAtual:3799.00,
  precoAnterior:4599.00,
  desconto:17,
  frete:'Consulte na loja',
  freteValor:null,
  freteGratis:false,
  cepFrete:'72620-405',
  precoComFrete:null,
  prazoEntrega:null,
  voltagem:'220V',
  url:'https://loja.electrolux.com.br/ar-condicionado-split-electrolux-inverter-24000-btus-color-adapt-quente-frio-ji24r-je24r-/p',
  imagem:'https://electrolux.vtexassets.com/arquivos/ids/291654-360-360?aspect=true&format=auto&height=360&v=639100679775670000&width=360',
  ativa:true,
  dataEncontrada:iso,
  ultimaVerificacao:iso,
  observacoes:'Preço, modelo e voltagem 220V confirmados na Loja Oficial Electrolux em 13/09/2026. EANs das unidades externa e interna constam na página oficial, mas não foram consolidados como um único EAN do conjunto.',
  historicoPrecos:[{data:iso,preco:3799.00,freteValor:null,precoComFrete:null}],
  menorPrecoHistorico:3799.00,
  precoMedioHistorico:3799.00,
  scoreOferta:35,
  classificacaoOferta:'Normal',
  variacaoPreco:null,
  ultimaQuedaPreco:null
};
if(!(data.ofertas||[]).some(o=>o.id===newOffer.id || o.url===newOffer.url)){
  data.ofertas.push(newOffer);
  addLog('adicionado',newOffer.nome,newOffer.id,'Oferta adicionada da Loja Oficial Electrolux com preço, modelo e voltagem 220V verificados.');
}

data.geradoEm=iso;
data.total=(data.ofertas||[]).filter(o=>o.ativa!==false).length;
fs.writeFileSync(catalogPath,JSON.stringify(data,null,2)+'\n','utf8');

const backups=fs.readdirSync(backupDir).filter(n=>/^ofertas-\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(n)).sort();
for(const old of backups.slice(0,Math.max(0,backups.length-14))){
  const full=path.join(backupDir,old);
  if(full!==backupPath) fs.unlinkSync(full);
}
console.log(`Ativos: ${data.total}; backup: ${backupPath}`);
