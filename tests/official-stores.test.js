const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {detect}=require("../scripts/verify-products-lib.cjs");
const allowedHosts=new Set(["www.mobly.com.br","loja.electrolux.com.br","www.magazineluiza.com.br","www.casasbahia.com.br"]);
const catalog=JSON.parse(fs.readFileSync("data/produtos-oficiais.json","utf8"));
test("fontes oficiais por categoria incluem Casas Bahia e Magalu",()=>{
 const ids=new Set();
 assert.equal(catalog.total,catalog.produtos.length);
 assert.ok(catalog.produtos.length>=25);
 for(const p of catalog.produtos){
   assert.ok(!ids.has(p.id));ids.add(p.id);
   assert.ok(allowedHosts.has(new URL(p.url).hostname));
   assert.equal(p.lojaOficial,true);
   assert.equal(p.precoAtual,null);
   assert.equal(p.imagem,null);
   assert.equal(p.estoqueStatus,"Unknown");
 }
 for(const c of ["Camas","Sofás","Guarda-roupas","Cadeiras","Mesas","Eletrodomésticos"])
   assert.ok(catalog.produtos.some(p=>p.categoria===c),"Categoria não coberta: "+c);
 for(const store of ["magalu","casasbahia","mobly","electrolux"])
   assert.ok(catalog.produtos.some(p=>p.vendedorEsperado===store),"Varejista não coberto: "+store);
});
const offer=(price,seller)=>({["@type"]:"Offer",price,priceCurrency:"BRL",
 availability:"https://schema.org/InStock",seller:{"@type":"Organization",name:seller}});
function htmlProduct(name,seller){
 return '<script type="application/ld+json">'+JSON.stringify({"@context":"https://schema.org","@type":"Product",
   name,image:"https://images.example.com/image.jpg",offers:offer("450.00",seller)})+'</script>';
}
test("Magalu exige vendedor Magalu e não apenas marketplace",()=>{
 const p={nome:"Cadeira Diretor Giratória DIR-002",url:"https://www.magazineluiza.com.br/cadeira-de-escritorio-diretor-giratoria-dir-002/p/224326200/mo/cdpd/",vendedorEsperado:"magalu"};
 assert.equal(detect(htmlProduct(p.nome,"Magalu"),p).status,"verified");
 assert.equal(detect(htmlProduct(p.nome,"Loja Terceirizada"),p).status,"unverified");
});
test("Casas Bahia exige vendedor próprio, e não marketplace",()=>{
 const p={nome:"Geladeira Frost Free Duplex 400L",url:"https://www.casasbahia.com.br/geladeira-electrolux-frost-free-400l-autosense-duplex-inox-look-tf44s/p/1576383180",vendedorEsperado:"casasbahia"};
 assert.equal(detect(htmlProduct(p.nome,"Casas Bahia"),p).status,"verified");
 assert.equal(detect(htmlProduct(p.nome,"Fornecedor Parceiro"),p).status,"unverified");
});
test("produto sem foto não entra como oferta confirmada",()=>{
 const p={nome:"Sofá 3 Lugares Moderno",url:"https://www.mobly.com.br/sofa-exemplo-123.html",vendedorEsperado:"mobly"};
 const raw=JSON.stringify({"@type":"Product",name:p.nome,offers:offer("750.00","Mobly")});
 assert.equal(detect('<script type="application/ld+json">'+raw+'</script>',p).status,"unverified");
});
