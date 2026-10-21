const test=require("node:test");
const assert=require("node:assert/strict");
const {detect,availability,matchName,isRenderable}=require("../scripts/verify-products-lib.cjs");
const item={id:"karsten-test",nome:"Jogo de Cama Queen 300 Fios Videira",url:"https://www.karsten.com.br/produto"};
function fixture(stock="InStock",price="199.90",name=item.nome){
 return '<!doctype html><html><script type="application/ld+json">'+JSON.stringify({
 "@context":"https://schema.org","@type":"Product",name,offers:{"@type":"Offer",price,priceCurrency:"BRL",availability:"https://schema.org/"+stock}
 })+'</script></html>';
}
test("estoque e preço positivos aceitos apenas com produto correto",()=>{
 const v=detect(fixture(),item);
 assert.equal(v.status,"verified");
 assert.equal(v.price,199.90);
 assert.equal(v.stock,"InStock");
});
test("retirar produto esgotado mesmo com preço válido",()=>{
 for(const status of ["OutOfStock","SoldOut","Discontinued","BackOrder","PreOrder","InStoreOnly"]){
 const result=detect(fixture(status),item);
 assert.equal(result.status,"out_of_stock",status);
 }
});
test("não supor estoque nem aceitar moeda estranha",()=>{
 assert.equal(detect(fixture("Unknown"),item).status,"unverified");
 const bad=fixture().replace('"BRL"','"USD"');
 assert.equal(detect(bad,item).status,"unverified");
 assert.equal(detect(fixture("InStock","0"),item).status,"unverified");
 assert.equal(detect(fixture("InStock","199.90","Outro Produto Qualquer"),item).status,"unverified");
});
test("não misturar variantes com preços incompatíveis",()=>{
 const html='<script type="application/ld+json">'+JSON.stringify({"@type":"Product",name:item.nome,
 offers:[{"@type":"Offer",price:199,priceCurrency:"BRL",availability:"InStock"},
 {"@type":"Offer",price:249,priceCurrency:"BRL",availability:"InStock"}]})+'</script>';
 assert.equal(detect(html,item).status,"unverified");
});
test("produto recente com estoque confirmado entra; antigo não",()=>{
 const now=Date.parse("2026-10-21T15:00:00Z");
 const o={ativa:true,precoAtual:200,url:item.url,imagem:"https://www.karsten.com.br/photo.jpg",
 fonteTipo:"pagina_publica_estruturada",estoqueStatus:"InStock",ultimaVerificacao:"2026-10-21T14:00:00Z"};
 assert.ok(isRenderable(o,now));
 assert.ok(!isRenderable({...o,ultimaVerificacao:"2026-10-20T10:00:00Z"},now));
 assert.ok(!isRenderable({...o,estoqueStatus:"OutOfStock"},now));
});
test("normaliza só estados de estoque explícitos",()=>{
 assert.equal(availability("https://schema.org/InStock"),"InStock");
 assert.equal(availability("https://schema.org/OutOfStock"),"OutOfStock");
 assert.equal(availability(""),"Unknown");
 assert.equal(matchName("Sofá Retrátil modelo 3 Lugares","Sofá modelo Retrátil"),true);
});
