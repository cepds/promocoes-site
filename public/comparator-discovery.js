(() => {
  "use strict";
  const root=document.querySelector("#comparatorDiscovery");
  if(!root)return;
  const providers=[
    {nome:"Buscapé",host:"www.buscape.com.br",base:"https://www.buscape.com.br/busca/"},
    {nome:"Zoom",host:"www.zoom.com.br",base:"https://www.zoom.com.br/busca/"},
    {nome:"Bondfaro",host:"www.bondfaro.com.br",base:"https://www.bondfaro.com.br/busca/"}
  ];
  let items=[],group="Todos",selected="c01";
  const make=(tag,klass,value)=>{
    const e=document.createElement(tag);
    if(klass)e.className=klass;
    if(value!=null)e.textContent=value;
    return e;
  };
  const normalize=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const header=make("div","comparator-head");
  header.append(make("h2",null,"Descubra mais produtos em comparadores"),make("p",null,"36 categorias. Busque preços nas plataformas originais, sem apresentar valores antigos como promoções verificadas."));
  const search=make("input","comparator-input");
  search.type="search";search.placeholder="Ex.: sofá retrátil, jogo de cama, colchão queen";
  search.setAttribute("aria-label","Buscar produtos em comparadores de preço");
  const tabs=make("div","comparator-groups");
  const cards=make("div","comparator-grid");
  const outlet=make("div","comparator-outlet");
  root.append(header,search,tabs,cards,outlet);
  function targetUrl(base,query){
    const q=String(query||"").trim().slice(0,100).replace(/\s+/g,"+");
    return base+encodeURIComponent(q);
  }
  function renderActions(){
    outlet.replaceChildren();
    const category=items.find(item=>item.id===selected)||items[0];
    const q=search.value.trim()||category?.consulta||"";
    if(!q)return;
    const info=make("div");
    info.append(make("strong",null,"Pesquisar: "+q),make("p",null,"Os links abrem a busca no comparador. Preço, vendedor, frete e estoque devem ser confirmados no destino."));
    outlet.append(info);
    const actions=make("div","comparator-actions");
    for(const provider of providers){
      const a=make("a","comparator-action","Comparar no "+provider.nome+" ↗");
      a.href=targetUrl(provider.base,q);
      a.target="_blank";a.rel="noopener noreferrer";
      a.referrerPolicy="no-referrer";
      actions.append(a);
    }
    const pcQuery=/notebook|computador|pc|placa|processador|memoria|ssd|gabinete|fonte/i.test(q);
    if(pcQuery){
      const a=make("a","comparator-action comparator-extra","Montar PC no MEUPC.NET ↗");
      a.href="https://meupc.net/";a.target="_blank";a.rel="noopener noreferrer";
      actions.append(a);
    }
    outlet.append(actions);
  }
  function render(){
    const groups=["Todos",...new Set(items.map(item=>item.grupo))];
    tabs.replaceChildren();
    for(const entry of groups){
      const b=make("button","comparator-tab"+(entry===group?" active":""),entry);
      b.type="button";b.setAttribute("aria-pressed",String(entry===group));
      b.addEventListener("click",()=>{group=entry;render()});
      tabs.append(b);
    }
    const filter=normalize(search.value.trim());
    cards.replaceChildren();
    const rows=items.filter(i=>(group==="Todos"||i.grupo===group)&&(!filter||normalize(i.nome+" "+i.consulta+" "+i.grupo).includes(filter)));
    for(const item of rows){
      const b=make("button","comparator-category"+(selected===item.id?" active":""),item.nome);
      b.type="button";b.setAttribute("aria-pressed",String(selected===item.id));
      b.addEventListener("click",()=>{selected=item.id;render()});
      cards.append(b);
    }
    if(!rows.length)cards.append(make("p","comparator-empty","Nenhuma categoria corresponde à pesquisa; use os links diretos abaixo."));
    renderActions();
  }
  search.addEventListener("input",render);
  fetch("./categorias-descoberta.json",{cache:"no-cache"}).then(r=>{
    if(!r.ok)throw Error("Categorias indisponíveis");
    return r.json();
  }).then(data=>{
    if(!Array.isArray(data.categorias))throw Error("Categorias inválidas");
    items=data.categorias.filter(c=>c.id&&c.nome&&c.consulta&&c.grupo);
    render();
  }).catch(()=>{
    header.append(make("p",null,"Categorias temporariamente indisponíveis. Tente atualizar a página."));
  });
})();
