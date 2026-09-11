(() => {
  const originalFetch = window.fetch.bind(window);
  const API_PREFIX = "https://api.github.com/repos/cepds/promocoes-site/contents/data/ofertas.json";
  const RAW_URL = "https://raw.githubusercontent.com/cepds/promocoes-site/main/data/ofertas.json";
  const CACHE_KEY = "radar:last-good-data";

  function utf8ToBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  function base64ToUtf8(value) {
    const binary = atob(String(value || "").replace(/\s/g, ""));
    const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  }

  function remember(text) {
    try {
      JSON.parse(text);
      localStorage.setItem(CACHE_KEY, text);
    } catch (_) {}
  }

  function cachedResponse() {
    try {
      const text = localStorage.getItem(CACHE_KEY);
      if (!text) return null;
      JSON.parse(text);
      return new Response(JSON.stringify({ encoding: "base64", content: utf8ToBase64(text), source: "local-cache" }), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Radar-Source": "local-cache" }
      });
    } catch (_) {
      return null;
    }
  }

  async function fromRaw() {
    const response = await originalFetch(`${RAW_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Raw GitHub HTTP ${response.status}`);
    const text = await response.text();
    JSON.parse(text);
    remember(text);
    return new Response(JSON.stringify({ encoding: "base64", content: utf8ToBase64(text), source: "raw" }), {
      status: 200,
      headers: { "Content-Type": "application/json", "X-Radar-Source": "raw" }
    });
  }

  async function fromApi(input, init) {
    const response = await originalFetch(input, init);
    if (response.ok) {
      try {
        const clone = response.clone();
        const payload = await clone.json();
        if (payload?.content) remember(base64ToUtf8(payload.content));
      } catch (_) {}
    }
    return response;
  }

  window.fetch = async function radarFetch(input, init = {}) {
    const url = typeof input === "string" ? input : input?.url || "";
    if (!url.startsWith(API_PREFIX)) return originalFetch(input, init);

    try {
      return await fromRaw();
    } catch (rawError) {
      console.warn("Radar: fonte raw indisponível, tentando API.", rawError);
    }

    try {
      const response = await fromApi(input, init);
      if (response.ok) return response;
      throw new Error(`GitHub API HTTP ${response.status}`);
    } catch (apiError) {
      console.warn("Radar: API indisponível, tentando último catálogo salvo.", apiError);
    }

    const cached = cachedResponse();
    if (cached) return cached;
    throw new Error("Não foi possível acessar a base de produtos no momento.");
  };
})();
