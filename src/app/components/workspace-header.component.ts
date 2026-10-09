import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from '../services/token.service';
import { TokenStateService } from '../services/token-state.service';
import { FileImportService } from '../services/file-import.service';
import { WorkspaceActionModalComponent } from './workspace-action-modal.component';

@Component({
  selector: 'app-workspace-header',
  standalone: true,
  imports: [CommonModule, WorkspaceActionModalComponent],
  template: `
    <!-- Header: Logo, Branding & Export All -->
    <div class="p-3 border-b border-gray-800 flex items-center justify-between bg-gray-900 shrink-0">
      <div class="flex items-center space-x-2">
        <div class="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
          D
        </div>
        <span class="font-bold text-sm tracking-wide text-white">DTCG Forge</span>
      </div>

      <div class="flex items-center space-x-1">
        <button
          data-testid="export-all-btn"
          (click)="onExportAll()"
          title="Exportar todos os arquivos"
          class="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
        </button>
        
        <button
          data-testid="workspace-options-btn"
          (click)="toggleWorkspaceMenu($event)"
          title="Opções do Workspace"
          class="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors cursor-pointer relative"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Import Button Area -->
    <div class="p-2 border-b border-gray-800/80 bg-gray-900/50 relative">
      <label class="w-full py-1.5 px-2 bg-gray-800/70 hover:bg-gray-800 border border-gray-700/60 rounded flex items-center justify-center space-x-1.5 cursor-pointer text-xs font-medium text-gray-300 hover:text-white transition-all shadow-xs">
        <svg class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        <span>Importar Arquivos</span>
        <input type="file" multiple accept=".json" class="hidden" (change)="onFileInput($event)">
      </label>
      
      <!-- Workspace Actions Popover -->
      <div *ngIf="isWorkspaceMenuOpen()"
           (click)="$event.stopPropagation()"
           class="absolute top-1 right-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-50 text-xs w-48 animate-in fade-in zoom-in-95 duration-100">
        <button (click)="requestWorkspaceAction('new')" class="w-full px-3 py-2 text-left hover:bg-gray-700 flex items-center space-x-2 text-gray-200 hover:text-white">
          <svg class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          <span>Novo Workspace</span>
        </button>
        <button (click)="requestWorkspaceAction('preset')" class="w-full px-3 py-2 text-left hover:bg-gray-700 flex items-center space-x-2 text-gray-200 hover:text-white">
          <svg class="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          <span>Carregar Workspace de Exemplo</span>
        </button>
      </div>
    </div>

    <!-- Workspace Action Confirmation Modal -->
    <app-workspace-action-modal
      *ngIf="pendingWorkspaceAction()"
      (confirm)="confirmWorkspaceAction($event)"
      (cancel)="cancelWorkspaceAction()">
    </app-workspace-action-modal>
  `
})
export class WorkspaceHeaderComponent {
  tokenService = inject(TokenService);
  tokenState = inject(TokenStateService);
  fileImport = inject(FileImportService);

  isWorkspaceMenuOpen = signal<boolean>(false);
  pendingWorkspaceAction = signal<'new' | 'preset' | null>(null);

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.isWorkspaceMenuOpen()) {
        this.isWorkspaceMenuOpen.set(false);
      }
      if (this.pendingWorkspaceAction()) {
        this.cancelWorkspaceAction();
      }
    }
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.isWorkspaceMenuOpen.set(false);
  }

  onFileInput(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.fileImport.readAndAddFiles(files);
    }
  }

  onExportAll() {
    const duplicates = this.tokenService.duplicateTokensInfo();
    if (duplicates.length > 0) {
      alert('Aviso: Existem tokens duplicados em seus arquivos. Verifique os conflitos no rodapé antes de exportar.');
    }

    const files = this.tokenService.files();
    for (const file of files) {
      this.fileImport.downloadJson(file.name || 'design-tokens.json', file.content);
    }
  }

  toggleWorkspaceMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isWorkspaceMenuOpen.update(val => !val);
  }

  requestWorkspaceAction(action: 'new' | 'preset') {
    this.isWorkspaceMenuOpen.set(false);
    
    // If the workspace is currently empty (no files), we skip confirmation
    if (this.tokenService.files().length === 0) {
      this.executeWorkspaceAction(action);
      return;
    }

    // Show confirmation modal
    this.pendingWorkspaceAction.set(action);
  }

  confirmWorkspaceAction(withBackup: boolean) {
    const action = this.pendingWorkspaceAction();
    if (!action) return;

    if (withBackup) {
      this.onExportAll();
    }
    
    this.executeWorkspaceAction(action);
    this.pendingWorkspaceAction.set(null);
  }

  cancelWorkspaceAction() {
    this.pendingWorkspaceAction.set(null);
  }

  private executeWorkspaceAction(action: 'new' | 'preset') {
    if (action === 'new') {
      this.tokenState.initEmptyWorkspace();
    } else if (action === 'preset') {
      this.tokenState.loadPreset();
    }
  }
}
