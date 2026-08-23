import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaletteConfigModalComponent } from './palette-config-modal.component';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { vi } from 'vitest';

vi.mock('@material/material-color-utilities', () => {
  return {
    themeFromSourceColor: vi.fn(),
    argbFromHex: vi.fn(),
    hexFromArgb: (v: number) => '#000000',
    TonalPalette: { fromInt: vi.fn() }
  };
});

describe('PaletteConfigModalComponent', () => {
  let component: PaletteConfigModalComponent;
  let fixture: ComponentFixture<PaletteConfigModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaletteConfigModalComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PaletteConfigModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render modal content if isOpen is false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
    expect(overlay).toBeFalsy();
  });

  it('should render modal content when isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
    expect(overlay).toBeTruthy();
  });

  it('should bind currentScript to textarea', async () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('currentScript', 'console.log("hello");');
    fixture.detectChanges();
    
    // wait for stable to ensure ngModel is bound
    await fixture.whenStable();
    fixture.detectChanges();

    const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
    expect(textarea.value).toBe('console.log("hello");');
  });

  it('should emit cancel event when Cancel button is clicked', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    
    const cancelSpy = vi.spyOn(component.cancel, 'emit');
    const cancelButton = fixture.debugElement.query(By.css('.btn-cancel')).nativeElement;
    
    cancelButton.click();
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should emit save event with edited script when Save button is clicked', async () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('currentScript', 'original');
    fixture.detectChanges();
    await fixture.whenStable();

    const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
    // Simulate user typing
    textarea.value = 'edited';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const saveSpy = vi.spyOn(component.save, 'emit');
    const saveButton = fixture.debugElement.query(By.css('.btn-save')).nativeElement;
    
    saveButton.click();
    expect(saveSpy).toHaveBeenCalledWith('edited');
  });
});
