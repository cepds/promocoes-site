/* Políticas compartilhadas entre catálogo, produto e testes.
 * Sem dependências: funciona no navegador e no Node.js.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.RadarPolicy = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const MAX_VERIFICATION_AGE_MS = 18 * 60 * 60 * 1000;
  function number(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const raw = String(value ?? "").trim();
    if (!raw) return 0;
    const normalized = raw.includes(",")
      ? raw.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "")
      : raw.replace(/[^\d.-]/g, "");
    const result = Number(normalized);
    return Number.isFinite(result) ? result : 0;
  }
  function safeHttpsUrl(value) {
    try {
      const url = new URL(String(value ?? "").trim());
      return url.protocol === "https:" ? url.href : "";
    } catch { return ""; }
  }
  function isRecentVerification(offer, now = Date.now()) {
    const checked = Date.parse(offer?.ultimaVerificacao || "");
    if (!Number.isFinite(checked)) return false;
    const age = now - checked;
    return age >= -5 * 60 * 1000 && age <= MAX_VERIFICATION_AGE_MS;
  }
  function money(value) {
    return number(value).toLocaleString("pt-BR", {
      style: "currency", currency: "BRL", minimumFractionDigits: 2
    });
  }
  function hasValue(offer, key) {
    return Object.prototype.hasOwnProperty.call(offer, key)
      && offer[key] !== null && offer[key] !== undefined
      && String(offer[key]).trim() !== "";
  }
  function shippingInfo(offer, current) {
    const raw = String(offer?.frete ?? "").trim();
    const lower = raw.toLocaleLowerCase("pt-BR");
    const free = offer?.freteGratis === true || /frete gr[aá]tis/i.test(raw)
      || lower === "grátis" || lower === "gratis";
    let freightValue = null;
    if (free) freightValue = 0;
    else if (hasValue(offer, "freteValor")) {
      const v = number(offer.freteValor);
      if (v >= 0) freightValue = v;
    } else {
      const match = raw.match(/R\$\s*([\d.]+(?:,\d{1,2})?)/i);
      if (match) freightValue = number(match[1]);
    }
    const label = free ? "Grátis" : freightValue !== null
      ? money(freightValue)
      : raw && !/^(?:não informado|consulte(?: o)? cep)$/i.test(raw)
        ? raw : "Consulte na loja";
    let total = null;
    if (hasValue(offer, "precoComFrete") && number(offer.precoComFrete) > 0) {
      total = number(offer.precoComFrete);
    } else if (number(current) > 0 && freightValue !== null) {
      total = number(current) + freightValue;
    }
    return { label, total, freightValue, free };
  }
  return { MAX_VERIFICATION_AGE_MS, number, safeHttpsUrl, isRecentVerification, shippingInfo };
});
