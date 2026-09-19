import { FlatToken } from '../models/token.model';

export interface SearchableToken {
  path: string;
  type: string;
  value?: any;
  resolvedValue: any;
  sourceFile: string;
  isSubMember: boolean;
}

/**
 * Splits a search query into normalized lowercase terms using space, hyphen, and dot delimiters.
 * Strips curly braces commonly used for alias syntax ({color.brand}).
 */
export function extractSearchTerms(query: string): string[] {
  if (!query) {
    return [];
  }
  const clean = query.replace(/[{}]/g, ' ').trim().toLowerCase();
  if (!clean) {
    return [];
  }
  return clean.split(/[\s\-\.]+/).filter(Boolean);
}

/**
 * Checks if a token (flat or searchable) matches all search terms across path, alias, type, and values.
 */
function matchesTerms(
  item: { path: string; type?: string; value?: any; resolvedValue?: any },
  terms: string[]
): boolean {
  if (terms.length === 0) {
    return true;
  }

  const path = (item.path || '').toLowerCase();
  const aliasFormat = `{${path}}`;
  const type = item.type ? item.type.toLowerCase() : '';
  const valStr =
    item.value !== undefined && item.value !== null && (typeof item.value === 'string' || typeof item.value === 'number')
      ? String(item.value).toLowerCase()
      : '';
  const resolvedStr =
    item.resolvedValue !== undefined && item.resolvedValue !== null && (typeof item.resolvedValue === 'string' || typeof item.resolvedValue === 'number')
      ? String(item.resolvedValue).toLowerCase()
      : '';

  return terms.every(term => {
    return (
      path.includes(term) ||
      aliasFormat.includes(term) ||
      type.includes(term) ||
      (valStr !== '' && valStr.includes(term)) ||
      (resolvedStr !== '' && resolvedStr.includes(term))
    );
  });
}

/**
 * Checks if a FlatToken matches the given search query across multiple fields.
 * Supports multi-term order-independent matching across space, hyphen, and dot delimiters.
 */
export function matchToken(token: FlatToken, query: string): boolean {
  if (!query || !query.trim()) {
    return true;
  }

  const terms = extractSearchTerms(query);
  return matchesTerms(token, terms);
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
      value: t.value,
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
              value: val,
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
 * Filters expanded searchable tokens with multi-term order-independent query matching across space, hyphen, and dot delimiters.
 */
export function filterSearchableTokens(
  searchableTokens: SearchableToken[],
  query: string,
  limit = 15
): SearchableToken[] {
  const trimmed = query ? query.trim() : '';

  if (!trimmed) {
    return searchableTokens.slice(0, limit);
  }

  const terms = extractSearchTerms(trimmed);

  const filtered = searchableTokens
    .filter(t => matchesTerms(t, terms))
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
