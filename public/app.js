const DATA_API_URL = "https://api.github.com/repos/cepds/promocoes-site/contents/data/ofertas.json?ref=main";
const MAX_AGE_HOURS = 18;

const els = {
  offers: document.querySelector("#offers"),
  empty: document.querySelector("#empty"),
  error: document.querySelector("#error"),
  errorMessage: document.querySelector("#errorMessage"),
  count: document.querySelector("#count"),
  updated: document.querySelector("#updated"),
  status: document.querySelector("#status"),
  search: document.querySelector("#search"),
  category: document.querySelector("#category"),
  store: document.querySelector("#store"),
  sort: document.querySelector("#sort"),
  categoryChips: document.querySelector("#categoryChips"),
  statOffers: document.querySelector("#statOffers"),
  statStores: document.querySelector("#statStores"),
  statDiscount: document.querySelector("#statDiscount"),
};

let allOffers = [];
const brokenImages = new Set();

function asNumber(value) {
  if (typeof value === "number") return value;
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "")
    : raw.replace(/[^\d.-]/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function asDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isFresh(value) {
  const d = asDate(value);
  if (!d) return false;
  const age = Date.now() - d.getTime();
  return age >= 0 && age <= MAX_AGE_HOURS * 60 * 60 * 1000;
}

function money(value) {
  return asNumber(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function text(value, fallback = "Não informado") {
  const v = String(value ?? "").trim();
  return v || fallback;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(url) {
  try {
    const parsed = new URL(String(url || "").trim());
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

function validImageUrl(value) {
  try {
    const parsed = new URL(String(value || "").trim());
    return parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
}

function offerKey(o) {
  return String(o.id || o.url || o.nome || "");
}

function decodeBase64Utf8(value) {
  const binary = atob(String(value || "").replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

function setStatus(message, ok = true) {
  const label = els.status?.querySelector("span:last-child");
  const dot = els.status?.querySelector(".status-dot");
  if (label) label.textContent = message;
  else if (els.status) els.status.textContent = message;
  if (dot) {
    dot.style.background = ok ? "#22c55e" : "#f97316";
    dot.style.boxShadow = ok
      ? "0 0 0 4px rgba(34,197,94,.12)"
      : "0 0 0 4px rgba(249,115,22,.12)";
  }
}

async function fetchPayload() {
  const response = await fetch(`${DATA_API_URL}&t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`);
  const file = await response.json();
  if (file.encoding !== "base64" || !file.content) throw new Error("Resposta de dados inválida");
  return JSON.parse(decodeBase64Utf8(file.content));
}

function activeOffers() {
  return allOffers.filter(o => {
    const key = offerKey(o);
    return o.ativa !== false
      && isFresh(o.ultimaVerificacao)
      && Boolean(validImageUrl(o.imagem))
      && !brokenImages.has(key);
  });
}

function uniqueValues(key) {
  return [...new Set(activeOffers().map(o => text(o[key], "")).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function populateSelect(select, values, label) {
  const current = select.value;
  select.innerHTML = `<option value="">${label}</option>` + values
    .map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`)
    .join("");
  if (values.includes(current)) select.value = current;
}

function renderCategoryChips() {
  const categories = uniqueValues("categoria");
  const selected = els.category.value;

  els.categoryChips.innerHTML = ["", ...categories].map(category => {
    const label = category || "Todas";
    const active = selected === category ? " active" : "";
    return `<button class="category-chip${active}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(label)}</button>`;
  }).join("");

  els.categoryChips.querySelectorAll(".category-chip").forEach(button => {
    button.addEventListener("click", () => {
      els.category.value = button.dataset.category || "";
      renderCategoryChips();
      render();
    });
  });
}

function updateStats() {
  const rows = activeOffers();
  const stores = new Set(rows.map(o => text(o.loja, "")).filter(Boolean));
  const bestDiscount = rows.reduce((max, o) => Math.max(max, asNumber(o.desconto)), 0);

  els.statOffers.textContent = rows.length;
  els.statStores.textContent = stores.size;
  els.statDiscount.textContent = `${Math.round(bestDiscount)}%`;
}

function render() {
  const term = els.search.value.trim().toLocaleLowerCase("pt-BR");
  const category = els.category.value;
  const store = els.store.value;
  const sort = els.sort.value;

  let rows = activeOffers();

  if (term) {
    rows = rows.filter(o => [o.nome, o.categoria, o.loja, o.cupom, o.observacoes]
      .some(v => text(v, "").toLocaleLowerCase("pt-BR").includes(term)));
  }
  if (category) rows = rows.filter(o => text(o.categoria, "") === category);
  if (store) rows = rows.filter(o => text(o.loja, "") === store);

  rows.sort((a, b) => {
    if (sort === "discount") return asNumber(b.desconto) - asNumber(a.desconto);
    if (sort === "priceAsc") return asNumber(a.precoAtual) - asNumber(b.precoAtual);
    if (sort === "priceDesc") return asNumber(b.precoAtual) - asNumber(a.precoAtual);
    return (asDate(b.ultimaVerificacao)?.getTime() || 0) - (asDate(a.ultimaVerificacao)?.getTime() || 0);
  });

  els.count.textContent = `${rows.length} ${rows.length === 1 ? "oferta" : "ofertas"}`;
  els.empty.classList.toggle("hidden", rows.length !== 0);
  els.offers.classList.toggle("hidden", rows.length === 0);

  els.offers.innerHTML = rows.map(o => {
    const current = asNumber(o.precoAtual);
    const previous = asNumber(o.precoAnterior);
    const discount = asNumber(o.desconto);
    const url = safeUrl(o.url);
    const image = validImageUrl(o.imagem);
    const checked = asDate(o.ultimaVerificacao);
    const coupon = text(o.cupom, "");
    const cashback = text(o.cashback, "");
    const shipping = text(o.frete, "");
    const savingValue = previous > current && current > 0 ? previous - current : 0;
    const key = offerKey(o);

    const perks = [
      coupon && coupon.toLocaleLowerCase("pt-BR") !== "não informado"
        ? `<span class="perk coupon">Cupom: ${escapeHtml(coupon)}</span>`
        : "",
      shipping && shipping.toLocaleLowerCase("pt-BR") !== "não informado"
        ? `<span class="perk">Frete: ${escapeHtml(shipping)}</span>`
        : "",
      cashback && cashback.toLocaleLowerCase("pt-BR") !== "não informado"
        ? `<span class="perk">Cashback: ${escapeHtml(cashback)}</span>`
        : "",
    ].filter(Boolean).join("");

    return `
      <article class="card" data-offer-key="${escapeHtml(key)}">
        <div class="image-wrap">
          <img class="product-image" src="${escapeHtml(image)}" alt="${escapeHtml(text(o.nome))}" loading="lazy" decoding="async">
          ${discount > 0 ? `<div class="badge">-${Math.round(discount)}%</div>` : ""}
          <div class="store-pill" title="${escapeHtml(text(o.loja))}">${escapeHtml(text(o.loja))}</div>
        </div>

        <div class="card-body">
          <span class="category-label">${escapeHtml(text(o.categoria))}</span>
          <h3 class="product-name">${escapeHtml(text(o.nome))}</h3>

          <div class="price-block">
            <div class="old-price">${previous > current && previous > 0 ? money(previous) : ""}</div>
            <div class="price-line">
              <div class="price">${current > 0 ? money(current) : "Preço indisponível"}</div>
              ${savingValue > 0 ? `<span class="saving">economize ${money(savingValue)}</span>` : ""}
            </div>
          </div>

          ${perks ? `<div class="perks">${perks}</div>` : ""}
          ${checked ? `<div class="verified">Verificado em ${checked.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</div>` : ""}
          ${url ? `<a class="buy" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Ver oferta na loja →</a>` : ""}
        </div>
      </article>`;
  }).join("");

  els.offers.querySelectorAll(".product-image").forEach(img => {
    img.addEventListener("error", () => {
      const card = img.closest(".card");
      const key = card?.dataset.offerKey || "";
      if (key) brokenImages.add(key);
      renderCategoryChips();
      updateStats();
      render();
    }, { once: true });
  });
}

async function loadOffers() {
  try {
    setStatus("Atualizando ofertas…", true);
    els.error.classList.add("hidden");

    const payload = await fetchPayload();
    allOffers = Array.isArray(payload.ofertas) ? payload.ofertas : [];
    brokenImages.clear();

    populateSelect(els.category, uniqueValues("categoria"), "Todas as categorias");
    populateSelect(els.store, uniqueValues("loja"), "Todas as lojas");
    renderCategoryChips();
    updateStats();

    els.updated.textContent = payload.geradoEm
      ? `Atualizado ${new Date(payload.geradoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`
      : "Atualização automática";

    setStatus("Ofertas atualizadas", true);
    render();
  } catch (err) {
    console.error(err);
    setStatus("Falha na atualização", false);
    els.error.classList.remove("hidden");
    els.errorMessage.textContent = `Não foi possível carregar a base de promoções. ${err.message || ""}`;
  }
}

els.search.addEventListener("input", render);
els.store.addEventListener("change", render);
els.sort.addEventListener("change", render);
els.category.addEventListener("change", () => {
  renderCategoryChips();
  render();
});

window.loadOffers = loadOffers;
loadOffers();
