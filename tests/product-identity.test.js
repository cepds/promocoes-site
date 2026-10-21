const test=require("node:test");
const assert=require("node:assert/strict");
const p=require("../public/product-identity.js");
const fridge={nome:"Geladeira Brastemp Frost Free Duplex 415L BRM51MB 220V",modelo:"BRM51MB",categoria:"Geladeiras"};
test("mesmo modelo e tensão podem ser comparados entre varejistas",()=>{
 const a={...fridge,loja:"Brastemp",url:"https://www.brastemp.com.br/modelo"};
 const b={...fridge,nome:"Geladeira Brastemp BRM51MB 220 V 415L",loja:"Carrefour",url:"https://www.carrefour.com.br/p"};
 assert.equal(p.group(a),"model:brastemp:brm51mb:220");
 assert.equal(p.group(a),p.group(b));
 assert.equal(p.compatible(a,b),true);
});
test("127V não pode ser comparado com 220V; modelo desconhecido também não",()=>{
 const x={...fridge,url:"https://loja.example.com/a"},y={...fridge,voltagem:"127V",url:"https://loja.example.com/b"};
 assert.notEqual(p.group(x),p.group(y));
 assert.equal(p.compatible(x,y),false);
 assert.equal(p.group({...fridge,nome:"Geladeira Brastemp BRM51MB",voltagem:null}),"");
 assert.equal(p.group({...fridge,modelo:"BRM52MB"}),"model:brastemp:brm52mb:220");
});
test("móveis de mesmas linhas mas medidas ou cores diferentes nunca são agrupados pelo modelo",()=>{
 const a={categoria:"Camas",nome:"Cama Casal Mônaco Cinamomo",modelo:"MONACO123",marca:"Tcil",url:"https://www.madeiramadeira.com.br/a"};
 const b={...a,nome:"Cama Queen Mônaco Neve",url:"https://www.madeiramadeira.com.br/b"};
 assert.equal(p.group(a),"");
 assert.equal(p.compatible(a,b),false);
});
test("GTIN/EAN válido aproxima somente unidades idênticas em URLs distintas",()=>{
 const a={ean:"7891234567890",categoria:"Camas",nome:"Cama casal exemplar",url:"https://www.mobly.com.br/x"};
 const b={...a,url:"https://www.madeiramadeira.com.br/y",nome:"Outra descrição do produto"};
 assert.equal(p.group(a),"ean:7891234567890");
 assert.equal(p.compatible(a,b),true);
 assert.equal(p.compatible(a,{...b,ean:"7891234567891"}),false);
});
test("não agrupa por nomes parecidos, sem EAN ou modelo e marca específicos",()=>{
 assert.equal(p.group({categoria:"Geladeiras",nome:"Geladeira Frost Free 400L",modelo:"ABC123",voltagem:"220V"}),"");
 assert.equal(p.group({categoria:"Geladeiras",nome:"Geladeira Electrolux TF38S",modelo:"TF38S"}),"");
});
