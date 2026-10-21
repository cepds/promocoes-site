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
