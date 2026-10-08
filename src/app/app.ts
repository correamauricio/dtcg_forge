import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileExplorerComponent } from './components/file-explorer.component';
import { SidebarComponent } from './components/sidebar.component';
import { EditorComponent } from './components/editor.component';
import { PreviewComponent } from './components/preview.component';
import { WelcomeModalComponent } from './components/welcome-modal.component';
import { ShortcutService } from './services/shortcut.service';
import { TokenStateService } from './services/token-state.service';
import { WorkspaceSessionService } from './services/workspace-session.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FileExplorerComponent, SidebarComponent, EditorComponent, PreviewComponent, WelcomeModalComponent],
  template: `
    <div class="h-screen w-screen flex bg-gray-900 overflow-hidden font-sans">
      <ng-container *ngIf="isAppReady()">
        <app-file-explorer class="shrink-0"></app-file-explorer>
        <app-sidebar class="shrink-0"></app-sidebar>
        <app-editor class="shrink-0"></app-editor>
        <app-preview class="flex-1"></app-preview>
      </ng-container>
      
      <!-- Show nothing or a loading spinner if app is initializing -->
    </div>
    
    <app-welcome-modal 
      *ngIf="showWelcomeModal()"
      [hasPreviousSession]="hasPreviousSession()"
      [lastUpdated]="lastUpdated()"
      (action)="handleModalAction($event)">
    </app-welcome-modal>
  `,
  styles: []
})
export class App implements OnInit {
  shortcutService = inject(ShortcutService);
  tokenStateService = inject(TokenStateService);
  workspaceSession = inject(WorkspaceSessionService);

  isAppReady = signal(false);
  showWelcomeModal = signal(false);
  hasPreviousSession = signal(false);
  lastUpdated = signal<number | null>(null);

  constructor() {
    this.shortcutService.init();
  }

  async ngOnInit() {
    const sessionInit = await this.workspaceSession.initializeSession();

    if (sessionInit.status === 'restored' && sessionInit.workspace) {
      this.tokenStateService.restoreWorkspace(sessionInit.workspace);
      this.isAppReady.set(true);
    } else {
      const savedWorkspace = await this.workspaceSession.loadWorkspace();
      if (savedWorkspace) {
        this.hasPreviousSession.set(true);
        this.lastUpdated.set(savedWorkspace.updatedAt);
      }
      this.showWelcomeModal.set(true);
    }
  }

  handleModalAction(action: 'continue' | 'presets' | 'empty' | 'dismiss') {
    this.showWelcomeModal.set(false);
    
    if (action === 'continue' || (action === 'dismiss' && this.hasPreviousSession())) {
      this.restoreWorkspaceFromDb();
    } else if (action === 'presets' || (action === 'dismiss' && !this.hasPreviousSession())) {
      this.tokenStateService.loadPreset();
      this.isAppReady.set(true);
    } else if (action === 'empty') {
      this.tokenStateService.initEmptyWorkspace();
      this.isAppReady.set(true);
    }
    
    this.workspaceSession.markSessionActive();
  }

  private async restoreWorkspaceFromDb() {
    const ws = await this.workspaceSession.loadWorkspace();
    if (ws) {
      this.tokenStateService.restoreWorkspace(ws);
    } else {
      this.tokenStateService.loadPreset();
    }
    this.isAppReady.set(true);
  }
}
