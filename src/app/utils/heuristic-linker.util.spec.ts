import { heuristicTokenMatch } from './heuristic-linker.util';
import { FlatToken } from '../models/token.model';

describe('Heuristic Token Linker (NLP-based)', () => {
  
  function createToken(path: string, type: string = 'color'): FlatToken {
    return {
      path,
      originalPath: path.split('.'),
      value: 'dummy',
      resolvedValue: 'dummy',
      type,
      sourceFile: 'test.json'
    };
  }

  it('should match a component token to the best imported token using semantic intent', () => {
    const importedTokens: FlatToken[] = [
      createToken('color.background.surface'),
      createToken('color.primary.main'),
      createToken('color.text.muted'),
      createToken('color.danger.main'),
      createToken('spacing.sm', 'spacing'),
      createToken('border.radius.full', 'borderRadius')
    ];

    const previewTokens: FlatToken[] = [
      createToken('preview.button.cta.background'),
      createToken('preview.button.danger.background'),
      createToken('preview.card.surface'),
      createToken('preview.global.spacing.sm', 'spacing'),
      createToken('preview.global.borderRadius.full', 'borderRadius')
    ];

    const result = heuristicTokenMatch(importedTokens, previewTokens);

    expect(result.find(t => t.path === 'preview.button.cta.background')?.value).toBe('{color.primary.main}');
    expect(result.find(t => t.path === 'preview.button.danger.background')?.value).toBe('{color.danger.main}');
    expect(result.find(t => t.path === 'preview.card.surface')?.value).toBe('{color.background.surface}');
    expect(result.find(t => t.path === 'preview.global.spacing.sm')?.value).toBe('{spacing.sm}');
    expect(result.find(t => t.path === 'preview.global.borderRadius.full')?.value).toBe('{border.radius.full}');
  });

  it('should prefer canonical scales (e.g. 500) over minor scales (e.g. 50) for intent elements', () => {
    const importedTokens = [
      createToken('blue.50'),
      createToken('blue.100'),
      createToken('blue.500'), // Canonical
      createToken('blue.900')
    ];
    // CTA should prefer 500
    const previewTokens = [createToken('button.primary.background')];
    const result = heuristicTokenMatch(importedTokens, previewTokens);

    expect(result[0].value).toBe('{blue.500}');
  });

  it('should prefer semantic tokens over generic primitive tokens', () => {
    const importedTokens = [
      createToken('color.blue.500'), // primitive
      createToken('button.primary.bg') // semantic
    ];
    const previewTokens = [createToken('preview.button.cta.background')];
    const result = heuristicTokenMatch(importedTokens, previewTokens);

    // Should pick the semantic token because of the semantic tiering bonus and shared taxonomy
    expect(result[0].value).toBe('{button.primary.bg}');
  });

  it('should not be fooled by false-positive substring matches (e.g. pink is not text ink)', () => {
    const importedTokens = [
      createToken('color.pink.500'), // "pink" has "ink" inside it
      createToken('color.text.main') // Correct text color
    ];
    const previewTokens = [createToken('typography.main')]; // expects text/ink/foreground
    const result = heuristicTokenMatch(importedTokens, previewTokens);

    expect(result[0].value).toBe('{color.text.main}');
  });

  it('should cross-match compatible types like dimension and spacing', () => {
    const importedTokens = [
      createToken('size.small', 'dimension') // Using DTCG 'dimension'
    ];
    const previewTokens = [
      createToken('global.spacing.sm', 'spacing') // Using specific 'spacing'
    ];
    const result = heuristicTokenMatch(importedTokens, previewTokens);

    expect(result[0].value).toBe('{size.small}');
  });

  it('should resolve tie-breaks using path depth and nominal differences', () => {
    const importedTokens = [
      createToken('surface.card.base'),
      createToken('surface.card') 
    ];
    const previewTokens = [createToken('preview.card.surface')]; 
    // "preview.card.surface" has 3 words
    // "surface.card" has 2 words (diff: 1)
    // "surface.card.base" has 3 words (diff: 0) -> this should win if scores are identical
    
    // Wait, let's see how scores play out:
    // preview.card.surface roles: surface
    // surface.card.base roles: surface (base is in surface) -> wait, base is surface!
    // surface.card roles: surface
    // surface.card.base might score slightly higher due to "base" sharing roles or lexical? 
    // Let's use words that don't add score, just depth:
    
    const importedTokensTie = [
      createToken('color.primary.main'),
      createToken('color.primary')
    ];
    const previewTokensTie = [createToken('preview.primary.main')];
    // Words for preview: ['primary', 'main'] (preview removed as stopword) -> length = 2
    // Words for color.primary.main: ['primary', 'main'] -> length = 2
    // Words for color.primary: ['primary'] -> length = 1
    // Lexical match gives more score for 'main', so color.primary.main wins easily anyway.
    
    // Let's force an exact tie in score:
    const impTie2 = [
      createToken('palette.blue.500'),
      createToken('blue.500')
    ];
    // Words: ['palette', 'blue', '500'] vs ['blue', '500']
    const prevTie2 = [createToken('btn.blue.500')];
    // Words: ['btn', 'blue', '500'] -> length = 3
    // 'blue' and '500' match lexically. Both get same score (same roles, same lexical matches).
    // prevTie2 length 3. 'palette.blue.500' length 3. 'blue.500' length 2.
    // 'palette.blue.500' should win because the depth difference is smaller (0 vs 1).
    const result2 = heuristicTokenMatch(impTie2, prevTie2);
    expect(result2[0].value).toBe('{palette.blue.500}');
  });
});
