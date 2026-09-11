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
};

let allOffers = [];

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
  return asNumber(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

function fallbackImage() {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="#f3f4f6"/><text x="400" y="255" text-anchor="middle" font-family="Arial,sans-serif" font-size="32" fill="#9ca3af">Sem imagem</text></svg>';
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function decodeBase64Utf8(value) {
  const binary = atob(String(value || "").replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

async function fetchPayload() {
  const response = await fetch(DATA_API_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`);
  const file = await response.json();
  if (file.encoding !== "base64" || !file.content) throw new Error("Resposta de dados inválida");
  return JSON.parse(decodeBase64Utf8(file.content));
}

function uniqueValues(key) {
  return [...new Set(allOffers.map(o => text(o[key], "")).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function populateSelect(select, values, label) {
  const current = select.value;
  select.innerHTML = `<option value="">${label}</option>` + values
    .map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`)
    .join("");
  if (values.includes(current)) select.value = current;
}

function render() {
  const term = els.search.value.trim().toLocaleLowerCase("pt-BR");
  const category = els.category.value;
  const store = els.store.value;
  const sort = els.sort.value;

  let rows = allOffers.filter(o => o.ativa !== false && isFresh(o.ultimaVerificacao));

  if (term) {
    rows = rows.filter(o => [o.nome, o.categoria, o.loja, o.cupom]
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
    const image = safeUrl(o.imagem) || fallbackImage();
    const checked = asDate(o.ultimaVerificacao);

    return `
      <article class="card">
        <div class="image-wrap">
          <img class="product-image" src="${escapeHtml(image)}" alt="${escapeHtml(text(o.nome))}">
          ${discount > 0 ? `<div class="badge">${Math.round(discount)}% OFF</div>` : ""}
        </div>
        <div class="card-body">
          <div class="meta"><span>${escapeHtml(text(o.categoria))}</span><span>${escapeHtml(text(o.loja))}</span></div>
          <h2 class="product-name">${escapeHtml(text(o.nome))}</h2>
          <div>
            <div class="old-price">${previous > current && previous > 0 ? money(previous) : ""}</div>
            <div class="price">${current > 0 ? money(current) : "Preço não informado"}</div>
          </div>
          <div class="details">
            <div class="detail"><span>Cupom</span><b>${escapeHtml(text(o.cupom))}</b></div>
            <div class="detail"><span>Cashback</span><b>${escapeHtml(text(o.cashback))}</b></div>
            <div class="detail"><span>Frete</span><b>${escapeHtml(text(o.frete))}</b></div>
            ${checked ? `<div class="detail"><span>Verificado</span><b>${checked.toLocaleString("pt-BR")}</b></div>` : ""}
          </div>
          ${url ? `<a class="buy" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Ver oferta</a>` : ""}
        </div>
      </article>`;
  }).join("");

  els.offers.querySelectorAll(".product-image").forEach(img => {
    img.addEventListener("error", () => {
      img.src = fallbackImage();
    }, { once: true });
  });
}

async function loadOffers() {
  try {
    els.status.textContent = "Carregando ofertas…";
    els.error.classList.add("hidden");

    const payload = await fetchPayload();
    allOffers = Array.isArray(payload.ofertas) ? payload.ofertas : [];

    populateSelect(els.category, uniqueValues("categoria"), "Todas");
    populateSelect(els.store, uniqueValues("loja"), "Todas");

    els.updated.textContent = payload.geradoEm
      ? `Atualizado: ${new Date(payload.geradoEm).toLocaleString("pt-BR")}`
      : "";
    els.status.textContent = "Base atualizada";
    render();
  } catch (err) {
    console.error(err);
    els.status.textContent = "Erro ao carregar";
    els.error.classList.remove("hidden");
    els.errorMessage.textContent = `Não foi possível carregar a base de promoções. ${err.message || ""}`;
  }
}

[els.search, els.category, els.store, els.sort].forEach(el => {
  el.addEventListener(el === els.search ? "input" : "change", render);
});

loadOffers();
