/* Agrupamento conservador de ofertas do MESMO modelo e variante. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.RadarIdentity=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 function norm(v){return String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
 function voltage(p){
   const t=String(p?.voltagem||p?.nome||"");
   const m=t.match(/\b(110|127|220|230|240)\s*v(?:olts)?\b/i);
   return m?({"110":"127","127":"127","220":"220","230":"230","240":"240"}[m[1]]):"";
 }
 function brand(p){
   const explicit=norm(p?.marca||p?.fabricante||p?.brand);
   if(explicit)return explicit;
   const t=norm(p?.nome);
   for(const b of ["brastemp","electrolux","consul","philco","samsung","lg","acer","ortobom","karsten","madesa"])
     if(t.split(" ").includes(b))return b;
   return "";
 }
 function group(p){
   const gtin=String(p?.ean||p?.gtin||p?.codigoBarras||"").replace(/\D/g,"");
   if(gtin.length>=12&&gtin.length<=14)return "ean:"+gtin;
   // Sem marca e SKU do fabricante não se compara só pelo nome comercial.
   const b=brand(p),m=norm(p?.modeloFabricante||p?.modelo||p?.mpn||"").replace(/ /g,"");
   if(!b||!m||m.length<4||!/\d/.test(m)||!/[a-z]/.test(m))return "";
   const cat=norm(p.categoria),name=norm(p.nome);
   const electric=/geladeira|refrigerador|freezer|lavadora|micro ondas|ar condicionado|fogao|eletr|televisor|tv/.test(cat+" "+name);
   const v=voltage(p);
   // Geladeiras 127V e 220V têm preços e EANs diferentes.
   if(electric&&!v)return "";
   // Móveis podem ter o mesmo nome com dimensões, tecido e cores diferentes:
   // só agrupar móveis com EAN exato, não com nome ou modelo genérico.
   if(/cama|sofa|guarda|movel|cadeira|mesa|colchao|quarto/.test(cat))return "";
   return "model:"+b+":"+m+":"+(v||"n/a");
 }
 function compatible(a,b){const ak=group(a),bk=group(b);return !!ak&&ak===bk&&String(a?.url||"")!==String(b?.url||"")}
 return {norm,voltage,brand,group,compatible};
});
