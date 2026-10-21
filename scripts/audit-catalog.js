// Auditoria de integridade do catálogo. NÃO revalida preços remotamente.
const fs = require("node:fs");
const { isRecentVerification, safeHttpsUrl, shippingInfo } = require("../public/catalog-policy.js");
const data = JSON.parse(fs.readFileSync("data/ofertas.json","utf8"));
const offers = (data.ofertas || []).filter(o => o && o.ativa !== false);
const now = Date.now();
const report = {
  generatedAt: new Date(now).toISOString(),
  notice: "Datas são do catálogo. Este processo NÃO acessou lojas nem confirmou preços, estoque ou entrega.",
  total: offers.length,
  recent: offers.filter(o => isRecentVerification(o,now)).length,
  expired: offers.filter(o => !isRecentVerification(o,now)).length,
  unknownShipping: offers.filter(o => shippingInfo(o,o.precoAtual).freightValue === null).length,
  missingHttpsProductLink: offers.filter(o => !safeHttpsUrl(o.url)).length,
  missingHttpsImage: offers.filter(o => !safeHttpsUrl(o.imagem)).length,
  limitedPriceHistory: offers.filter(o => !Array.isArray(o.historicoPrecos) || o.historicoPrecos.length < 2).length,
  withoutStockEvidence: offers.filter(o => !o.estoqueStatus).length
};
console.log(JSON.stringify(report,null,2));
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    "## Qualidade do catálogo\n\n" +
    Object.entries(report).map(([k,v])=>"- **"+k+"**: "+v).join("\n")+"\n");
}
if (report.missingHttpsProductLink || report.missingHttpsImage) process.exitCode = 1;
