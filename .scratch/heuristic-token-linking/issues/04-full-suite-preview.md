# 04: Expand Default Preview Sheet and Robust Heuristics

**What to build:** O `default-preview-sheet.json` original contava apenas com 2 componentes simplistas. É necessário expandi-lo para uma suíte robusta de Component Tokens (tipografia, superfícies, cores de texto, ações variadas, botões, cards, overlays, bordas, espaçamentos e sombras). Para suportar essa suíte extensa, o Heuristic Scoring Engine também deve ser refinado para abranger esses novos cenários e garantir vinculação correta.

**Blocked by:** 01, 02, 03.

**Status:** ready-for-agent

- [ ] `token-state.service.ts` atualizado com o JSON robusto de componentes.
- [ ] `heuristic-linker.util.ts` cobrindo cenários ampliados de tipografia, sombras e bordas.
- [ ] Testes unitários de heurística ajustados e testados com sucesso.
