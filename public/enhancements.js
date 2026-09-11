(() => {
  const TARGETS=["Sofás","TVs","Celulares","Informática","Geladeiras","Máquinas de lavar","Air Fryers","Móveis","Ferramentas","Cozinha","Climatização","Games"];
  const PAGE=24;
  let mode="all", visible=PAGE, applying=false, scheduled=false;
  const $=s=>document.querySelector(s);
  if(!document.querySelector('link[data-radar-commerce]')){const l=document.createElement("link");l.rel="stylesheet";l.href="./commerce.css?v=1";l.dataset.radarCommerce="1";document.head.appendChild(l)}
  const rows=()=>{try{return typeof activeOffers==="function"?activeOffers():[]}catch{return[]}};
  const key=o=>{try{return offerKey(o)}catch{return String(o?.id||o?.url||o?.nome||"")}};
  const dropped=o=>{try{return droppedPrice(o)}catch{return false}};
  const recent=o=>{try{return isNew(o)}catch{return false}};
  const score=o=>{try{return dealScore(o)}catch{return Number(o?.scoreOferta)||0}};
  const money=v=>{const n=Number(v);return Number.isFinite(n)&&n>0?n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}):""};
  const low=o=>{const h=Array.isArray(o?.historicoPrecos)?o.historicoPrecos:[];const p=Number(o?.precoAtual)||0;const vals=h.map(x=>Number(x?.preco)||0).filter(Boolean);return p>0&&vals.length>0&&p<=Math.min(...vals)+.01};
  const favs=()=>{try{return favorites instanceof Set?favorites:new Set()}catch{return new Set()}};
  const rel=v=>{const d=v?new Date(v):null;if(!d||Number.isNaN(d.getTime()))return"verificação recente";const m=Math.max(0,Math.floor((Date.now()-d.getTime())/60000));if(m<2)return"verificado agora";if(m<60)return`verificado há ${m} min`;const h=Math.floor(m/60);if(h<24)return`verificado há ${h}h`;return`verificado há ${Math.floor(h/24)}d`};
  const clean=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  const digits=v=>String(v??"").replace(/\D/g,"");

  function productGroupKey(o){
    const ean=digits(o?.ean||o?.gtin||o?.codigoBarras);
    if(ean.length>=8&&ean.length<=14)return`ean:${ean}`;
    const group=clean(o?.produtoGrupo||o?.modeloFabricante||o?.skuModelo||o?.modelo);
    if(group.length>=3)return`model:${group}`;
    const tokens=clean(o?.nome).split(/\s+/).filter(Boolean);
    const model=tokens.filter(t=>t.length>=4&&/[a-z]/.test(t)&&/\d/.test(t)&&!/^\d+(gb|tb|kg|g|l|ml|cm|mm|hz|w|v|btus?)$/.test(t));
    return model.length?`name-model:${clean(o?.categoria)}:${model.slice(0,2).join("-")}`:"";
  }

  function groupMap(list){
    const map=new Map();
    list.forEach(o=>{const g=productGroupKey(o);if(!g)return;const arr=map.get(g)||[];arr.push(o);map.set(g,arr)});
    return map;
  }

  function paymentInfo(o){
    const pix=Number(o?.precoPix??o?.precoAvista)||0;
    const card=Number(o?.precoCartao)||0;
    const installments=Number(o?.parcelas)||0;
    const installment=Number(o?.valorParcela)||0;
    const condition=String(o?.condicaoPagamento||o?.formaPagamento||"").trim();
    const parts=[];
    if(pix>0)parts.push(`PIX ${money(pix)}`);
    if(card>0)parts.push(`Cartão ${money(card)}`);
    if(installments>0&&installment>0)parts.push(`${installments}x de ${money(installment)}`);
    else if(installments>0)parts.push(`até ${installments}x`);
    if(!parts.length&&condition)parts.push(condition);
    return parts.join(" • ");
  }

  function deliveryInfo(o){
    const value=o?.prazoEntrega||o?.entregaEstimada||o?.dataEntrega||o?.previsaoEntrega||"";
    return String(value||"").trim();
  }

  function ensure(){
    if(!$("#smartViews")){
      const a=$(".category-strip-wrap");
      a?.insertAdjacentHTML("afterend",'<section class="smart-tools"><div id="smartViews" class="smart-view-row"><button class="smart-view active" data-mode="all">Todas</button><button class="smart-view" data-mode="drops">↓ Baixaram <b id="dropCount">0</b></button><button class="smart-view" data-mode="low">Menor histórico <b id="lowCount">0</b></button><button class="smart-view" data-mode="new">Novidades <b id="newCount">0</b></button><button class="smart-view" data-mode="best">Melhores <b id="bestCount">0</b></button><button id="favDropBtn" class="smart-view hidden" data-mode="favdrops">♡ Favoritos ↓ <b id="favDropCount">0</b></button></div><div id="catalogHealth" class="catalog-health"></div></section>');
      $("#smartViews")?.addEventListener("click",e=>{const b=e.target.closest("[data-mode]");if(!b)return;mode=b.dataset.mode;visible=PAGE;$("#smartViews").querySelectorAll(".smart-view").forEach(x=>x.classList.toggle("active",x===b));apply()});
    }
    if(!$("#loadMoreArea")){
      $("#offers")?.insertAdjacentHTML("afterend",'<div id="loadMoreArea" class="load-more-area hidden"><button id="loadMoreButton" class="load-more-button" type="button">Carregar mais produtos</button></div>');
      $("#loadMoreButton")?.addEventListener("click",()=>{visible+=PAGE;apply()});
    }
  }

  function match(o){if(mode==="drops")return dropped(o);if(mode==="low")return low(o);if(mode==="new")return recent(o);if(mode==="best")return score(o)>=58;if(mode==="favdrops")return favs().has(key(o))&&dropped(o);return true}

  function health(list){
    const c=new Map(TARGETS.map(x=>[x,0]));list.forEach(o=>c.set(o.categoria,(c.get(o.categoria)||0)+1));
    const inc=TARGETS.filter(x=>(c.get(x)||0)<10);
    const stale=list.filter(o=>{const d=o.ultimaVerificacao?new Date(o.ultimaVerificacao):null;return!d||Number.isNaN(d.getTime())||Date.now()-d.getTime()>64800000}).length;
    const freight=list.filter(o=>!o.frete||/consulte/i.test(String(o.frete))).length;
    const el=$("#catalogHealth");
    if(el){el.innerHTML=`<div><span>Categorias completas</span><strong>${12-inc.length}/12</strong></div><div><span>Abaixo de 10</span><strong>${inc.length}</strong></div><div><span>Verificação antiga</span><strong>${stale}</strong></div><div><span>Frete a consultar</span><strong>${freight}</strong></div>`;el.title=inc.length?inc.map(x=>`${x}: ${c.get(x)||0}/10`).join(" • "):"Todas as categorias atingiram 10 ou mais ofertas."}
  }

  function enhanceCard(card,o,groups){
    const verified=card.querySelector(".verified");
    if(verified){const value=rel(o.ultimaVerificacao);if(verified.textContent!==value)verified.textContent=value}
    const scoreEl=card.querySelector(".score-badge");if(scoreEl)scoreEl.title="Nota baseada em desconto, histórico, frete e confiança da loja.";

    const tagRow=card.querySelector(".tag-row");
    const group=productGroupKey(o);
    const alternatives=group?(groups.get(group)||[]):[];
    const storeCount=new Set(alternatives.map(x=>String(x.loja||"").trim()).filter(Boolean)).size;
    let multi=tagRow?.querySelector(".tag-multi-store");
    if(storeCount>=2){
      if(!multi){multi=document.createElement("span");multi.className="tag tag-multi-store";tagRow?.appendChild(multi)}
      if(multi)multi.textContent=`${storeCount} lojas`;
    }else multi?.remove();

    const perks=card.querySelector(".perks");
    const payment=paymentInfo(o);
    let paymentEl=card.querySelector(".payment-note");
    if(payment){
      if(!paymentEl){paymentEl=document.createElement("div");paymentEl.className="payment-note";perks?.insertAdjacentElement("afterend",paymentEl)}
      if(paymentEl.textContent!==payment)paymentEl.textContent=payment;
    }else paymentEl?.remove();

    const delivery=deliveryInfo(o);
    let deliveryEl=card.querySelector(".delivery-note");
    if(delivery){
      if(!deliveryEl){deliveryEl=document.createElement("div");deliveryEl.className="delivery-note";(paymentEl||perks)?.insertAdjacentElement("afterend",deliveryEl)}
      if(deliveryEl.textContent!==`Entrega: ${delivery}`)deliveryEl.textContent=`Entrega: ${delivery}`;
    }else deliveryEl?.remove();
  }

  function scheduleApply(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply()})}

  function apply(){
    if(applying)return;
    applying=true;
    try{
      ensure();
      const list=rows();
      const groups=groupMap(list);
      if($("#dropCount"))$("#dropCount").textContent=list.filter(dropped).length;
      if($("#lowCount"))$("#lowCount").textContent=list.filter(low).length;
      if($("#newCount"))$("#newCount").textContent=list.filter(recent).length;
      if($("#bestCount"))$("#bestCount").textContent=list.filter(o=>score(o)>=58).length;
      const fd=list.filter(o=>favs().has(key(o))&&dropped(o)).length;
      if($("#favDropCount"))$("#favDropCount").textContent=fd;
      $("#favDropBtn")?.classList.toggle("hidden",fd===0);
      health(list);
      const map=new Map(list.map(o=>[key(o),o]));
      const cards=[...document.querySelectorAll("#offers .card")];
      const eligible=[];
      cards.forEach(card=>{
        const o=map.get(card.dataset.offerKey||"");
        if(o&&match(o))eligible.push(card);
        card.classList.add("smart-hidden");
        if(o)enhanceCard(card,o,groups);
      });
      eligible.slice(0,visible).forEach(c=>c.classList.remove("smart-hidden"));
      $("#loadMoreArea")?.classList.toggle("hidden",eligible.length<=visible);
      if($("#count"))$("#count").textContent=`${eligible.length} ${eligible.length===1?"oferta":"ofertas"}`;
    }finally{applying=false}
  }

  document.addEventListener("DOMContentLoaded",()=>{
    ensure();
    const root=$("#offers");
    if(root)new MutationObserver(scheduleApply).observe(root,{childList:true,subtree:true});
    setTimeout(apply,400);
  });
})();
