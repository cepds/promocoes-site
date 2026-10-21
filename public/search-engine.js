/* Busca textual e tolerância a acentos, hifens e variações comuns. */
(function (root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.RadarSearch=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  const STOP=new Set(["de","da","do","dos","das","a","o","e","para","com","em","por","um","uma"]);
  function normalize(value){
    return String(value??"").normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"").toLowerCase()
      .replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
  }
  const SYNONYMS={
    "lencois":"lencol","lencol":"lencol","toalhas":"toalha","toalha":"toalha",
    "sofas":"sofa","sofa":"sofa","moveis":"movel","movel":"movel",
    "travesseiros":"travesseiro","colchoes":"colchao","colchao":"colchao",
    "guardas":"guarda","roupas":"roupa","edredons":"edredom",
    "poltronas":"poltrona","cadeiras":"cadeira","mesas":"mesa"
  };
  function tokens(value){
    return normalize(value).split(" ").filter(x=>x&&!STOP.has(x)).map(x=>SYNONYMS[x]||x);
  }
  function match(offer,query){
    const wanted=tokens(query);
    if(!wanted.length)return true;
    const fields=[offer.nome,offer.categoria,offer.loja,offer.modelo,offer.produtoGrupo,
      offer.observacoes,offer.cupom,offer.voltagem,offer.tags?.join?.(" ")||""];
    const haystack=tokens(fields.filter(Boolean).join(" ")).join(" ");
    return wanted.every(word=>haystack.includes(word));
  }
  return {normalize,tokens,match};
});
