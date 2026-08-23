# 03: Sidebar Token Search Input, Keyboard Shortcuts & Empty State (#8)

**What to build:**
Deliver the interactive user interface in `SidebarComponent`: a search input bar placed between the header and token tree, with real-time reactive filtering, a clear button (`✕`), `Escape` keyboard shortcut to clear search, result counter badge (`X de Y`), and an Empty State illustration/message when no tokens match the search query.

**Blocked by:** #7 (02: Reactive Search State & Hierarchical Tree Filtering)

**GitHub Issue:** https://github.com/correamauricio/dtcg_forge/issues/8

**Status:** ready-for-agent

- [ ] Search bar integrated into `SidebarComponent` with search icon, input field, and clear button.
- [ ] Keyboard shortcut `Escape` clears the input and resets tree filter.
- [ ] Result counter badge displays match count when search is active.
- [ ] Empty State rendered when `filteredTokenCount === 0` and query is active.
- [ ] Unit tests in `sidebar.component.spec.ts` verify input binding, query dispatch, clear actions, shortcut handling, and empty state rendering.
