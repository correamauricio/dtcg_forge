import { FlatToken } from '../models/token.model';

// Dicionário de pesos (Scoring Engine)
const SCORING_RULES = [
  { keywords: ['primary', 'brand', 'accent'], weight: 10 },
  { keywords: ['surface', 'bg', 'background'], weight: 8 },
  { keywords: ['text', 'ink', 'foreground'], weight: 8 },
  { keywords: ['muted', 'secondary'], weight: 5 },
  { keywords: ['border', 'stroke'], weight: 7 },
  { keywords: ['cta', 'button'], weight: 6 } // cta/button words can attract interactive colors
];

/**
 * Calculates a match score between a component token path and an imported token path.
 */
function calculateScore(componentPath: string, importedPath: string): number {
  let score = 0;
  const compLower = componentPath.toLowerCase();
  const impLower = importedPath.toLowerCase();

  // Se ambos tiverem palavras parecidas, ganham pontos
  for (const rule of SCORING_RULES) {
    const compHasKeyword = rule.keywords.some(kw => compLower.includes(kw));
    const impHasKeyword = rule.keywords.some(kw => impLower.includes(kw));
    
    // Se o target token (ex: preview.button.cta.background) busca uma keyword 
    // e o token importado (ex: color.primary.main) TEM essa keyword (ex: primary vs cta - wait, they are different keywords)
    
    // Wait, the logic is: component token implies an *intent*. 
    // We need to map component intents to semantic intents.
    // Example: "cta.background" wants a primary/brand background.
    // Let's refine the scoring matrix.
  }

  // Simplified robust matrix for this specific scenario:
  // 1. If component token implies primary/action (cta, primary, brand) -> imported token gets points for primary/brand.
  const isCtaOrPrimary = compLower.includes('cta') || compLower.includes('primary');
  if (isCtaOrPrimary && (impLower.includes('primary') || impLower.includes('brand') || impLower.includes('accent'))) {
    score += 25;
  }

  // 2. If component token implies background (bg, background, surface) -> imported token gets points for surface/background/bg
  const isBackground = compLower.includes('bg') || compLower.includes('background') || compLower.includes('surface');
  if (isBackground && (impLower.includes('bg') || impLower.includes('background') || impLower.includes('surface'))) {
    score += 10;
  }

  // 3. If component implies text/foreground
  const isText = compLower.includes('text') || compLower.includes('foreground') || compLower.includes('ink');
  if (isText && (impLower.includes('text') || impLower.includes('foreground') || impLower.includes('ink'))) {
    score += 10;
  }
  
  // 4. Exact word match gives high points (ex: "surface" matching "surface")
  const compWords = compLower.split(/[.\-_]/);
  const impWords = impLower.split(/[.\-_]/);
  
  for (const cw of compWords) {
    if (impWords.includes(cw) && cw !== 'color' && cw !== 'preview') {
      score += 5;
    }
  }

  return score;
}

/**
 * Mutates (or returns a new array of) preview tokens, mapping them to the imported tokens
 * via aliases, based on heuristic weights.
 */
export function heuristicTokenMatch(importedTokens: FlatToken[], previewTokens: FlatToken[]): FlatToken[] {
  // We return a new array to avoid mutating the original
  const result: FlatToken[] = [];

  for (const pToken of previewTokens) {
    let bestScore = -1;
    let bestMatch: FlatToken | null = null;

    for (const iToken of importedTokens) {
      // Only match tokens of the same type if possible, or if one is missing type
      if (pToken.type && iToken.type && pToken.type !== iToken.type) {
        continue;
      }

      const score = calculateScore(pToken.path, iToken.path);
      // We pick the first one in case of a tie (Opção A)
      if (score > bestScore && score > 0) {
        bestScore = score;
        bestMatch = iToken;
      }
    }

    if (bestMatch) {
      // Create an alias reference
      result.push({
        ...pToken,
        value: `{${bestMatch.path}}`
      });
    } else {
      result.push({ ...pToken }); // unchanged
    }
  }

  return result;
}
