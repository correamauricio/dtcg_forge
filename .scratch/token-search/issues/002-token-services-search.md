# 002: Estado e Serviço Reativo de Busca (TokenStateService & TokenService)

## Descrição
Integrar o sinal reativo de busca `searchQuery` no `TokenStateService` e fornecer no `TokenService`:
- `searchQuery` (sinal legível)
- `setSearchQuery(query: string)` e `clearSearchQuery()`
- `filteredFlatTokens` (computed usando `searchTokens`)
- `groupedTokens` atualizado para reagir ao filtro
- `totalTokenCount` e `filteredTokenCount`

## Critérios de Aceitação
- Testes unitários atualizados em `token-state.service.spec.ts` e `token.service.spec.ts`
- Retorno de todos os tokens quando a query for vazia
- Filtragem automática reativa na árvore agrupada

## Blockers
- 001-token-search-util.md
