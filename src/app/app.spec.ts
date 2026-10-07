import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TokenService } from './services/token.service';
import { TokenStateService } from './services/token-state.service';
import { HistoryService } from './services/history.service';
import { ShortcutService } from './services/shortcut.service';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { WorkspaceStorageService } from './services/workspace-storage.service';
import { App } from './app';

vi.mock('@material/material-color-utilities', () => {
  return {
    themeFromSourceColor: vi.fn(),
    argbFromHex: vi.fn(),
    hexFromArgb: (v: number) => '#000000',
    TonalPalette: { fromInt: vi.fn() }
  };
});

describe('TokenService Variant Behavior', () => {
  it('should maintain token listing for active file even when different variant is active', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: WorkspaceStorageService, useValue: { saveWorkspace: async () => {}, loadWorkspace: async () => null } },
        TokenStateService,
        HistoryService,
        TokenService
      ]
    });

    const stateService = TestBed.inject(TokenStateService);
    stateService.loadPreset();

    const service = TestBed.inject(TokenService);

    expect(service.activeFileName()).toBe('semantics.json');
    const initialCount = service.flatTokens().length;
    expect(initialCount).toBeGreaterThan(0);

    // Change variant to semantics-dark.json
    const groups = service.variantGroups();
    expect(groups.length).toBeGreaterThan(0);
    service.selectVariant(groups[0].id, 'semantics-dark.json');

    // The viewed file is still semantics.json
    expect(service.activeFileName()).toBe('semantics.json');
    // Tokens list must NOT disappear
    expect(service.flatTokens().length).toBe(initialCount);
    expect(service.groupedTokens()['color']).toBeDefined();
  });
});

describe('Session Lifecycle and Welcome Modal', () => {
    let app: any;
    let fixture: any;
    let mockTokenStateService: any;
    let mockWorkspaceStorage: any;

    beforeEach(async () => {
      mockTokenStateService = {
        initializeSession: vi.fn(),
        loadPreset: vi.fn(),
        initEmptyWorkspace: vi.fn()
      };

      mockWorkspaceStorage = {
        loadWorkspace: vi.fn()
      };

      await TestBed.configureTestingModule({
        imports: [App],
        providers: [
          { provide: TokenStateService, useValue: mockTokenStateService },
          { provide: WorkspaceStorageService, useValue: mockWorkspaceStorage },
          { provide: ShortcutService, useValue: { init: vi.fn() } },
          { provide: TokenService, useValue: { 
            activeFileName: signal('semantics.json'), 
            flatTokens: signal([]), 
            groupedTokens: signal({}), 
            saveStatus: signal('saved'),
            activeFileContent: signal(''),
            variantGroups: signal([]),
            isJsonEditorOpen: signal(false),
            selectedTokenPath: signal(null),
            fileNames: signal(['semantics.json']),
            rawTokens: signal([]),
            files: signal([]),
            duplicateTokensInfo: signal({}),
            searchQuery: signal(''),
            filteredTokenCount: signal(0),
            cssVariables: signal('')
          } }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(App);
      app = fixture.componentInstance;
    });

    afterEach(() => {
      sessionStorage.clear();
      vi.clearAllMocks();
    });

    it('should show welcome modal on new session and empty storage', async () => {
      mockTokenStateService.initializeSession.mockResolvedValue('new');
      mockWorkspaceStorage.loadWorkspace.mockResolvedValue(null);

      await app.ngOnInit();
      
      expect(app.showWelcomeModal()).toBe(true);
      expect(app.hasPreviousSession()).toBe(false);
      expect(app.isAppReady()).toBe(false);
    });

    it('should show welcome modal with "continue" option if storage has workspace but session is new', async () => {
      mockTokenStateService.initializeSession.mockResolvedValue('new');
      mockWorkspaceStorage.loadWorkspace.mockResolvedValue({ updatedAt: 123456 });

      await app.ngOnInit();
      
      expect(app.showWelcomeModal()).toBe(true);
      expect(app.hasPreviousSession()).toBe(true);
      expect(app.lastUpdated()).toBe(123456);
      expect(app.isAppReady()).toBe(false);
    });

    it('should bypass modal and be ready if session is restored', async () => {
      mockTokenStateService.initializeSession.mockResolvedValue('restored');

      await app.ngOnInit();
      
      expect(app.showWelcomeModal()).toBe(false);
      expect(app.isAppReady()).toBe(true);
    });

    it('should handle "presets" action from modal', () => {
      app.handleModalAction('presets');
      
      expect(mockTokenStateService.loadPreset).toHaveBeenCalled();
      expect(sessionStorage.getItem('dtcg_forge_session_active')).toBe('true');
      expect(app.showWelcomeModal()).toBe(false);
      expect(app.isAppReady()).toBe(true);
    });

    it('should handle "empty" action from modal', () => {
      app.handleModalAction('empty');
      
      expect(mockTokenStateService.initEmptyWorkspace).toHaveBeenCalled();
      expect(sessionStorage.getItem('dtcg_forge_session_active')).toBe('true');
      expect(app.showWelcomeModal()).toBe(false);
      expect(app.isAppReady()).toBe(true);
    });

    it('should handle "continue" action from modal', async () => {
      mockWorkspaceStorage.loadWorkspace.mockResolvedValue({ files: [] });
      mockTokenStateService.initializeSession.mockResolvedValue('restored');

      app.handleModalAction('continue');
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(sessionStorage.getItem('dtcg_forge_session_active')).toBe('true');
      expect(mockTokenStateService.initializeSession).toHaveBeenCalled();
      expect(app.showWelcomeModal()).toBe(false);
      expect(app.isAppReady()).toBe(true);
    });
  });
