(() => {
  "use strict";
  const root = document.querySelector("#homeDiscovery");
  if (!root) return;

  const TOPICS = [
    { id: "moveis", title: "Móveis", subtitle: "Sofás, racks e guarda-roupas", search: "sofá" },
    { id: "quarto", title: "Quarto", subtitle: "Camas, cabeceiras e cômodas", search: "cama" },
    { id: "cama", title: "Roupa de cama", subtitle: "Lençóis, edredons e travesseiros", search: "jogo de cama" },
    { id: "mesa", title: "Mesa posta", subtitle: "Toalhas de mesa, louças e faqueiros", search: "toalha de mesa" },
    { id: "banho", title: "Banho", subtitle: "Toalhas, roupões e tapetes", search: "toalha de banho" },
    { id: "decoracao", title: "Decoração", subtitle: "Tapetes, almofadas e luminárias", search: "decoração" },
    { id: "cozinha", title: "Cozinha", subtitle: "Móveis, organização e utensílios", search: "cozinha" },
    { id: "colchoes", title: "Colchões", subtitle: "Solteiro, casal, queen e king", search: "colchão" }
  ];
  const normalize = v => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim();
  const allowedHosts = new Set([
    "www.mobly.com.br", "www.madeiramadeira.com.br", "www.tokstok.com.br",
    "www.camicado.com.br", "www.karsten.com.br", "www.artex.com.br",
    "www.zelo.com.br", "www.altenburg.com.br"
  ]);
  function validStoreURL(value) {
    try {
      const u = new URL(value);
      return u.protocol === "https:" && allowedHosts.has(u.hostname) ? u.href : null;
    } catch { return null; }
  }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const head = el("div", "home-discovery-heading");
  const titleArea = el("div");
  titleArea.append(el("span","home-eyebrow","Navegue pela casa"), el("h2",null,"Móveis, cama, mesa e banho"),
    el("p",null,"Explore categorias e visite os sites oficiais das lojas. Preço, estoque e frete são confirmados somente na loja."));
  head.append(titleArea);
  const input = el("input", "home-store-search");
  input.type = "search";
  input.autocomplete = "off";
  input.placeholder = "Buscar: sofá, roupa de cama, toalhas, mesa...";
  input.setAttribute("aria-label","Filtrar lojas por categoria ou produto");
  head.append(input);
  const quick = el("div","home-topic-grid");
  const subhead = el("div","home-store-heading");
  const storeTitle = el("h3",null,"Lojas oficiais para explorar");
  const resultCount = el("span","home-store-count");
  subhead.append(storeTitle,resultCount);
  const cards = el("div","home-store-grid");
  const foot = el("p","home-store-note",
    "Seleção por domínio oficial, não por reputação de vendedores terceiros. O Radar não confirma preços e disponibilidade dessas lojas em tempo real.");
  root.append(head,quick,subhead,cards,foot);

  let selectedTopic = "", stores = [];

  function openHistorySearch(term) {
    const search = document.querySelector("#search");
    const toggle = document.querySelector("#historicalToggle");
    if (toggle && !toggle.disabled && toggle.textContent.includes("Consultar")) toggle.click();
    if (search) {
      search.value = term;
      search.dispatchEvent(new Event("input", { bubbles: true }));
      document.querySelector(".offers-section")?.scrollIntoView({ behavior: "smooth" });
    }
  }
  function renderTopics() {
    quick.replaceChildren();
    TOPICS.forEach(topic => {
      const btn = el("button", "home-topic", "");
      btn.type = "button";
      btn.setAttribute("aria-pressed", String(selectedTopic === topic.id));
      if (selectedTopic === topic.id) btn.classList.add("active");
      btn.append(el("strong",null,topic.title),el("small",null,topic.subtitle));
      btn.addEventListener("click",() => {
        selectedTopic = selectedTopic === topic.id ? "" : topic.id;
        renderTopics();
        renderStores();
      });
      quick.append(btn);
    });
  }
  function match(store) {
    const target = TOPICS.find(topic => topic.id === selectedTopic);
    if (target && !(store.categoria || []).includes(target.id)) return false;
    const term = normalize(input.value);
    if (!term) return true;
    const text = normalize([store.nome,store.descricao,store.rotulo,(store.categoria||[]).join(" "),
      ...TOPICS.filter(t=>(store.categoria||[]).includes(t.id)).map(t=>t.subtitle)].join(" "));
    return term.split(" ").every(token => text.includes(token));
  }
  function renderStores() {
    cards.replaceChildren();
    const filtered = stores.filter(match);
    resultCount.textContent = `${filtered.length} de ${stores.length} lojas`;
    if (!filtered.length) {
      cards.append(el("p","home-no-stores","Nenhuma loja do diretório corresponde à busca. Tente um termo mais amplo."));
      return;
    }
    filtered.forEach(store => {
      const url = validStoreURL(store.url);
      if (!url) return;
      const article = el("article","home-store-card");
      const h = el("h4",null,store.nome);
      const pill = el("span","home-official-pill","Domínio oficial");
      article.append(h,pill,el("p",null,store.descricao));
      const link = el("a","home-store-link","Visitar loja ↗");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.referrerPolicy = "no-referrer";
      article.append(link);
      cards.append(article);
    });
  }
  async function boot() {
    try {
      const response = await fetch("./lojas-casa.json", {cache:"no-cache"});
      if (!response.ok) throw Error("HTTP " + response.status);
      const data = await response.json();
      if (!Array.isArray(data.lojas)) throw Error("Diretório inválido");
      stores = data.lojas.filter(item => item && validStoreURL(item.url) && Array.isArray(item.categoria));
      renderTopics(); renderStores();
    } catch (error) {
      resultCount.textContent = "Indisponível";
      cards.append(el("p","home-no-stores","O diretório está temporariamente indisponível. As ofertas salvas continuam acessíveis abaixo."));
      console.warn("Diretório indisponível:",error);
    }
  }
  input.addEventListener("input",renderStores);
  root.append(el("button","home-history-link","Pesquisar referências históricas do catálogo"));
  root.lastElementChild.addEventListener("click",() => openHistorySearch(input.value.trim()));
  boot();
})();
