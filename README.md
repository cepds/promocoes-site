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
