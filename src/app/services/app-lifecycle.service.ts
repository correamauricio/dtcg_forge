import { Injectable, inject, signal } from '@angular/core';
import { WorkspaceSessionService } from './workspace-session.service';
import { TokenStateService } from './token-state.service';

export type AppState = 'initializing' | 'welcome' | 'ready';

@Injectable({ providedIn: 'root' })
export class AppLifecycleService {
  private workspaceSession = inject(WorkspaceSessionService);
  private tokenState = inject(TokenStateService);

  appState = signal<AppState>('initializing');
  hasPreviousSession = signal(false);
  lastUpdated = signal<number | null>(null);

  async initializeApp() {
    const sessionInit = await this.workspaceSession.initializeSession();

    if (sessionInit.status === 'restored' && sessionInit.workspace) {
      this.tokenState.restoreWorkspace(sessionInit.workspace);
      this.appState.set('ready');
    } else {
      const savedWorkspace = await this.workspaceSession.loadWorkspace();
      if (savedWorkspace) {
        this.hasPreviousSession.set(true);
        this.lastUpdated.set(savedWorkspace.updatedAt);
      }
      this.appState.set('welcome');
    }
  }

  async handleWelcomeAction(action: 'continue' | 'presets' | 'empty' | 'dismiss') {
    this.appState.set('initializing');
    
    if (action === 'continue' || (action === 'dismiss' && this.hasPreviousSession())) {
      const ws = await this.workspaceSession.loadWorkspace();
      if (ws) {
        this.tokenState.restoreWorkspace(ws);
      } else {
        this.tokenState.loadPreset();
      }
    } else if (action === 'presets' || (action === 'dismiss' && !this.hasPreviousSession())) {
      this.tokenState.loadPreset();
    } else if (action === 'empty') {
      this.tokenState.initEmptyWorkspace();
    }
    
    this.workspaceSession.markSessionActive();
    this.appState.set('ready');
  }
}
