"use strict";
// Apenas dados estruturados públicos, com preço BRL e disponibilidade positiva explícita.
// Não tenta contornar captcha, autenticação, bloqueios ou páginas dinâmicas.
const {safeStoreUrl}=require("../public/catalog-policy.js");

function normalize(s){return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
const stop=new Set(["para","com","uma","uns","das","dos","por","the","em","de","da","do","oficial","pelo","pela","peças","pecas","cor","marca","loja","branco","preto","azul","verde"]);
function tokens(s){return [...new Set(normalize(s).split(/\s+/).filter(x=>x.length>2&&!stop.has(x)))];}
function matchName(expected,actual){
 const a=tokens(expected),b=new Set(tokens(actual));
 if(!a.length||!b.size)return false;
 const overlap=a.filter(x=>b.has(x)).length;
 return overlap>=2 && overlap/Math.min(a.length,b.size)>=0.6;
}
function allNodes(input,depth=0){
 if(!input||typeof input!=="object"||depth>7)return[];
 if(Array.isArray(input))return input.flatMap(x=>allNodes(x,depth+1));
 return [input,...Object.values(input).flatMap(x=>typeof x==="object"?allNodes(x,depth+1):[])];
}
function isType(obj,want){
 const t=obj?.["@type"];return (Array.isArray(t)?t:[t]).some(x=>String(x||"").split("/").at(-1).toLowerCase()===want.toLowerCase());
}
function parseAmount(v){
 if(typeof v==="number")return Number.isFinite(v)&&v>0?v:null;
 const s=String(v??"").trim().replace(/^R\$\s*/,"");
 if(!s||!/^[\d.,]+$/.test(s))return null;
 const val=s.includes(",")?Number(s.replace(/\./g,"").replace(",",".")):Number(s);
 return Number.isFinite(val)&&val>0&&val<1000000?Math.round(val*100)/100:null;
}
function availability(value){
 const s=String(value??"").split("/").at(-1).replace(/[^a-z]/gi,"").toLowerCase();
 if(["instock","limitedavailability","onlineonly"].includes(s))return "InStock";
 if(["outofstock","soldout","discontinued","instoreonly","backorder","preorder","presale"].includes(s))return "OutOfStock";
 return "Unknown";
}
function primaryImage(value){
 const choices=Array.isArray(value)?value:[value];
 for(const v of choices){
   const link=typeof v==="string"?v:typeof v==="object"&&v?String(v.url||v.contentUrl||""):"";
   if(/^https:\/\//i.test(link) && !/\.svg(?:\?|$)/i.test(link))return link;
 }
 return "";
}
function officialSeller(html,record,offer){
 if(!record?.vendedorEsperado)return true;
 const owner=String(record.vendedorEsperado);
 const seller=offer?.seller?.name||offer?.seller?.legalName||offer?.seller||"";
 const candidate=normalize(seller);
 if(owner==="electrolux")return new URL(record.url).hostname==="loja.electrolux.com.br";
 if(owner==="mobly"&&/\bmobly\b/.test(candidate))return true;
 if(owner==="magalu"&&/\bmagalu\b|\bmagazine luiza\b/.test(candidate))return true;
 if(owner==="casasbahia"&&/\bcasas bahia\b/.test(candidate))return true;
 // Vendedor de terceiro explicitamente indicado no Offer nunca pode ser
 // substituído por slogans ou anúncios gerais do marketplace.
 if(candidate)return false;
 const text=normalize(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ").replace(/<[^>]*>/g," ")).slice(0,150000);
 if(owner==="mobly")return /vendido e entregue por mobly/.test(text);
 if(owner==="magalu")return /vendido por magalu e entregue por magalu|vendido e entregue por magalu|produto vendido e entregue pelo magalu/.test(text);
 if(owner==="casasbahia")return /vendido e entregue por casas bahia/.test(text);
 return false;
}
function detect(html,record){
 if(typeof html!=="string"||html.length>3600000)return {status:"unverified",reason:"html_invalido"};
 const scripts=[...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
 const valid=[];
 let seenOut=false,seenMatch=false;
 for(const found of scripts){
   let value;try{value=JSON.parse(found[1].replace(/&quot;/g,'"').replace(/&amp;/g,"&"));}catch{continue}
   for(const node of allNodes(value)){
     if(!isType(node,"Product")||!matchName(record.nome,node.name))continue;
     seenMatch=true;
     const offers=allNodes(node.offers||[]).filter(x=>isType(x,"Offer"));
     for(const o of offers){
       const stock=availability(o.availability);
       if(stock==="OutOfStock"){seenOut=true;continue}
       if(stock!=="InStock")continue;
       const curr=String(o.priceCurrency||o.priceSpecification?.priceCurrency||"").toUpperCase();
       const price=parseAmount(o.price??o.priceSpecification?.price);
       if(curr!=="BRL"||!price)continue;
       const matchUrl=String(o.url||"").trim();
       if(matchUrl && (!safeStoreUrl(matchUrl)||new URL(matchUrl).hostname!==new URL(record.url).hostname))continue;
       if(!officialSeller(html,record,o))continue;
       const image=primaryImage(node.image)||primaryImage(record.imagem);
       if(!image)continue;
       valid.push({price,stock,url:record.url,image,officialSeller:!!record.vendedorEsperado});
     }
   }
 }
 if(valid.length===1)return {status:"verified",...valid[0]};
 if(valid.length>1){
   const unique=[...new Set(valid.map(v=>v.price))];
   return unique.length===1?{status:"verified",...valid[0]}:{status:"unverified",reason:"variantes_com_precos_distintos"};
 }
 if(seenOut&&seenMatch)return {status:"out_of_stock",reason:"estoque_negativo_explicito"};
 return {status:"unverified",reason:seenMatch?"sem_preco_estoque_confiavel":"produto_nao_identificado"};
}
function isRenderable(o,now=Date.now()){
 const t=Date.parse(o?.ultimaVerificacao||"");
 return o?.ativa===true
  &&o?.fonteTipo==="pagina_publica_estruturada"
  &&o?.estoqueStatus==="InStock"
  &&Number(o?.precoAtual)>0
  &&Number.isFinite(t) && now-t>=-300000 && now-t<=18*3600000
  &&!!safeStoreUrl(o?.url)
  &&/^https:\/\//.test(String(o?.imagem||""));
}
module.exports={detect,availability,matchName,parseAmount,isRenderable};
