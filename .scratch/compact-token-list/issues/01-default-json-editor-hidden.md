# 01: Default JSON Editor Hidden State & Initial View Setup (#10)

**What to build:**
Update `TokenStateService` so that the raw JSON editor starts collapsed (`_isJsonEditorOpen = signal<boolean>(false)`) on initial application load, ensuring users start with a clean and focused design token visual workspace.

**Blocked by:** None (can start immediately)

**GitHub Issue:** https://github.com/correamauricio/dtcg_forge/issues/10

**Status:** completed

- [x] New feature branch `feat/compact-token-list-sticky-headers` is created and checked out.
- [x] `TokenStateService` initializes `_isJsonEditorOpen` to `false`.
- [x] Unit tests in `token-state.service.spec.ts` verify that `isJsonEditorOpen()` defaults to `false`.
- [x] All existing test suites pass without regression.
