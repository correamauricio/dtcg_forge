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

**Token Search**:
The interactive search input and filtering mechanism in the token sidebar that queries and filters tokens within the Active File by path, group name, value, or token type.
_Avoid_: Token query, token finder

**Filtered Token Tree**:
The hierarchical token tree representation where non-matching branches are pruned while preserving ancestor groups containing matching tokens.
_Avoid_: Filtered list, search tree

**Palette Generator**:
A script or algorithm that calculates and generates a full set of color tokens (a palette) based on a single seed color.
_Avoid_: Auto-color tool, theme maker

**Primitive Token Group**:
A Token Group where no token inside it is an alias; all tokens represent explicit, hardcoded values.
_Avoid_: Base tokens group, hardcoded group

**Workspace**:
The complete collection of Token Files along with interface state (such as the Active File, Active Variant selections, and disabled files) managed in a user session.
_Avoid_: Project, document, environment

**Session**:
The browser-based persistence layer containing the user's current Workspace, providing the boundary for initializing, loading, and auto-saving state across application reloads using IndexedDB.
