# 02: Reactive Search State & Hierarchical Tree Filtering (#7)

**What to build:**
Enable reactive search filtering in the application state and facade service. `TokenStateService` maintains the `searchQuery` signal, and `TokenService` computes `filteredFlatTokens` and a pruned `groupedTokens` tree where only branches leading to matching tokens remain visible. Total and filtered token counts are exposed as computed signals.

**Blocked by:** #6 (01: Core Token Search Engine & Autocomplete Refactor)

**GitHub Issue:** https://github.com/correamauricio/dtcg_forge/issues/7

**Status:** completed

- [x] `TokenStateService` manages `searchQuery` signal with `setSearchQuery(query)` and `clearSearchQuery()`.
- [x] `TokenService` exposes `searchQuery`, `setSearchQuery`, `clearSearchQuery`, `filteredFlatTokens`, pruned `groupedTokens`, `totalTokenCount`, and `filteredTokenCount`.
- [x] Unit tests in `token-state.service.spec.ts` and `token.service.spec.ts` verify query updates, reactive tree pruning, fallback to full list when query is empty, and match counters.

