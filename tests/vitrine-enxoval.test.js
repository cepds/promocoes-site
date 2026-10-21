const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("homepage começa pela busca e vitrine sem diretorio de links",()=>{
  const index=fs.readFileSync("public/index.html","utf8");
  assert.ok(index.includes('id="search"'));
  assert.ok(index.includes('id="offers"'));
  assert.ok(index.includes('id="categoryChips"'));
  assert.ok(index.includes('Vitrine de produtos'));
  assert.ok(!index.includes('id="comparatorDiscovery"'));
  assert.ok(!index.includes('id="homeDiscovery"'));
  assert.ok(!index.includes('<script src="./comparator-discovery.js'));
  assert.ok(!index.includes('<script src="./home-discovery.js'));
  assert.ok(index.indexOf('id="search"')<index.indexOf('id="offers"'));
});
test("cama mesa e banho contem seis produtos reais com links diretos",()=>{
  const en=JSON.parse(fs.readFileSync("public/enxoval.json","utf8"));
  const source=JSON.parse(fs.readFileSync("data/enxoval.json","utf8"));
  assert.deepEqual(en,source);
  assert.equal(en.ofertas.length,6);
  assert.deepEqual([...new Set(en.ofertas.map(o=>o.subcategoria))].sort(),
    ["Banho","Mesa posta","Roupa de cama"].sort());
  for(const item of en.ofertas){
    assert.equal(item.categoria,"Cama, mesa e banho");
    assert.ok(item.nome.length>12);
    assert.equal(new URL(item.url).hostname,"www.karsten.com.br");
    assert.ok(item.precoAtual>0);
    assert.equal(item.imagemIlustrativa,true);
    assert.ok(item.observacoes.includes("Imagem ilustrativa"));
    assert.ok(new Date(item.ultimaVerificacao).getTime()>0);
  }
});
test("frontend mescla catalogo de enxoval nos cards e detalhes",()=>{
 const app=fs.readFileSync("public/app.js","utf8");
 const detail=fs.readFileSync("public/produto.js","utf8");
 assert.match(app,/fetchLocalEnxoval/);
 assert.match(app,/allOffers = \[\.\.\.main, \.\.\.additional/);
 assert.match(app,/imagemIlustrativa/);
 assert.match(detail,/\.\/enxoval\.json/);
});
