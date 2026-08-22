# 03: Elevated Variant Grouping and Active Preview Eye Switching

**What to build:**
Detect and group variant files in elevated surface containers within the File Explorer. Display an Eye (👁️) icon for variant files indicating which variant is actively resolved in the live preview. Clicking specifically on the Eye icon switches the active preview variant independently without altering the active file currently opened for editing in the token inspector.

**Blocked by:** 02: File Explorer Component with Drag & Drop and File Actions

**Status:** ready-for-agent

- [ ] Variant files sharing overlapping token paths are visually clustered inside an elevated surface container (higher surface color / card styling) within the File Explorer.
- [ ] The active preview variant displays an illuminated Eye icon (👁️), while inactive variants in the group display a dim/outline Eye icon.
- [ ] Clicking a variant row selects it for editing AND updates the active preview variant.
- [ ] Clicking specifically on the Eye icon updates the active preview variant without changing the file currently open in the token inspector.
- [ ] Unit tests in `file-explorer.component.spec.ts` verify variant grouping container styles and independent eye-click preview switching behavior.
