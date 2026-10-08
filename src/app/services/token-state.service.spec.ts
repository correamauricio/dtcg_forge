import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TokenStateService } from './token-state.service';
import { WorkspaceSessionService } from './workspace-session.service';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

describe('TokenStateService', () => {
  let service: TokenStateService;
  let mockStorageService: any;

  beforeEach(() => {
    mockStorageService = {
      scheduleSave: vi.fn(),
      loadWorkspace: vi.fn().mockResolvedValue(null),
      saveStatus: signal('saved')
    };

    TestBed.configureTestingModule({
      providers: [
        TokenStateService,
        { provide: WorkspaceSessionService, useValue: mockStorageService }
      ]
    });
    service = TestBed.inject(TokenStateService);
    // Para manter a compatibilidade dos testes existentes que assumem o preset carregado
    service.loadPreset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call scheduleSave on WorkspaceSessionService when a file is added', async () => {
    service.addFile('new-file.json', { token: { $value: 'red' } });
    
    // Força a execução dos effects pendentes
    TestBed.flushEffects();
    
    expect(mockStorageService.scheduleSave).toHaveBeenCalledTimes(1);
  });

  it('should preserve custom metadata and extension properties when updating a token value', () => {
    const newFile = {
      name: 'test-meta.json',
      content: {
        color: {
          brand: {
            $value: '#ff0000',
            $type: 'color',
            $description: 'A brand color',
            figmaExtensions: {
              blendMode: 'multiply'
            }
          }
        }
      }
    };
    
    service.addFile(newFile.name, newFile.content);
    service.updateTokenValue(['color', 'brand'], '#00ff00');
    
    const file = service.files().find(f => f.name === 'test-meta.json');
    expect(file).toBeDefined();
    
    const brandNode = file?.content.color.brand;
    
    expect(brandNode['$value']).toBe('#00ff00');
    expect(brandNode['$type']).toBe('color');
    expect(brandNode['$description']).toBe('A brand color');
    expect(brandNode.figmaExtensions.blendMode).toBe('multiply');
  });

  it('should create new token nodes when path does not exist', () => {
    service.addFile('test.json', {});
    service.updateTokenValue(['new', 'path', 'color'], '#000');

    const file = service.files().find(f => f.name === 'test.json');
    expect(file?.content.new.path.color.$value).toBe('#000');
  });

  it('should update value property if $value does not exist', () => {
    service.addFile('test.json', { old: { value: '#111' } });
    service.updateTokenValue(['old'], '#222');
    
    const file = service.files().find(f => f.name === 'test.json');
    expect(file?.content.old.value).toBe('#222');
    expect(file?.content.old.$value).toBeUndefined();
  });

  it('should do nothing when trying to update token if active file is not found', () => {
    service.setActiveFileName('non-existent.json');
    service.updateTokenValue(['path'], '#000');
    // should not crash
    expect(service.files().length).toBeGreaterThan(0);
  });

  it('should load presets correctly on initialization', () => {
    const files = service.files();
    expect(files.length).toBe(3);
    expect(files.find(f => f.name === 'primitives.json')).toBeDefined();
    expect(files.find(f => f.name === 'semantics.json')).toBeDefined();
    expect(files.find(f => f.name === 'semantics-dark.json')).toBeDefined();
    expect(service.activeFileName()).toBe('semantics.json');
  });

  it('should set duplicate tokens info', () => {
    service.setDuplicateTokensInfo(['error 1', 'error 2']);
    expect(service.duplicateTokensInfo()).toEqual(['error 1', 'error 2']);
  });

  it('should select variant correctly', () => {
    service.selectVariant('group-1', 'dark.json');
    expect(service.selectedVariants()['group-1']).toBe('dark.json');
  });

  it('should toggle file disabled state', () => {
    expect(service.disabledFileNames().has('test.json')).toBe(false);
    service.toggleFileDisabled('test.json');
    expect(service.disabledFileNames().has('test.json')).toBe(true);
    service.toggleFileDisabled('test.json');
    expect(service.disabledFileNames().has('test.json')).toBe(false);
  });

  it('should update active file content', () => {
    service.addFile('test.json', { old: 'content' });
    service.updateActiveFileContent({ new: 'content' });
    const file = service.files().find(f => f.name === 'test.json');
    expect(file?.content).toEqual({ new: 'content' });
  });

  it('should do nothing on updateActiveFileContent if active file is not found', () => {
    service.setActiveFileName('non-existent.json');
    service.updateActiveFileContent({ new: 'content' });
    // should not crash
  });

  it('should initialize with json editor closed and allow toggling and setting state', () => {
    expect(service.isJsonEditorOpen()).toBe(false);

    service.setJsonEditorOpen(true);
    expect(service.isJsonEditorOpen()).toBe(true);

    service.toggleJsonEditor();
    expect(service.isJsonEditorOpen()).toBe(false);
  });

  it('should set selected token path', () => {
    service.setSelectedTokenPath(['a', 'b']);
    expect(service.selectedTokenPath()).toEqual(['a', 'b']);
  });

  it('should create and restore mementos safely isolated by deep copy', () => {
    service.addFile('test.json', { color: { $value: '#000' } });
    service.selectVariant('group-1', 'light.json');
    service.toggleFileDisabled('primitives.json');
    
    const memento = service.createMemento();

    // Mutate state after memento creation
    service.updateTokenValue(['color'], '#fff');
    service.selectVariant('group-1', 'dark.json');
    service.toggleFileDisabled('primitives.json'); // enable it back

    // State is mutated
    expect(service.files().find(f => f.name === 'test.json')?.content.color.$value).toBe('#fff');
    expect(service.selectedVariants()['group-1']).toBe('dark.json');
    expect(service.disabledFileNames().has('primitives.json')).toBe(false);

    // Restore memento
    service.restoreMemento(memento);

    // State is restored
    expect(service.files().find(f => f.name === 'test.json')?.content.color.$value).toBe('#000');
    expect(service.selectedVariants()['group-1']).toBe('light.json');
    expect(service.disabledFileNames().has('primitives.json')).toBe(true);
  });

  it('should overwrite existing file content when addFile is called with an existing file name', () => {
    service.addFile('existing.json', { old: 'content' });
    service.addFile('existing.json', { new: 'content' });

    const file = service.files().find(f => f.name === 'existing.json');
    expect(file?.content).toEqual({ new: 'content' });
  });

  describe('deleteFile', () => {
    it('should remove file and update activeFileName to remaining file if active file was deleted', () => {
      service.setActiveFileName('semantics.json');
      service.deleteFile('semantics.json');

      expect(service.files().find(f => f.name === 'semantics.json')).toBeUndefined();
      expect(service.files().length).toBe(2);
      expect(service.activeFileName()).toBe('primitives.json');
    });

    it('should set activeFileName to empty string if all files are deleted', () => {
      service.deleteFile('primitives.json');
      service.deleteFile('semantics.json');
      service.deleteFile('semantics-dark.json');

      expect(service.files().length).toBe(0);
      expect(service.activeFileName()).toBe('');
    });

    it('should retain activeFileName if another non-active file is deleted', () => {
      service.setActiveFileName('semantics.json');
      service.deleteFile('primitives.json');

      expect(service.activeFileName()).toBe('semantics.json');
    });

    it('should clean up disabledFileNames and selectedVariants when file is deleted', () => {
      service.toggleFileDisabled('semantics-dark.json');
      service.selectVariant('group-1', 'semantics-dark.json');
      expect(service.disabledFileNames().has('semantics-dark.json')).toBe(true);
      expect(service.selectedVariants()['group-1']).toBe('semantics-dark.json');

      service.deleteFile('semantics-dark.json');
      expect(service.disabledFileNames().has('semantics-dark.json')).toBe(false);
      expect(service.selectedVariants()['group-1']).toBeUndefined();
    });
  });

  describe('renameFile', () => {
    it('should rename file and update activeFileName if active file was renamed', () => {
      service.setActiveFileName('semantics.json');
      const success = service.renameFile('semantics.json', 'tokens-semantic.json');

      expect(success).toBe(true);
      expect(service.files().find(f => f.name === 'tokens-semantic.json')).toBeDefined();
      expect(service.files().find(f => f.name === 'semantics.json')).toBeUndefined();
      expect(service.activeFileName()).toBe('tokens-semantic.json');
    });

    it('should update disabledFileNames and selectedVariants mappings when file is renamed', () => {
      service.toggleFileDisabled('semantics-dark.json');
      service.selectVariant('group-1', 'semantics-dark.json');

      service.renameFile('semantics-dark.json', 'dark-theme.json');

      expect(service.disabledFileNames().has('semantics-dark.json')).toBe(false);
      expect(service.disabledFileNames().has('dark-theme.json')).toBe(true);
      expect(service.selectedVariants()['group-1']).toBe('dark-theme.json');
    });

    it('should reject renaming to an existing file name, empty string, or non-existent old file', () => {
      expect(service.renameFile('primitives.json', 'semantics.json')).toBe(false);
      expect(service.renameFile('primitives.json', '')).toBe(false);
      expect(service.renameFile('primitives.json', '   ')).toBe(false);
      expect(service.renameFile('non-existent.json', 'new-name.json')).toBe(false);
    });
  });

  describe('searchQuery', () => {
    it('should initialize with empty string', () => {
      expect(service.searchQuery()).toBe('');
    });

    it('should update searchQuery when setSearchQuery is called', () => {
      service.setSearchQuery('brand.primary');
      expect(service.searchQuery()).toBe('brand.primary');
    });

    it('should reset searchQuery when clearSearchQuery is called', () => {
      service.setSearchQuery('color');
      service.clearSearchQuery();
      expect(service.searchQuery()).toBe('');
    });
  });
});