import { FlatToken } from '../models/token.model';

// -------------------------------------------------------------------------
// 1. Matriz de Compatibilidade de Tipos
// -------------------------------------------------------------------------
const TYPE_COMPATIBILITY: Record<string, string[]> = {
  color: ['color'],
  spacing: ['spacing', 'dimension', 'space', 'size'],
  borderRadius: ['borderRadius', 'dimension', 'radius', 'radii', 'corner'],
  borderWidth: ['borderWidth', 'dimension', 'stroke'],
  fontSize: ['fontSize', 'fontSizes', 'dimension', 'size'],
  fontFamily: ['fontFamily', 'font', 'typeface'],
  boxShadow: ['boxShadow', 'shadow', 'elevation']
};

function isTypeCompatible(previewType: string, importedType: string): boolean {
  if (previewType === importedType) return true;
  
  const pTypeCompat = TYPE_COMPATIBILITY[previewType] || [previewType];
  const iTypeCompat = TYPE_COMPATIBILITY[importedType] || [importedType];
  
  // Se algum alias de tipo for comum entre os dois, consideraremos compatível
  return pTypeCompat.some(pt => iTypeCompat.includes(pt));
}

// -------------------------------------------------------------------------
// 2. Dicionários Semânticos (Taxonomia)
// -------------------------------------------------------------------------
interface SemanticTaxonomy {
  role: 'intent' | 'surface' | 'content' | 'state' | 'border' | 'scale_canonical' | 'scale_minor' | 'size_small' | 'size_large';
  keywords: string[];
}

const TAXONOMY: SemanticTaxonomy[] = [
  { role: 'intent', keywords: ['primary', 'brand', 'accent', 'action', 'main', 'interactive', 'cta'] },
  { role: 'intent', keywords: ['danger', 'error', 'negative', 'destructive', 'critical', 'alert', 'red'] },
  { role: 'intent', keywords: ['success', 'positive', 'green', 'valid'] },
  { role: 'intent', keywords: ['warning', 'caution', 'attention', 'yellow', 'orange'] },
  { role: 'surface', keywords: ['background', 'bg', 'surface', 'canvas', 'layer', 'panel', 'card', 'base', 'page'] },
  { role: 'content', keywords: ['text', 'foreground', 'fg', 'content', 'label', 'ink', 'typography', 'on'] },
  { role: 'state', keywords: ['muted', 'subtle', 'secondary', 'tertiary', 'disabled', 'inactive'] },
  { role: 'border', keywords: ['border', 'stroke', 'divider', 'outline', 'ring'] },
  { role: 'scale_canonical', keywords: ['500', '600', '9', '10', 'base', 'md', 'medium'] },
  { role: 'scale_minor', keywords: ['100', '200', '300', '50'] },
  { role: 'size_small', keywords: ['sm', 'small', 'xs'] },
  { role: 'size_large', keywords: ['lg', 'large', 'xl', '2xl'] }
];

// Stopwords que não adicionam valor à heurística de desempate
const STOP_WORDS = new Set(['dtcg', 'color', 'colors', 'token', 'tokens', 'global', 'preview', 'val', 'value', 'var']);

// -------------------------------------------------------------------------
// 3. Tokenizer Léxico (NLP)
// -------------------------------------------------------------------------
function tokenizePath(path: string): string[] {
  return path
    .toLowerCase()
    .split(/[.\-_/]+/) // Quebra por ponto, traço, underscore ou barra
    .map(word => word.trim())
    .filter(word => word.length > 0 && !STOP_WORDS.has(word));
}

function classifyRoles(words: string[]): Set<string> {
  const roles = new Set<string>();
  for (const word of words) {
    // Exact match ou simple stemming like "buttons" -> "button"
    const normalizedWord = word.endsWith('s') && word.length > 3 ? word.slice(0, -1) : word;
    
    for (const taxon of TAXONOMY) {
      if (taxon.keywords.includes(normalizedWord) || taxon.keywords.includes(word)) {
        roles.add(taxon.role);
      }
    }
  }
  return roles;
}

// -------------------------------------------------------------------------
// 4. Classificação de Camadas (Tiering)
// -------------------------------------------------------------------------
function isSemanticTier(words: string[]): boolean {
  // Primitivos geralmente são "color.blue.500". 
  // Semânticos descrevem o uso: "button.primary.bg", "surface.card", "text.muted"
  const primitiveColors = new Set(['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'slate', 'zinc', 'neutral', 'stone', 'amber', 'lime', 'emerald', 'teal', 'cyan', 'sky', 'indigo', 'violet', 'fuchsia', 'rose']);
  
  // Se o caminho tiver predominantemente palavras de uso em vez de paletas genéricas puras
  const hasUsageWord = words.some(w => ['button', 'surface', 'text', 'bg', 'primary', 'action', 'card'].includes(w));
  const hasPrimitiveColor = words.some(w => primitiveColors.has(w));
  const hasNumberScale = words.some(w => !isNaN(Number(w)));

  if (hasUsageWord) return true;
  if (hasPrimitiveColor && hasNumberScale && !hasUsageWord) return false; // Puro primitivo
  
  return true; // Assume semântico por padrão caso não pareça primitivo explícito
}

// -------------------------------------------------------------------------
// 5. Motor de Pontuação e Desempate
// -------------------------------------------------------------------------
function calculateScore(compWords: string[], compRoles: Set<string>, impWords: string[], impRoles: Set<string>): number {
  let score = 0;

  const roleWeights: Record<string, number> = {
    intent: 50,
    surface: 30,
    content: 30,
    state: 20,
    border: 20,
    size_small: 10,
    size_large: 10,
    scale_canonical: 0,
    scale_minor: 0
  };

  // Semântica base: Se compartilham o mesmo role principal (ex: Intent, Surface, Content)
  for (const role of compRoles) {
    if (impRoles.has(role)) {
      score += roleWeights[role] || 15;
    }
  }

  // Similaridade Lexical (Quantas palavras exatas compartilham?)
  for (const cw of compWords) {
    // Normalizamos pluralização leve
    const cwNorm = cw.endsWith('s') && cw.length > 3 ? cw.slice(0, -1) : cw;
    const match = impWords.some(iw => {
      const iwNorm = iw.endsWith('s') && iw.length > 3 ? iw.slice(0, -1) : iw;
      return iwNorm === cwNorm || iw.includes(cw) || cw.includes(iw);
    });

    if (match) {
      score += 15;
    }
  }

  // Bônus para Semânticos
  if (isSemanticTier(impWords)) {
    score += 10;
  }

  // Tie-breaker para Escalas e Intenções (Fallback p/ primitivos)
  if (compRoles.has('intent')) {
     if (impRoles.has('scale_canonical')) {
       score += 20; // boost suficiente para cruzar o threshold se for a única paleta
     } else if (impRoles.has('scale_minor')) {
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
  const result: FlatToken[] = [];

  for (const pToken of previewTokens) {
    let bestScore = 0;
    let bestMatch: FlatToken | null = null;
    
    const compWords = tokenizePath(pToken.path);
    const compRoles = classifyRoles(compWords);

    for (const iToken of importedTokens) {
      if (pToken.type && iToken.type) {
        if (!isTypeCompatible(pToken.type, iToken.type)) {
          continue;
        }
      }

      const impWords = tokenizePath(iToken.path);
      const impRoles = classifyRoles(impWords);

      const score = calculateScore(compWords, compRoles, impWords, impRoles);

      // Desempate Estrito por Profundidade e Proximidade:
      if (score > bestScore) {
        bestScore = score;
        bestMatch = iToken;
      } else if (score === bestScore && score > 0 && bestMatch) {
        // Regra de desempate nominal:
        const currentDiff = Math.abs(compWords.length - impWords.length);
        const bestWords = tokenizePath(bestMatch.path);
        const bestDiff = Math.abs(compWords.length - bestWords.length);
        
        if (currentDiff < bestDiff) {
           bestMatch = iToken;
        }
      }
    }

    if (bestMatch && bestScore >= 15) {
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
