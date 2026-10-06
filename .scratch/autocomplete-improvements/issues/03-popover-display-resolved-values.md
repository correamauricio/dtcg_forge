# 03: Exibição do valor final de tokens numéricos e strings na listagem do autocomplete (#29)

**What to build:**
No popover do autocomplete, ao renderizar sugestões de alias tokens para tipos numéricos ou strings (como `dimension`, `number`, `string`, `duration`, etc.), deve-se exibir o valor final (resolvido) do token na listagem para facilitar a identificação do seu significado. No caso de tokens de cor (`color`), a cor já é exibida visualmente através do círculo de swatch, portanto não é necessário exibir o valor da cor.

**Blocked by:** None

**GitHub Issue:** https://github.com/correamauricio/dtcg_forge/issues/29

**Status:** approved

- [x] Tokens de tipos que não sejam `color` exibem seu `resolvedValue` de forma legível na listagem de sugestões.
- [x] Tokens do tipo `color` mantêm apenas o swatch visual de cor, sem poluir com o texto do valor.
- [x] Testes unitários TDD em `alias-autocomplete.component.spec.ts` cobrindo a renderização dos valores resolvidos conforme o tipo do token.
- [x] Implementação aprovada pelo usuário antes de fechar a issue ou mergear.
