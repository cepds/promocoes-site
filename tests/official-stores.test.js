const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {detect}=require("../scripts/verify-products-lib.cjs");
const allowedHosts=new Set(["www.mobly.com.br","loja.electrolux.com.br","www.magazineluiza.com.br","www.casasbahia.com.br","www.madeiramadeira.com.br","www.carrefour.com.br","m.magazineluiza.com.br"]);
const catalog=JSON.parse(fs.readFileSync("data/produtos-oficiais.json","utf8"));
test("fontes oficiais por categoria incluem Casas Bahia e Magalu",()=>{
 const ids=new Set();
 assert.equal(catalog.total,catalog.produtos.length);
 assert.ok(catalog.produtos.length>=42);
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
 for(const store of ["magalu","casasbahia","mobly","electrolux","madeiramadeira","magalu-brastemp","carrefour-brastemp","magalu-electrolux","carrefour-electrolux"])
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

test("fabricante vende oficialmente no Magalu e Carrefour, mas terceiros não",()=>{
 const cases=[
  ["magalu-brastemp","https://www.magazineluiza.com.br/geladeira/p/x/ed/ref2/","Brastemp"],
  ["carrefour-brastemp","https://www.carrefour.com.br/produto/geladeira-brm51mb-220v-123","Brastemp"],
  ["magalu-electrolux","https://www.magazineluiza.com.br/geladeira/p/y/ed/ref2/","Electrolux"],
  ["carrefour-electrolux","https://www.carrefour.com.br/produto/geladeira-tf38s-220v-123","Electrolux"],
  ["madeiramadeira","https://www.madeiramadeira.com.br/cama-casal-123.html","MadeiraMadeira"]
 ];
 for(const [owner,url,seller] of cases){
   const record={nome:"Geladeira Modelo BRM51MB",url,vendedorEsperado:owner};
   assert.equal(detect(htmlProduct(record.nome,seller),record).status,"verified",owner);
   assert.equal(detect(htmlProduct(record.nome,"Vendedor Terceirizado"),record).status,"unverified",owner);
 }
});
test("o modelo do fabricante deve coincidir em anúncios de parceiros",()=>{
 const record={nome:"Geladeira Brastemp BRM51MB 220V",modelo:"BRM51MB",url:"https://www.carrefour.com.br/produto/geladeira-123",vendedorEsperado:"carrefour-brastemp"};
 const x=htmlProduct("Geladeira Brastemp BRM51MB 220V","Brastemp");
 assert.equal(detect(x,record).status,"verified");
 assert.equal(detect(htmlProduct("Geladeira Brastemp BRM52MB 220V","Brastemp"),record).status,"unverified");
});

test("camas iguais em Mobly e Magalu exigem vendedor fabricante",()=>{
 const p={nome:"Cama Box com Colchão Casal Howie D33 17x138x188 Branco e Cinza",
 url:"https://m.magazineluiza.com.br/cama-box/p/ga11j3f91e/co/cmbx/",vendedorEsperado:"magalu-mobly"};
 assert.equal(detect(htmlProduct(p.nome,"Mobly"),p).status,"verified");
 assert.equal(detect(htmlProduct(p.nome,"Lojista Qualquer"),p).status,"unverified");
 const m={nome:"Cama Casal em MDP 193cm x 144cm Mônaco Tcil Móveis",
 url:"https://www.magazineluiza.com.br/cama-casal/p/760308900/mo/camo/",vendedorEsperado:"magalu-madeiramadeira"};
 assert.equal(detect(htmlProduct(m.nome,"Madeira Madeira"),m).status,"verified");
 assert.equal(detect(htmlProduct(m.nome,"Lojista Qualquer"),m).status,"unverified");
});
test("cada grupo multiloja possui ao menos duas paginas de produto e não inventa preços",()=>{
 const groups=new Map();
 for(const product of catalog.produtos){
   if(!product.identidadeRevisada)continue;
   const group=groups.get(product.produtoGrupo)||[];
   group.push(product);groups.set(product.produtoGrupo,group);
   assert.equal(product.precoAtual,null);
   assert.equal(product.estoqueStatus,"Unknown");
 }
 assert.equal(groups.size,2);
 for(const products of groups.values()){
   assert.equal(products.length,2);
   assert.equal(new Set(products.map(p=>new URL(p.url).hostname)).size,2);
 }
});

test("cama comparada exige mesmas dimensões e variação visual",()=>{
 const p={nome:"Cama Box Casal Howie D33 17x138x188 Branco e Cinza",url:"https://m.magazineluiza.com.br/cama/p/ga11j3f91e/co/cmbx/",
  vendedorEsperado:"magalu-mobly",identidadeRevisada:true,produtoGrupo:"howie-d33-casal-17x138x188-branco-cinza",
  verificacaoTermos:["howie","d33","138x188","branco","cinza"]};
 assert.equal(detect(htmlProduct(p.nome,"Mobly"),p).status,"verified");
 assert.equal(detect(htmlProduct("Cama Box Howie D33 17x88x188 Branco e Cinza","Mobly"),p).status,"unverified");
 assert.equal(detect(htmlProduct("Cama Box Howie D33 17x138x188 Preto","Mobly"),p).status,"unverified");
});
