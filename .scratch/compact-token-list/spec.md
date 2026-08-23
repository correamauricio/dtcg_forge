# Spec: Compact Single-Line Token List, Sticky Scroll Hierarchy & Default Hidden JSON View

## Problem Statement

When exploring and editing design tokens in the sidebar, users face excessive vertical scrolling and visual noise:
1. Each token currently occupies two lines (a header with redundant `alias` and `$type` badges, and a second line for the editor input), which reduces the amount of visible tokens on the screen.
2. In deep token hierarchies, scrolling through long token sets causes users to lose context of which parent category/group they are currently viewing.
3. Long token values and alias paths (e.g. `{color.background.muted}`) get truncated at the end, hiding the most relevant token identifier from the user.
4. The raw JSON editor panel opens expanded by default on application launch, cluttering the view and distracting users whose primary workflow is managing tokens through the visual tree.

## Solution

1. Compact Single-Line Layout: Restructure each token row to occupy a single line with a clean 50/50 division between the token name (left, truncated) and value editor (right). Remove redundant `$type` and `alias` badges from the row.
2. Right-Aligned Values: Align the value input text to the right (`text-right`), ensuring that the trailing portion of lengthy token values or aliases remains immediately visible.
3. Sticky Scroll Hierarchy: Implement multi-level sticky headers for parent groups based on tree depth (`depth`), so ancestor group names remain pinned at the top while scrolling (similar to IDE sticky scroll).
4. Hidden JSON View by Default: Change the initial state of the raw JSON editor in `TokenStateService` to start collapsed (`isJsonEditorOpen = false`).
5. Compact Composite & Color Nodes: Maintain single-line compact representations for color pickers (swatch next to value) and composite tokens (compact `Object {X}` accordion trigger that cascades cleanly on expansion).

## User Stories

1. As a design system maintainer, I want each token to occupy only a single compact line in the sidebar, so that I can see twice as many tokens simultaneously without excessive scrolling.
2. As a designer, I want the token name and value editor to share the row space (50/50 split), so that both key and value are easily readable and editable.
3. As a developer, I want long token alias paths to be right-aligned in the input, so that I can see the specific token name at the end of the path even when the path is long.
4. As a user, I want redundant `alias` and `$type` badges removed from individual token rows, so that the sidebar interface is clean, minimal, and focused.
5. As a user scrolling through large token collections, I want parent category and group headers to stay pinned to the top of the sidebar using multi-level sticky scroll, so that I never lose track of the active group hierarchy.
6. As a user viewing nested groups (e.g., `color` -> `primary` -> `main`), I want each ancestor header to stick at an offset matching its hierarchy depth with solid background, so that text does not overlap or become unreadable.
7. As a user opening the application, I want the Raw JSON panel to be collapsed by default, so that the workspace starts clean and focused on the token visual tree.
8. As a user working with color tokens, I want the color swatch to sit neatly beside the value on the same line, so that visual color preview and editing remain immediate.
9. As a user inspecting composite tokens (like typography or shadows), I want the row to show a compact summary button (e.g., `Object {3}`) on one line, which expands into single-line child rows when clicked.

## Implementation Decisions

- **Git Branch**: Work will be executed on a dedicated feature branch named `feat/compact-token-list-sticky-headers`.
- **State Management**:
  - `TokenStateService._isJsonEditorOpen` initial signal changed from `true` to `false`.
  - All token modifications continue to be routed through `HistoryService` via `StateChangeCommand` for full undo/redo support.
- **Hierarchical Depth & Sticky Header**:
  - `TokenNodeComponent` receives a `depth` input (`number`, default `0`), passed recursively to child `app-token-node` instances with `depth + 1`.
  - Group headers apply `sticky top-0`, `z-index` calculated from depth (`calc(30 - depth)`), and `style.top.px="depth * 26"`.
  - Group headers have solid backgrounds (`bg-gray-900/95 backdrop-blur-xs`) and subtle bottom borders to cleanly occlude scrolled child items.
- **Single-Line Row Architecture**:
  - Container: `flex items-center justify-between gap-2 py-1 px-1.5 min-h-[32px] rounded-md hover:bg-gray-800`.
  - Left column: `w-1/2 min-w-0 font-mono text-xs text-gray-200 truncate` with `[title]="key"`.
  - Right column: `w-1/2 min-w-0 flex items-center justify-end`.
  - Badges: Remove `$type` badge and `alias` pill from the row.
- **Input Right-Alignment**:
  - `AliasAutocompleteComponent` input element receives `text-right` styling in `font-mono text-xs`.
- **Composite Nodes**:
  - Accordion trigger button formatted as a compact badge on the right column.
  - Expanded child items indented with cascading single-line layout.

## Testing Decisions

- Test only external behavior and UI contracts, not internal private functions.
- `TokenStateService`: Verify `isJsonEditorOpen()` defaults to `false`.
- `TokenNodeComponent`:
  - Verify single-line DOM structure and absence of alias/type badges.
  - Verify group header receives sticky position and correct depth styles.
  - Verify selection and update events fire accurately.
- `ColorNodeComponent` & `PrimitiveNodeComponent`:
  - Verify compact layout integration and value commit handling.
- `SidebarComponent`:
  - Verify integration with tree list and search filtering remains intact.
- Existing tests in the repository serve as prior art and must all remain 100% green.

## Out of Scope

- Persisting JSON editor state to `localStorage` across page reloads (kept in memory for KISS).
- Multi-token bulk selection or drag-and-drop reordering.
- Syntax highlighting within the single-line input field.

## Further Notes

- All changes respect SOLID, Clean Code, and KISS principles.
- Full test suite must pass via `npm test -- --watch=false`.
