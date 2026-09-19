# 02: Seleção de item com clique único no popover do autocomplete (#28)

**What to build:**
Corrigir o comportamento de seleção de itens por clique no popover do `AliasAutocompleteComponent`. Atualmente, está sendo necessário dar dois cliques para selecionar um item em vez de um clique único. Isso ocorre porque o evento `blur` do input de texto consome o foco antes do evento `click` do botão ser registrado. Prevenir o `mousedown` no popover garante que o primeiro clique selecione imediatamente o item e emita o valor.

**Blocked by:** None

**GitHub Issue:** https://github.com/correamauricio/dtcg_forge/issues/28

**Status:** ready-for-agent

- [x] Clicar uma única vez sobre um item da lista de sugestões seleciona o token imediatamente e fecha o popover.
- [x] Testes unitários com TDD verificando a seleção com clique único e emissão correta de `valueCommit`.
- [ ] Implementação aprovada pelo usuário antes de fechar a issue ou mergear.
