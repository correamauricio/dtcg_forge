import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AppLifecycleService } from './app-lifecycle.service';
import { TokenStateService } from './token-state.service';
import { WorkspaceSessionService } from './workspace-session.service';

describe('AppLifecycleService', () => {
  let service: AppLifecycleService;
  let mockTokenStateService: any;
  let mockWorkspaceSession: any;

  beforeEach(() => {
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

    TestBed.configureTestingModule({
      providers: [
        AppLifecycleService,
        { provide: TokenStateService, useValue: mockTokenStateService },
        { provide: WorkspaceSessionService, useValue: mockWorkspaceSession }
      ]
    });

    service = TestBed.inject(AppLifecycleService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should go to welcome state on new session and empty storage', async () => {
    mockWorkspaceSession.initializeSession.mockResolvedValue({ status: 'new', workspace: null });
    mockWorkspaceSession.loadWorkspace.mockResolvedValue(null);

    await service.initializeApp();
    
    expect(service.appState()).toBe('welcome');
    expect(service.hasPreviousSession()).toBe(false);
  });

  it('should go to welcome state with "continue" option if storage has workspace but session is new', async () => {
    mockWorkspaceSession.initializeSession.mockResolvedValue({ status: 'new', workspace: null });
    mockWorkspaceSession.loadWorkspace.mockResolvedValue({ updatedAt: 123456 });

    await service.initializeApp();
    
    expect(service.appState()).toBe('welcome');
    expect(service.hasPreviousSession()).toBe(true);
    expect(service.lastUpdated()).toBe(123456);
  });

  it('should bypass modal and be ready if session is restored', async () => {
    mockWorkspaceSession.initializeSession.mockResolvedValue({ status: 'restored', workspace: { files: [] } });

    await service.initializeApp();
    
    expect(service.appState()).toBe('ready');
    expect(mockTokenStateService.restoreWorkspace).toHaveBeenCalledWith({ files: [] });
  });

  it('should handle "presets" action from modal', async () => {
    await service.handleWelcomeAction('presets');
    
    expect(mockTokenStateService.loadPreset).toHaveBeenCalled();
    expect(mockWorkspaceSession.markSessionActive).toHaveBeenCalled();
    expect(service.appState()).toBe('ready');
  });

  it('should handle "empty" action from modal', async () => {
    await service.handleWelcomeAction('empty');
    
    expect(mockTokenStateService.initEmptyWorkspace).toHaveBeenCalled();
    expect(mockWorkspaceSession.markSessionActive).toHaveBeenCalled();
    expect(service.appState()).toBe('ready');
  });

  it('should handle "continue" action from modal', async () => {
    mockWorkspaceSession.loadWorkspace.mockResolvedValue({ files: [] });

    await service.handleWelcomeAction('continue');
    
    expect(mockWorkspaceSession.markSessionActive).toHaveBeenCalled();
    expect(mockTokenStateService.restoreWorkspace).toHaveBeenCalledWith({ files: [] });
    expect(service.appState()).toBe('ready');
  });
});
