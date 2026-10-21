const test = require("node:test");
const assert = require("node:assert/strict");
const policy = require("../public/catalog-policy.js");

test("verificacao recente exige timestamp valido dentro de 18h",()=>{
  const now=Date.parse("2026-10-21T15:00:00Z");
  assert.equal(policy.isRecentVerification({ultimaVerificacao:"2026-10-21T14:00:00Z"},now),true);
  assert.equal(policy.isRecentVerification({ultimaVerificacao:"2026-10-20T15:00:00Z"},now),false);
  assert.equal(policy.isRecentVerification({ultimaVerificacao:""},now),false);
  assert.equal(policy.isRecentVerification({ultimaVerificacao:"2027-01-01T00:00:00Z"},now),false);
});
test("frete null nunca equivale a gratis",()=>{
  const o={precoAtual:100,frete:"Consulte na loja",freteValor:null,precoComFrete:null};
  assert.deepEqual(policy.shippingInfo(o,100),{label:"Consulte na loja",total:null,freightValue:null,free:false});
});
test("frete gratis explicito permite total",()=>{
  const result=policy.shippingInfo({freteGratis:true,freteValor:null,precoComFrete:null},100);
  assert.equal(result.total,100);
  assert.equal(result.free,true);
});
test("frete conhecido permite soma",()=>{
  const result=policy.shippingInfo({freteValor:12.5,precoComFrete:null},100);
  assert.equal(result.total,112.5);
  assert.equal(result.free,false);
});
test("URLs exteriores exigem HTTPS",()=>{
  assert.equal(policy.safeHttpsUrl("javascript:alert(1)"),"");
  assert.equal(policy.safeHttpsUrl("http://example.com"),"");
  assert.equal(policy.safeHttpsUrl("https://example.com/p"),"https://example.com/p");
});

test("frete zero conhecido deve ser gratis sem confundir com valor nulo",()=>{
  const numeric=policy.shippingInfo({freteValor:0,freteGratis:false,precoComFrete:null},100);
  assert.deepEqual(numeric,{label:"Grátis",total:100,freightValue:0,free:true});
  const text=policy.shippingInfo({frete:"R$ 0,00",freteGratis:false,precoComFrete:null},100);
  assert.equal(text.free,true);
  assert.equal(text.total,100);
  const unknown=policy.shippingInfo({freteValor:null,freteGratis:false,precoComFrete:null},100);
  assert.equal(unknown.free,false);
  assert.equal(unknown.total,null);
});
test("bloqueia itens antigos, esgotados e sem evidencia",()=>{
  const now=Date.parse("2026-10-21T15:00:00Z");
  const base={ativa:true,fonteTipo:"pagina_publica_estruturada",estoqueStatus:"InStock",precoAtual:120,
    url:"https://www.karsten.com.br/produto",imagem:"https://img.example.com/foto.jpg",
    ultimaVerificacao:"2026-10-21T14:00:00Z"};
  assert.equal(policy.isConfirmedAvailable(base,now),true);
  for(const fields of [
    {estoqueStatus:"OutOfStock"},{estoqueStatus:"Unknown"},{ativa:false},
    {fonteTipo:"pagina_publica"},{ultimaVerificacao:"2026-10-20T14:00:00Z"},
    {precoAtual:0},{url:"https://example.com/invalido"}
  ])assert.equal(policy.isConfirmedAvailable({...base,...fields},now),false);
});
test("frontend não deve usar cache local nem reativar referencias antigas",()=>{
  const fs=require("node:fs"),app=fs.readFileSync("public/app.js","utf8");
  const index=fs.readFileSync("public/index.html","utf8");
  assert.match(app,/\.\/ofertas-verificadas\.json/);
  assert.doesNotMatch(app,/allOffers = \[\.\.\.main, \.\.\.additional/);
  assert.doesNotMatch(index,/historicalToggle/);
  assert.doesNotMatch(index,/fetch-fallback\.js/);
});
