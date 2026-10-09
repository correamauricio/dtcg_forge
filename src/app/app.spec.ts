import '@angular/compiler';
import { describe, it, expect, vi } from 'vitest';
import { TokenService } from './services/token.service';
import { TokenStateService } from './services/token-state.service';
import { HistoryService } from './services/history.service';
import { ShortcutService } from './services/shortcut.service';
import { AppLifecycleService } from './services/app-lifecycle.service';
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

describe('App Component', () => {
  it('should initialize app lifecycle on init', async () => {
    const mockLifecycle = {
      initializeApp: vi.fn(),
      appState: signal('initializing'),
      hasPreviousSession: signal(false),
      lastUpdated: signal(null),
      handleWelcomeAction: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: AppLifecycleService, useValue: mockLifecycle },
        { provide: ShortcutService, useValue: { init: vi.fn() } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    app.ngOnInit();
    expect(mockLifecycle.initializeApp).toHaveBeenCalled();
  });
});
