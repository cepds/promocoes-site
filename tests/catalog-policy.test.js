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
