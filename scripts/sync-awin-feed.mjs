// Importação de dados de afiliado Awin: somente feed autorizado e recente.
// Nunca raspa páginas de comparadores nem inventa preços/vendedores.
import fs from "node:fs";
import zlib from "node:zlib";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url);
const lib=require("./awin-feed-lib.cjs");
const requiredKey=process.env.AWIN_DATAFEED_API_KEY||"";
const catalogPath="data/ofertas.json";
const allowedFeedHosts=new Set(["productdata.awin.com","datafeed.api.productserve.com"]);
const MAX_COMPRESSED_BYTES=22*1024*1024;
const MAX_EXPANDED_BYTES=44*1024*1024;
const now=Date.now();
function summary(line){
  process.stdout.write(line+"\n");
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,line+"\n");
}
function safeFeed(url){
  try{
    const u=new URL(url);
    return u.protocol==="https:"&&allowedFeedHosts.has(u.hostname);
  }catch{return false}
}
async function readLimited(url){
  if(!safeFeed(url))throw Error("Origem de feed não autorizada");
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),30000);
  try{
    const response=await fetch(url,{signal:controller.signal,headers:{"Accept":"text/csv,application/gzip,application/octet-stream"}});
    if(!response.ok||!safeFeed(response.url))throw Error("Feed indisponível ou redirecionamento não autorizado: HTTP "+response.status);
    const chunks=[];let bytes=0;
    for await(const chunk of response.body){
      bytes+=chunk.length;
      if(bytes>MAX_COMPRESSED_BYTES)throw Error("Feed excedeu o limite de tamanho");
      chunks.push(chunk);
    }
    let body=Buffer.concat(chunks);
    if(body[0]===0x1f&&body[1]===0x8b){
      body=zlib.gunzipSync(body,{maxOutputLength:MAX_EXPANDED_BYTES});
    }
    if(body.length>MAX_EXPANDED_BYTES)throw Error("Feed descompactado muito grande");
    return body.toString("utf8");
  }finally{clearTimeout(timeout)}
}
function selectFeeds(rows){
  const pool=rows.filter(r=>{
    const region=String(r.primary_region||r.region||"").toLowerCase();
    const status=String(r.membership_status||"").toLowerCase();
    const lang=String(r.language||"").toLowerCase();
    return (region==="br"||region.includes("brazil")||region.includes("brasil"))
      &&(status.includes("joined")&&!status.includes("not joined"))
      &&(!lang||lang.includes("portug")||lang==="pt"||lang==="pt-br")
      &&lib.recent(lib.dateFromFeed(r.last_imported),now)
      &&safeFeed(r.url);
  });
  pool.sort((a,b)=>{
    const match=x=>/casa|movel|furniture|cama|colch|banho|eletron|loja|tech|informat|pet|esporte|beauty|decora|outlet/i.test(x.advertiser_name||"")?1:0;
    return match(b)-match(a)||(lib.dateFromFeed(b.last_imported)-lib.dateFromFeed(a.last_imported));
  });
  const seen=new Set();
  return pool.filter(x=>{if(seen.has(x.feed_id))return false;seen.add(x.feed_id);return true}).slice(0,5);
}
function uniqueOffers(rows,feed){
  const buckets=new Map();
  for(const row of rows){
    const offer=lib.mapRow(row,feed,now);
    if(!offer)continue;
    if(!buckets.has(offer.categoria))buckets.set(offer.categoria,[]);
    const list=buckets.get(offer.categoria);
    if(list.length<45)list.push(offer);
  }
  const grouped=[...buckets.values()],out=[],ids=new Set();
  while(out.length<90 && grouped.some(g=>g.length)){
    for(const group of grouped){
      if(!group.length)continue;
      const offer=group.shift();
      if(ids.has(offer.id))continue;
      ids.add(offer.id);out.push(offer);
      if(out.length>=90)break;
    }
  }
  return out;
}
async function main(){
  if(!requiredKey){
    summary("## Catálogo automático: aguardando autorização de feed");
    summary("O secret AWIN_DATAFEED_API_KEY ainda não está configurado. Dados anteriores preservados sem renovar datas de verificação.");
    return;
  }
  const listUrl="https://productdata.awin.com/datafeed/list/apikey/"+encodeURIComponent(requiredKey);
  const text=await readLimited(listUrl);
  const feeds=selectFeeds(lib.objects(text));
  if(!feeds.length){
    summary("## Catálogo automático: nenhum feed BR aprovado e recente disponível");
    summary("Nenhuma oferta ou data foi modificada. Verifique adesão a anunciantes e data de atualização dos feeds.");
    return;
  }
  const incoming=[];let errors=0;
  for(const row of feeds){
    try{
      const feed={
        advertiserName:row.advertiser_name,
        advertiserId:row.advertiser_id,
        lastImported:row.last_imported
      };
      const csv=await readLimited(row.url);
      const mapped=uniqueOffers(lib.objects(csv),feed);
      incoming.push(...mapped);
      summary("- Feed "+String(row.advertiser_name||"parceiro").replace(/[<>]/g,"")+": "+mapped.length+" itens elegíveis.");
    }catch(e){
      errors++;
      summary("- Falha em um feed parceiro; demais catálogos preservados ("+e.message.replace(/https?:\/\/\S+/g,"[URL omitida]")+").");
    }
  }
  if(!incoming.length){
    summary("Nenhum produto novo com dados, loja e data de feed válidos. Catálogo preservado.");
    if(errors===feeds.length)process.exitCode=1;
    return;
  }
  const catalog=JSON.parse(fs.readFileSync(catalogPath,"utf8"));
  const original=fs.readFileSync(catalogPath,"utf8");
  const before=new Set(catalog.ofertas.map(o=>String(o.url||"").split("?")[0].replace(/\/$/,"")));
  const knownIds=new Set(catalog.ofertas.map(o=>o.id));
  const selected=[],newUrls=new Set();
  for(const offer of incoming){
    const key=String(offer.url||"").split("?")[0].replace(/\/$/,"");
    if(!knownIds.has(offer.id)&&(before.has(key)||newUrls.has(key)))continue;
    newUrls.add(key);
    selected.push(offer);
  }
  const result=lib.upsert(catalog,selected,new Date(now).toISOString());
  if(result.added+result.updated===0){
    summary("O catálogo já estava atualizado com as informações dos feeds.");
    return;
  }
  const stamp=new Date(now).toISOString().replace(/[-:]/g,"").replace(/\.\d+Z/,"Z");
  const backup="data/backups/ofertas-feed-"+stamp+".json";
  fs.mkdirSync("data/backups",{recursive:true});
  fs.writeFileSync(backup,original,"utf8");
  fs.writeFileSync(catalogPath,JSON.stringify(catalog,null,2)+"\n","utf8");
  summary("## Importação Awin concluída");
  summary("- Novos: "+result.added+" | atualizados: "+result.updated+" | catálogo ativo: "+result.total);
  summary("- Fonte: feeds autorizados, não confirmação de preço no checkout. Nenhum preço antigo foi revalidado automaticamente.");
}
main().catch(e=>{console.error("Importação abortada: "+e.message.replace(/https?:\/\/\S+/g,"[URL omitida]"));process.exitCode=1;});
