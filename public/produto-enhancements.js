(() => {
  const root=document.querySelector('#productDetail');
  if(!root)return;
  function ensureMeta(name,attr='name'){let el=document.head.querySelector(`meta[${attr}="${name}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attr,name);document.head.appendChild(el)}return el}
  function enhance(){
    const title=root.querySelector('.detail-title');
    if(!title||root.querySelector('.share-actions'))return;
    const price=root.querySelector('.detail-price')?.textContent?.trim()||'';
    const store=[...root.querySelectorAll('p')].find(p=>p.textContent?.startsWith('Loja:'))?.textContent?.replace(/^Loja:\s*/,'')||'';
    const desc=`${title.textContent.trim()} ${price}${store?` na ${store}`:''}. Compare preço, frete e histórico no Radar de Promoções.`;
    ensureMeta('description').setAttribute('content',desc);
    ensureMeta('og:title','property').setAttribute('content',title.textContent.trim());
    ensureMeta('og:description','property').setAttribute('content',desc);
    ensureMeta('og:type','property').setAttribute('content','product');
    ensureMeta('og:url','property').setAttribute('content',location.href);
    const actions=document.createElement('div');actions.className='share-actions';
    const share=document.createElement('button');share.type='button';share.className='share-offer';share.textContent='Compartilhar oferta';
    const help=document.createElement('button');help.type='button';help.className='score-help';help.textContent='Como funciona a nota?';
    const box=document.createElement('div');box.className='score-explanation hidden';box.textContent='A nota considera desconto, posição no histórico de preço, frete e confiança da loja. Quanto mais perto do menor preço histórico e melhor a condição final, maior a pontuação.';
    share.addEventListener('click',async()=>{const data={title:title.textContent.trim(),text:`${title.textContent.trim()} — ${price}`,url:location.href};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(location.href);share.textContent='Link copiado';setTimeout(()=>share.textContent='Compartilhar oferta',1500)}}catch(_){}});
    help.addEventListener('click',()=>box.classList.toggle('hidden'));
    actions.append(share,help);const buy=root.querySelector('.buy');buy?.insertAdjacentElement('afterend',actions);actions.insertAdjacentElement('afterend',box);
  }
  const obs=new MutationObserver(enhance);obs.observe(root,{childList:true,subtree:true});enhance();
})();
