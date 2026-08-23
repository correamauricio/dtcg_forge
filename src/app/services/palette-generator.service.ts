import { Injectable } from '@angular/core';
import { themeFromSourceColor, argbFromHex, hexFromArgb } from '@material/material-color-utilities';

const STORAGE_KEY = 'dtcg_palette_generator_script';
const DEFAULT_SCRIPT = `
// The Material 3 Color Utilities are injected in the scope:
// themeFromSourceColor, argbFromHex, hexFromArgb

// 1. Convert the seed color to ARGB
const seedArgb = argbFromHex(seedColor);

// 2. Generate the M3 Theme
const theme = themeFromSourceColor(seedArgb);

// 3. Extract the primary palette (or any palette you prefer)
const palette = theme.palettes.primary;

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
        scriptBody
      );

      // Execute the function
      const result = generatorFn(
        seedColor, 
        tokenName, 
        currentGroup, 
        themeFromSourceColor, 
        argbFromHex, 
        hexFromArgb
      );

      return result || {};
    } catch (e) {
      console.error('PaletteGeneratorService: Error executing custom script', e);
      throw e;
    }
  }
}
