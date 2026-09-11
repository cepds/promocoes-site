# Backups do catálogo

Esta pasta recebe snapshots automáticos de `data/ofertas.json` antes das atualizações programadas.

Política do Radar:
- criar um backup antes de substituir o catálogo principal;
- usar nomes com data e hora, por exemplo `ofertas-2026-09-11-1800.json`;
- manter preferencialmente os 14 snapshots mais recentes;
- nunca sobrescrever `data/ofertas.json` se a criação do novo backup falhar;
- a limpeza de backups antigos não deve apagar o snapshot mais recente.

Os backups servem apenas para recuperação do catálogo e não são carregados pelo site público.
