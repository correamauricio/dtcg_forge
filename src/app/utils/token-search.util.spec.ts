import { describe, it, expect } from 'vitest';
import { FlatToken } from '../models/token.model';
import { searchTokens, matchToken, expandTokensForSearch, filterSearchableTokens } from './token-search.util';

describe('token-search.util', () => {
  const mockTokens: FlatToken[] = [
    {
      path: 'color.brand.primary',
      originalPath: ['color', 'brand', 'primary'],
      value: '#3b82f6',
      resolvedValue: '#3b82f6',
      type: 'color',
      sourceFile: 'core.json'
    },
    {
      path: 'color.brand.secondary',
      originalPath: ['color', 'brand', 'secondary'],
      value: '{color.blue.500}',
      resolvedValue: '#2563eb',
      type: 'color',
      sourceFile: 'core.json'
    },
    {
      path: 'spacing.sm',
      originalPath: ['spacing', 'sm'],
      value: 8,
      resolvedValue: 8,
      type: 'dimension',
      sourceFile: 'spacing.json'
    },
    {
      path: 'typography.heading-1',
      originalPath: ['typography', 'heading-1'],
      value: {
        fontFamily: 'Inter',
        fontSize: '32px',
        fontWeight: {
          bold: 700
        }
      },
      resolvedValue: {
        fontFamily: 'Inter',
        fontSize: '32px',
        fontWeight: {
          bold: 700
        }
      },
      type: 'typography',
      sourceFile: 'typography.json'
    }
  ];

  describe('matchToken', () => {
    it('returns true when query is empty or only whitespace', () => {
      expect(matchToken(mockTokens[0], '')).toBe(true);
      expect(matchToken(mockTokens[0], '   ')).toBe(true);
    });

    it('matches by token name or path segment', () => {
      expect(matchToken(mockTokens[0], 'primary')).toBe(true);
      expect(matchToken(mockTokens[0], 'brand')).toBe(true);
      expect(matchToken(mockTokens[0], 'color.brand')).toBe(true);
      expect(matchToken(mockTokens[0], 'nonexistent')).toBe(false);
    });

    it('matches by token value or resolved value (string and number)', () => {
      expect(matchToken(mockTokens[0], '#3b82f6')).toBe(true);
      expect(matchToken(mockTokens[1], '#2563eb')).toBe(true);
      expect(matchToken(mockTokens[2], '8')).toBe(true);
    });

    it('matches by alias syntax', () => {
      expect(matchToken(mockTokens[1], '{color.blue.500}')).toBe(true);
      expect(matchToken(mockTokens[1], 'color.blue.500')).toBe(true);
      expect(matchToken(mockTokens[0], '{color.brand.primary}')).toBe(true);
    });

    it('matches by token type', () => {
      expect(matchToken(mockTokens[0], 'color')).toBe(true);
      expect(matchToken(mockTokens[2], 'dimension')).toBe(true);
    });

    it('is case-insensitive and trims whitespace', () => {
      expect(matchToken(mockTokens[0], '  PRIMARY  ')).toBe(true);
      expect(matchToken(mockTokens[0], 'COLOR.BRAND.PRIMARY')).toBe(true);
    });
  });

  describe('searchTokens', () => {
    it('returns all tokens when query is empty or blank', () => {
      expect(searchTokens(mockTokens, '')).toEqual(mockTokens);
      expect(searchTokens(mockTokens, '   ')).toEqual(mockTokens);
    });

    it('filters tokens that match query', () => {
      const results = searchTokens(mockTokens, 'brand');
      expect(results.length).toBe(2);
      expect(results.map(r => r.path)).toEqual([
        'color.brand.primary',
        'color.brand.secondary'
      ]);
    });

    it('returns empty array when no token matches', () => {
      const results = searchTokens(mockTokens, 'xyz-non-existent');
      expect(results).toEqual([]);
    });
  });

  describe('expandTokensForSearch', () => {
    it('expands composite tokens into sub-member items recursively for autocomplete', () => {
      const expanded = expandTokensForSearch(mockTokens);
      const subMembers = expanded.filter(e => e.isSubMember);
      
      expect(subMembers.map(s => s.path)).toContain('typography.heading-1.fontFamily');
      expect(subMembers.map(s => s.path)).toContain('typography.heading-1.fontSize');
      expect(subMembers.map(s => s.path)).toContain('typography.heading-1.fontWeight.bold');
    });

    it('excludes currentPath when provided', () => {
      const expanded = expandTokensForSearch(mockTokens, 'color.brand.primary');
      expect(expanded.find(e => e.path === 'color.brand.primary')).toBeUndefined();
    });
  });

  describe('filterSearchableTokens', () => {
    it('returns initial slice when query is empty', () => {
      const expanded = expandTokensForSearch(mockTokens);
      const filtered = filterSearchableTokens(expanded, '');
      expect(filtered.length).toBeLessThanOrEqual(15);
      expect(filtered[0].path).toBe('color.brand.primary');
    });

    it('filters by alias syntax, path, and prepends custom item when query is provided', () => {
      const expanded = expandTokensForSearch(mockTokens);
      const filtered = filterSearchableTokens(expanded, '{color.brand.primary}');
      
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered[0].type).toBe('custom');
      expect(filtered[0].path).toBe('{color.brand.primary}');
      expect(filtered.some(f => f.path === 'color.brand.primary')).toBe(true);
    });

    it('filters by resolved value match', () => {
      const expanded = expandTokensForSearch(mockTokens);
      const filtered = filterSearchableTokens(expanded, '#3b82f6');
      expect(filtered.some(f => f.path === 'color.brand.primary')).toBe(true);
    });
  });
});
