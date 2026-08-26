## Parent
Part of #19

## What to build
Add a "Harmonize other color groups" toggle to the UI inside `PrimitiveGroupNodeComponent`. This toggle drives whether a color picker change emits a standard single-color update or triggers the new bulk-harmonization flow.

## Acceptance criteria
- [ ] `PrimitiveGroupNodeComponent` UI displays a "Harmonize other color groups" checkbox (defaulting to unchecked).
- [ ] The component emits a new `@Output() harmonizeGroup` event if the toggle is checked during a color change.
- [ ] If unchecked, it emits individual `updateToken` events as it currently does.
- [ ] The parent component (`token-node.component.ts` / `file-explorer.component.ts` tree) catches `harmonizeGroup` and forwards it to `TokenStateService.harmonizeActiveFile`.

## Blocked by
- Ticket 2 (State Management Integration)
