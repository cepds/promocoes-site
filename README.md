# Radar de Promoções

Site gratuito para acompanhar promoções de lojas confiáveis, com atualização automática duas vezes ao dia.

## Arquitetura

- **ChatGPT (automação 2x/dia)** pesquisa e revalida ofertas.
- **GitHub** armazena `data/ofertas.json`.
- **Firebase Hosting** hospeda o site estático.
- O site lê o JSON do GitHub e esconde ofertas inativas ou sem verificação recente.

## Estrutura

- `public/` — site estático.
- `data/ofertas.json` — base das ofertas.
- `firebase.json` — configuração do Firebase Hosting.
- `.firebaserc` — projeto Firebase `promocoes-65707`.

## Importante

Para o site hospedado no Firebase conseguir ler `data/ofertas.json` diretamente do GitHub sem autenticação, este repositório precisa estar **público**. Não coloque segredos, tokens, senhas ou credenciais no repositório.

## Publicar o site

```powershell
firebase use promocoes-65707
firebase deploy --only hosting
```

Depois do primeiro deploy, as próximas atualizações de ofertas não exigem novo deploy: o navegador lê o JSON atualizado do GitHub.
