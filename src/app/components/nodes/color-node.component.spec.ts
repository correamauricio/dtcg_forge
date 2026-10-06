import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorNodeComponent } from './color-node.component';
import { AliasAutocompleteComponent } from '../alias-autocomplete.component';
import { TokenService } from '../../services/token.service';

describe('ColorNodeComponent', () => {
  let component: ColorNodeComponent;
  let fixture: ComponentFixture<ColorNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorNodeComponent, AliasAutocompleteComponent],
      providers: [
        {
          provide: TokenService,
          useValue: {
            allFlatTokens: () => []
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ColorNodeComponent);
    component = fixture.componentInstance;
    component.token = { value: '#000000', originalPath: ['path', 'to', 'color'], path: 'path.to.color' } as any;
    fixture.detectChanges();
  });

  it('should only commit token update when color picker interaction is finalized on change event, ignoring intermediate drag input events', () => {
    const emitSpy = vi.spyOn(component.updateToken, 'emit');
    
    const colorPickerEl: HTMLInputElement = fixture.nativeElement.querySelector('input[type="color"]');
    
    // Simulate user dragging cursor across the color spectrum (fires continuous input events)
    colorPickerEl.value = '#111111';
    colorPickerEl.dispatchEvent(new Event('input'));

    colorPickerEl.value = '#222222';
    colorPickerEl.dispatchEvent(new Event('input'));

    colorPickerEl.value = '#333333';
    colorPickerEl.dispatchEvent(new Event('input'));

    // Intermediate color adjustments while dragging should NOT emit memento updates
    expect(emitSpy).not.toHaveBeenCalled();

    // User releases mouse click / finalizes color selection
    colorPickerEl.dispatchEvent(new Event('change'));
    
    // Should emit only once with the finalized color
    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith({ path: ['path', 'to', 'color'], value: '#333333' });
  });

  it('should display clean alias path in the text input without curly braces when color token is an alias', async () => {
    component.token = {
      value: '{color.brand.primary}',
      resolvedValue: '#3b82f6',
      originalPath: ['color', 'brand', 'primary'],
      path: 'color.brand.primary',
      type: 'color'
    } as any;
    fixture.detectChanges();
    await fixture.whenStable();

    const textInputEl: HTMLInputElement = fixture.nativeElement.querySelector('app-alias-autocomplete input');
    expect(textInputEl.value).toBe('color.brand.primary');
  });

  it('should preserve alias semantics upon committing an alias update', () => {
    const emitSpy = vi.spyOn(component.updateToken, 'emit');

    component.onValueCommit('{color.brand.secondary}');

    expect(emitSpy).toHaveBeenCalledWith({
      path: ['path', 'to', 'color'],
      value: '{color.brand.secondary}'
    });
  });

  it('should preserve raw hex color upon committing a hex update', () => {
    const emitSpy = vi.spyOn(component.updateToken, 'emit');

    component.onValueCommit('#1d4ed8');

    expect(emitSpy).toHaveBeenCalledWith({
      path: ['path', 'to', 'color'],
      value: '#1d4ed8'
    });
  });
});

