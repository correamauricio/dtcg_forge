# Token Search and Hierarchical Filtering

We implemented token search restricted to the Active File by extracting a headless, pure search utility (`token-search.util.ts`) shared between the Alias Autocomplete and the Token Sidebar. Instead of flattening search results into a simple list, searching preserves and prunes the hierarchical Token Tree (`Filtered Token Tree`), retaining ancestor groups of matching tokens so users maintain structural context while editing.
