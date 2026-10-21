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
 const allowed={
   mobly:{host:"www.mobly.com.br",seller:/^mobly$/},
   magalu:{host:"www.magazineluiza.com.br",seller:/^(?:magalu|magazine luiza)$/},
   casasbahia:{host:"www.casasbahia.com.br",seller:/^casas bahia$/},
   electrolux:{host:"loja.electrolux.com.br",seller:/^electrolux$/},
   madeiramadeira:{host:"www.madeiramadeira.com.br",seller:/^madeira ?madeira$/},
   "magalu-mobly":{host:"m.magazineluiza.com.br",seller:/^mobly$/},
   "magalu-madeiramadeira":{host:"www.magazineluiza.com.br",seller:/^madeira ?madeira$/},
   "magalu-brastemp":{host:"www.magazineluiza.com.br",seller:/^brastemp$/},
   "magalu-electrolux":{host:"www.magazineluiza.com.br",seller:/^electrolux$/},
   "carrefour-brastemp":{host:"www.carrefour.com.br",seller:/^brastemp$/},
   "carrefour-electrolux":{host:"www.carrefour.com.br",seller:/^electrolux$/}
 };
 const policy=allowed[owner];
 if(!policy||new URL(record.url).hostname!==policy.host)return false;
 const seller=offer?.seller?.name||offer?.seller?.legalName||offer?.seller||"";
 const candidate=normalize(seller);
 if(candidate)return policy.seller.test(candidate);
 if(owner==="electrolux")return true; // venda em domínio direto do fabricante
 const stripped=normalize(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ").replace(/<[^>]*>/g," ")).slice(0,150000);
 const named=owner==="magalu-mobly"?"mobly":owner==="magalu-madeiramadeira"?"madeira madeira":owner.includes("brastemp")?"brastemp":owner.includes("electrolux")?"electrolux":owner==="magalu"?"magalu":owner==="casasbahia"?"casas bahia":owner;
 return (owner==="magalu-mobly"&&stripped.includes("vendido por mobly e entregue por magalu")) || stripped.includes("vendido e entregue por "+named) ||
   (named==="magalu"&&stripped.includes("produto vendido e entregue pelo magalu"));
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
     // Modelos iguais mas variantes diferentes não podem compartilhar preço.
     if(record.vendedorEsperado&&record.modelo){
       const expected=normalize(record.modelo).replace(/ /g,"");
       const identity=normalize([node.name,node.model,node.mpn,node.sku].filter(Boolean).join(" ")).replace(/ /g,"");
       if(!identity.includes(expected))continue;
     }
     if(record.identidadeRevisada===true){
       // Apenas grupo comparável se dimensões, modelo e variante pesquisados
       // forem compatíveis com os dados de identificação da página.
       if(!Array.isArray(record.verificacaoTermos)||record.verificacaoTermos.length<3)continue;
       const identity=normalize([node.name,node.model,node.color,node.size,record.url].filter(Boolean).join(" "));
       const compact=identity.replace(/ /g,"");
       if(!record.verificacaoTermos.every(word=>{
         const w=normalize(word);return identity.includes(w)||compact.includes(w.replace(/ /g,""));
       }))continue;
     }
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
       const model=typeof node.model==="string"?node.model:(typeof node.mpn==="string"?node.mpn:"");
       const ean=String(node.gtin13||node.gtin14||node.gtin12||node.gtin||"").replace(/\\D/g,"");
       valid.push({price,stock,url:record.url,image,officialSeller:!!record.vendedorEsperado,model,ean});
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
