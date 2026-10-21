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
const sources=[...(primary.ofertas||[]),...(supplementary.ofertas||[])];
const unique=new Map();
for(const item of sources)if(item&&item.ativa!==false&&item.id&&!unique.has(String(item.id)))unique.set(String(item.id),item);
const offers=[...unique.values()].filter(x=>safeStoreUrl(x.url));
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
     const verified={
       ...original,
       ativa:true,
       precoAnterior:null,
       desconto:0,
       precoAtual:result.price,
       frete:"Consulte na loja",freteValor:null,freteGratis:false,precoComFrete:null,
       cupom:null,cashback:null,prazoEntrega:null,entregaEstimada:null,
       estoqueStatus:"InStock",
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
- Disponíveis com preço confirmado: ${approved.length}
- Esgotados explicitamente: ${counters.out_of_stock}
- Sem evidência suficiente: ${counters.unverified}
- Falhas de acesso/rede: ${counters.network_failure}
- Duração: ${Math.round((Date.now()-start)/1000)}s
- Somente confirmados são publicados; os demais ficam ocultos. Sem reutilização de datas/preços antigos.
`;
console.log(summary);
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);
if(process.env.RADAR_DIAGNOSTICS==="1")console.log(JSON.stringify(details,null,2));
