import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TokenService } from './services/token.service';
import { TokenStateService } from './services/token-state.service';
import { HistoryService } from './services/history.service';
import { ShortcutService } from './services/shortcut.service';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { WorkspaceSessionService } from './services/workspace-session.service';
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
        { provide: WorkspaceSessionService, useValue: { scheduleSave: async () => {}, loadWorkspace: async () => null } },
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
    let mockWorkspaceSession: any;

    beforeEach(async () => {
      mockTokenStateService = {
        loadPreset: vi.fn(),
        initEmptyWorkspace: vi.fn(),
        restoreWorkspace: vi.fn()
      };

      mockWorkspaceSession = {
        loadWorkspace: vi.fn(),
        initializeSession: vi.fn().mockResolvedValue({ status: 'new', workspace: null }),
        markSessionActive: vi.fn()
      };

      await TestBed.configureTestingModule({
        imports: [App],
        providers: [
          { provide: TokenStateService, useValue: mockTokenStateService },
          { provide: WorkspaceSessionService, useValue: mockWorkspaceSession },
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
      mockWorkspaceSession.initializeSession.mockResolvedValue({ status: 'new', workspace: null });
      mockWorkspaceSession.loadWorkspace.mockResolvedValue(null);

      await app.ngOnInit();
      
      expect(app.showWelcomeModal()).toBe(true);
      expect(app.hasPreviousSession()).toBe(false);
      expect(app.isAppReady()).toBe(false);
    });

    it('should show welcome modal with "continue" option if storage has workspace but session is new', async () => {
      mockWorkspaceSession.initializeSession.mockResolvedValue({ status: 'new', workspace: null });
      mockWorkspaceSession.loadWorkspace.mockResolvedValue({ updatedAt: 123456 });

      await app.ngOnInit();
      
      expect(app.showWelcomeModal()).toBe(true);
      expect(app.hasPreviousSession()).toBe(true);
      expect(app.lastUpdated()).toBe(123456);
      expect(app.isAppReady()).toBe(false);
    });

    it('should bypass modal and be ready if session is restored', async () => {
      mockWorkspaceSession.initializeSession.mockResolvedValue({ status: 'restored', workspace: { files: [] } });

      await app.ngOnInit();
      
      expect(app.showWelcomeModal()).toBe(false);
      expect(app.isAppReady()).toBe(true);
      expect(mockTokenStateService.restoreWorkspace).toHaveBeenCalledWith({ files: [] });
    });

    it('should handle "presets" action from modal', () => {
      app.handleModalAction('presets');
      
      expect(mockTokenStateService.loadPreset).toHaveBeenCalled();
      expect(mockWorkspaceSession.markSessionActive).toHaveBeenCalled();
      expect(app.showWelcomeModal()).toBe(false);
      expect(app.isAppReady()).toBe(true);
    });

    it('should handle "empty" action from modal', () => {
      app.handleModalAction('empty');
      
      expect(mockTokenStateService.initEmptyWorkspace).toHaveBeenCalled();
      expect(mockWorkspaceSession.markSessionActive).toHaveBeenCalled();
      expect(app.showWelcomeModal()).toBe(false);
      expect(app.isAppReady()).toBe(true);
    });

    it.skip('should handle "continue" action from modal', async () => {
      app.ngOnInit = vi.fn(); // Prevent automatic execution from interfering
      mockWorkspaceSession.loadWorkspace.mockResolvedValue({ files: [] });
      
      // Avoid calling ngOnInit to prevent race conditions with its async state setting
      app.showWelcomeModal.set(true); 

      app.handleModalAction('continue');
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockWorkspaceSession.markSessionActive).toHaveBeenCalled();
      expect(mockTokenStateService.restoreWorkspace).toHaveBeenCalledWith({ files: [] });
      expect(app.showWelcomeModal()).toBe(false);
      expect(app.isAppReady()).toBe(true);
    });
});
