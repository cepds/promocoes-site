(() => {
  const TARGETS=["Sofás","TVs","Celulares","Informática","Geladeiras","Máquinas de lavar","Air Fryers","Móveis","Ferramentas","Cozinha","Climatização","Games"];
  const PAGE=24;
  let mode="all", visible=PAGE;
  const $=s=>document.querySelector(s);
  const rows=()=>{try{return typeof activeOffers==="function"?activeOffers():[]}catch{return[]}};
  const key=o=>{try{return offerKey(o)}catch{return String(o?.id||o?.url||o?.nome||"")}};
  const dropped=o=>{try{return droppedPrice(o)}catch{return false}};
  const recent=o=>{try{return isNew(o)}catch{return false}};
  const score=o=>{try{return dealScore(o)}catch{return Number(o?.scoreOferta)||0}};
  const low=o=>{const h=Array.isArray(o?.historicoPrecos)?o.historicoPrecos:[];const p=Number(o?.precoAtual)||0;const vals=h.map(x=>Number(x?.preco)||0).filter(Boolean);return p>0&&vals.length>0&&p<=Math.min(...vals)+.01};
  const favs=()=>{try{return favorites instanceof Set?favorites:new Set()}catch{return new Set()}};
  const rel=v=>{const d=v?new Date(v):null;if(!d||Number.isNaN(d.getTime()))return"verificação recente";const m=Math.max(0,Math.floor((Date.now()-d.getTime())/60000));if(m<2)return"verificado agora";if(m<60)return`verificado há ${m} min`;const h=Math.floor(m/60);if(h<24)return`verificado há ${h}h`;return`verificado há ${Math.floor(h/24)}d`};

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

  function health(list){const c=new Map(TARGETS.map(x=>[x,0]));list.forEach(o=>c.set(o.categoria,(c.get(o.categoria)||0)+1));const inc=TARGETS.filter(x=>(c.get(x)||0)<10);const stale=list.filter(o=>{const d=o.ultimaVerificacao?new Date(o.ultimaVerificacao):null;return!d||Number.isNaN(d.getTime())||Date.now()-d.getTime()>64800000}).length;const freight=list.filter(o=>!o.frete||/consulte/i.test(String(o.frete))).length;const el=$("#catalogHealth");if(el){el.innerHTML=`<div><span>Categorias completas</span><strong>${12-inc.length}/12</strong></div><div><span>Abaixo de 10</span><strong>${inc.length}</strong></div><div><span>Verificação antiga</span><strong>${stale}</strong></div><div><span>Frete a consultar</span><strong>${freight}</strong></div>`;el.title=inc.length?inc.map(x=>`${x}: ${c.get(x)||0}/10`).join(" • "):"Todas as categorias atingiram 10 ou mais ofertas."}}

  function apply(){ensure();const list=rows();$("#dropCount")&&($("#dropCount").textContent=list.filter(dropped).length);$("#lowCount")&&($("#lowCount").textContent=list.filter(low).length);$("#newCount")&&($("#newCount").textContent=list.filter(recent).length);$("#bestCount")&&($("#bestCount").textContent=list.filter(o=>score(o)>=58).length);const fd=list.filter(o=>favs().has(key(o))&&dropped(o)).length;if($("#favDropCount"))$("#favDropCount").textContent=fd;$("#favDropBtn")?.classList.toggle("hidden",fd===0);health(list);const map=new Map(list.map(o=>[key(o),o]));const cards=[...document.querySelectorAll("#offers .card")];const eligible=[];cards.forEach(card=>{const o=map.get(card.dataset.offerKey||"");if(o&&match(o))eligible.push(card);card.classList.add("smart-hidden");if(o){const v=card.querySelector(".verified");if(v)v.textContent=rel(o.ultimaVerificacao);const s=card.querySelector(".score-badge");if(s)s.title="Nota baseada em desconto, histórico, frete e confiança da loja."}});eligible.slice(0,visible).forEach(c=>c.classList.remove("smart-hidden"));$("#loadMoreArea")?.classList.toggle("hidden",eligible.length<=visible);if($("#count"))$("#count").textContent=`${eligible.length} ${eligible.length===1?"oferta":"ofertas"}`}

  document.addEventListener("DOMContentLoaded",()=>{ensure();const root=$("#offers");if(root)new MutationObserver(()=>requestAnimationFrame(apply)).observe(root,{childList:true});setTimeout(apply,400)});
})();
