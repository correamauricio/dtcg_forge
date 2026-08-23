import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrimitiveGroupNodeComponent } from './primitive-group-node.component';
import { By } from '@angular/platform-browser';

describe('PrimitiveGroupNodeComponent', () => {
  let component: PrimitiveGroupNodeComponent;
  let fixture: ComponentFixture<PrimitiveGroupNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimitiveGroupNodeComponent]
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

  it('should emit selectToken when onSelectToken is called', () => {
    const spy = vi.spyOn(component.selectToken, 'emit');
    component.onSelectToken(['colors', '100']);
    expect(spy).toHaveBeenCalledWith({ path: ['colors', '100'] });
  });

  it('should emit updateToken when onColorChange is called', () => {
    const spy = vi.spyOn(component.updateToken, 'emit');
    component.onColorChange(['colors', '100'], '#000000');
    expect(spy).toHaveBeenCalledWith({ path: ['colors', '100'], value: '#000000' });
  });
});
