const DATA_API_URL = "https://api.github.com/repos/cepds/promocoes-site/contents/data/ofertas.json?ref=main";
const FIXED_CEP = "72620-405";
const FAVORITES_KEY = "radar:favoritos";
const COMPARE_KEY = "radar:comparar";
const MAX_COMPARE = 3;

const els = {
  offers: document.querySelector("#offers"), empty: document.querySelector("#empty"), error: document.querySelector("#error"),
  errorMessage: document.querySelector("#errorMessage"), count: document.querySelector("#count"), updated: document.querySelector("#updated"),
  status: document.querySelector("#status"), search: document.querySelector("#search"), category: document.querySelector("#category"),
  store: document.querySelector("#store"), sort: document.querySelector("#sort"), categoryChips: document.querySelector("#categoryChips"),
  statOffers: document.querySelector("#statOffers"), statStores: document.querySelector("#statStores"), statDiscount: document.querySelector("#statDiscount"),
  minPrice: document.querySelector("#minPrice"), maxPrice: document.querySelector("#maxPrice"), minDiscount: document.querySelector("#minDiscount"),
  freeShipping: document.querySelector("#freeShipping"), clearFilters: document.querySelector("#clearFilters"), favoritesToggle: document.querySelector("#favoritesToggle"),
  favoritesCount: document.querySelector("#favoritesCount"), compareToggle: document.querySelector("#compareToggle"), compareCount: document.querySelector("#compareCount"),
  comparePanel: document.querySelector("#comparePanel"), compareContent: document.querySelector("#compareContent"), clearCompare: document.querySelector("#clearCompare"),
  mobileFavorites: document.querySelector("#mobileFavorites"), mobileCompare: document.querySelector("#mobileCompare")
};

let allOffers = [];
let favoritesOnly = false;
const brokenImages = new Set();
let favorites = new Set(loadLocal(FAVORITES_KEY));
let compare = new Set(loadLocal(COMPARE_KEY));

function loadLocal(key) { try { const v = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } }
function saveLocal(key, set) { localStorage.setItem(key, JSON.stringify([...set])); }
function asNumber(value) { if (typeof value === "number") return Number.isFinite(value) ? value : 0; const raw = String(value ?? "").trim(); if (!raw) return 0; const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "") : raw.replace(/[^\d.-]/g, ""); const n = Number(normalized); return Number.isFinite(n) ? n : 0; }
function asDate(value) { if (!value) return null; const d = new Date(value); return Number.isNaN(d.getTime()) ? null : d; }
function money(value) { return asNumber(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }); }
function text(value, fallback = "Não informado") { const v = String(value ?? "").trim(); return v || fallback; }
function escapeHtml(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function safeUrl(url) { try { const parsed = new URL(String(url || "").trim()); return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : ""; } catch { return ""; } }
function validImageUrl(value) { try { const parsed = new URL(String(value || "").trim()); return parsed.protocol === "https:" ? parsed.href : ""; } catch { return ""; } }
function offerKey(o) { return String(o.id || o.url || o.nome || ""); }
function decodeBase64Utf8(value) { const binary = atob(String(value || "").replace(/\s/g, "")); return new TextDecoder("utf-8").decode(Uint8Array.from(binary, c => c.charCodeAt(0))); }
function hasOwnValue(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== null && obj[key] !== undefined && String(obj[key]).trim() !== ""; }

function setStatus(message, ok = true) {
  const label = els.status?.querySelector("span:last-child"); const dot = els.status?.querySelector(".status-dot");
  if (label) label.textContent = message; else if (els.status) els.status.textContent = message;
  if (dot) { dot.style.background = ok ? "#22c55e" : "#f97316"; dot.style.boxShadow = ok ? "0 0 0 4px rgba(34,197,94,.12)" : "0 0 0 4px rgba(249,115,22,.12)"; }
}

async function fetchPayload() {
  const response = await fetch(`${DATA_API_URL}&t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`);
  const file = await response.json();
  if (file.encoding !== "base64" || !file.content) throw new Error("Resposta de dados inválida");
  return JSON.parse(decodeBase64Utf8(file.content));
}

function is220Compatible(o) {
  const blob = [o.voltagem, o.nome, o.observacoes].filter(Boolean).join(" ").toLowerCase();
  const electrical = /volts?|\b110v\b|\b127v\b|\b220v\b|bivolt|elétric|eletric|lavadora|geladeira|air fryer|fritadeira|ar condicionado|monitor|tv|televis|celular|notebook|console|playstation|xbox|parafusadeira/.test(blob);
  if (!electrical) return true;
  if (/\b(110|127)\s*v\b/.test(blob) && !/220\s*v|bivolt/.test(blob)) return false;
  return true;
}

function activeOffers() {
  return allOffers.filter(o => o.ativa !== false && Boolean(validImageUrl(o.imagem)) && !brokenImages.has(offerKey(o)) && is220Compatible(o));
}

function shippingInfo(o, current) {
  const raw = text(o.frete, ""); const lower = raw.toLocaleLowerCase("pt-BR");
  const explicitFree = o.freteGratis === true || lower.includes("frete grátis") || lower.includes("frete gratis") || lower === "grátis" || lower === "gratis";
  let freightValue = null;
  if (explicitFree) freightValue = 0;
  else if (hasOwnValue(o, "freteValor")) { const n = asNumber(o.freteValor); if (n >= 0) freightValue = n; }
  else { const match = raw.match(/R\$\s*([\d.]+(?:,\d{1,2})?)/i); if (match) { const n = asNumber(match[1]); if (n >= 0) freightValue = n; } }
  let label = "Consulte na loja";
  if (explicitFree) label = "Grátis"; else if (freightValue !== null) label = money(freightValue); else if (raw && !["não informado", "consulte o cep", "consulte cep"].includes(lower)) label = raw;
  let total = null;
  if (hasOwnValue(o, "precoComFrete")) { const n = asNumber(o.precoComFrete); if (n > 0) total = n; }
  else if (current > 0 && freightValue !== null) total = current + freightValue;
  return { label, total, freightValue, free: freightValue === 0 || explicitFree };
}

function history(o) {
  const h = Array.isArray(o.historicoPrecos) ? o.historicoPrecos : [];
  return h.map(x => ({ data: asDate(x.data || x.dataHora || x.em), preco: asNumber(x.preco ?? x.precoAtual), total: asNumber(x.precoComFrete) })).filter(x => x.preco > 0).sort((a,b)=>(a.data?.getTime()||0)-(b.data?.getTime()||0));
}
function historyStats(o) {
  const h = history(o); const values = h.map(x => x.preco);
  const current = asNumber(o.precoAtual); if (current > 0 && !values.length) values.push(current);
  return { min: values.length ? Math.min(...values) : current, avg: values.length ? values.reduce((a,b)=>a+b,0)/values.length : current, count: h.length };
}
function droppedPrice(o) { const h = history(o); if (h.length >= 2) return h[h.length-1].preco < h[h.length-2].preco; return false; }
function isNew(o) { const d = asDate(o.dataEncontrada); return d ? Date.now() - d.getTime() <= 48 * 60 * 60 * 1000 : false; }
function storeTrust(o) { return text(o.seloLoja || o.lojaConfianca || "", ""); }
function dealScore(o) {
  if (hasOwnValue(o, "scoreOferta")) return Math.max(0, Math.min(100, asNumber(o.scoreOferta)));
  const discount = Math.min(50, Math.max(0, asNumber(o.desconto)));
  const stats = historyStats(o); const current = asNumber(o.precoAtual);
  let historyPoints = 8;
  if (stats.count >= 2 && stats.min > 0) { const pctAboveMin = ((current - stats.min) / stats.min) * 100; historyPoints = pctAboveMin <= 1 ? 30 : pctAboveMin <= 5 ? 24 : pctAboveMin <= 10 ? 15 : 6; }
  const ship = shippingInfo(o, current); const shipPoints = ship.free ? 12 : ship.freightValue !== null ? 6 : 2;
  const trust = storeTrust(o); const trustPoints = trust ? 8 : 3;
  return Math.round(Math.min(100, discount + historyPoints + shipPoints + trustPoints));
}
function scoreLabel(score) { return score >= 75 ? "Excelente" : score >= 58 ? "Boa" : score >= 42 ? "Interessante" : "Normal"; }

function uniqueValues(key) { return [...new Set(activeOffers().map(o => text(o[key], "")).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"pt-BR")); }
function populateSelect(select, values, label) { const current = select.value; select.innerHTML = `<option value="">${label}</option>` + values.map(v=>`<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join(""); if (values.includes(current)) select.value = current; }
function categoryCounts() { const map = new Map(); activeOffers().forEach(o => map.set(text(o.categoria,"Outros"), (map.get(text(o.categoria,"Outros"))||0)+1)); return map; }
function renderCategoryChips() {
  const counts = categoryCounts(); const categories = [...counts.keys()].sort((a,b)=>a.localeCompare(b,"pt-BR")); const selected = els.category.value;
  els.categoryChips.innerHTML = [`<button class="category-chip${selected===""?" active":""}" data-category="">Todas <b>${activeOffers().length}</b></button>`, ...categories.map(c=>`<button class="category-chip${selected===c?" active":""}" data-category="${escapeHtml(c)}">${escapeHtml(c)} <b>${counts.get(c)}</b></button>`)].join("");
  els.categoryChips.querySelectorAll(".category-chip").forEach(b=>b.addEventListener("click",()=>{ els.category.value = b.dataset.category || ""; renderCategoryChips(); render(); }));
}

function updateStats() { const rows = activeOffers(); els.statOffers.textContent = rows.length; els.statStores.textContent = new Set(rows.map(o=>text(o.loja,"")).filter(Boolean)).size; els.statDiscount.textContent = `${Math.round(rows.reduce((m,o)=>Math.max(m,asNumber(o.desconto)),0))}%`; }
function updateLocalCounters() { els.favoritesCount.textContent = favorites.size; els.compareCount.textContent = compare.size; els.favoritesToggle?.classList.toggle("active", favoritesOnly); }

function filteredRows() {
  const term = els.search.value.trim().toLocaleLowerCase("pt-BR"); const category = els.category.value; const store = els.store.value; const sort = els.sort.value;
  const minPrice = asNumber(els.minPrice.value); const maxPrice = asNumber(els.maxPrice.value); const minDiscount = asNumber(els.minDiscount.value);
  let rows = activeOffers();
  if (favoritesOnly) rows = rows.filter(o=>favorites.has(offerKey(o)));
  if (term) rows = rows.filter(o=>[o.nome,o.categoria,o.loja,o.cupom,o.observacoes,o.voltagem,o.seloLoja].some(v=>text(v,"").toLocaleLowerCase("pt-BR").includes(term)));
  if (category) rows = rows.filter(o=>text(o.categoria,"")===category);
  if (store) rows = rows.filter(o=>text(o.loja,"")===store);
  if (minPrice > 0) rows = rows.filter(o=>asNumber(o.precoAtual)>=minPrice);
  if (maxPrice > 0) rows = rows.filter(o=>asNumber(o.precoAtual)<=maxPrice);
  if (minDiscount > 0) rows = rows.filter(o=>asNumber(o.desconto)>=minDiscount);
  if (els.freeShipping.checked) rows = rows.filter(o=>shippingInfo(o,asNumber(o.precoAtual)).free);
  rows.sort((a,b)=>{
    if (sort === "score") return dealScore(b)-dealScore(a);
    if (sort === "discount") return asNumber(b.desconto)-asNumber(a.desconto);
    if (sort === "priceAsc") return asNumber(a.precoAtual)-asNumber(b.precoAtual);
    if (sort === "priceDesc") return asNumber(b.precoAtual)-asNumber(a.precoAtual);
    if (sort === "totalAsc") { const at=shippingInfo(a,asNumber(a.precoAtual)).total ?? Infinity; const bt=shippingInfo(b,asNumber(b.precoAtual)).total ?? Infinity; return at-bt; }
    return (asDate(b.dataEncontrada)?.getTime()||asDate(b.ultimaVerificacao)?.getTime()||0)-(asDate(a.dataEncontrada)?.getTime()||asDate(a.ultimaVerificacao)?.getTime()||0);
  });
  return rows;
}

function renderCard(o) {
  const current = asNumber(o.precoAtual), previous = asNumber(o.precoAnterior), discount = asNumber(o.desconto), url = safeUrl(o.url), image = validImageUrl(o.imagem), key = offerKey(o), checked = asDate(o.ultimaVerificacao);
  const coupon = text(o.cupom,""), cashback = text(o.cashback,""), saving = previous > current && current > 0 ? previous-current : 0, ship = shippingInfo(o,current), score = dealScore(o), stats = historyStats(o), trust = storeTrust(o), fav = favorites.has(key), cmp = compare.has(key);
  const tags = [isNew(o)?`<span class="tag tag-new">Novo</span>`:"", droppedPrice(o)?`<span class="tag tag-drop">↓ Baixou</span>`:"", o.voltagem?`<span class="tag">${escapeHtml(o.voltagem)}</span>`:"", trust?`<span class="tag tag-trust">✓ ${escapeHtml(trust)}</span>`:""].filter(Boolean).join("");
  const perks = [coupon && coupon.toLowerCase()!=="não informado"?`<span class="perk coupon">Cupom: ${escapeHtml(coupon)}</span>`:"", `<span class="perk">Frete: ${escapeHtml(ship.label)}</span>`, ship.total!==null?`<span class="perk total">Total: ${money(ship.total)}</span>`:"", cashback && cashback.toLowerCase()!=="não informado"?`<span class="perk">Cashback: ${escapeHtml(cashback)}</span>`:""].filter(Boolean).join("");
  return `<article class="card" data-offer-key="${escapeHtml(key)}">
    <div class="image-wrap"><a class="image-link" href="./produto.html?id=${encodeURIComponent(key)}"><img class="product-image" src="${escapeHtml(image)}" alt="${escapeHtml(text(o.nome))}" loading="lazy" decoding="async"></a>${discount>0?`<div class="badge">-${Math.round(discount)}%</div>`:""}<button class="favorite-button${fav?" active":""}" data-favorite="${escapeHtml(key)}" aria-label="Favoritar">${fav?"♥":"♡"}</button><div class="store-pill">${escapeHtml(text(o.loja))}</div></div>
    <div class="card-body"><div class="tag-row">${tags}</div><span class="category-label">${escapeHtml(text(o.categoria))}</span><h3 class="product-name"><a href="./produto.html?id=${encodeURIComponent(key)}">${escapeHtml(text(o.nome))}</a></h3>
    <div class="score-row"><span class="score-badge score-${scoreLabel(score).toLowerCase()}">${score}/100 • ${scoreLabel(score)}</span>${stats.count>=2?`<span class="history-note">mín. ${money(stats.min)}</span>`:""}</div>
    <div class="price-block"><div class="old-price">${previous>current&&previous>0?money(previous):""}</div><div class="price-line"><div class="price">${current>0?money(current):"Preço indisponível"}</div>${saving>0?`<span class="saving">economize ${money(saving)}</span>`:""}</div></div>
    <div class="perks">${perks}</div>
    <label class="compare-check"><input type="checkbox" data-compare="${escapeHtml(key)}" ${cmp?"checked":""}> Comparar</label>
    ${checked?`<div class="verified">Verificado em ${checked.toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</div>`:""}
    <div class="card-actions"><a class="details" href="./produto.html?id=${encodeURIComponent(key)}">Detalhes</a>${url?`<a class="buy" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Ver na loja →</a>`:""}</div></div></article>`;
}

function render() {
  const rows = filteredRows(); els.count.textContent = `${rows.length} ${rows.length===1?"oferta":"ofertas"}`; els.empty.classList.toggle("hidden",rows.length!==0); els.offers.classList.toggle("hidden",rows.length===0); els.offers.innerHTML = rows.map(renderCard).join("");
  els.offers.querySelectorAll(".product-image").forEach(img=>img.addEventListener("error",()=>{ const card=img.closest(".card"); const key=card?.dataset.offerKey||""; if(key) brokenImages.add(key); renderCategoryChips(); updateStats(); render(); },{once:true}));
  els.offers.querySelectorAll("[data-favorite]").forEach(btn=>btn.addEventListener("click",()=>toggleFavorite(btn.dataset.favorite)));
  els.offers.querySelectorAll("[data-compare]").forEach(input=>input.addEventListener("change",()=>toggleCompare(input.dataset.compare,input.checked)));
}

function toggleFavorite(key) { favorites.has(key)?favorites.delete(key):favorites.add(key); saveLocal(FAVORITES_KEY,favorites); updateLocalCounters(); render(); }
function toggleCompare(key,wantAdd=true) { if(wantAdd){ if(compare.size>=MAX_COMPARE&&!compare.has(key)){ alert("Você pode comparar até 3 produtos."); render(); return; } compare.add(key); } else compare.delete(key); saveLocal(COMPARE_KEY,compare); updateLocalCounters(); renderCompare(); render(); }
function openCompare(){ renderCompare(); els.comparePanel.classList.remove("hidden"); }
function closeCompare(){ els.comparePanel.classList.add("hidden"); }
function renderCompare(){
  const items=[...compare].map(k=>allOffers.find(o=>offerKey(o)===k)).filter(Boolean); if(!items.length){ els.compareContent.innerHTML='<div class="empty-compare">Selecione até 3 produtos para comparar.</div>'; return; }
  const row=(label,fn)=>`<tr><th>${label}</th>${items.map(o=>`<td>${fn(o)}</td>`).join("")}</tr>`;
  els.compareContent.innerHTML=`<div class="compare-scroll"><table class="compare-table"><thead><tr><th></th>${items.map(o=>`<th><button class="compare-remove" data-remove-compare="${escapeHtml(offerKey(o))}">×</button>${escapeHtml(text(o.nome))}</th>`).join("")}</tr></thead><tbody>${row("Preço",o=>money(o.precoAtual))}${row("Desconto",o=>`${Math.round(asNumber(o.desconto))}%`)}${row("Frete",o=>escapeHtml(shippingInfo(o,asNumber(o.precoAtual)).label))}${row("Total",o=>{const t=shippingInfo(o,asNumber(o.precoAtual)).total;return t!==null?money(t):"—"})}${row("Voltagem",o=>escapeHtml(text(o.voltagem,"—")))}${row("Loja",o=>escapeHtml(text(o.loja)))}${row("Nota",o=>`${dealScore(o)}/100`)}${row("Menor histórico",o=>{const s=historyStats(o);return s.count>=2?money(s.min):"—"})}</tbody></table></div>`;
  els.compareContent.querySelectorAll("[data-remove-compare]").forEach(b=>b.addEventListener("click",()=>toggleCompare(b.dataset.removeCompare,false)));
}

function clearFilters(){ els.search.value=""; els.category.value=""; els.store.value=""; els.minPrice.value=""; els.maxPrice.value=""; els.minDiscount.value="0"; els.freeShipping.checked=false; favoritesOnly=false; renderCategoryChips(); updateLocalCounters(); render(); }

async function loadOffers(){
  try { setStatus("Atualizando…",true); els.error.classList.add("hidden"); const payload=await fetchPayload(); allOffers=Array.isArray(payload.ofertas)?payload.ofertas:[]; brokenImages.clear();
    populateSelect(els.category,uniqueValues("categoria"),"Todas as categorias"); populateSelect(els.store,uniqueValues("loja"),"Todas as lojas"); renderCategoryChips(); updateStats(); updateLocalCounters();
    els.updated.textContent=payload.geradoEm?`Atualizado ${new Date(payload.geradoEm).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}`:"Atualização automática"; setStatus("Ofertas atualizadas",true); render();
  } catch(err){ console.error(err); setStatus("Falha na atualização",false); els.error.classList.remove("hidden"); els.errorMessage.textContent=`Não foi possível carregar a base. ${err.message||""}`; }
}

[els.search,els.minPrice,els.maxPrice].forEach(el=>el?.addEventListener("input",render)); [els.store,els.sort,els.minDiscount,els.freeShipping].forEach(el=>el?.addEventListener("change",render));
els.category?.addEventListener("change",()=>{renderCategoryChips();render();}); els.clearFilters?.addEventListener("click",clearFilters);
els.favoritesToggle?.addEventListener("click",()=>{favoritesOnly=!favoritesOnly;updateLocalCounters();render();}); els.mobileFavorites?.addEventListener("click",()=>{favoritesOnly=!favoritesOnly;updateLocalCounters();render();window.scrollTo({top:document.querySelector(".offers-section")?.offsetTop||0,behavior:"smooth"});});
els.compareToggle?.addEventListener("click",openCompare); els.mobileCompare?.addEventListener("click",openCompare); els.clearCompare?.addEventListener("click",()=>{compare.clear();saveLocal(COMPARE_KEY,compare);updateLocalCounters();renderCompare();render();});
els.comparePanel?.querySelectorAll("[data-close-compare]").forEach(el=>el.addEventListener("click",closeCompare));
window.loadOffers=loadOffers; loadOffers();
