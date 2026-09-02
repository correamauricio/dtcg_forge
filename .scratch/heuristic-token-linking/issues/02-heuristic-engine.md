# 02: Desenvolver o Heuristic Scoring Engine

**What to build:** Uma função utilitária pura (`heuristic-linker.util.ts`) que recebe tokens importados pelo usuário e a folha padrão do preview. Ela roda regras de pontuação baseadas em palavras-chave (ex: tokens `cta.background` dão preferência a encontrar valores `primary` ou `brand`) e retorna a folha padrão com as referências (aliases) inseridas.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] A lógica de pontuação (pesos) prioriza intenção de ação (CTA) para associar a cores semânticas principais.
- [ ] O código é testado via TDD validando as hipóteses de pesos e desempate (escolha do primeiro maior valor).
