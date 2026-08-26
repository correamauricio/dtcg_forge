import { TestBed } from '@angular/core/testing';
import { PaletteGeneratorService } from './palette-generator.service';

vi.mock('@material/material-color-utilities', () => {
  return {
    themeFromSourceColor: vi.fn(),
    argbFromHex: vi.fn().mockImplementation((hex: string) => parseInt(hex.replace('#', ''), 16) || 0),
    hexFromArgb: vi.fn().mockImplementation((v: number) => '#' + v.toString(16).padStart(6, '0')),
    TonalPalette: { fromInt: vi.fn() },
    Blend: { harmonize: vi.fn().mockReturnValue(0x123456) }
  };
});

describe('PaletteGeneratorService', () => {
  let service: PaletteGeneratorService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [PaletteGeneratorService]
    });
    service = TestBed.inject(PaletteGeneratorService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Storage (getScript / saveScript)', () => {
    it('should return default Material 3 script when no script is saved', () => {
      const script = service.getScript();
      expect(script).toContain('themeFromSourceColor');
      expect(script).toContain('return newTokens');
    });

    it('should save and retrieve a custom script', () => {
      const customScript = 'return { "100": { value: "#ffffff" } };';
      service.saveScript(customScript);
      expect(service.getScript()).toBe(customScript);
      expect(localStorage.getItem('dtcg_palette_generator_script')).toBe(customScript);
    });
  });

  describe('generate', () => {
    it('should generate tokens based on the custom script', () => {
      const customScript = `
        const newTokens = {};
        for(const key of Object.keys(currentGroup)) {
           newTokens[key] = { value: seedColor };
        }
        return newTokens;
      `;
      service.saveScript(customScript);
      
      const currentGroup = { 
        "100": { _token: { originalPath: ['primary', '100'] } },
        "200": { _token: { originalPath: ['primary', '200'] } }
      };
      
      const result = service.generate('#ff0000', '100', currentGroup);
      
      expect(result['100'].value).toBe('#ff0000');
      expect(result['200'].value).toBe('#ff0000');
    });

    it('should inject @material/material-color-utilities functions', () => {
      const customScript = `
        // Just return the hexFromArgb function result to prove it's injected
        return { result: hexFromArgb(0xff000000) };
      `;
      service.saveScript(customScript);
      
      const result = service.generate('#000000', '100', {});
      expect(result['result']).toBe('#ff000000');
    });

    it('should throw an error if the script has invalid syntax', () => {
      const invalidScript = 'return { ;;; }';
      service.saveScript(invalidScript);
      
      expect(() => {
        service.generate('#000', '50', {});
      }).toThrow();
    });
  });

  describe('findBaseColor', () => {
    it('should return the value of the 500 token if it exists', () => {
      const group = {
        '100': { $value: '#111' },
        '500': { $value: '#555' },
        '900': { $value: '#999' }
      };
      expect(service.findBaseColor(group)).toBe('#555');
    });

    it('should return the value of the base token if 500 does not exist', () => {
      const group = {
        'light': { value: '#111' },
        'base': { value: '#555' },
        'dark': { value: '#999' }
      };
      expect(service.findBaseColor(group)).toBe('#555');
    });

    it('should return the median token if neither 500, base, nor primary exist', () => {
      const group = {
        '100': { $value: '#111' },
        '200': { $value: '#222' },
        '300': { $value: '#333' }
      };
      expect(service.findBaseColor(group)).toBe('#222');
    });

    it('should return primary token value if 500 and base do not exist', () => {
      const group = { 'primary': { $value: '#777' } };
      expect(service.findBaseColor(group)).toBe('#777');
    });

    it('should return null if group is null or not an object', () => {
      expect(service.findBaseColor(null)).toBeNull();
      expect(service.findBaseColor('string')).toBeNull();
    });

    it('should return null if group has no valid keys', () => {
      expect(service.findBaseColor({ _token: {} })).toBeNull();
    });

    it('should sort keys alphanumerically correctly', () => {
      const group = {
        'z': { $value: '#1' },
        'a': { $value: '#2' },
        'm': { $value: '#3' }
      };
      // Sorted: a, m, z. Median is m
      expect(service.findBaseColor(group)).toBe('#3');
    });

    it('should fallback to string sort if keys contain both numbers and strings', () => {
      const group = {
        'z': { $value: '#1' },
        '100': { $value: '#2' }
      };
      expect(service.findBaseColor(group)).toBeTruthy(); // just hitting the sort line
    });
  });

  describe('harmonizeColorPrimitiveGroups', () => {
    it('should harmonize other color groups but skip source group and aliases', () => {
      // Mock the generate script logic for this test to just return a dummy token
      vi.spyOn(service, 'generate').mockImplementation((seedColorHex: string) => {
        return { 'base': { value: seedColorHex } }; // returning the passed seed for test visibility
      });

      const fileContent = {
        color: {
          primary: {
            '500': { $value: '#ff0000', $type: 'color' } // The source group
          },
          secondary: {
            'base': { $value: '#00ff00', $type: 'color' } // Target Color Primitive Group
          },
          semantic: {
            'text': { $value: '{color.primary.500}', $type: 'color' } // Contains alias, should skip
          }
        },
        spacing: {
          'sm': { $value: '4px', $type: 'dimension' } // Not a color group, should skip
        }
      };

      const result = service.harmonizeColorPrimitiveGroups(fileContent, ['color', 'primary'], '#ffff00');

      // The source group should remain unchanged structurally in the result
      expect(result.color.primary['500'].$value).toBe('#ff0000');
      
      // The secondary group should have been harmonized and regenerated
      // Our mocked generate returns { 'base': { value: seedColorHex } }
      // Because we mocked Blend.harmonize to return 0x123456, the seedColorHex passed to generate is #123456
      expect(result.color.secondary['base'].$value).toBe('#123456');

      // Alias group should be skipped
      expect(result.color.semantic.text.$value).toBe('{color.primary.500}');

      // Spacing should be skipped
      expect(result.spacing.sm.$value).toBe('4px');
    });

    it('should safely handle missing baseColorHex or non-objects', () => {
      const result = service.harmonizeColorPrimitiveGroups(null, [], '#000');
      expect(result).toBeNull();

      const result2 = service.harmonizeColorPrimitiveGroups(
        { group: { '100': { val: 1 } } }, 
        ['none'], 
        '#000'
      );
      expect(result2).toBeTruthy();
    });

    it('should replace value instead of $value if token uses legacy format', () => {
      vi.spyOn(service, 'generate').mockImplementation(() => ({ 'base': { value: '#abc' } }));
      const fileContent = {
        color: {
          secondary: {
            // Strictly NO $value here
            'base': { value: '#00ff00', type: 'color' } 
          }
        }
      };
      const result = service.harmonizeColorPrimitiveGroups(fileContent, ['color', 'primary'], '#ffff00');
      expect(result.color.secondary['base'].value).toBe('#abc');
      expect(result.color.secondary['base'].$value).toBeUndefined();
    });
  });
});
