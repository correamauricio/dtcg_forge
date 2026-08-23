import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

vi.mock('@material/material-color-utilities', () => {
  return {
    themeFromSourceColor: vi.fn(),
    argbFromHex: vi.fn(),
    hexFromArgb: (v: number) => '#000000',
    TonalPalette: { fromInt: vi.fn() }
  };
});
import { PrimitiveGroupNodeComponent } from './primitive-group-node.component';
import { By } from '@angular/platform-browser';
import { PaletteGeneratorService } from '../services/palette-generator.service';
import { PaletteConfigModalComponent } from './palette-config-modal.component';

describe('PrimitiveGroupNodeComponent', () => {
  let component: PrimitiveGroupNodeComponent;
  let fixture: ComponentFixture<PrimitiveGroupNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimitiveGroupNodeComponent, PaletteConfigModalComponent],
      providers: [
        {
          provide: PaletteGeneratorService,
          useValue: {
            getScript: vi.fn(),
            saveScript: vi.fn(),
            generate: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrimitiveGroupNodeComponent);
    component = fixture.componentInstance;
    
    // Default valid inputs
    component.node = {
      100: { _token: { type: 'color', value: '#fff', originalPath: ['colors', '100'] } },
      200: { _token: { type: 'color', value: '#eee', originalPath: ['colors', '200'] } }
    };
    component.nodeName = 'colors';
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start collapsed (compact mode) by default', () => {
    expect(component.isExpanded).toBe(false);
  });

  it('should toggle isExpanded when toggleExpanded is called', () => {
    component.toggleExpanded();
    expect(component.isExpanded).toBe(true);
    component.toggleExpanded();
    expect(component.isExpanded).toBe(false);
  });

  it('should render app-token-node when isExpanded is true', () => {
    component.isExpanded = true;
    fixture.detectChanges();
    const tokenNode = fixture.debugElement.query(By.css('app-token-node'));
    expect(tokenNode).toBeTruthy();
  });

  it('should emit selectToken when onSelectToken is called', () => {
    const spy = vi.spyOn(component.selectToken, 'emit');
    component.onSelectToken(['colors', '100']);
    expect(spy).toHaveBeenCalledWith({ path: ['colors', '100'] });
  });

  it('should call PaletteGeneratorService and emit updateToken for each generated color when onColorChange is called', () => {
    const paletteService = TestBed.inject(PaletteGeneratorService);
    const mockGeneratedPalette = {
      100: '#111111',
      200: '#222222'
    };
    const generateSpy = vi.spyOn(paletteService, 'generate').mockReturnValue(mockGeneratedPalette);
    const emitSpy = vi.spyOn(component.updateToken, 'emit');

    component.onColorChange(['colors', '100'], '#111111');

    expect(generateSpy).toHaveBeenCalledWith('#111111', '100', component.node);
    expect(emitSpy).toHaveBeenCalledTimes(2);
    expect(emitSpy).toHaveBeenCalledWith({ path: ['colors', '100'], value: '#111111' });
    expect(emitSpy).toHaveBeenCalledWith({ path: ['colors', '200'], value: '#222222' });
  });

    it('should fallback to single updateToken when PaletteGeneratorService throws an error', () => {
      const paletteService = TestBed.inject(PaletteGeneratorService);
      vi.spyOn(paletteService, 'generate').mockImplementation(() => {
        throw new Error('Script failed');
      });
      const emitSpy = vi.spyOn(component.updateToken, 'emit');

      // Suppress console.error for this expected error test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      component.onColorChange(['colors', '100'], '#555555');

      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith({ path: ['colors', '100'], value: '#555555' });
      
      consoleSpy.mockRestore();
    });
  describe('Modal Integration', () => {
    it('should open modal with current script when openConfig is called', () => {
      // Mock the service
      const paletteService = TestBed.inject(PaletteGeneratorService);
      vi.spyOn(paletteService, 'getScript').mockReturnValue('mock script');
      
      component.openConfig();
      fixture.detectChanges();
      
      expect(component.isConfigModalOpen).toBe(true);
      expect(component.generatorScript).toBe('mock script');
      
      const modal = fixture.debugElement.query(By.css('app-palette-config-modal'));
      expect(modal).toBeTruthy();
      expect(modal.componentInstance.isOpen).toBe(true);
      expect(modal.componentInstance.currentScript).toBe('mock script');
    });

    it('should save script and close modal when onSaveConfig is called', () => {
      const paletteService = TestBed.inject(PaletteGeneratorService);
      const saveSpy = vi.spyOn(paletteService, 'saveScript');
      
      component.isConfigModalOpen = true;
      component.onSaveConfig('new script');
      
      expect(saveSpy).toHaveBeenCalledWith('new script');
      expect(component.isConfigModalOpen).toBe(false);
    });

    it('should close modal without saving when onCancelConfig is called', () => {
      const paletteService = TestBed.inject(PaletteGeneratorService);
      const saveSpy = vi.spyOn(paletteService, 'saveScript');
      
      component.isConfigModalOpen = true;
      component.onCancelConfig();
      
      expect(saveSpy).not.toHaveBeenCalled();
      expect(component.isConfigModalOpen).toBe(false);
    });
  });
});
