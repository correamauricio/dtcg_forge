# 01: Sincronização do scroll no popover do autocomplete (#27)

**What to build:**
Ao navegar com as setas do teclado (ArrowDown e ArrowUp) no popover de sugestões do `AliasAutocompleteComponent`, a barra de rolagem (scroll) do container de sugestões deve acompanhar automaticamente o item atualmente selecionado, garantindo que o item permaneça visível na área de visualização.

**Blocked by:** None

**GitHub Issue:** https://github.com/correamauricio/dtcg_forge/issues/27

**Status:** in-review

- [x] Quando o usuário pressiona ArrowDown ou ArrowUp, o item selecionado (`selectedIndex`) é rolado para a visualização visível caso esteja fora da área visível (`scrollIntoView({ block: 'nearest' })`).
- [x] Testes automatizados (TDD) em `alias-autocomplete.component.spec.ts` cobrindo a navegação e sincronização do scroll no popover.
- [ ] Implementação aprovada pelo usuário antes de fechar a issue ou mergear.
