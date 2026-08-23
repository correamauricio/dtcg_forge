# 02: Compact UI

**What to build:** The compact horizontal list visualization of color tokens. When the analyzer detects a primitive color group, the tokens are rendered as color circles side-by-side rather than a vertical list. The UI remembers if the user expanded it to a list during the session.

**Blocked by:** 01-services

**Status:** ready-for-agent

- [ ] Create `PrimitiveGroupNodeComponent` for rendering the horizontal list of color circles.
- [ ] Implement state management (expand/collapse) defaulting to compact.
- [ ] Integrate into `TokenNodeComponent` to delegate rendering to the new component when `TokenGroupAnalyzerService` flags a primitive color group.
- [ ] Add unit tests for component rendering and state toggling.
