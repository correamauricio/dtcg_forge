import { TestBed } from '@angular/core/testing';
import { PaletteGeneratorService } from './palette-generator.service';

vi.mock('@material/material-color-utilities', () => {
  return {
    themeFromSourceColor: vi.fn(),
    argbFromHex: vi.fn(),
    hexFromArgb: (v: number) => '#000000',
    TonalPalette: { fromInt: vi.fn() }
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
      expect(result['result']).toBe('#000000');
    });

    it('should throw an error if the script has invalid syntax', () => {
      const invalidScript = 'return { ;;; }';
      service.saveScript(invalidScript);
      
      expect(() => {
        service.generate('#000', '50', {});
      }).toThrow();
    });
  });
});
