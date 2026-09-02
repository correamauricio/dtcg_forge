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

  // Color mapping logic
  const isCtaOrPrimary = compLower.includes('cta') || compLower.includes('primary');
  if (isCtaOrPrimary && (impLower.includes('primary') || impLower.includes('brand') || impLower.includes('accent'))) {
    score += 25;
  }

  const isSecondary = compLower.includes('secondary');
  if (isSecondary && (impLower.includes('secondary') || impLower.includes('muted'))) {
    score += 25;
  }

  const isDanger = compLower.includes('danger') || compLower.includes('error');
  if (isDanger && (impLower.includes('danger') || impLower.includes('error') || impLower.includes('red'))) {
    score += 25;
  }

  const isSuccess = compLower.includes('success');
  if (isSuccess && (impLower.includes('success') || impLower.includes('green'))) {
    score += 25;
  }

  const isWarning = compLower.includes('warning');
  if (isWarning && (impLower.includes('warning') || impLower.includes('yellow') || impLower.includes('orange'))) {
    score += 25;
  }

  const isBackground = compLower.includes('bg') || compLower.includes('background') || compLower.includes('surface') || compLower.includes('page') || compLower.includes('panel') || compLower.includes('card');
  if (isBackground && (impLower.includes('bg') || impLower.includes('background') || impLower.includes('surface') || impLower.includes('base'))) {
    score += 10;
  }

  const isText = compLower.includes('text') || compLower.includes('foreground') || compLower.includes('ink') || compLower.includes('typography');
  if (isText && (impLower.includes('text') || impLower.includes('foreground') || impLower.includes('ink'))) {
    score += 10;
  }

  const isBorder = compLower.includes('border') || compLower.includes('ring') || compLower.includes('stroke');
  if (isBorder && (impLower.includes('border') || impLower.includes('ring') || impLower.includes('stroke'))) {
    score += 15;
  }

  // Sizing and Scale logic (spacing, radii, fontSize)
  const isSmall = compLower.match(/\b(sm|small)\b/);
  if (isSmall && impLower.match(/\b(sm|small|100|200)\b/)) {
    score += 15;
  }

  const isMedium = compLower.match(/\b(md|medium|base|main)\b/);
  if (isMedium && impLower.match(/\b(md|medium|base|main|400|500)\b/)) {
    score += 15;
  }

  const isLarge = compLower.match(/\b(lg|large|xl)\b/);
  if (isLarge && impLower.match(/\b(lg|large|xl|700|800|900)\b/)) {
    score += 15;
  }

  const isFull = compLower.match(/\b(full|circle|round)\b/);
  if (isFull && impLower.match(/\b(full|circle|round|9999)\b/)) {
    score += 15;
  }

  // Exact word match
  const compWords = compLower.split(/[.\-_]/);
  const impWords = impLower.split(/[.\-_]/);
  
  for (const cw of compWords) {
    if (impWords.includes(cw) && cw !== 'color' && cw !== 'preview' && cw !== 'global') {
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
