"use strict";
// Adaptador de feed Awin (CSV) -- apenas dados autorizados, sem scraping de comparadores.
const crypto=require("node:crypto");
const Policy=require("../public/catalog-policy.js");
const MAX_AGE=18*3600*1000;
function parseCsv(source,delimiter=","){
  const text=String(source||"").replace(/^\uFEFF/,"");
  const rows=[];let cells=[],cur="",quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){
      if(quoted&&text[i+1]==='"'){cur+='"';i++;}else quoted=!quoted;
    }else if(c===delimiter&&!quoted){cells.push(cur);cur="";}
    else if((c==="\n"||c==="\r")&&!quoted){
      if(c==="\r"&&text[i+1]==="\n")i++;
      cells.push(cur);cur="";
      if(cells.some(v=>v.trim()))rows.push(cells);
      cells=[];
    }else cur+=c;
  }
  if(quoted)throw Error("CSV malformado: aspas sem fechamento");
  if(cur||cells.length){cells.push(cur);if(cells.some(v=>v.trim()))rows.push(cells)}
  return rows;
}
function objects(csv,delimiter=","){
  const rows=parseCsv(csv,delimiter);
  if(!rows.length)return [];
  const headers=rows.shift().map(x=>x.trim().toLowerCase().replace(/\s+/g,"_"));
  return rows.map(values=>Object.fromEntries(headers.map((h,i)=>[h,values[i]??""])));
}
function brazilianNumber(value){
  const raw=String(value??"").trim().replace(/\s*(BRL|R\$)\s*/gi,"");
  if(!raw)return null;
  let numeric=raw;
  if(raw.includes(",")&&raw.includes("."))numeric=raw.lastIndexOf(",")>raw.lastIndexOf(".")?raw.replace(/\./g,"").replace(",","."):raw.replace(/,/g,"");
  else if(raw.includes(","))numeric=raw.replace(",",".");
  const result=Number(numeric);
  return Number.isFinite(result)&&result>0?Number(result.toFixed(2)):null;
}
function dateFromFeed(v){
  const raw=String(v??"").trim();
  if(!raw)return null;
  const iso=raw.replace(" ","T");
  const time=Date.parse(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(iso)?iso:iso+"Z");
  return Number.isFinite(time)?time:null;
}
function recent(time,now=Date.now()){return Number.isFinite(time)&&now-time>=-5*60*1000&&now-time<=MAX_AGE;}
function category(title,merchantCategory=""){
  const t=(String(title)+" "+String(merchantCategory)).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const rules=[
    [/toalh|roupao|banho|tapete de banheiro/,"Cama, mesa e banho"],
    [/lencol|edredom|travesseiro|fronha|cobertor|colcha|jogo de cama/,"Cama, mesa e banho"],
    [/colchao|cama box|base box/,"Colchões"],
    [/sofa|poltrona|chaise/,"Sofás"],
    [/guarda roupa|comoda|rack|painel para tv|mesa de jantar|cadeira|escrivaninha|armario|estante/,"Móveis"],
    [/louca|jogo de jantar|prato|panela|talher|frigideira|copo|jarra/,"Cozinha"],
    [/geladeira|refrigerador|freezer/,"Geladeiras"],
    [/maquina de lavar|lavadora de roupas/,"Máquinas de lavar"],
    [/air ?fryer|fritadeira/,"Air Fryers"],
    [/ar condicionado|climatizador|ventilador/,"Climatização"],
    [/televis|smart tv|tv (?:led|4k|oled)/,"TVs"],
    [/celular|smartphone/,"Celulares"],
    [/notebook|computador|monitor|ssd|processador|placa de video|memoria ram/,"Informática"],
    [/videogame|console|playstation|xbox|nintendo/,"Games"],
    [/furadeira|parafusadeira|serra|esmerilhadeira/,"Ferramentas"],
    [/berco|carrinho bebe|cadeirinha/,"Bebês"],
    [/racao|cama pet|gato|cachorro/,"Pets"],
    [/tapete decorativo|almofada|luminaria|pendente|quadro/,"Decoração"],
    [/jardim|piscina|churrasqueira/,"Jardim e varanda"],
    [/bicicleta|esteira|halter|academia/,"Esportes"]
  ];
  for(const [test,group] of rules)if(test.test(t))return group;
  return null;
}
function isFalse(v){return ["0","false","no","nao","não","out of stock","out_of_stock","unavailable","esgotado"].includes(String(v??"").trim().toLowerCase());}
function mapRow(row,feed,now=Date.now()){
  if(!recent(dateFromFeed(feed.lastImported),now))return null;
  if(isFalse(row.in_stock)||isFalse(row.is_for_sale)||isFalse(row.stock_status))return null;
  const name=String(row.product_name||row.product_title||"").trim().slice(0,240);
  const merchant=String(row.merchant_name||feed.advertiserName||"").trim().slice(0,140);
  const id=String(row.merchant_product_id||row.aw_product_id||row.product_id||"").trim();
  const price=brazilianNumber(row.search_price||row.store_price||row.price);
  const image=Policy.safeHttpsUrl(row.merchant_image_url||row.aw_image_url||row.large_image||"");
  const direct=Policy.safeStoreUrl(row.merchant_deep_link||row.deep_link||"");
  const cat=category(name,row.merchant_category||row.category_name);
  const cur=String(row.currency||"BRL").trim().toUpperCase();
  if(!id||!name||!merchant||!price||!image||!direct||!cat||cur!=="BRL")return null;
  const hash=crypto.createHash("sha256").update(feed.advertiserId+":"+id).digest("hex").slice(0,24);
  const before=brazilianNumber(row.rrp_price||row.product_price_old);
  const previous=before&&before>price&&before/price<=3?before:null;
  const discount=previous?Math.round((1-price/previous)*100):0;
  const cost=brazilianNumber(row.delivery_cost);
  const free=/^(0|0.00|0,00)$/i.test(String(row.delivery_cost||"").trim());
  const stamp=new Date(dateFromFeed(feed.lastImported)).toISOString();
  return {
    id:"awin-"+hash,nome:name,categoria:cat,loja:merchant,
    precoAtual:price,precoAnterior:previous,desconto:discount,
    url:direct,imagem:image,ativa:true,
    dataEncontrada:stamp,ultimaVerificacao:stamp,
    fonteTipo:"feed_afiliado",fonte:"Awin",fonteAtualizadaEm:stamp,
    fonteObservacao:"Preço importado do feed de parceiro atualizado; confirme preço final, frete e vendedor diretamente na loja.",
    observacoes:"Preço fornecido por catálogo de afiliado, não validado no checkout. Confirme estoque e condições no varejista.",
    frete:free?"Grátis":"Consulte na loja",freteValor:free?0:(cost??null),freteGratis:free,
    precoComFrete:cost!==null?Number((price+(free?0:cost)).toFixed(2)):free?price:null,
    estoqueStatus:String(row.stock_status||row.in_stock||"").trim(),
    historicoPrecos:[{data:stamp,preco:price,freteValor:cost,precoComFrete:null}],
    seloLoja:"Feed de parceiro: confirme o vendedor",
    afiliadoOrigem:"Awin"
  };
}
function upsert(catalog,incoming,now=new Date().toISOString()){
  if(!Array.isArray(catalog.ofertas))throw Error("Catálogo sem lista de ofertas");
  const index=new Map(catalog.ofertas.map((o,i)=>[String(o.id),i]));
  let added=0,updated=0;
  for(const offer of incoming){
    const pos=index.get(offer.id);
    if(pos===undefined){
      catalog.ofertas.push(offer);index.set(offer.id,catalog.ofertas.length-1);added++;continue;
    }
    const original=catalog.ofertas[pos];
    const previousPrice=Number(original.precoAtual);
    const history=Array.isArray(original.historicoPrecos)?original.historicoPrecos.slice(-89):[];
    if(previousPrice!==offer.precoAtual || !history.length)history.push({data:offer.ultimaVerificacao,preco:offer.precoAtual,freteValor:offer.freteValor,precoComFrete:offer.precoComFrete});
    const cleaned={...original,...offer,dataEncontrada:original.dataEncontrada||offer.dataEncontrada,historicoPrecos:history};
    if(JSON.stringify(cleaned)!==JSON.stringify(original)){catalog.ofertas[pos]=cleaned;updated++}
  }
  if(added||updated){
    catalog.total=catalog.ofertas.filter(o=>o.ativa!==false).length;
    catalog.geradoEm=now;
    catalog.ultimaImportacaoFeed=now;
    catalog.fonteImportacao="Awin";
  }
  return {added,updated,total:catalog.ofertas.filter(o=>o.ativa!==false).length};
}
module.exports={parseCsv,objects,brazilianNumber,dateFromFeed,recent,category,mapRow,upsert};
