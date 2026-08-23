import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokenService } from './token.service';
import { HistoryService } from './history.service';
import { TokenStateService } from './token-state.service';
import { signal } from '@angular/core';

describe('TokenService (Facade & Mutation Orchestration via Command Pattern)', () => {
  let service: TokenService;
  let historyServiceMock: any;
  let stateServiceMock: any;

  beforeEach(() => {
    historyServiceMock = {
      execute: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn()
    };

    stateServiceMock = {
      files: signal([]),
      activeFileName: signal(null),
      selectedVariants: signal({}),
      disabledFileNames: signal(new Set()),
      duplicateTokensInfo: signal([]),
      isJsonEditorOpen: signal(false),
      selectedTokenPath: signal([]),
      searchQuery: signal(''),
      setSearchQuery: vi.fn((q: string) => stateServiceMock.searchQuery.set(q)),
      clearSearchQuery: vi.fn(() => stateServiceMock.searchQuery.set('')),
      addFile: vi.fn(),
      updateTokenValue: vi.fn(),
      selectVariant: vi.fn(),
      toggleFileDisabled: vi.fn(),
      setDuplicateTokensInfo: vi.fn(),
      updateActiveFileContent: vi.fn(),
      createMemento: vi.fn(),
      restoreMemento: vi.fn(),
      setActiveFileName: vi.fn(),
      toggleJsonEditor: vi.fn(),
      setJsonEditorOpen: vi.fn(),
      setSelectedTokenPath: vi.fn(),
      deleteFile: vi.fn(),
      renameFile: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        TokenService,
        { provide: HistoryService, useValue: historyServiceMock },
        { provide: TokenStateService, useValue: stateServiceMock }
      ]
    });

    service = TestBed.inject(TokenService);
  });

  it('should route token value modifications through HistoryService using an encapsulated StateChangeCommand', () => {
    service.updateTokenValue(['color', 'primary'], '#FF0000');

    expect(historyServiceMock.execute).toHaveBeenCalledTimes(1);
    const passedCommand = historyServiceMock.execute.mock.calls[0][0];
    expect(passedCommand).toBeDefined();

    // Executing the command encapsulates calling state mutation
    passedCommand.execute();
    expect(stateServiceMock.updateTokenValue).toHaveBeenCalledWith(['color', 'primary'], '#FF0000');
  });

  it('should route file content updates through HistoryService using a StateChangeCommand', () => {
    const updatedContent = { color: { brand: { $value: '#123456' } } };
    service.updateActiveFileContent(updatedContent);

    expect(historyServiceMock.execute).toHaveBeenCalledTimes(1);
    const passedCommand = historyServiceMock.execute.mock.calls[0][0];

    passedCommand.execute();
    expect(stateServiceMock.updateActiveFileContent).toHaveBeenCalledWith(updatedContent);
  });

  it('should route variant selections through HistoryService using a StateChangeCommand', () => {
    service.selectVariant('group-1', 'dark.json');

    expect(historyServiceMock.execute).toHaveBeenCalledTimes(1);
    const passedCommand = historyServiceMock.execute.mock.calls[0][0];

    passedCommand.execute();
    expect(stateServiceMock.selectVariant).toHaveBeenCalledWith('group-1', 'dark.json');
  });

  it('should route toggling file disabled state through HistoryService using a StateChangeCommand', () => {
    service.toggleFileDisabled('theme.json');

    expect(historyServiceMock.execute).toHaveBeenCalledTimes(1);
    const passedCommand = historyServiceMock.execute.mock.calls[0][0];

    passedCommand.execute();
    expect(stateServiceMock.toggleFileDisabled).toHaveBeenCalledWith('theme.json');
  });

  it('should route addFile through HistoryService using a StateChangeCommand', () => {
    service.addFile('new-file.json', { color: {} });

    expect(historyServiceMock.execute).toHaveBeenCalledTimes(1);
    const passedCommand = historyServiceMock.execute.mock.calls[0][0];

    passedCommand.execute();
    expect(stateServiceMock.addFile).toHaveBeenCalledWith('new-file.json', { color: {} });
  });

  it('should route deleteFile through HistoryService using a StateChangeCommand', () => {
    service.deleteFile('old-file.json');

    expect(historyServiceMock.execute).toHaveBeenCalledTimes(1);
    const passedCommand = historyServiceMock.execute.mock.calls[0][0];

    passedCommand.execute();
    expect(stateServiceMock.deleteFile).toHaveBeenCalledWith('old-file.json');
  });

  it('should route renameFile through HistoryService using a StateChangeCommand', () => {
    service.renameFile('old.json', 'new.json');

    expect(historyServiceMock.execute).toHaveBeenCalledTimes(1);
    const passedCommand = historyServiceMock.execute.mock.calls[0][0];

    passedCommand.execute();
    expect(stateServiceMock.renameFile).toHaveBeenCalledWith('old.json', 'new.json');
  });

  it('should delegate UI state methods directly to TokenStateService without HistoryService', () => {
    stateServiceMock.toggleJsonEditor = vi.fn();
    service.toggleJsonEditor();
    expect(stateServiceMock.toggleJsonEditor).toHaveBeenCalled();

    stateServiceMock.setJsonEditorOpen = vi.fn();
    service.setJsonEditorOpen(true);
    expect(stateServiceMock.setJsonEditorOpen).toHaveBeenCalledWith(true);

    stateServiceMock.setActiveFileName = vi.fn();
    service.setActiveFileName('file.json');
    expect(stateServiceMock.setActiveFileName).toHaveBeenCalledWith('file.json');

    stateServiceMock.setSelectedTokenPath = vi.fn();
    service.setSelectedTokenPath(['a']);
    expect(stateServiceMock.setSelectedTokenPath).toHaveBeenCalledWith(['a']);
    
    expect(historyServiceMock.execute).not.toHaveBeenCalled();
  });

  it('should compute rawTokens based on activeFileName', () => {
    stateServiceMock.files.set([{ name: 'active.json', content: { a: 1 } }]);
    stateServiceMock.activeFileName.set('active.json');
    TestBed.flushEffects();
    expect(service.rawTokens()).toEqual({ a: 1 });

    stateServiceMock.activeFileName.set('missing.json');
    expect(service.rawTokens()).toEqual({});
  });

  it('should compute cssVariables', () => {
    stateServiceMock.files.set([
      { name: 'tokens.json', content: { color: { primary: { $value: '#000', $type: 'color' } } } }
    ]);
    stateServiceMock.activeFileName.set('tokens.json');
    TestBed.flushEffects();
    
    const css = service.cssVariables();
    expect(css).toContain('--color-primary: #000;');
  });

  it('should execute duplicate tokens callback in allFlatTokens without crashing', () => {
    vi.useFakeTimers();
    
    stateServiceMock.files.set([
      { name: '1.json', content: { color: { $value: '#1' } } },
      { name: '2.json', content: { color: { $value: '#2' } } }
    ]);
    stateServiceMock.activeFileName.set('1.json');
    TestBed.flushEffects();
    
    const all = service.allFlatTokens();
    expect(all.length).toBeGreaterThan(0);
    
    vi.runAllTimers(); // Trigger the setTimeout inside resolveAllFlatTokens callback
    expect(stateServiceMock.setDuplicateTokensInfo).toHaveBeenCalled();
    
    vi.useRealTimers();
  });

  it('should compute groupedTokens and flatTokens correctly', () => {
    stateServiceMock.files.set([
      { name: 'tokens.json', content: { color: { primary: { $value: '#000' } } } }
    ]);
    stateServiceMock.activeFileName.set('tokens.json');
    TestBed.flushEffects();
    
    const flat = service.flatTokens();
    expect(flat.length).toBe(1);
    expect(flat[0].path).toBe('color.primary');

    const grouped = service.groupedTokens();
    expect(grouped['color']['primary']._token).toBeDefined();
  });

  it('should filter groupedTokens and flatTokens when searchQuery is active and prune non-matching branches', () => {
    stateServiceMock.files.set([
      {
        name: 'tokens.json',
        content: {
          color: {
            brand: {
              primary: { $value: '#0055ff', $type: 'color' },
              secondary: { $value: '#ff5500', $type: 'color' }
            },
            neutral: {
              white: { $value: '#ffffff', $type: 'color' }
            }
          },
          spacing: {
            sm: { $value: '8px', $type: 'dimension' }
          }
        }
      }
    ]);
    stateServiceMock.activeFileName.set('tokens.json');
    stateServiceMock.searchQuery.set('primary');
    TestBed.flushEffects();

    expect(service.totalTokenCount()).toBe(4);
    expect(service.filteredTokenCount()).toBe(1);

    const filtered = service.filteredFlatTokens();
    expect(filtered.length).toBe(1);
    expect(filtered[0].path).toBe('color.brand.primary');

    const grouped = service.groupedTokens();
    expect(grouped['color']).toBeDefined();
    expect(grouped['color']['brand']).toBeDefined();
    expect(grouped['color']['brand']['primary']._token).toBeDefined();
    expect(grouped['color']['neutral']).toBeUndefined();
    expect(grouped['spacing']).toBeUndefined();
  });

  it('should delegate setSearchQuery and clearSearchQuery to TokenStateService', () => {
    service.setSearchQuery('neutral');
    expect(stateServiceMock.setSearchQuery).toHaveBeenCalledWith('neutral');

    service.clearSearchQuery();
    expect(stateServiceMock.clearSearchQuery).toHaveBeenCalled();
  });
});

