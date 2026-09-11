(() => {
  const root=document.querySelector('#productDetail');
  if(!root)return;
  if(!document.querySelector('link[data-radar-commerce]')){const l=document.createElement("link");l.rel="stylesheet";l.href="./commerce.css?v=1";l.dataset.radarCommerce="1";document.head.appendChild(l)}
  const API="https://api.github.com/repos/cepds/promocoes-site/contents/data/ofertas.json?ref=main";
  let enriched=false, loading=false;

  const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:0};
  const money=v=>num(v)>0?num(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}):"";
  const clean=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  const digits=v=>String(v??"").replace(/\D/g,"");
  const key=o=>String(o?.id||o?.url||o?.nome||"");

  function ensureMeta(name,attr='name'){
    let el=document.head.querySelector(`meta[${attr}="${name}"]`);
    if(!el){el=document.createElement('meta');el.setAttribute(attr,name);document.head.appendChild(el)}
    return el;
  }

  function decode(v){
    const b=atob(String(v||"").replace(/\s/g,""));
    return new TextDecoder("utf-8").decode(Uint8Array.from(b,c=>c.charCodeAt(0)));
  }

  function productGroupKey(o){
    const ean=digits(o?.ean||o?.gtin||o?.codigoBarras);
    if(ean.length>=8&&ean.length<=14)return`ean:${ean}`;
    const group=clean(o?.produtoGrupo||o?.modeloFabricante||o?.skuModelo||o?.modelo);
    if(group.length>=3)return`model:${group}`;
    const tokens=clean(o?.nome).split(/\s+/).filter(Boolean);
    const model=tokens.filter(t=>t.length>=4&&/[a-z]/.test(t)&&/\d/.test(t)&&!/^\d+(gb|tb|kg|g|l|ml|cm|mm|hz|w|v|btus?)$/.test(t));
    return model.length?`name-model:${clean(o?.categoria)}:${model.slice(0,2).join("-")}`:"";
  }

  function paymentInfo(o){
    const pix=num(o?.precoPix??o?.precoAvista);
    const card=num(o?.precoCartao);
    const installments=num(o?.parcelas);
    const installment=num(o?.valorParcela);
    const condition=String(o?.condicaoPagamento||o?.formaPagamento||"").trim();
    const parts=[];
    if(pix>0)parts.push(`<span><b>PIX/à vista</b> ${money(pix)}</span>`);
    if(card>0)parts.push(`<span><b>Cartão</b> ${money(card)}</span>`);
    if(installments>0&&installment>0)parts.push(`<span><b>Parcelamento</b> ${installments}x de ${money(installment)}</span>`);
    else if(installments>0)parts.push(`<span><b>Parcelamento</b> até ${installments}x</span>`);
    if(!parts.length&&condition)parts.push(`<span><b>Pagamento</b> ${esc(condition)}</span>`);
    return parts.join("");
  }

  function deliveryInfo(o){
    return String(o?.prazoEntrega||o?.entregaEstimada||o?.dataEntrega||o?.previsaoEntrega||"").trim();
  }

  function shippingTotal(o){
    const direct=num(o?.precoComFrete);
    if(direct>0)return direct;
    const price=num(o?.precoAtual);
    if(o?.freteGratis===true)return price;
    if(o?.freteValor!==null&&o?.freteValor!==undefined&&String(o.freteValor)!=="")return price+Math.max(0,num(o.freteValor));
    return null;
  }

  async function loadPayload(){
    const r=await fetch(`${API}&t=${Date.now()}`,{cache:"no-store"});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const f=await r.json();
    return JSON.parse(decode(f.content));
  }

  function renderCommercial(current,offers){
    if(root.querySelector(".commercial-details"))return;
    const payment=paymentInfo(current);
    const delivery=deliveryInfo(current);
    const stock=String(current?.estoqueStatus||current?.disponibilidade||"").trim();
    if(payment||delivery||stock){
      const box=document.createElement("section");
      box.className="commercial-details";
      box.innerHTML=`${payment?`<div class="commercial-row"><strong>Pagamento</strong><div class="commercial-values">${payment}</div></div>`:""}${delivery?`<div class="commercial-row"><strong>Entrega para CEP 72620-405</strong><span>${esc(delivery)}</span></div>`:""}${stock?`<div class="commercial-row"><strong>Estoque</strong><span>${esc(stock)}</span></div>`:""}`;
      const meta=root.querySelector(".detail-meta");
      (meta||root.querySelector(".detail-price"))?.insertAdjacentElement("afterend",box);
    }

    const group=productGroupKey(current);
    if(!group)return;
    const alternatives=offers.filter(o=>o&&o.ativa!==false&&key(o)!==key(current)&&productGroupKey(o)===group);
    if(!alternatives.length)return;
    alternatives.sort((a,b)=>(shippingTotal(a)??Number.MAX_SAFE_INTEGER)-(shippingTotal(b)??Number.MAX_SAFE_INTEGER)||num(a.precoAtual)-num(b.precoAtual));

    const section=document.createElement("section");
    section.className="detail-card alternatives-card";
    const rows=alternatives.slice(0,8).map(o=>{
      const total=shippingTotal(o);
      const pay=paymentInfo(o).replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
      const delivery=deliveryInfo(o);
      return `<div class="alternative-row"><div><strong>${esc(o.loja||"Loja")}</strong>${o.seloLoja?`<small>✓ ${esc(o.seloLoja)}</small>`:""}${delivery?`<small>Entrega: ${esc(delivery)}</small>`:""}${pay?`<small>${esc(pay)}</small>`:""}</div><div class="alternative-price"><b>${money(o.precoAtual)||"Preço na loja"}</b>${total?`<small>Total ${money(total)}</small>`:""}<a href="${esc(o.url||"#")}" target="_blank" rel="noopener noreferrer">Ver oferta</a></div></div>`;
    }).join("");
    section.innerHTML=`<div class="alternatives-head"><div><h2>Mesmo produto em outras lojas</h2><p>Compare o preço final, frete e condição de pagamento.</p></div><strong>${alternatives.length+1} lojas</strong></div><div class="alternatives-list">${rows}</div>`;
    root.appendChild(section);
  }

  async function enrichFromData(){
    if(loading)return;
    loading=true;
    try{
      const payload=await loadPayload();
      const offers=Array.isArray(payload?.ofertas)?payload.ofertas:[];
      const wanted=new URLSearchParams(location.search).get("id")||"";
      const current=offers.find(o=>key(o)===wanted);
      if(current)renderCommercial(current,offers);
    }catch(error){console.warn("Radar: detalhes comerciais adicionais indisponíveis.",error)}
    finally{loading=false}
  }

  function enhance(){
    const title=root.querySelector('.detail-title');
    if(!title||enriched)return;
    enriched=true;
    const price=root.querySelector('.detail-price')?.textContent?.trim()||'';
    const store=[...root.querySelectorAll('p')].find(p=>p.textContent?.startsWith('Loja:'))?.textContent?.replace(/^Loja:\s*/,'')||'';
    const image=root.querySelector('.detail-image')?.src||'';
    const offerUrl=root.querySelector('.buy')?.href||location.href;
    const desc=`${title.textContent.trim()} ${price}${store?` na ${store}`:''}. Compare preço, frete, pagamento, entrega e histórico no Radar de Promoções.`;
    ensureMeta('description').setAttribute('content',desc);
    ensureMeta('og:title','property').setAttribute('content',title.textContent.trim());
    ensureMeta('og:description','property').setAttribute('content',desc);
    ensureMeta('og:type','property').setAttribute('content','product');
    ensureMeta('og:url','property').setAttribute('content',location.href);
    if(image)ensureMeta('og:image','property').setAttribute('content',image);
    const numericPrice=Number(price.replace(/[^\d,]/g,'').replace(',','.'))||0;
    const ld=document.createElement('script');
    ld.type='application/ld+json';
    ld.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Product',name:title.textContent.trim(),image:image?[image]:undefined,description:desc,offers:{'@type':'Offer',url:offerUrl,priceCurrency:'BRL',price:numericPrice||undefined,availability:'https://schema.org/InStock',seller:store?{'@type':'Organization',name:store}:undefined}});
    document.head.appendChild(ld);

    const actions=document.createElement('div');
    actions.className='share-actions';
    const share=document.createElement('button');share.type='button';share.className='share-offer';share.textContent='Compartilhar oferta';
    const help=document.createElement('button');help.type='button';help.className='score-help';help.textContent='Como funciona a nota?';
    const box=document.createElement('div');box.className='score-explanation hidden';box.textContent='A nota considera desconto, posição no histórico de preço, frete e confiança da loja. Quanto mais perto do menor preço histórico e melhor a condição final, maior a pontuação.';
    share.addEventListener('click',async()=>{const data={title:title.textContent.trim(),text:`${title.textContent.trim()} — ${price}`,url:location.href};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(location.href);share.textContent='Link copiado';setTimeout(()=>share.textContent='Compartilhar oferta',1500)}}catch(_){}});
    help.addEventListener('click',()=>box.classList.toggle('hidden'));
    actions.append(share,help);
    const buy=root.querySelector('.buy');
    buy?.insertAdjacentElement('afterend',actions);
    actions.insertAdjacentElement('afterend',box);
    enrichFromData();
  }

  const obs=new MutationObserver(()=>requestAnimationFrame(enhance));
  obs.observe(root,{childList:true,subtree:true});
  enhance();
})();
