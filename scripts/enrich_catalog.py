import json
from pathlib import Path
from datetime import datetime, timezone

p=Path('data/ofertas.json')
data=json.loads(p.read_text(encoding='utf-8'))
now=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
logs=list(data.get('logAlteracoes') or [])
changes={
'magalu-sofa-mirela-170-bege':(934.92,1099.90,15,False),
'lg-dual-compact-18000':(3129.98,3556.80,12,True),
'magalu-samsung-ar09-ultra-ai':(2050.20,2278.00,10,True),
'magalu-tcl-55c6k':(3704.05,3899.00,5,True),
'meli-bosch-gsr714e-220v':(298.90,439.00,31,False),
'magalu-philco-40-roku':(1394.91,1499.90,7,False),
'magalu-lg-gbb472-476':(4199.00,4420.00,5,False),
'norotech-parafusadeira-48v':(198.54,599.99,67,False),
'ps5-slim-disk-1tb':(4783.08,5199.00,8,False),
'magalu-sofa-multimoveis-cr45242':(2823.99,3529.99,20,False),
'magalu-sofa-luna-180-vinho':(2027.45,2385.23,15,False),
'magalu-sofa-secret-bau-bege':(2124.03,2498.86,15,False),
'magalu-sofa-luna-180-castor':(2099.00,2385.23,12,False),
'magalu-sofa-compact-180-azul':(1116.95,1241.05,10,False),
'cozinha-demobile-alba':(999.40,1052.00,5,False),
}
for o in data.get('ofertas',[]):
    old=float(o.get('precoAtual') or 0)
    old_time=o.get('ultimaVerificacao') or data.get('geradoEm') or now
    hist=list(o.get('historicoPrecos') or [])
    if not hist: hist=[{'data':old_time,'preco':round(old,2),'freteValor':None,'precoComFrete':None}]
    if o.get('id') in changes:
        new,prev,disc,deactivate=changes[o['id']]
        if new<old:
            o['ultimaQuedaPreco']={'data':now,'valorAnterior':old,'valorNovo':new};o['variacaoPreco']=round(new-old,2)
            logs.append({'data':now,'tipo':'preco_baixou','produto':o.get('nome',''),'id':o.get('id',''),'detalhe':f'Preço caiu de R$ {old:.2f} para R$ {new:.2f}.'})
        elif new>old and deactivate and o.get('ativa',True):
            o['ativa']=False;o['variacaoPreco']=round(new-old,2)
            logs.append({'data':now,'tipo':'preco_subiu_removido','produto':o.get('nome',''),'id':o.get('id',''),'detalhe':f'Preço subiu de R$ {old:.2f} para R$ {new:.2f}; oferta desativada.'})
        o['precoAtual']=new;o['precoAnterior']=prev;o['desconto']=disc;o['ultimaVerificacao']=now
        rec={'data':now,'preco':round(new,2),'freteValor':o.get('freteValor') if isinstance(o.get('freteValor'),(int,float)) else None,'precoComFrete':o.get('precoComFrete') if isinstance(o.get('precoComFrete'),(int,float)) else None}
        if any(hist[-1].get(k)!=rec.get(k) for k in ('preco','freteValor','precoComFrete')): hist.append(rec)
    o.setdefault('variacaoPreco',0);o.setdefault('ultimaQuedaPreco',None);o['cepFrete']='72620-405';o.setdefault('frete','Consulte na loja');o.setdefault('freteGratis',False)
    if o.get('id')=='meli-bosch-gsr714e-220v':
        o['seloLoja']='Loja Oficial';o['freteGratis']=True;o['freteValor']=0;o['frete']='Grátis';o['precoComFrete']=o['precoAtual'];o['voltagem']='220V'
        rec={'data':now,'preco':o['precoAtual'],'freteValor':0,'precoComFrete':o['precoAtual']}
        if any(hist[-1].get(k)!=rec.get(k) for k in ('preco','freteValor','precoComFrete')): hist.append(rec)
    if not o.get('seloLoja') and ('loja oficial' in (o.get('loja') or '').lower() or 'loja oficial' in (o.get('observacoes') or '').lower() or 'oficial' in (o.get('loja') or '').lower()): o['seloLoja']='Loja Oficial'
    if o.get('id') in {'magalu-lg-gbb472-476','ps5-slim-disk-1tb','cozinha-demobile-alba'}: o['seloLoja']='Vendido por Magalu'
    if o.get('id')=='magalu-philco-40-roku': o['seloLoja']='Loja Oficial'
    o['historicoPrecos']=hist[-60:]
    prices=[float(x['preco']) for x in o['historicoPrecos'] if isinstance(x.get('preco'),(int,float)) and x['preco']>0]
    if prices:
        o['menorPrecoHistorico']=round(min(prices),2);o['precoMedioHistorico']=round(sum(prices)/len(prices),2)
    disc=max(0,min(float(o.get('desconto') or 0),50));score=45+min(disc*.8,28)+(8 if o.get('seloLoja') else 0)+(7 if o.get('freteGratis') is True else -4 if not isinstance(o.get('freteValor'),(int,float)) else 0)
    if len(prices)>=2 and o.get('precoAtual',0)<=min(prices): score+=8
    score=int(max(0,min(100,round(score))));o['scoreOferta']=score;o['classificacaoOferta']='Excelente' if score>=85 else 'Boa' if score>=70 else 'Interessante' if score>=55 else 'Normal'
    o.setdefault('cashback','Não informado');o.setdefault('cupom','Não informado');o.setdefault('observacoes','')
data['logAlteracoes']=logs[-200:];data['geradoEm']=now;data['total']=sum(1 for o in data.get('ofertas',[]) if o.get('ativa') is not False)
p.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
