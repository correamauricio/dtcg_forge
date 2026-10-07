import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileExplorerComponent } from './components/file-explorer.component';
import { SidebarComponent } from './components/sidebar.component';
import { EditorComponent } from './components/editor.component';
import { PreviewComponent } from './components/preview.component';
import { WelcomeModalComponent } from './components/welcome-modal.component';
import { ShortcutService } from './services/shortcut.service';
import { TokenStateService } from './services/token-state.service';
import { WorkspaceStorageService } from './services/workspace-storage.service';

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
  workspaceStorage = inject(WorkspaceStorageService);

  isAppReady = signal(false);
  showWelcomeModal = signal(false);
  hasPreviousSession = signal(false);
  lastUpdated = signal<number | null>(null);

  constructor() {
    this.shortcutService.init();
  }

  async ngOnInit() {
    // Tenta inicializar a sessão a partir do sessionStorage e IndexedDB
    const sessionStatus = await this.tokenStateService.initializeSession();

    if (sessionStatus === 'restored') {
      // Sessão já ativa e workspace restaurado
      this.isAppReady.set(true);
    } else {
      // Verifica se há algo salvo no storage mesmo sem sessão ativa
      const savedWorkspace = await this.workspaceStorage.loadWorkspace();
      
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
      // Continue = carrega do BD. Como a sessão não estava ativa, temos que forçar a leitura do DB aqui 
      // ou apenas chamar um método no TokenStateService para carregar tudo.
      this.restoreWorkspaceFromDb();
    } else if (action === 'presets' || (action === 'dismiss' && !this.hasPreviousSession())) {
      this.tokenStateService.loadPreset();
      this.isAppReady.set(true);
    } else if (action === 'empty') {
      this.tokenStateService.initEmptyWorkspace();
      this.isAppReady.set(true);
    }
    
    sessionStorage.setItem('dtcg_forge_session_active', 'true');
  }

  private async restoreWorkspaceFromDb() {
    const ws = await this.workspaceStorage.loadWorkspace();
    if (ws) {
      // Vamos injetar o load na service
      // Na verdade, initializeSession já faz o restore se a session estiver ativa.
      // Podemos apenas setar a session e chamar initializeSession novamente.
      sessionStorage.setItem('dtcg_forge_session_active', 'true');
      await this.tokenStateService.initializeSession();
    } else {
      this.tokenStateService.loadPreset();
    }
    this.isAppReady.set(true);
  }
}
