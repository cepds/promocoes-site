const DATA_URL="https://api.github.com/repos/cepds/promocoes-site/contents/data/ofertas.json?ref=main";
const TARGETS=["Sofás","TVs","Celulares","Informática","Geladeiras","Máquinas de lavar","Air Fryers","Móveis","Ferramentas","Cozinha","Climatização","Games"];
const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const clean=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const digits=v=>String(v??"").replace(/\D/g,"");
function decode(v){const b=atob(String(v||"").replace(/\s/g,""));return new TextDecoder().decode(Uint8Array.from(b,c=>c.charCodeAt(0)))}
function httpsImage(v){try{return new URL(String(v||"")).protocol==="https:"}catch{return false}}
function is220(o){const s=[o.voltagem,o.nome,o.observacoes].filter(Boolean).join(" ").toLowerCase();return !(/\b(110|127)\s*v\b/.test(s)&&!/220\s*v|bivolt/.test(s))}
function stale(o){const d=o.ultimaVerificacao?new Date(o.ultimaVerificacao):null;return !d||Number.isNaN(d.getTime())||Date.now()-d.getTime()>18*60*60*1000}
function groupKey(o){const ean=digits(o.ean||o.gtin||o.codigoBarras);if(ean.length>=8&&ean.length<=14)return`ean:${ean}`;const m=clean(o.produtoGrupo||o.modeloFabricante||o.skuModelo||o.modelo);return m?`model:${m}`:""}
(async()=>{try{
 const r=await fetch(`${DATA_URL}&t=${Date.now()}`,{cache:"no-store"}); if(!r.ok) throw new Error(`HTTP ${r.status}`);
 const f=await r.json(); const p=JSON.parse(decode(f.content)); const active=(p.ofertas||[]).filter(o=>o.ativa!==false);
 const cats=new Map(TARGETS.map(c=>[c,0])); active.forEach(o=>cats.set(o.categoria||"Outros",(cats.get(o.categoria||"Outros")||0)+1));
 const withHistory=active.filter(o=>Array.isArray(o.historicoPrecos)&&o.historicoPrecos.length>=2).length;
 const noFreight=active.filter(o=>!o.frete||/consulte/i.test(String(o.frete))).length;
 const noImage=active.filter(o=>!httpsImage(o.imagem)).length;
 const incompatible=active.filter(o=>!is220(o)).length;
 const staleCount=active.filter(stale).length;
 const incomplete=TARGETS.filter(c=>(cats.get(c)||0)<10);
 const complete=TARGETS.length-incomplete.length;
 const withPayment=active.filter(o=>Number(o.precoPix||o.precoAvista||o.precoCartao)>0||Number(o.parcelas)>0||String(o.condicaoPagamento||o.formaPagamento||"").trim()).length;
 const withDelivery=active.filter(o=>String(o.prazoEntrega||o.entregaEstimada||o.dataEntrega||o.previsaoEntrega||"").trim()).length;
 const identified=active.filter(o=>groupKey(o)).length;
 const groups=new Map(); active.forEach(o=>{const g=groupKey(o);if(!g)return;const s=groups.get(g)||new Set();s.add(String(o.loja||""));groups.set(g,s)}); const multiStore=[...groups.values()].filter(s=>s.size>=2).length;
 $("#adminStats").innerHTML=`<div class="admin-stat"><span>Ativos</span><strong>${active.length}</strong></div><div class="admin-stat"><span>Categorias completas</span><strong>${complete}/${TARGETS.length}</strong></div><div class="admin-stat"><span>Com histórico</span><strong>${withHistory}</strong></div><div class="admin-stat"><span>Verificação antiga</span><strong>${staleCount}</strong></div><div class="admin-stat"><span>Pagamento detalhado</span><strong>${withPayment}</strong></div><div class="admin-stat"><span>Prazo de entrega</span><strong>${withDelivery}</strong></div><div class="admin-stat"><span>Modelo/EAN identificado</span><strong>${identified}</strong></div><div class="admin-stat"><span>Grupos multiloja</span><strong>${multiStore}</strong></div>`;
 $("#categoryHealth").innerHTML=`<table class="admin-table"><thead><tr><th>Categoria</th><th>Produtos</th><th>Meta</th><th>Status</th></tr></thead><tbody>${TARGETS.map(c=>{const n=cats.get(c)||0;return `<tr><td>${esc(c)}</td><td>${n}</td><td>10+</td><td>${n>=10?"✓ Completa":`⚠ ${10-n} faltando`}</td></tr>`}).join("")}</tbody></table>`;
 const pending=[]; if(incomplete.length)pending.push(`${incomplete.length} categoria(s) abaixo de 10: ${incomplete.map(c=>`${c} (${cats.get(c)||0}/10)`).join(", ")}`); if(noImage)pending.push(`${noImage} sem imagem HTTPS`); if(incompatible)pending.push(`${incompatible} incompatível(is) com 220V`); if(noFreight)pending.push(`${noFreight} sem frete calculado`); if(staleCount)pending.push(`${staleCount} sem verificação nas últimas 18 horas`);
 $("#issues").innerHTML=pending.length?`<ul>${pending.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:"<p>Sem pendências críticas detectadas.</p>";
 const logs=Array.isArray(p.logAlteracoes)?p.logAlteracoes.slice(-30).reverse():[];
 $("#changeLog").innerHTML=logs.length?logs.map(x=>`<div class="log-item"><strong>${esc(x.tipo||"Atualização")}</strong> • ${esc(x.produto||x.nome||"")}<br><span>${esc(x.detalhe||x.descricao||"")}</span>${x.data?`<br><small>${esc(new Date(x.data).toLocaleString("pt-BR"))}</small>`:""}</div>`).join(""):"<p>O log começará a ser preenchido nas próximas atualizações.</p>";
 $("#adminUpdated").textContent=p.geradoEm?`Base atualizada em ${new Date(p.geradoEm).toLocaleString("pt-BR")}`:"Base carregada";
}catch(e){$("#adminStats").innerHTML=`<div class="state-card"><h3>Falha ao carregar painel</h3><p>${esc(e.message)}</p></div>`}})();
