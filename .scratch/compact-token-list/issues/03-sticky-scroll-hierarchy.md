# 03: Multi-Level Sticky Scroll Hierarchy for Ancestor Groups (#12)

**What to build:**
Implement IDE-like multi-level sticky scroll for parent category headers in `TokenNodeComponent`. Each ancestor group header stays pinned at the top of the sidebar viewport as the user scrolls, offset by hierarchy depth (`depth * 26px`), with solid background (`bg-gray-900`) and a subtle bottom border to prevent underlying scrolled tokens from bleeding through.

**Blocked by:** #11 (Compact Single-Line Token Node & Right-Aligned Value Inputs)

**GitHub Issue:** https://github.com/correamauricio/dtcg_forge/issues/12

**Status:** completed

- [x] `TokenNodeComponent` supports an `@Input() depth = 0` property, passing `depth + 1` to recursive child instances.
- [x] Group headers (`!isToken(node, key)`) have `sticky top-0`, dynamic `top` offset based on `depth`, and descending `z-index`.
- [x] Group headers have solid backgrounds (`bg-gray-900/95 backdrop-blur-xs`) and bottom border styling for crisp visual separation.
- [x] Multi-level group scrolling behaves smoothly without jumping or overlapping text.
- [x] Unit tests in `token-node.component.spec.ts` verify sticky scroll classes and depth computation.
