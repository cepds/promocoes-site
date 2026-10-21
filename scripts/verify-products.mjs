import fs from "node:fs";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const {detect,isRenderable}=require("./verify-products-lib.cjs");
const {safeStoreUrl}=require("../public/catalog-policy.js");

const OUTPUT="public/ofertas-verificadas.json";
const start=Date.now();
const toIso=t=>new Date(t).toISOString();
const stamp=toIso(start);
const primary=JSON.parse(fs.readFileSync("data/ofertas.json","utf8"));
const supplementary=JSON.parse(fs.readFileSync("data/enxoval.json","utf8"));
const curated=JSON.parse(fs.readFileSync("data/produtos-oficiais.json","utf8"));
const previousCatalog=JSON.parse(fs.readFileSync(OUTPUT,"utf8"));
const previous=new Map((previousCatalog.ofertas||[]).map(o=>[String(o.id),o]));
const sources=[...(curated.produtos||[]),...(primary.ofertas||[]),...(supplementary.ofertas||[])];
const FIRST_PARTY_HOSTS=new Set([
  "www.karsten.com.br","br-store.acer.com","www.kabum.com.br",
  "www.brastemp.com.br","www.cuisinartbrasil.com.br",
  "loja.electrolux.com.br","www.tramontina.com.br","www.philco.com.br"
]);
function isOfficialChannel(record){
  if(!safeStoreUrl(record.url))return false;
  const hostname=new URL(record.url).hostname;
  if(record.vendedorEsperado)return !!record.lojaOficial;
  return FIRST_PARTY_HOSTS.has(hostname);
}
const unique=new Map();
const targetUrls=new Set();
for(const item of sources){
 if(!item||item.ativa===false||!item.id||!isOfficialChannel(item))continue;
 const key=new URL(item.url).origin+new URL(item.url).pathname.replace(/\/$/,"");
 if(unique.has(String(item.id))||targetUrls.has(key))continue;
 unique.set(String(item.id),item);targetUrls.add(key);
}
const offers=[...unique.values()];
const details=[];
const counters={verified:0,out_of_stock:0,unverified:0,network_failure:0};
let next=0;
async function check(record){
 const target=safeStoreUrl(record.url);
 if(!target)return {status:"unverified",reason:"url_nao_permitida"};
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),12500);
 try {
   const response=await fetch(target,{
     signal:controller.signal,
     cache:"no-store",
     headers:{"Accept":"text/html,application/xhtml+xml","User-Agent":"RadarPromocoesCatalogVerifier/1.0 (public structured product data)"}
   });
   if(!response.ok)return {status:"network_failure",reason:"http_"+response.status};
   const original=new URL(target),final=new URL(response.url);
   const safeFinal=safeStoreUrl(final.href);
   if(!safeFinal||!["www.magazineluiza.com.br","m.magazineluiza.com.br"].includes(final.hostname)&&final.hostname!==original.hostname)
     return {status:"unverified",reason:"redirecionamento_invalido"};
   if(!/text\/html|application\/xhtml\+xml/i.test(response.headers.get("content-type")||""))
     return {status:"unverified",reason:"nao_html"};
   const reader=response.body?.getReader();if(!reader)return {status:"unverified",reason:"sem_conteudo"};
   const chunks=[];let bytes=0;
   try {
     while(true){
       const {done,value}=await reader.read();if(done)break;
       bytes+=value.byteLength;
       if(bytes>3_500_000){await reader.cancel();return {status:"unverified",reason:"pagina_muito_grande"}}
       chunks.push(value);
     }
   }finally{reader.releaseLock()}
   const html=new TextDecoder().decode(Buffer.concat(chunks.map(x=>Buffer.from(x))));
   return detect(html,record);
 }catch(error){return {status:"network_failure",reason:error?.name==="AbortError"?"tempo_excedido":"acesso_indisponivel"}}
 finally{clearTimeout(timer)}
}
async function worker(){
 while(true){
   const idx=next++;
   if(idx>=offers.length)return;
   const original=offers[idx];
   const result=await check(original);
   counters[result.status]=(counters[result.status]||0)+1;
   details.push({id:original.id,loja:original.loja,status:result.status,reason:result.reason||null});
   if(result.status==="verified"){
     // Não reaproveitar frete, desconto, estoque ou preço da consulta antiga.
     const prior=previous.get(String(original.id));
     const priorValid=prior?.fonteTipo==="pagina_publica_estruturada"
       &&prior?.estoqueStatus==="InStock"
       &&prior?.url===original.url
       &&Number(prior?.precoAtual)>0;
     const priorTime=Date.parse(prior?.ultimaVerificacao||"");
     const recentComparison=priorValid&&Number.isFinite(priorTime)
       &&start-priorTime>=0&&start-priorTime<=14*86400000;
     const previousPrice=recentComparison?Number(prior.precoAtual):null;
     const drop=previousPrice&&result.price<previousPrice
       ?Math.round((1-result.price/previousPrice)*100):0;
     const isRealDrop=drop>=3&&drop<=60;
     const history=priorValid&&Array.isArray(prior.historicoPrecos)
       ?prior.historicoPrecos.slice(-89):[];
     if(!history.length||Number(history.at(-1).preco)!==result.price)
       history.push({data:stamp,preco:result.price});
     const verified={
       ...original,
       ativa:true,
       imagem:result.image,
       precoAnterior:isRealDrop?previousPrice:null,
       desconto:isRealDrop?drop:0,
       historicoPrecos:history,
       precoAtual:result.price,
       frete:"Consulte na loja",freteValor:null,freteGratis:false,precoComFrete:null,
       cupom:null,cashback:null,prazoEntrega:null,entregaEstimada:null,
       estoqueStatus:"InStock",
       lojaOficial:isOfficialChannel(original),
       loja:original.vendedorEsperado==="magalu"?"Magalu — Loja Oficial"
         :original.vendedorEsperado==="casasbahia"?"Casas Bahia — Loja Oficial"
         :original.vendedorEsperado==="mobly"?"Mobly — Loja Oficial"
         :original.vendedorEsperado==="electrolux"?"Electrolux — Loja Oficial"
         :original.loja,
       seloLoja:"Loja oficial",
       ultimaVerificacao:stamp,fonteTipo:"pagina_publica_estruturada",
       fonte:"Oferta e disponibilidade em JSON-LD Product/Offer da loja",
       fonteAtualizadaEm:stamp
     };
     if(isRenderable(verified,start))approved.push(verified);
   }
 }
}
const approved=[];
await Promise.all(Array.from({length:4},()=>worker()));
approved.sort((a,b)=>a.categoria.localeCompare(b.categoria,"pt-BR")||a.nome.localeCompare(b.nome,"pt-BR"));
const result={
 versao:2,geradoEm:stamp,validadeHoras:18,
 aviso:"Somente produtos com preço em BRL e estoque disponível confirmados nos dados estruturados da loja. Preços podem mudar após a consulta.",
 total:approved.length,
 ofertas:approved
};
fs.writeFileSync(OUTPUT,JSON.stringify(result,null,2)+"\n");
const summary=`## Verificação de produtos (${stamp})
- Produtos candidatos: ${offers.length}
- Disponíveis com preço confirmado em lojas oficiais: ${approved.length}
- Esgotados explicitamente: ${counters.out_of_stock}
- Sem evidência suficiente: ${counters.unverified}
- Falhas de acesso/rede: ${counters.network_failure}
- Duração: ${Math.round((Date.now()-start)/1000)}s
- Somente confirmados são publicados; os demais ficam ocultos. Sem reutilização de datas/preços antigos.
`;
console.log(summary);
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);
if(process.env.RADAR_DIAGNOSTICS==="1")console.log(JSON.stringify(details,null,2));
