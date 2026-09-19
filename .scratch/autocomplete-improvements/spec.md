# Spec: Autocomplete Improvements

## Problem Statement
The alias autocomplete component (`AliasAutocompleteComponent`) currently has five usability and developer experience friction points:
1. **Scroll desynchronization**: Keyboard navigation (ArrowDown, ArrowUp) does not scroll the active item into view.
2. **Double-click required**: Clicking a dropdown item requires two clicks because input blur consumes focus on mousedown.
3. **Hidden resolved values**: Non-color tokens (numeric, dimension, string) do not show their resolved values in suggestions.
4. **Rigid search query**: Queries do not support multi-term fuzzy search separated by space, hyphen, or dot in any order.
5. **Enclosing curly braces**: Input fields display raw `{}` brackets around alias paths, degrading editing ergonomics.

## Solution Architecture
- Implement keyboard scroll-into-view synchronization in `AliasAutocompleteComponent`.
- Prevent default on mousedown in popover buttons to allow single-click selection.
- Render `token.resolvedValue` for non-color tokens in the suggestion template.
- Enhance `token-search.util.ts` to tokenize queries by `[\s\-\.]` and match order-independently.
- Strip visual `{}` in token input representations while preserving valid alias semantics upon commit.
