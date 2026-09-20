# 05: Omitir chaves {} no input de alias tokens na interface (#31)

**What to build:**
Nos campos de input de tokens na interface, não exibir as chaves `{` e `}` ao redor do caminho do token alias (ex: exibir `color.brand.primary` em vez de `{color.brand.primary}`). Isso facilita a digitação, edição e leitura pelo usuário, mantendo a semântica correta de alias no modelo de dados subjacente.

**Blocked by:** None

**GitHub Issue:** https://github.com/correamauricio/dtcg_forge/issues/31

**Status:** ready-for-agent

- [x] O input do `AliasAutocompleteComponent` e dos nós de tokens (`PrimitiveNodeComponent`, `ColorNodeComponent`) exibem o caminho do alias limpo, sem as chaves `{}`.
- [x] A seleção pelo autocomplete ou commit de valores preserva a integridade sem duplicar chaves nem corromper tokens brutos ou numéricos.
- [x] Testes unitários TDD cobrindo a exibição limpa e a edição sem chaves visíveis.
- [ ] Implementação aprovada pelo usuário antes de fechar a issue ou mergear.

