## Summary of Changes

This PR improves the design token tree interface in the sidebar by making the token list compact, minimal, and easily navigable with multi-level sticky scrolling.

### Key Changes
1. **Single-Line Token Layout**:
   - Each token row occupies a single line (`min-h-7`).
   - Dynamic 50/50 proportion: token key has `max-w-[45%] shrink-0 truncate` and value editor takes all remaining space (`flex-1 min-w-0`).
   - Removed redundant `$type` and `alias` badges from the token row.

2. **Right-Aligned Value Inputs & Auto-Scroll to End (`scrollToEnd`)**:
   - Value inputs are styled with `text-right font-mono text-xs`.
   - On initial load (`ngAfterViewInit`), value update (`ngOnChanges`), and `onBlur`, the input automatically scrolls to the end (`scrollLeft = scrollWidth`), ensuring the trailing part of long aliases (e.g. `...blue.500}`) is immediately visible in resting state.
   - Added host class `block w-full min-w-0` to all node components.

3. **Multi-Level Sticky Scroll Hierarchy (IDE-like)**:
   - Ancestor group headers stay pinned at the top while scrolling through deep token collections.
   - Dynamic offset `style.top.px="depth * 26"` with precise height `h-6.5` and descending `z-index`.
   - 100% solid `bg-gray-900` background with `-mx-1` to eliminate text overlap, blur ghosting, or gaps.
   - Removed top padding from the sidebar scroll container (`px-2 pb-2`) to eliminate the 8px top leak.

4. **Default Hidden Raw JSON Editor**:
   - Changed initial state of `TokenStateService._isJsonEditorOpen` to `false` so the app starts focused on the token visual tree.

## Verification
- **Unit Tests**: 186/186 tests passing (21 test suites).
- **TypeScript**: `npx tsc --noEmit` passing with 0 errors.
- **Production Build**: `npm run build` compiled successfully.

Closes #10
Closes #11
Closes #12
