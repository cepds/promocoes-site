const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const search=require("../public/search-engine.js");

test("busca normaliza acentos e plurais",()=>{
  assert.equal(search.match({nome:"Sofá 3 lugares retrátil",categoria:"Móveis"},"sofas"),true);
  assert.equal(search.match({nome:"Jogo de Lençol 180 fios",categoria:"Cama"},"lencois"),true);
  assert.equal(search.match({nome:"Toalha de banho algodão",categoria:"Banho"},"toalhas banho"),true);
});
test("busca composta exige todos os termos relevantes",()=>{
  assert.equal(search.match({nome:"Mesa para jantar com 4 cadeiras",categoria:"Móveis"},"mesa cadeiras"),true);
  assert.equal(search.match({nome:"Toalhas de banho",categoria:"Banho"},"sofa banho"),false);
});
test("diretorio de lojas tem dominios oficiais fixos e espelho identico",()=>{
  const directory=JSON.parse(fs.readFileSync("public/lojas-casa.json","utf8"));
  const master=JSON.parse(fs.readFileSync("data/lojas-casa.json","utf8"));
  assert.deepEqual(directory,master);
  const allow=new Set(["www.mobly.com.br","www.madeiramadeira.com.br","www.tokstok.com.br",
  "www.camicado.com.br","www.karsten.com.br","www.artex.com.br",
  "www.zelo.com.br","www.altenburg.com.br"]);
  assert.equal(directory.lojas.length,8);
  for(const loja of directory.lojas){
    const url=new URL(loja.url);
    assert.equal(url.protocol,"https:");
    assert.ok(allow.has(url.hostname));
    assert.ok(loja.nome);
  }
  const ids=new Set(directory.lojas.flatMap(l=>l.categoria));
  for(const id of ["moveis","quarto","cama","mesa","banho","decoracao","cozinha","colchoes"]){
    assert.ok(ids.has(id),"Sem loja para "+id);
  }
});
