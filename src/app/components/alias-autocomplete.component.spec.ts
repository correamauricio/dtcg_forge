import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AliasAutocompleteComponent } from './alias-autocomplete.component';
import { TokenService } from '../services/token.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { FlatToken } from '../models/token.model';

describe('AliasAutocompleteComponent', () => {
  let component: AliasAutocompleteComponent;
  let fixture: ComponentFixture<AliasAutocompleteComponent>;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const mockTokens: FlatToken[] = [
    {
      path: 'color.brand.primary',
      originalPath: ['color', 'brand', 'primary'],
      value: '#3b82f6',
      resolvedValue: '#3b82f6',
      type: 'color',
      sourceFile: 'core.json'
    },
    {
      path: 'color.brand.secondary',
      originalPath: ['color', 'brand', 'secondary'],
      value: '#1d4ed8',
      resolvedValue: '#1d4ed8',
      type: 'color',
      sourceFile: 'core.json'
    },
    {
      path: 'spacing.sm',
      originalPath: ['spacing', 'sm'],
      value: '8px',
      resolvedValue: '8px',
      type: 'dimension',
      sourceFile: 'core.json'
    },
    {
      path: 'opacity.half',
      originalPath: ['opacity', 'half'],
      value: 0.5,
      resolvedValue: 0.5,
      type: 'number',
      sourceFile: 'core.json'
    },
    {
      path: 'typography.font-family',
      originalPath: ['typography', 'font-family'],
      value: 'Inter, sans-serif',
      resolvedValue: 'Inter, sans-serif',
      type: 'string',
      sourceFile: 'core.json'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AliasAutocompleteComponent],
      providers: [
        {
          provide: TokenService,
          useValue: {
            allFlatTokens: () => mockTokens
          }
        }
      ]
    }).compileComponents();

    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();
    fixture = TestBed.createComponent(AliasAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should select all text in the input when clicked by the user for fast editing', async () => {
    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
    component.value = 'border.radius.sm';
    fixture.detectChanges();
    await fixture.whenStable();

    inputEl.dispatchEvent(new Event('click'));

    expect(inputEl.selectionStart).toBe(0);
    expect(inputEl.selectionEnd).toBe('border.radius.sm'.length);
  });

  it('should mirror the user input as the first suggestion in the autocomplete dropdown', () => {
    const typedValue = 'custom-raw-value';

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
    inputEl.value = typedValue;
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const options = component.matchingTokens();
    expect(options.length).toBeGreaterThan(0);
    expect(options[0].path).toBe(typedValue);
    expect(options[0].type).toBe('custom');
  });

  it('should extract query when input includes alias prefix {', () => {
    component.onInputChange('{color.brand');
    expect(component.filterQuery()).toBe('color.brand');
    expect(component.isOpen()).toBe(true);
  });

  it('should emit valueCommit on blur', () => {
    const spy = vi.spyOn(component.valueCommit, 'emit');
    component.value = '#ffffff';
    component.onBlur();
    expect(spy).toHaveBeenCalledWith('#ffffff');
  });

  it('should format token as alias when selecting non-custom token', () => {
    const changeSpy = vi.spyOn(component.valueChange, 'emit');
    const commitSpy = vi.spyOn(component.valueCommit, 'emit');

    component.selectToken({ path: 'color.brand.primary', type: 'color' });

    expect(component.value).toBe('{color.brand.primary}');
    expect(changeSpy).toHaveBeenCalledWith('{color.brand.primary}');
    expect(commitSpy).toHaveBeenCalledWith('{color.brand.primary}');
    expect(component.isOpen()).toBe(false);
  });

  it('should format token as raw value when selecting custom token', () => {
    component.selectToken({ path: 'custom-text', type: 'custom' });
    expect(component.value).toBe('custom-text');
    expect(component.isOpen()).toBe(false);
  });

  it('should navigate suggestions with ArrowDown, ArrowUp, and select with Enter', () => {
    component.isOpen.set(true);
    component.filterQuery.set('brand');

    const keyboardEventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    component.onKeyDown(keyboardEventDown);
    expect(component.selectedIndex()).toBe(1);

    const keyboardEventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    component.onKeyDown(keyboardEventUp);
    expect(component.selectedIndex()).toBe(0);

    const commitSpy = vi.spyOn(component.valueCommit, 'emit');
    const keyboardEventEnter = new KeyboardEvent('keydown', { key: 'Enter' });
    component.onKeyDown(keyboardEventEnter);
    expect(commitSpy).toHaveBeenCalled();
  });

  it('should close dropdown on Escape or Tab', () => {
    component.isOpen.set(true);
    component.onKeyDown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.isOpen()).toBe(false);

    component.isOpen.set(true);
    component.onKeyDown(new KeyboardEvent('keydown', { key: 'Tab' }));
    expect(component.isOpen()).toBe(false);
  });

  it('should open dropdown when closed and ArrowDown or { is pressed', () => {
    component.isOpen.set(false);
    component.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(component.isOpen()).toBe(true);

    component.isOpen.set(false);
    component.onKeyDown(new KeyboardEvent('keydown', { key: '{' }));
    expect(component.isOpen()).toBe(true);
  });

  it('should close popover on popover closed event', () => {
    component.isOpen.set(true);
    component.onPopoverClosed();
    expect(component.isOpen()).toBe(false);
  });

  it('should open and extract query on focus', () => {
    component.value = '{brand';
    component.onFocus();
    expect(component.isOpen()).toBe(true);
    expect(component.filterQuery()).toBe('brand');
  });

  it('should scroll input to the end on blur and initialization', async () => {
    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
    component.value = '{very.long.token.path.expression.for.testing}';
    component.onBlur();

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(inputEl.scrollLeft).toBe(inputEl.scrollWidth);
  });

  it('should scroll the selected item into view when navigating with ArrowDown and ArrowUp', () => {
    const scrollSpy = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollSpy;

    component.isOpen.set(true);
    component.filterQuery.set('brand');
    fixture.detectChanges();

    const maxIndex = component.matchingTokens().length - 1;

    // ArrowDown moves from 0 to 1
    const keyboardEventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    component.onKeyDown(keyboardEventDown);

    expect(component.selectedIndex()).toBe(1);
    expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest' });
    expect((scrollSpy.mock.contexts[0] as HTMLElement).getAttribute('data-index')).toBe('1');

    scrollSpy.mockClear();

    // ArrowUp moves from 1 back to 0
    const keyboardEventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    component.onKeyDown(keyboardEventUp);

    expect(component.selectedIndex()).toBe(0);
    expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest' });
    expect((scrollSpy.mock.contexts[0] as HTMLElement).getAttribute('data-index')).toBe('0');

    scrollSpy.mockClear();

    // ArrowUp from 0 wraps to the last item
    component.onKeyDown(keyboardEventUp);

    expect(component.selectedIndex()).toBe(maxIndex);
    expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest' });
    expect((scrollSpy.mock.contexts[0] as HTMLElement).getAttribute('data-index')).toBe(String(maxIndex));

    scrollSpy.mockClear();

    // ArrowDown from last item wraps back to 0
    component.onKeyDown(keyboardEventDown);

    expect(component.selectedIndex()).toBe(0);
    expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest' });
    expect((scrollSpy.mock.contexts[0] as HTMLElement).getAttribute('data-index')).toBe('0');
  });

  it('should prevent default on mousedown on suggestion item to avoid premature blur', () => {
    component.isOpen.set(true);
    fixture.detectChanges();

    const button = document.querySelector('.cdk-overlay-container button') as HTMLButtonElement;
    expect(button).toBeTruthy();

    const mousedownEvent = new MouseEvent('mousedown', { cancelable: true, bubbles: true });
    button.dispatchEvent(mousedownEvent);

    expect(mousedownEvent.defaultPrevented).toBe(true);
  });

  it('should select token immediately with a single click and emit valueCommit', () => {
    const commitSpy = vi.spyOn(component.valueCommit, 'emit');
    component.isOpen.set(true);
    fixture.detectChanges();

    const button = document.querySelector('.cdk-overlay-container button') as HTMLButtonElement;
    expect(button).toBeTruthy();

    button.click();

    expect(component.value).toBe('{color.brand.primary}');
    expect(commitSpy).toHaveBeenCalledWith('{color.brand.primary}');
    expect(component.isOpen()).toBe(false);
  });

  it('should display resolvedValue in suggestions popover for dimension, number, and string tokens', () => {
    component.isOpen.set(true);
    component.filterQuery.set('');
    fixture.detectChanges();

    const buttons = Array.from(overlayContainerElement.querySelectorAll('button'));

    // Find dimension token suggestion
    const dimensionBtn = buttons.find(btn => btn.textContent?.includes('spacing.sm'));
    expect(dimensionBtn).toBeDefined();
    const dimensionResolved = dimensionBtn?.querySelector('.token-resolved-value');
    expect(dimensionResolved).toBeTruthy();
    expect(dimensionResolved?.textContent?.trim()).toBe('8px');

    // Find number token suggestion
    const numberBtn = buttons.find(btn => btn.textContent?.includes('opacity.half'));
    expect(numberBtn).toBeDefined();
    const numberResolved = numberBtn?.querySelector('.token-resolved-value');
    expect(numberResolved).toBeTruthy();
    expect(numberResolved?.textContent?.trim()).toBe('0.5');

    // Find string token suggestion
    const stringBtn = buttons.find(btn => btn.textContent?.includes('typography.font-family'));
    expect(stringBtn).toBeDefined();
    const stringResolved = stringBtn?.querySelector('.token-resolved-value');
    expect(stringResolved).toBeTruthy();
    expect(stringResolved?.textContent?.trim()).toBe('Inter, sans-serif');
  });

  it('should not display resolvedValue text for color tokens, only rendering the color swatch', () => {
    component.isOpen.set(true);
    component.filterQuery.set('');
    fixture.detectChanges();

    const buttons = Array.from(overlayContainerElement.querySelectorAll('button'));
    const colorBtn = buttons.find(btn =>
      btn.querySelector('.font-mono.font-medium')?.textContent?.trim() === 'color.brand.primary'
    );
    expect(colorBtn).toBeDefined();

    // Color swatch should exist
    const swatch = colorBtn?.querySelector('span.rounded-full');
    expect(swatch).toBeTruthy();

    // Resolved value text element should NOT exist for color tokens
    const colorResolved = colorBtn?.querySelector('.token-resolved-value');
    expect(colorResolved).toBeNull();

    // Button text content should not display the raw color hex value
    expect(colorBtn?.textContent).not.toContain('#3b82f6');
  });

  describe('Clean alias path display without curly braces', () => {
    it('should display the clean token path without curly braces when value is an alias', async () => {
      component.value = '{color.brand.primary}';
      fixture.detectChanges();
      await fixture.whenStable();

      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      expect(inputEl.value).toBe('color.brand.primary');
    });

    it('should display raw literals unchanged in the input', async () => {
      component.value = '#3b82f6';
      fixture.detectChanges();
      await fixture.whenStable();

      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      expect(inputEl.value).toBe('#3b82f6');

      component.value = '16px';
      fixture.detectChanges();
      await fixture.whenStable();
      expect(inputEl.value).toBe('16px');
    });

    it('should display clean path in input after selecting a token from autocomplete while committing alias', async () => {
      const commitSpy = vi.spyOn(component.valueCommit, 'emit');

      component.selectToken({ path: 'color.brand.primary', type: 'color' });
      fixture.detectChanges();
      await fixture.whenStable();

      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      expect(inputEl.value).toBe('color.brand.primary');
      expect(component.value).toBe('{color.brand.primary}');
      expect(commitSpy).toHaveBeenCalledWith('{color.brand.primary}');
    });

    it('should preserve alias semantics when editing an existing alias and blurring without changes', () => {
      const commitSpy = vi.spyOn(component.valueCommit, 'emit');
      component.value = '{color.brand.primary}';
      fixture.detectChanges();

      component.onBlur();

      expect(commitSpy).toHaveBeenCalledWith('{color.brand.primary}');
    });

    it('should commit token path as alias when user types clean path matching a known token', () => {
      const commitSpy = vi.spyOn(component.valueCommit, 'emit');

      component.onInputChange('color.brand.secondary');
      component.onBlur();

      expect(commitSpy).toHaveBeenCalledWith('{color.brand.secondary}');
    });

    it('should commit raw literal as-is when user types a non-token value', () => {
      const commitSpy = vi.spyOn(component.valueCommit, 'emit');

      component.onInputChange('24px');
      component.onBlur();

      expect(commitSpy).toHaveBeenCalledWith('24px');
    });

    it('should normalize and not duplicate brackets when user manually enters curly braces', () => {
      const commitSpy = vi.spyOn(component.valueCommit, 'emit');

      component.onInputChange('{color.brand.secondary}');
      component.onBlur();

      expect(commitSpy).toHaveBeenCalledWith('{color.brand.secondary}');
    });
  });
});

