import { heuristicTokenMatch } from './heuristic-linker.util';
import { FlatToken } from '../models/token.model';

describe('Heuristic Token Linker', () => {
  it('should match a component token to the best imported token using heuristic weights', () => {
    const importedTokens: FlatToken[] = [
      { path: 'color.background.surface', originalPath: ['color', 'background', 'surface'], value: '#ffffff', resolvedValue: '#ffffff', type: 'color', sourceFile: 'imported.json' },
      { path: 'color.primary.main', originalPath: ['color', 'primary', 'main'], value: '#3b82f6', resolvedValue: '#3b82f6', type: 'color', sourceFile: 'imported.json' },
      { path: 'color.text.muted', originalPath: ['color', 'text', 'muted'], value: '#6b7280', resolvedValue: '#6b7280', type: 'color', sourceFile: 'imported.json' }
    ];

    const previewTokens: FlatToken[] = [
      { path: 'preview.button.cta.background', originalPath: ['preview', 'button', 'cta', 'background'], value: '#000000', resolvedValue: '#000000', type: 'color', sourceFile: 'default-preview-sheet.json' },
      { path: 'preview.card.surface', originalPath: ['preview', 'card', 'surface'], value: '#ffffff', resolvedValue: '#ffffff', type: 'color', sourceFile: 'default-preview-sheet.json' }
    ];

    const result = heuristicTokenMatch(importedTokens, previewTokens);

    // Expect the CTA background to match color.primary.main (has 'primary' score)
    const ctaToken = result.find(t => t.path === 'preview.button.cta.background');
    expect(ctaToken?.value).toBe('{color.primary.main}');

    // Expect card surface to match color.background.surface (has 'surface' score)
    const cardToken = result.find(t => t.path === 'preview.card.surface');
    expect(cardToken?.value).toBe('{color.background.surface}');
  });
});
