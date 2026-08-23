import { FlatToken } from '../models/token.model';

export interface SearchableToken {
  path: string;
  type: string;
  resolvedValue: any;
  sourceFile: string;
  isSubMember: boolean;
}

/**
 * Checks if a FlatToken matches the given search query across multiple fields.
 */
export function matchToken(token: FlatToken, query: string): boolean {
  if (!query || !query.trim()) {
    return true;
  }

  const cleanQuery = query.trim().toLowerCase();
  const aliasStripped = cleanQuery.replace(/^\{|\}$/g, '');

  // 1. Path or segments matching
  const path = token.path.toLowerCase();
  if (path.includes(cleanQuery) || (aliasStripped && path.includes(aliasStripped))) {
    return true;
  }

  // 2. Alias format matching (e.g. {color.brand.primary})
  const aliasFormat = `{${path}}`;
  if (aliasFormat.includes(cleanQuery)) {
    return true;
  }

  // 3. Type matching
  if (token.type && token.type.toLowerCase().includes(cleanQuery)) {
    return true;
  }

  // 4. Value matching
  if (token.value !== undefined && token.value !== null) {
    if (typeof token.value === 'string' || typeof token.value === 'number') {
      const valStr = String(token.value).toLowerCase();
      if (valStr.includes(cleanQuery) || valStr.includes(aliasStripped)) {
        return true;
      }
    }
  }

  // 5. Resolved Value matching
  if (token.resolvedValue !== undefined && token.resolvedValue !== null) {
    if (typeof token.resolvedValue === 'string' || typeof token.resolvedValue === 'number') {
      const resolvedStr = String(token.resolvedValue).toLowerCase();
      if (resolvedStr.includes(cleanQuery) || resolvedStr.includes(aliasStripped)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Pure search function that returns filtered flat tokens matching the query.
 */
export function searchTokens(tokens: FlatToken[], query: string): FlatToken[] {
  if (!query || !query.trim()) {
    return tokens;
  }

  return tokens.filter(token => matchToken(token, query));
}

/**
 * Expands flat tokens including sub-properties of composite tokens for autocomplete/deep search.
 */
export function expandTokensForSearch(tokens: FlatToken[], currentPath?: string): SearchableToken[] {
  const results: SearchableToken[] = [];

  for (const t of tokens) {
    if (currentPath && t.path === currentPath) {
      continue;
    }

    results.push({
      path: t.path,
      type: t.type,
      resolvedValue: t.resolvedValue,
      sourceFile: t.sourceFile,
      isSubMember: false
    });

    if (t.value && typeof t.value === 'object' && !Array.isArray(t.value)) {
      const explore = (obj: any, prefix: string) => {
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          const subPath = `${prefix}.${key}`;
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            explore(val, subPath);
          } else {
            results.push({
              path: subPath,
              type: 'sub-prop',
              resolvedValue: val,
              sourceFile: t.sourceFile,
              isSubMember: true
            });
          }
        }
      };
      explore(t.value, t.path);
    }
  }

  return results;
}

/**
 * Filters expanded searchable tokens with query matching and ranking for autocomplete.
 */
export function filterSearchableTokens(
  searchableTokens: SearchableToken[],
  query: string,
  limit = 15
): SearchableToken[] {
  const trimmed = query ? query.toLowerCase().trim() : '';

  if (!trimmed) {
    return searchableTokens.slice(0, limit);
  }

  const cleanQuery = trimmed.replace(/^\{|\}$/g, '');

  const filtered = searchableTokens
    .filter(t => {
      const matchPath = t.path.toLowerCase().includes(cleanQuery);
      const matchAlias = `{${t.path.toLowerCase()}}`.includes(trimmed);
      const matchValue = String(t.resolvedValue).toLowerCase().includes(cleanQuery);
      return matchPath || matchAlias || matchValue;
    })
    .slice(0, limit);

  if (trimmed) {
    filtered.unshift({
      path: trimmed,
      type: 'custom',
      resolvedValue: trimmed,
      sourceFile: 'custom',
      isSubMember: false
    });
  }

  return filtered;
}
