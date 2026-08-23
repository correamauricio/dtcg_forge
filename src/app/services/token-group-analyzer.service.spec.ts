import { TestBed } from '@angular/core/testing';
import { TokenGroupAnalyzerService } from './token-group-analyzer.service';

describe('TokenGroupAnalyzerService', () => {
  let service: TokenGroupAnalyzerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TokenGroupAnalyzerService]
    });
    service = TestBed.inject(TokenGroupAnalyzerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isPrimitiveColorGroup', () => {
    it('should return true when all leaf tokens are primitive colors', () => {
      const groupNode = {
        50: { _token: { type: 'color', value: '#fafafa', originalPath: ['colors', '50'] } },
        100: { _token: { type: 'color', value: '#f5f5f5', originalPath: ['colors', '100'] } }
      };
      expect(service.isPrimitiveColorGroup(groupNode)).toBe(true);
    });

    it('should return false if any leaf token is an alias', () => {
      const groupNode = {
        50: { _token: { type: 'color', value: '#fafafa', originalPath: ['colors', '50'] } },
        100: { _token: { type: 'color', value: '{base.gray.100}', originalPath: ['colors', '100'] } }
      };
      expect(service.isPrimitiveColorGroup(groupNode)).toBe(false);
    });

    it('should return false if any leaf token is not of type color', () => {
      const groupNode = {
        50: { _token: { type: 'color', value: '#fafafa', originalPath: ['colors', '50'] } },
        size: { _token: { type: 'dimension', value: '16px', originalPath: ['colors', 'size'] } }
      };
      expect(service.isPrimitiveColorGroup(groupNode)).toBe(false);
    });

    it('should return false for an empty group', () => {
      const groupNode = {};
      expect(service.isPrimitiveColorGroup(groupNode)).toBe(false);
    });

    it('should return false for nested groups (must be a flat group of colors)', () => {
      const groupNode = {
        blue: {
          500: { _token: { type: 'color', value: '#0055ff' } }
        }
      };
      expect(service.isPrimitiveColorGroup(groupNode)).toBe(false);
    });
  });
});
