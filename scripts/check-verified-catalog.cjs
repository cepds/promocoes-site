"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");
const policy=require("../public/catalog-policy.js");
const file=JSON.parse(fs.readFileSync("public/ofertas-verificadas.json","utf8"));
const now=Date.now();
assert.equal(file.versao,2,"Versão de catálogo incompatível");
assert.ok(Array.isArray(file.ofertas),"Catálogo sem lista");
assert.equal(file.total,file.ofertas.length,"Total não confere");
assert.ok(Number.isFinite(Date.parse(file.geradoEm)) && Math.abs(now-Date.parse(file.geradoEm))<3*3600000,
  "Arquivo verificado não foi gerado nesta execução");
const ids=new Set();
for(const offer of file.ofertas){
 assert.ok(!ids.has(offer.id),"ID duplicado");
 ids.add(offer.id);
 assert.ok(policy.isConfirmedAvailable(offer,now),"Produto sem preço, fonte, data ou estoque confirmado: "+offer.id);
 assert.ok(offer.ultimaVerificacao && offer.fonteTipo==="pagina_publica_estruturada");
 assert.ok(offer.estoqueStatus==="InStock");
}
console.log("Catalogo validado: "+file.ofertas.length+" produtos confirmados e recentes.");
