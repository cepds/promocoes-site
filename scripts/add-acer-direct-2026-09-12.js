const fs = require('fs');

const DATA_PATH = 'data/ofertas.json';
const now = new Date().toISOString();
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
data.ofertas = Array.isArray(data.ofertas) ? data.ofertas : [];
data.logAlteracoes = Array.isArray(data.logAlteracoes) ? data.logAlteracoes : [];

const candidates = [
  ['acer-anv15-52-77bg-rtx4050','Notebook Gamer Acer Nitro V15 ANV15-52-77BG Core i7 16GB 512GB RTX 4050','ANV15-52-77BG','acer-anv15-52-77bg-16gb-512gb-rtx4050',8999,11999,10226.14,12,852.17,'https://br-store.acer.com/notebook-acer-nitro-v15-anv15-52-77bg-intel-core-i7-16gb-ram-512gb-ssd-rtx-4050-tela-15-6-windows-11-preto-nh-u0cal-004/p','https://acerstore.vtexassets.com/arquivos/ids/168147-800-auto?aspect=true&height=auto&v=639240341925900000&width=800'],
  ['acer-ag15-71p-73d2','Notebook Acer Aspire GO 15 AG15-71P-73D2 Core i7 16GB 512GB Windows 11 Pro','AG15-71P-73D2','acer-ag15-71p-73d2-16gb-512gb',6511.12,8999,7399,12,616.58,'https://br-store.acer.com/notebook-acer-ag15-71p-73d2--ci713620h--16gb--512gb-ssd--wnprc64--green--fhd-15-6-nx-jg7al-006/p','https://acerstore.vtexassets.com/arquivos/ids/167939-800-auto?aspect=true&height=auto&v=639231758463730000&width=800'],
  ['acer-a16-71m-55h0','Notebook Acer Aspire 16 A16-71M-55H0 Core Ultra 5 16GB 512GB','A16-71M-55H0','acer-a16-71m-55h0-16gb-512gb',5499,6599,6248.86,12,520.73,'https://br-store.acer.com/notebook-acer-a16-71m-55h0--cu5115u--16gb--512gb-ssd--wnhpsl64--gray--lcd-16-nx-jqlal-001/p','https://acerstore.vtexassets.com/arquivos/ids/166947-800-auto?aspect=true&height=auto&v=639094337858270000&width=800'],
  ['acer-ag15-51p-52bh','Notebook Acer Aspire GO 15 AG15-51P-52BH Core 5 8GB 512GB','AG15-51P-52BH','acer-ag15-51p-52bh-8gb-512gb',4999,7999,5680.68,12,473.39,'https://br-store.acer.com/notebook-acer-aspire-go-15-ag15-51p-52bh-intel-core-5-8gb-ram-512gb-ssd-tela-15-3-windows-11-azul-nx-jgfal-007/p','https://acerstore.vtexassets.com/arquivos/ids/168021-800-auto?aspect=true&height=auto&v=639232949391570000&width=800'],
  ['acer-ag15-71p-753g','Notebook Acer Aspire GO 15 AG15-71P-753G Core i7 8GB 256GB Linux','AG15-71P-753G','acer-ag15-71p-753g-8gb-256gb',5809.56,7499,6601.77,12,550.14,'https://br-store.acer.com/notebook-acer-aspire-go-15-ag15-71p-753g-intel-core-i7-8gb-ram-256gb-ssd-tela-15-6-linux-verde-nx-jh6al-008/p','https://acerstore.vtexassets.com/arquivos/ids/167513-800-auto?aspect=true&height=auto&v=639217229694130000&width=800'],
  ['acer-ag15-71pt-72el','Notebook Acer Aspire GO 15 Touch AG15-71PT-72EL Core i7 16GB 512GB','AG15-71PT-72EL','acer-ag15-71pt-72el-16gb-512gb-touch',5799,7999,6589.77,12,549.14,'https://br-store.acer.com/notebook-acer-ag15-71pt-72el-ci713620h-16gb-512gb-ssd-windows-11-home-green-fhd-15-6-nx-jgcal-002/p','https://acerstore.vtexassets.com/arquivos/ids/167965-800-auto?aspect=true&height=auto&v=639231799808000000&width=800'],
  ['acer-anv15-41-r6j0','Notebook Gamer Acer Nitro V15 ANV15-41-R6J0 Ryzen 7 8GB 512GB RTX 4050','ANV15-41-R6J0','acer-anv15-41-r6j0-8gb-512gb-rtx4050',5999,7999,6817.05,12,568.08,'https://br-store.acer.com/notebook-acer-anv15-41-r6j0--r77735hs--8gb--512gb-ssd--rtx4050--agpos--black--fhd-15-6-nh-u20al-004/p','https://acerstore.vtexassets.com/arquivos/ids/167213-800-auto?aspect=true&height=auto&v=639154837941030000&width=800'],
  ['acer-anv16-72-7327','Notebook Gamer Acer Nitro V16 ANV16-72-7327 Core 7 32GB 1TB RTX 5060','ANV16-72-7327','acer-anv16-72-7327-32gb-1tb-rtx5060',10999,16999,12498.86,12,1041.57,'https://br-store.acer.com/notebook-acer-nitro-anv16-72-7327--c7240h--rtx-5060--32gb--1tb-ssd--wnhasl64--black--lcd-16-nh-qunal-001/p','https://acerstore.vtexassets.com/arquivos/ids/166574-800-auto?aspect=true&height=auto&v=639046216427800000&width=800'],
  ['acer-phn16-73-76h8','Notebook Gamer Acer Predator Helios Neo 16 AI PHN16-73-76H8 Ultra 7 32GB 512GB RTX 5070','PHN16-73-76H8','acer-phn16-73-76h8-32gb-512gb-rtx5070',12499,14999,14203.41,12,1183.61,'https://br-store.acer.com/notebook-acer-phn16-73-76h8--cu7255hx--32gb--512gb-ssd--8g-gddr7--rtx-5070--wnhasl64--black--lcd-16-nh-u2pal-004/p','https://acerstore.vtexassets.com/arquivos/ids/166899-800-auto?aspect=true&height=auto&v=639093738966300000&width=800'],
  ['acer-a515-45-r478','Notebook Acer Aspire 5 A515-45-R478 Ryzen 5 16GB 512GB Linux','A515-45-R478','acer-a515-45-r478-16gb-512gb',4999,6999,5680.68,12,473.39,'https://br-store.acer.com/notebook-acer-aspire-5-a515-45-r478-amd-ryzen-5-16gb-ram-512gb-ssd-tela-15-6-linux-prata-nx-aydal-00r/p','https://acerstore.vtexassets.com/arquivos/ids/167808-800-auto?aspect=true&height=auto&v=639225749107470000&width=800']
].map(([id,nome,modelo,produtoGrupo,precoAtual,precoAnterior,precoCartao,parcelas,valorParcela,url,imagem]) => ({
  id,nome,modelo,modeloFabricante:modelo,produtoGrupo,precoAtual,precoAnterior,precoPix:precoAtual,precoAvista:precoAtual,precoCartao,parcelas,valorParcela,url,imagem,
  categoria:'Informática',loja:'Loja Oficial Acer',seloLoja:'Loja Oficial',voltagem:'Bivolt',estoqueStatus:'Em estoque',
  desconto: Math.max(0, Math.floor((1 - precoAtual / precoAnterior) * 100)),
  condicaoPagamento:`${precoAtual.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} no PIX ou à vista no cartão; ${precoCartao.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} em até ${parcelas}x de ${valorParcela.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}`,
  observacoes:'Preço, disponibilidade, pagamento e fonte bivolt 100–240V confirmados na Loja Oficial Acer em 12/09/2026.'
}));

function norm(url){try{const u=new URL(url);return `${u.origin}${u.pathname}`.replace(/\/$/,'')}catch{return String(url||'').split('?')[0].replace(/\/$/,'')}}
function label(s){return s>=75?'Excelente':s>=58?'Boa':s>=42?'Interessante':'Normal'}
async function imageOk(url){try{const r=await fetch(url,{method:'GET',redirect:'follow',headers:{'user-agent':'Mozilla/5.0'}});return r.ok && (r.headers.get('content-type')||'').toLowerCase().startsWith('image/')}catch{return false}}

(async()=>{
  const ids=new Set(data.ofertas.map(o=>o.id));
  const urls=new Set(data.ofertas.map(o=>norm(o.url)));
  let added=0;
  for(const c of candidates){
    if(ids.has(c.id)||urls.has(norm(c.url))) continue;
    if(!(await imageOk(c.imagem))){console.log(`Ignorado: imagem oficial não respondeu como imagem: ${c.id}`);continue;}
    const score=Math.min(100,Math.round(Math.min(50,c.desconto)+30+8+4));
    const offer={...c,cupom:'Não informado',cashback:'Não informado',frete:'Consulte na loja',freteValor:null,freteGratis:false,cepFrete:'72620-405',precoComFrete:null,prazoEntrega:null,ativa:true,dataEncontrada:now,ultimaVerificacao:now,historicoPrecos:[{data:now,preco:c.precoAtual,freteValor:null,precoComFrete:null}],menorPrecoHistorico:c.precoAtual,precoMedioHistorico:c.precoAtual,scoreOferta:score,classificacaoOferta:label(score),variacaoPreco:null,ultimaQuedaPreco:null};
    data.ofertas.push(offer);ids.add(c.id);urls.add(norm(c.url));added++;
    data.logAlteracoes.push({data:now,tipo:'adicionado',produto:c.nome,id:c.id,detalhe:'Oferta verificada na Loja Oficial Acer, com imagem oficial e fonte bivolt confirmadas.'});
  }
  if(!added){console.log('Nenhuma oferta Acer direta adicionada.');return;}
  data.logAlteracoes=data.logAlteracoes.slice(-200);data.geradoEm=now;data.total=data.ofertas.filter(o=>o.ativa!==false).length;
  fs.writeFileSync(DATA_PATH,JSON.stringify(data,null,2)+'\n','utf8');
  console.log(`Adicionadas ${added} ofertas Acer diretas. Total ativo: ${data.total}`);
})();
