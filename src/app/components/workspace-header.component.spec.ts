import { TestBed, ComponentFixture } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { WorkspaceHeaderComponent } from './workspace-header.component';
import { TokenService } from '../services/token.service';
import { TokenStateService } from '../services/token-state.service';
import { FileImportService } from '../services/file-import.service';

describe('WorkspaceHeaderComponent', () => {
  let component: WorkspaceHeaderComponent;
  let fixture: ComponentFixture<WorkspaceHeaderComponent>;
  
  let mockTokenService: any;
  let mockTokenStateService: any;
  let mockFileImport: any;

  beforeEach(async () => {
    mockTokenService = {
      files: signal([
        { name: 'tokens.json', content: { a: 1 } }
      ]),
      duplicateTokensInfo: signal([])
    };

    mockTokenStateService = {
      initEmptyWorkspace: vi.fn(),
      loadPreset: vi.fn()
    };

    mockFileImport = {
      readAndAddFiles: vi.fn(),
      downloadJson: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [WorkspaceHeaderComponent],
      providers: [
        { provide: TokenService, useValue: mockTokenService },
        { provide: TokenStateService, useValue: mockTokenStateService },
        { provide: FileImportService, useValue: mockFileImport }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkspaceHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render branding', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('DTCG Forge');
  });

  it('should call fileImport.readAndAddFiles on valid file input change', () => {
    const mockFile = new File(['{}'], 'tokens.json', { type: 'application/json' });
    const event = { target: { files: [mockFile] } };
    
    component.onFileInput(event);
    
    expect(mockFileImport.readAndAddFiles).toHaveBeenCalledWith([mockFile]);
  });

  it('should not call fileImport.readAndAddFiles if no files selected', () => {
    const event = { target: { files: [] } };
    component.onFileInput(event);
    expect(mockFileImport.readAndAddFiles).not.toHaveBeenCalled();
  });

  it('should call downloadJson for all files on onExportAll', () => {
    component.onExportAll();
    expect(mockFileImport.downloadJson).toHaveBeenCalledWith('tokens.json', { a: 1 });
  });

  it('should show alert before export if duplicate tokens exist', () => {
    mockTokenService.duplicateTokensInfo.set(['Conflict']);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    component.onExportAll();
    
    expect(alertSpy).toHaveBeenCalled();
    expect(mockFileImport.downloadJson).toHaveBeenCalled();
  });

  it('should toggle workspace menu', () => {
    const event = { stopPropagation: vi.fn() } as unknown as MouseEvent;
    
    expect(component.isWorkspaceMenuOpen()).toBe(false);
    
    component.toggleWorkspaceMenu(event);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.isWorkspaceMenuOpen()).toBe(true);
    
    component.toggleWorkspaceMenu(event);
    expect(component.isWorkspaceMenuOpen()).toBe(false);
  });

  it('should skip confirmation modal and execute directly if workspace is empty', () => {
    mockTokenService.files.set([]); // empty workspace
    
    component.requestWorkspaceAction('new');
    
    expect(component.pendingWorkspaceAction()).toBeNull();
    expect(mockTokenStateService.initEmptyWorkspace).toHaveBeenCalled();
  });

  it('should show confirmation modal if workspace is not empty', () => {
    component.requestWorkspaceAction('new');
    
    expect(component.pendingWorkspaceAction()).toBe('new');
    expect(mockTokenStateService.initEmptyWorkspace).not.toHaveBeenCalled();
  });

  it('should execute action with backup when confirmed', () => {
    component.pendingWorkspaceAction.set('preset');
    
    const exportSpy = vi.spyOn(component, 'onExportAll');
    
    component.confirmWorkspaceAction(true); // with backup
    
    expect(exportSpy).toHaveBeenCalled();
    expect(mockTokenStateService.loadPreset).toHaveBeenCalled();
    expect(component.pendingWorkspaceAction()).toBeNull();
  });

  it('should execute action without backup when confirmed', () => {
    component.pendingWorkspaceAction.set('preset');
    
    const exportSpy = vi.spyOn(component, 'onExportAll');
    
    component.confirmWorkspaceAction(false); // without backup
    
    expect(exportSpy).not.toHaveBeenCalled();
    expect(mockTokenStateService.loadPreset).toHaveBeenCalled();
    expect(component.pendingWorkspaceAction()).toBeNull();
  });

  it('should reset pending action on cancel', () => {
    component.pendingWorkspaceAction.set('new');
    component.cancelWorkspaceAction();
    expect(component.pendingWorkspaceAction()).toBeNull();
  });

  it('should close menus on Escape keydown', () => {
    component.isWorkspaceMenuOpen.set(true);
    component.pendingWorkspaceAction.set('new');
    
    component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    
    expect(component.isWorkspaceMenuOpen()).toBe(false);
    expect(component.pendingWorkspaceAction()).toBeNull();
  });
});
