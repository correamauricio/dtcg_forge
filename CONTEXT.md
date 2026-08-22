# DTCG Forge

DTCG Forge is a visual editor and inspector for W3C Design Tokens Community Group (DTCG) token files with real-time token resolution, variant switching, and live component preview.

## Language

**Token File**:
A JSON file containing W3C Design Tokens specifications (e.g. primitives, semantic layers, or themes).
_Avoid_: Config file, document

**Active File**:
The specific Token File currently opened in the token inspector and raw JSON editor for editing.
_Avoid_: Selected document, open tab

**Variant Group**:
A cluster of Token Files that share overlapping token paths (e.g. light and dark semantic themes).
_Avoid_: Theme set, conflict group

**Active Variant**:
The Token File within a Variant Group whose token values are currently applied to the live component preview (represented by the active Eye indicator).
_Avoid_: Current theme, previewed file

**File Explorer**:
The dedicated left sidebar responsible for managing the project's collection of Token Files, including drag & drop import, file selection, renaming, deletion, variant grouping, status footer, and export.
_Avoid_: File selector, file picker dropdown
