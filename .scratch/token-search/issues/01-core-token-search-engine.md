# 01: Core Token Search Engine & Autocomplete Refactor (#6)

**What to build:**
A pure, headless token search engine with full test coverage supporting matching by token path, ancestor group name, token value, resolved alias, and token type. Refactor `AliasAutocompleteComponent` to delegate its matching and token expansion to this engine, eliminating duplicated filtering logic and achieving SRP.

**Blocked by:** None (can start immediately)

**GitHub Issue:** https://github.com/correamauricio/dtcg_forge/issues/6

**Status:** ready-for-agent

- [ ] `token-search.util.ts` exports `searchTokens`, `matchToken`, and `expandTokensForSearch`.
- [ ] Unit tests in `token-search.util.spec.ts` cover path matching, group ancestry, alias syntax, token values, type matching, case insensitivity, and sub-properties.
- [ ] `AliasAutocompleteComponent` refactored to use `token-search.util.ts` with all tests in `alias-autocomplete.component.spec.ts` passing green.
