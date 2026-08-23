# 02: Compact Single-Line Token Node & Right-Aligned Value Inputs (#11)

**What to build:**
Refactor the token row rendering in `TokenNodeComponent` so that every token occupies a single line split 50/50 between the token key/name (with truncation and tooltip) and the value editor. Remove the redundant `alias` and `$type` badges from the token row. Update `AliasAutocompleteComponent` and child node components (`PrimitiveNodeComponent`, `ColorNodeComponent`, `CompositeNodeComponent`) to support right-aligned text so the end of long values and aliases remains clearly visible.

**Blocked by:** #10 (Default JSON Editor Hidden State & Initial View Setup)

**GitHub Issue:** https://github.com/correamauricio/dtcg_forge/issues/11

**Status:** completed

- [x] `TokenNodeComponent` renders each token in a single line with 50% width allocated for the key name and 50% for the value editor.
- [x] Token key has `truncate` and `[title]="key"` for clear readability without breaking layout.
- [x] Badges for `$type` and `alias` are removed from the token row.
- [x] `AliasAutocompleteComponent` input element is styled with `text-right` and monospace font, ensuring the tail of long values/aliases stays visible.
- [x] `ColorNodeComponent` renders the value input and color swatch side-by-side within the 50% right column.
- [x] `CompositeNodeComponent` displays a compact indicator (`Object {X}` / `Array [X]`) that expands cascading child items in single-line format.
- [x] Unit tests in `token-node.component.spec.ts` and related component specs pass green.
