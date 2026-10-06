# 04: Busca com múltiplos termos e fuzzy search no autocomplete (#30)

**What to build:**
Aprimorar o mecanismo de busca do autocomplete (`token-search.util.ts`) para que, quando o usuário digitar palavras separadas por espaço, hífen (`-`) ou ponto (`.`), cada palavra seja tratada como um termo de busca independente. Todos os termos devem casar com o caminho, alias ou valor do token, mesmo que não estejam na mesma ordem digitada.

**Blocked by:** None

**GitHub Issue:** https://github.com/correamauricio/dtcg_forge/issues/30

**Status:** approved

- [x] A query de busca é tokenizada por delimitadores (espaço, hífen, ponto).
- [x] Todos os termos digitados devem casar com o token (no caminho, alias ou valor), independente da ordem dos termos.
- [x] Testes unitários TDD em `token-search.util.spec.ts` cobrindo queries compostas com espaços, hífens, pontos e em ordens diferentes.
- [x] Implementação aprovada pelo usuário antes de fechar a issue ou mergear.
