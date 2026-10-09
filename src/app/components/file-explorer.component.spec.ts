import { TestBed, ComponentFixture } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { signal } from '@angular/core';
import { FileExplorerComponent } from './file-explorer.component';
import { TokenService } from '../services/token.service';
import { TokenStateService } from '../services/token-state.service';
import { FileImportService } from '../services/file-import.service';

describe('FileExplorerComponent', () => {
  let component: FileExplorerComponent;
  let fixture: ComponentFixture<FileExplorerComponent>;
  let tokenServiceMock: any;
  let fileImportServiceMock: any;

  beforeEach(async () => {
    tokenServiceMock = {
      files: signal([
        { name: 'primitives.json', content: { color: { blue: { $value: '#00f' } } } },
        { name: 'semantics.json', content: { color: { primary: { $value: '{color.blue}' } } } },
        { name: 'semantics-dark.json', content: { color: { primary: { $value: '{color.blue}' } } } }
      ]),
      activeFileName: signal('semantics.json'),
      variantGroups: signal([
        {
          id: 'group-1',
          name: 'Variante 1',
          files: ['semantics.json', 'semantics-dark.json'],
          activeFile: 'semantics.json'
        }
      ]),
      duplicateTokensInfo: signal<string[]>([]),
      setActiveFileName: vi.fn(),
      selectVariant: vi.fn(),
      addFile: vi.fn(),
      deleteFile: vi.fn(),
      renameFile: vi.fn(),
      saveStatus: signal('saved')
    };

    const tokenStateMock = {
      initEmptyWorkspace: vi.fn(),
      loadPreset: vi.fn()
    };

    fileImportServiceMock = {
      readAndAddFiles: vi.fn(),
      downloadJson: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [FileExplorerComponent],
      providers: [
        { provide: TokenService, useValue: tokenServiceMock },
        { provide: TokenStateService, useValue: tokenStateMock },
        { provide: FileImportService, useValue: fileImportServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FileExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render standalone files and elevated variant containers', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('primitives.json');
    expect(el.textContent).toContain('semantics.json');
    expect(el.textContent).toContain('semantics-dark.json');

    const variantContainer = el.querySelector('[data-testid="variant-group-container"]');
    expect(variantContainer).toBeTruthy();
    expect(variantContainer?.textContent).toContain('semantics.json');
    expect(variantContainer?.textContent).toContain('semantics-dark.json');
  });

  it('should select active file for editing when clicking a file item', () => {
    component.onFileSelect('primitives.json');
    expect(tokenServiceMock.setActiveFileName).toHaveBeenCalledWith('primitives.json');
  });

  it('should select variant and active file when selecting a variant item row', () => {
    component.onVariantSelect('group-1', 'semantics-dark.json');
    expect(tokenServiceMock.setActiveFileName).toHaveBeenCalledWith('semantics-dark.json');
    expect(tokenServiceMock.selectVariant).toHaveBeenCalledWith('group-1', 'semantics-dark.json');
  });

  it('should switch preview variant when clicking eye icon on a variant item without changing active file', () => {
    const mouseEvent = new MouseEvent('click');
    const stopPropagationSpy = vi.spyOn(mouseEvent, 'stopPropagation');

    component.onVariantEyeClick('group-1', 'semantics-dark.json', mouseEvent);
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(tokenServiceMock.selectVariant).toHaveBeenCalledWith('group-1', 'semantics-dark.json');
    expect(tokenServiceMock.setActiveFileName).not.toHaveBeenCalled();
  });

  it('should manage dragover and dragleave state', () => {
    const dragEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn()
    } as unknown as DragEvent;

    component.onDragOver(dragEvent);
    expect(component.isDraggingOver()).toBe(true);
    expect(dragEvent.preventDefault).toHaveBeenCalled();

    component.onDragLeave(dragEvent);
    expect(component.isDraggingOver()).toBe(false);
  });

  it('should import json file on valid file drop via FileImportService', () => {
    const mockFile = new File(['{"color": {"red": {"$value": "#f00"}}}'], 'tokens.json', { type: 'application/json' });
    const dropEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        files: [mockFile]
      }
    } as unknown as DragEvent;

    component.onFileDrop(dropEvent);
    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(dropEvent.stopPropagation).toHaveBeenCalled();
    expect(component.isDraggingOver()).toBe(false);
    expect(fileImportServiceMock.readAndAddFiles).toHaveBeenCalledWith([mockFile]);
  });

  it('should prompt and delete file when confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.onDeleteFile('primitives.json', new MouseEvent('click'));
    expect(tokenServiceMock.deleteFile).toHaveBeenCalledWith('primitives.json');
  });

  it('should not delete file when cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.onDeleteFile('primitives.json', new MouseEvent('click'));
    expect(tokenServiceMock.deleteFile).not.toHaveBeenCalled();
  });

  it('should start inline rename and commit with valid new name', () => {
    component.startRename('primitives.json');
    expect(component.editingFileName()).toBe('primitives.json');
    expect(component.editingFileValue()).toBe('primitives.json');

    component.editingFileValue.set('primitives-v2.json');
    component.commitRename('primitives.json');

    expect(tokenServiceMock.renameFile).toHaveBeenCalledWith('primitives.json', 'primitives-v2.json');
    expect(component.editingFileName()).toBeNull();
  });

  it('should cancel inline rename', () => {
    component.startRename('primitives.json');
    component.cancelRename();
    expect(component.editingFileName()).toBeNull();
  });

  it('should open and close action menu on document click', () => {
    const dummyButton = document.createElement('button');
    vi.spyOn(dummyButton, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 50,
      width: 20,
      height: 20,
      right: 120,
      bottom: 70,
      x: 100,
      y: 50,
      toJSON: () => {}
    });

    const event = {
      stopPropagation: vi.fn(),
      target: dummyButton
    } as unknown as MouseEvent;

    component.openMenu('primitives.json', event);
    expect(component.activeMenuFile()).toBe('primitives.json');
    expect(component.menuPosition()).toEqual({ x: 100, y: 70 });

    component.onDocumentClick();
    expect(component.activeMenuFile()).toBeNull();
  });

  it('should handle menu actions (rename, export, delete)', () => {
    component.activeMenuFile.set('primitives.json');
    component.onMenuRename();
    expect(component.editingFileName()).toBe('primitives.json');

    component.activeMenuFile.set('primitives.json');
    component.onMenuExport();
    expect(fileImportServiceMock.downloadJson).toHaveBeenCalledWith('primitives.json', { color: { blue: { $value: '#00f' } } });

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.activeMenuFile.set('primitives.json');
    component.onMenuDelete();
    expect(tokenServiceMock.deleteFile).toHaveBeenCalledWith('primitives.json');
  });


});
