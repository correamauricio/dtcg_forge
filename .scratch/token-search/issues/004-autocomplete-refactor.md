# 004: Refatoração do Autocomplete (AliasAutocompleteComponent)

## Descrição
Refatorar o `AliasAutocompleteComponent` para utilizar as funções do motor puro `token-search.util.ts`, eliminando lógica de busca e expansão duplicadas.

## Critérios de Aceitação
- Todos os testes de `alias-autocomplete.component.spec.ts` continuam passando
- Redução de complexidade no componente de UI (cumprindo SRP)

## Blockers
- 001-token-search-util.md
