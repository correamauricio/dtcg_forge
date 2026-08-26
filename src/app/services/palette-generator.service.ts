import { Injectable } from '@angular/core';
import { themeFromSourceColor, argbFromHex, hexFromArgb, TonalPalette, Blend } from '@material/material-color-utilities';

const STORAGE_KEY = 'dtcg_palette_generator_script';
const DEFAULT_SCRIPT = `
// The Material 3 Color Utilities are injected in the scope:
// themeFromSourceColor, argbFromHex, hexFromArgb, TonalPalette

// 1. Convert the seed color to ARGB
const seedArgb = argbFromHex(seedColor);

// 2. Generate an exact Tonal Palette from the seed color
// This preserves the exact chroma (saturation) of your seed color,
// unlike themeFromSourceColor which forces primary colors to be vibrant.
const palette = TonalPalette.fromInt(seedArgb);

// 4. Map the Material tonal palette to our token group
const newTokens = {};
for (const key of Object.keys(currentGroup)) {
  // Try to parse the key as a number (e.g., '100', '500')
  const tone = parseInt(key, 10);
  
  if (!isNaN(tone) && tone >= 0 && tone <= 1000) {
    // Material tonal palettes go from 0 to 100 (where 0 is black, 100 is white)
    // Often 500 in standard scales maps roughly to 40-50 in M3.
    // We do a simple mapping here: standard web scales (50-900) to M3 (100-10).
    const m3Tone = 100 - Math.round(tone / 10);
    const colorArgb = palette.tone(m3Tone);
    newTokens[key] = { value: hexFromArgb(colorArgb) };
  } else {
    // If it's not a standard numeric step, just return the seed color
    newTokens[key] = { value: seedColor };
  }
}

return newTokens;
`;

@Injectable({
  providedIn: 'root'
})
export class PaletteGeneratorService {

  constructor() { }

  getScript(): string {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_SCRIPT;
  }

  saveScript(script: string): void {
    localStorage.setItem(STORAGE_KEY, script);
  }

  generate(seedColor: string, tokenName: string, currentGroup: any): Record<string, any> {
    const scriptBody = this.getScript();
    
    try {
      // Create a new function with the necessary arguments injected,
      // as well as the Material 3 utilities so the user can call them without importing.
      const generatorFn = new Function(
        'seedColor', 
        'tokenName', 
        'currentGroup', 
        'themeFromSourceColor', 
        'argbFromHex', 
        'hexFromArgb',
        'TonalPalette',
        scriptBody
      );

      // Execute the function
      const result = generatorFn(
        seedColor, 
        tokenName, 
        currentGroup, 
        themeFromSourceColor, 
        argbFromHex, 
        hexFromArgb,
        TonalPalette
      );

      return result || {};
    } catch (e) {
      console.error('PaletteGeneratorService: Error executing custom script', e);
      throw e;
    }
  }

  findBaseColor(group: any): string | null {
    if (!group || typeof group !== 'object') return null;

    const getValue = (node: any) => node?.$value || node?.value;

    if (group['500'] && getValue(group['500'])) return getValue(group['500']);
    if (group['base'] && getValue(group['base'])) return getValue(group['base']);
    if (group['primary'] && getValue(group['primary'])) return getValue(group['primary']);

    // Ignore non-color nodes like '_token' metadata if it exists
    const keys = Object.keys(group).filter(k => k !== '_token');
    if (keys.length === 0) return null;

    // Sort keys alphabetically/numerically and pick the median
    keys.sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });

    const medianKey = keys[Math.floor(keys.length / 2)];
    return getValue(group[medianKey]) || null;
  }

  harmonizeColorPrimitiveGroups(fileContent: any, sourceGroupPath: string[], newSeedColorHex: string): any {
    const result = JSON.parse(JSON.stringify(fileContent)); // Deep clone
    const seedArgb = argbFromHex(newSeedColorHex);

    const traverse = (node: any, currentPath: string[]) => {
      if (!node || typeof node !== 'object') return;

      // Check if it's a leaf node (token)
      if (node.$value !== undefined || node.value !== undefined) return;

      // Ignore _token metadata
      if (currentPath[currentPath.length - 1] === '_token') return;

      // Check if this node is a Primitive Group
      const keys = Object.keys(node).filter(k => k !== '_token');
      if (keys.length > 0) {
        const isPrimitiveGroup = keys.every(k => {
          const child = node[k];
          if (!child || typeof child !== 'object') return false;
          // Must have a value
          if (child.$value === undefined && child.value === undefined) return false;
          const val = child.$value || child.value;
          // Must not be an alias
          if (typeof val === 'string' && val.includes('{')) return false;
          // If type is defined, it must be color
          if (child.$type && child.$type !== 'color') return false;
          return true;
        });

        // Also must contain at least one hex/rgb color
        const containsColor = keys.some(k => {
          const val = node[k].$value || node[k].value;
          return typeof val === 'string' && (val.startsWith('#') || val.startsWith('rgb'));
        });

        if (isPrimitiveGroup && containsColor) {
          // It's a Color Primitive Group
          // Check if it's the source group
          const isSourceGroup = currentPath.length === sourceGroupPath.length &&
            currentPath.every((val, index) => val === sourceGroupPath[index]);
            
          if (!isSourceGroup) {
            // Find base color
            const baseColorHex = this.findBaseColor(node);
            if (baseColorHex) {
              const baseArgb = argbFromHex(baseColorHex);
              const harmonizedArgb = Blend.harmonize(baseArgb, seedArgb);
              const harmonizedHex = hexFromArgb(harmonizedArgb);

              // Regenerate the group using the harmonized base color
              // Assuming tokenName can be the last part of the path
              const tokenName = currentPath[currentPath.length - 1] || 'color';
              const newTokens = this.generate(harmonizedHex, tokenName, node);
              
              // Replace children with generated tokens
              for (const key of Object.keys(newTokens)) {
                if (node[key]) {
                  const generatedVal = typeof newTokens[key] === 'object' && newTokens[key].value 
                    ? newTokens[key].value 
                    : newTokens[key];
                    
                  if (node[key].$value !== undefined) {
                    node[key].$value = generatedVal;
                  } else {
                    node[key].value = generatedVal;
                  }
                }
              }
            }
          }
          return; // Stop traversing deeper if it's a Primitive Group
        }
      }

      // Continue traversing
      for (const key of Object.keys(node)) {
        traverse(node[key], [...currentPath, key]);
      }
    };

    traverse(result, []);
    return result;
  }
}
