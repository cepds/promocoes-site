# Radar de Promoções — catálogo e pesquisa para casa

Site estático de pesquisa e referência de preços, com visualização de **móveis, quarto, cama, mesa e banho**.

## Recursos
- Catálogo no `data/ofertas.json` com pesquisa sem acentos, favoritos, comparação, histórico e filtros.
- Referências com checagem superior a 18 horas **não são ofertas confirmadas**. Quando todas estão vencidas, aparecem como referências históricas claramente sinalizadas, sem selos de desconto e sem promessa de frete ou estoque.
- Descoberta de oito lojas com domínio oficial revisado, por ambiente e tipo de produto, em `public/lojas-casa.json`.
- Diretório editorial-fonte em `data/lojas-casa.json` com espelho estático para Firebase.
- Links de compra limitados a domínios expressamente aprovados no código e na validação; isso **não valida individualmente vendedores terceiros** dentro dos marketplaces.
- PWA com cache de arquivos estáticos; o JSON do catálogo é consultado pelo GitHub.

## Atualização de dados
O workflow `audit-catalog.yml` roda em horários de referência 09h e 18h (UTC-3). **Ele só audita metadados**, informa validade das verificações e executa testes. Não visita lojas, não renova preços, não atualiza `ultimaVerificacao` e não garante estoque.

Para introduzir preços recentes, use uma fonte autorizada (API/feed da loja/parceiro ou pesquisa comprovada), cheque URL do produto, modelo/SKU, variação (cor/voltagem), preço à vista e forma de pagamento, vendedor, disponibilidade e data da consulta. Somente registre `ultimaVerificacao` depois dessa consulta real. Não escreva datas novas em registros antigos apenas para fazê-los aparecer.

## Validação
```powershell
node scripts/validate-site.js
node --test tests/*.test.js
node scripts/audit-catalog.js
```

O fluxo de deploy deve interromper em caso de erros de arquivo, domínio, sintaxe, testes ou credenciais de hospedagem ausentes.

## Hospedagem e deploy
- Projeto: Firebase Hosting `promocoes-65707`
- URL configurada: `https://promocoes-65707.web.app/`
- Branch de publicação: `main`. O workflow `firebase-hosting.yml` tenta deploy em push que altera o site, e também via acionamento manual.

**Configuração obrigatória:** adicione ao GitHub Actions secret `FIREBASE_SERVICE_ACCOUNT_PROMOCOES_65707` o JSON de uma conta de serviço do Firebase com permissão necessária para publicar no projeto. Faça isso em **GitHub → Settings → Secrets and variables → Actions**, nunca no código, comentário ou chat. Se o secret estiver ausente, o workflow falha claramente e não relata publicação como concluída.

A publicação pode ser acionada manualmente em **Actions → Firebase Hosting Deploy → Run workflow** após configurar as credenciais.

## Expansão de catálogos
O diretório de lojas não importa ofertas automaticamente. A próxima etapa é conectar feeds/APIs autorizados de varejistas, com validação de preço e estoque e observabilidade sobre falhas, antes de expandir `data/ofertas.json`. Dados sem confirmação não devem ser apresentados como promoções recentes.

## Uso responsável
Preço, estoque, frete e disponibilidade variam por região e momento. Confira na loja antes de comprar. Links afiliados exigem identificação adequada e aprovação do domínio de destino.

## Descoberta em comparadores (v3)

A página inicial dispõe de 36 categorias editoriais, com pesquisa em Buscapé, Zoom e Bondfaro, além de atalhos para JáCotei e MEUPC.NET. Esses botões abrem buscas no site original: **nenhum preço ou imagem é capturado sem permissão**. A Promotech pesquisada é serviço de campanhas promocionais, não fonte de comparação de preços identificada para importação.

As categorias adicionais de pesquisa são uma *navegação*, não um conjunto de ofertas novas artificialmente precificadas.

## Importação automatizada por feeds autorizados (Awin)

A Awin disponibiliza feeds de anunciantes com preço, nome, imagem, categoria, data de atualização e link da loja. O projeto inclui:
- `scripts/awin-feed-lib.cjs`: parser CSV, mapeamento, preços em BRL, categorias, autorização de URLs e deduplicação.
- `scripts/sync-awin-feed.mjs`: downloads do serviço oficial Awin; seleciona feeds **brasileiros, recentes e associados à conta**, limita tamanho e volume, preserva dados em falhas, mantém histórico.
- `.github/workflows/sync-authorized-feeds.yml`: execuções automáticas às 09h15 e 18h15 (Brasília), executa testes/validação antes de publicar alterações no GitHub.
- `tests/awin-feed.test.js`: casos de verificação do parser, produto e histórico.

**Configuração inicial indispensável:** cadastrar-se em https://www.awin.com/pt/afiliados, ter acesso autorizado aos feeds de anunciantes e, no menu Awin Toolbox → Create-a-Feed, obter a **Product Data Feed API key**. No GitHub do projeto, criar `Settings → Secrets and variables → Actions → New repository secret` com nome `AWIN_DATAFEED_API_KEY`. **Não incluir chaves no repositório, em issues ou no chat.** Essa chave é diferente da API comum de Publisher. Após conceder acesso, os processos são automáticos sem atualizações manuais do JSON.

O script usa exclusivamente as URLs oficiais de `productdata.awin.com` e `datafeed.api.productserve.com`; imagens devem ser HTTPS e a URL direta de compra precisa constar da lista de domínios autorizados em `public/catalog-policy.js`. Outras lojas dependem de revisão do domínio e do vendedor. Se o feed estiver desatualizado ou indisponível, **nenhum preço é atualizado artificialmente**. Uma nova oferta pode ser marcada recente apenas com data e preço vindos de um feed atualizado.

**Limite de independência:** sem credencial, feeds de anunciantes e autorização das lojas, nenhum robô sério consegue garantir atualização e estoque de todas as lojas sem configuração. As buscas nos comparadores são para descoberta, não scraping ou reutilização irrestrita de dados.

## Segurança da publicação

Se uma chave privada do Firebase tiver sido enviada por anexo ou outro canal, revogue-a no Google Cloud (IAM e administrador → Contas de serviço → Chaves) e crie outra com privilégios mínimos. Configure a **nova** chave no GitHub Secret `FIREBASE_SERVICE_ACCOUNT_PROMOCOES_65707`, nunca no código. O GitHub Actions do deploy **falha**, em vez de publicar, se a credencial não existir. Também é possível posteriormente migrar o deploy para federação OIDC sem chave duradoura.

## Vitrine sem ofertas antigas: verificação automática diária

- A vitrine pública lê **somente** `public/ofertas-verificadas.json`, nunca as datas ou preços históricos em `data/ofertas.json` ou `data/enxoval.json`.
- O GitHub Actions `.github/workflows/verify-and-publish.yml` roda **duas vezes ao dia** (09h e 18h de Brasília), e quando novos dados de feeds autorizados terminam de sincronizar. Não precisa criar outra conta.
- `scripts/verify-products.mjs` consulta os links existentes em lojas permitidas, procura `Product/Offer` JSON-LD correspondente ao produto, preço positivo em BRL e `availability` explicitamente disponível (`InStock`, `LimitedAvailability` ou `OnlineOnly`).
- **Esgotado, descontinuado, acesso bloqueado, retorno incerto, variantes divergentes ou preço não confirmado:** fora da vitrine. A fonte original é preservada para nova verificação, mas jamais exibida como oferta ativa.
- Ao verificar, o preço é substituído pelo da página; descontos, fretes e cupons antigos são zerados/desconhecidos (sem inventar vantagens). A data da consulta é renovada **somente** após confirmação.
- Cada validação publica o JSON atualizado no GitHub e também no Firebase. Um produto desaparece automaticamente do navegador quando ultrapassa **18 horas sem confirmação**, mesmo se uma execução agendada falhar.
- O Service Worker e o Firebase não armazenam em cache o catálogo verificado para uso offline. Se a rede estiver indisponível, a vitrine não mostra o último catálogo salvo.
- Auditoria: resultados e contagem de verificados, esgotados, sem confirmação e falhas são exibidos no resumo da execução do GitHub Actions.

**Limitações:** páginas com captcha, conteúdo exclusivamente em JavaScript, bloqueios automatizados ou sem dados estruturados explícitos não são consideradas verificáveis por esse processo gratuito; elas ficam ocultas. Não é possível garantir que lojas mantenham dados corretos, nem a descoberta de novos SKUs sem fontes oficiais ou feeds autorizados. O site pode exibir zero produtos até encontrar verificações confiáveis. A disponibilidade pode mudar após a consulta.

### Testes

```bash
node --test tests/*.test.js
node scripts/validate-site.js
node scripts/check-verified-catalog.cjs # após execução do verificador
```

## Lojas oficiais e novas categorias de casa

A curadoria `data/produtos-oficiais.json` contém páginas de produto de **Mobly, Electrolux, Magazine Luiza (Magalu) e Casas Bahia** em Camas, Sofás, Guarda-roupas, Cadeiras, Mesas e Eletrodomésticos, sem preços, descontos nem imagens inventadas.

Os links de varejistas com marketplace (especialmente Magalu e Casas Bahia) só entram na vitrine depois que a verificação conseguir identificar o **vendedor oficial**; uma página no domínio da loja não prova, por si só, quem vende. Sem confirmação inequívoca, o produto permanece oculto. O verificador também exige imagem HTTPS do JSON-LD Product, preço em BRL e disponibilidade positiva.

O acompanhamento de promoções usa apenas **dois preços realmente confirmados para o mesmo produto**, registrados em execuções separadas. O desconto só é exibido quando houver queda de pelo menos 3% e no máximo 60% em relação à verificação anterior de até 14 dias. Na primeira leitura do produto não se inventa promoção; fretes, descontos por meios de pagamento e cupons precisam de confirmação separada.

Adicionar/editar a curadoria aciona o workflow de verificação e publicação no GitHub. As verificações agendadas continuam às 09h e às 18h (horário de Brasília), sujeitas a atrasos do GitHub. A vitrine da página inicial segue mostrando apenas filtros e produtos, sem cards de lojas nem diretórios de links.

## Mesmo produto em lojas diferentes e novas camas de casal

A curadoria em `data/produtos-oficiais.json` foi ampliada com camas de casal e camas box **Mobly** e **MadeiraMadeira**, incluindo anúncios do mesmo fabricante vendidos por lojas oficiais dentro do **Magalu**. Foram adicionadas páginas de referência cruzada para geladeiras **Brastemp BRM51MB** e **Electrolux TF38S** em lojas parceiras autorizadas (**Carrefour** e **Magalu**). Nenhum preço ou estoque desses candidatos é preenchido antes da verificação automática.

Comparação confiável em `public/product-identity.js`:
- Produtos com GTIN/EAN idêntico podem formar um grupo;
- eletrodomésticos exigem **fabricante, código exato do modelo e voltagem exata**. Modelos sem tensão selecionada são tratados como versões distintas/indeterminadas;
- móveis não são comparados apenas pelo nome da linha: as duas camas com correspondência pesquisada receberam grupos curados com cor, modelo e dimensões compatíveis e validação de termos da página;
- apenas produtos que passaram no controle de **preço, estoque, identidade do produto e vendedor oficial** entram na comparação;
- os resultados aparecem apenas nos detalhes do produto ou como indicação discreta no card, mantendo a home exclusivamente com filtros e produtos.

Esta etapa amplia a **lista de candidatos**; a quantidade de produtos visíveis depende do JSON-LD confirmado nas próximas execuções do GitHub Actions. Não são forçados anúncios de marketplaces com vendedores terceiros, promoções sem preço confiável, nem variantes com códigos elétricos ambíguos.
