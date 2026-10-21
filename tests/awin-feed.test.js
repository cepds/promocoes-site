const test=require("node:test");
const assert=require("node:assert/strict");
const lib=require("../scripts/awin-feed-lib.cjs");
const stamp="2026-10-21T12:00:00Z";
const now=Date.parse("2026-10-21T13:00:00Z");
const feed={advertiserId:"567",advertiserName:"Parceiro teste",lastImported:stamp};
function row(){
 return {merchant_product_id:"SKU-ABC",product_name:"Jogo de cama queen Karsten 4 peças",merchant_name:"Loja teste",search_price:"129.90",currency:"BRL",merchant_deep_link:"https://www.karsten.com.br/produto-exemplo",merchant_image_url:"https://img.example.com/produto.jpg",in_stock:"1",merchant_category:"cama",delivery_cost:"0.00"};
}
test("CSV Awin respeita campos entre aspas, virgulas e quebras",()=>{
 const a=lib.objects('product_name,search_price,description\n"Lençol, queen",129.90,"Linha 1\nLinha 2"\n');
 assert.equal(a[0].product_name,"Lençol, queen");
 assert.equal(a[0].description,"Linha 1\nLinha 2");
});
test("mapeia feed de casa com fonte, preco e frete",()=>{
 const item=lib.mapRow(row(),feed,now);
 assert.ok(item);
 assert.equal(item.precoAtual,129.9);
 assert.equal(item.categoria,"Cama, mesa e banho");
 assert.equal(item.freteGratis,true);
 assert.equal(item.fonteTipo,"feed_afiliado");
 assert.equal(Date.parse(item.ultimaVerificacao),Date.parse(stamp));
});
test("recusa preco, loja, imagem ou data insuficientes",()=>{
 assert.equal(lib.mapRow({...row(),search_price:""},feed,now),null);
 assert.equal(lib.mapRow({...row(),merchant_deep_link:"https://example.org/produto"},feed,now),null);
 assert.equal(lib.mapRow({...row(),currency:"USD"},feed,now),null);
 assert.equal(lib.mapRow(row(),{...feed,lastImported:"2026-09-14T00:00:00Z"},now),null);
 assert.equal(lib.mapRow({...row(),in_stock:"0"},feed,now),null);
});
test("upsert cria produto sem renomear oferta existente e registra histórico na queda",()=>{
 const item=lib.mapRow(row(),feed,now);
 const cat={ofertas:[],total:0};
 assert.deepEqual(lib.upsert(cat,[item],stamp),{added:1,updated:0,total:1});
 assert.deepEqual(lib.upsert(cat,[item],stamp),{added:0,updated:0,total:1});
 const reduced={...item,precoAtual:99.90,ultimaVerificacao:"2026-10-21T14:00:00Z"};
 const changes=lib.upsert(cat,[reduced],"2026-10-21T14:00:00Z");
 assert.equal(changes.updated,1);
 assert.equal(cat.ofertas[0].historicoPrecos.length,2);
});
