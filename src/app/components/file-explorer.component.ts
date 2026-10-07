import { Component, computed, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../services/token.service';
import { TokenFile, VariantGroup } from '../models/token.model';

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <aside
      class="w-64 h-full bg-gray-900 border-r border-gray-800 flex flex-col text-gray-300 relative select-none transition-colors duration-150"
      [class.ring-2]="isDraggingOver()"
      [class.ring-blue-500]="isDraggingOver()"
      [class.ring-inset]="isDraggingOver()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onFileDrop($event)"
    >
      <!-- Drop Overlay Feedback -->
      <div
        *ngIf="isDraggingOver()"
        class="absolute inset-0 bg-blue-950/70 backdrop-blur-xs border-2 border-dashed border-blue-400 z-50 flex flex-col items-center justify-center pointer-events-none p-4 text-center"
      >
        <svg class="w-10 h-10 text-blue-400 mb-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <span class="text-sm font-semibold text-blue-200">Solte os arquivos JSON aqui</span>
      </div>

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
        </div>
      </div>

      <!-- Import Button Area -->
      <div class="p-2 border-b border-gray-800/80 bg-gray-900/50">
        <label class="w-full py-1.5 px-2 bg-gray-800/70 hover:bg-gray-800 border border-gray-700/60 rounded flex items-center justify-center space-x-1.5 cursor-pointer text-xs font-medium text-gray-300 hover:text-white transition-all shadow-xs">
          <svg class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>Importar Arquivos</span>
          <input type="file" multiple accept=".json" class="hidden" (change)="onFileInput($event)">
        </label>
      </div>

      <!-- Files List Area -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3">
        <!-- Standalone Files -->
        <div *ngIf="standaloneFiles().length > 0" class="space-y-0.5">
          <div class="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-2 py-1">
            Arquivos
          </div>

          <div *ngFor="let file of standaloneFiles()"
               (click)="onFileSelect(file.name)"
               (dblclick)="startRename(file.name)"
               class="group relative flex items-center justify-between px-2 py-1.5 rounded text-xs transition-all cursor-pointer"
               [class.bg-blue-600]="tokenService.activeFileName() === file.name"
               [class.text-white]="tokenService.activeFileName() === file.name"
               [class.font-medium]="tokenService.activeFileName() === file.name"
               [class.shadow-xs]="tokenService.activeFileName() === file.name"
               [class.hover:bg-gray-800]="tokenService.activeFileName() !== file.name"
               [class.text-gray-300]="tokenService.activeFileName() !== file.name">
            
            <div class="flex items-center space-x-1.5 min-w-0 flex-1">
              <svg class="w-3.5 h-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>

              <!-- Inline Rename Input -->
              <input *ngIf="editingFileName() === file.name"
                     #renameInput
                     type="text"
                     [ngModel]="editingFileValue()"
                     (ngModelChange)="editingFileValue.set($event)"
                     (keydown.enter)="commitRename(file.name)"
                     (keydown.escape)="cancelRename()"
                     (blur)="commitRename(file.name)"
                     (click)="$event.stopPropagation()"
                     class="bg-gray-950 text-white border border-blue-400 rounded px-1 py-0.5 text-xs w-full outline-none focus:ring-1 focus:ring-blue-400">

              <span *ngIf="editingFileName() !== file.name" class="truncate" [title]="file.name">
                {{ file.name }}
              </span>
            </div>

            <!-- Actions Menu Trigger -->
            <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="openMenu(file.name, $event)"
                      title="Opções do arquivo"
                      class="p-0.5 hover:bg-black/20 rounded text-gray-400 hover:text-white">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Variant Groups Containers (Elevated Surface) -->
        <div *ngIf="tokenService.variantGroups().length > 0" class="space-y-2">
          <div *ngFor="let group of tokenService.variantGroups()"
               data-testid="variant-group-container"
               class="bg-gray-800/90 border border-gray-700/80 rounded-lg p-1.5 space-y-1 shadow-sm">
            
            <div class="flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <span class="flex items-center space-x-1">
                <svg class="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                </svg>
                <span>Variantes</span>
              </span>
              <span class="text-[9px] text-gray-500 font-normal">({{ group.files.length }})</span>
            </div>

            <div class="space-y-0.5">
              <div *ngFor="let fileName of group.files"
                   (click)="onVariantSelect(group.id, fileName)"
                   (dblclick)="startRename(fileName)"
                   class="group relative flex items-center justify-between px-2 py-1.5 rounded text-xs transition-all cursor-pointer"
                   [class.bg-blue-600]="tokenService.activeFileName() === fileName"
                   [class.text-white]="tokenService.activeFileName() === fileName"
                   [class.font-medium]="tokenService.activeFileName() === fileName"
                   [class.shadow-xs]="tokenService.activeFileName() === fileName"
                   [class.hover:bg-gray-700/60]="tokenService.activeFileName() !== fileName"
                   [class.text-gray-300]="tokenService.activeFileName() !== fileName">
                
                <div class="flex items-center space-x-1.5 min-w-0 flex-1">
                  <!-- Eye Icon Indicator (Active Preview Variant) -->
                  <button
                    (click)="onVariantEyeClick(group.id, fileName, $event)"
                    [title]="group.activeFile === fileName ? 'Variante ativa no Preview' : 'Ativar esta variante no Preview'"
                    class="shrink-0 p-0.5 rounded transition-colors cursor-pointer"
                    [class.text-blue-300]="group.activeFile === fileName && tokenService.activeFileName() === fileName"
                    [class.text-blue-400]="group.activeFile === fileName && tokenService.activeFileName() !== fileName"
                    [class.text-gray-500]="group.activeFile !== fileName"
                    [class.hover:text-gray-300]="group.activeFile !== fileName"
                  >
                    <svg *ngIf="group.activeFile === fileName" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    <svg *ngIf="group.activeFile !== fileName" class="w-3.5 h-3.5 opacity-60 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
                    </svg>
                  </button>

                  <!-- Inline Rename Input -->
                  <input *ngIf="editingFileName() === fileName"
                         type="text"
                         [ngModel]="editingFileValue()"
                         (ngModelChange)="editingFileValue.set($event)"
                         (keydown.enter)="commitRename(fileName)"
                         (keydown.escape)="cancelRename()"
                         (blur)="commitRename(fileName)"
                         (click)="$event.stopPropagation()"
                         class="bg-gray-950 text-white border border-blue-400 rounded px-1 py-0.5 text-xs w-full outline-none focus:ring-1 focus:ring-blue-400">

                  <span *ngIf="editingFileName() !== fileName" class="truncate" [title]="fileName">
                    {{ fileName }}
                  </span>
                </div>

                <!-- Actions Menu Trigger -->
                <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button (click)="openMenu(fileName, $event)"
                          title="Opções do arquivo"
                          class="p-0.5 hover:bg-black/20 rounded text-gray-400 hover:text-white">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Context Menu Popup -->
      <div *ngIf="activeMenuFile()"
           (click)="$event.stopPropagation()"
           class="absolute right-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-50 text-xs w-36 animate-in fade-in zoom-in-95 duration-100"
           [style.top.px]="menuPosition().y">
        <button (click)="onMenuRename()" class="w-full px-3 py-1.5 text-left hover:bg-gray-700 flex items-center space-x-2 text-gray-200 hover:text-white">
          <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          <span>Renomear</span>
        </button>
        <button (click)="onMenuExport()" class="w-full px-3 py-1.5 text-left hover:bg-gray-700 flex items-center space-x-2 text-gray-200 hover:text-white">
          <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          <span>Exportar JSON</span>
        </button>
        <div class="border-t border-gray-700 my-1"></div>
        <button (click)="onMenuDelete()" class="w-full px-3 py-1.5 text-left hover:bg-red-600/20 text-red-400 hover:text-red-300 flex items-center space-x-2">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          <span>Excluir</span>
        </button>
      </div>

      <!-- Footer: Duplicate Tokens / Conflicts (Pure Visual Treatment) -->
      <div *ngIf="tokenService.duplicateTokensInfo().length > 0"
           data-testid="conflict-footer"
           class="bg-red-950/90 border-t border-red-900/80 p-2.5 text-xs text-red-200 flex flex-col space-y-1 shrink-0">
        <div class="font-semibold flex items-center space-x-1.5 text-red-300">
          <svg class="w-3.5 h-3.5 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <span>Atenção: Conflito de Tokens</span>
        </div>
        <ul class="list-disc pl-4 space-y-0.5 max-h-24 overflow-y-auto custom-scrollbar text-[11px] text-red-300/90">
          <li *ngFor="let msg of tokenService.duplicateTokensInfo()">{{ msg }}</li>
        </ul>
      </div>

      <!-- Footer: Save Status Indicator -->
      <div class="p-2 border-t border-gray-800 bg-gray-900 shrink-0 flex items-center justify-between" data-testid="save-status-indicator">
        <div class="flex items-center space-x-1.5 text-[11px] font-medium transition-colors"
             [ngClass]="{'text-blue-400': tokenService.saveStatus() === 'saving', 'text-gray-500': tokenService.saveStatus() === 'saved', 'text-red-400': tokenService.saveStatus() === 'error'}">
             
          <ng-container *ngIf="tokenService.saveStatus() === 'saving'">
            <svg class="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>Salvando...</span>
          </ng-container>

          <ng-container *ngIf="tokenService.saveStatus() === 'saved'">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Salvo localmente</span>
          </ng-container>

          <ng-container *ngIf="tokenService.saveStatus() === 'error'">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Erro ao salvar</span>
          </ng-container>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
  `]
})
export class FileExplorerComponent {
  tokenService = inject(TokenService);

  isDraggingOver = signal<boolean>(false);
  editingFileName = signal<string | null>(null);
  editingFileValue = signal<string>('');

  activeMenuFile = signal<string | null>(null);
  menuPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  standaloneFiles = computed(() => {
    const variantFileNames = new Set(this.tokenService.variantGroups().flatMap(g => g.files));
    return this.tokenService.files().filter(f => !variantFileNames.has(f.name));
  });

  @HostListener('document:click')
  onDocumentClick() {
    this.activeMenuFile.set(null);
  }

  onFileSelect(fileName: string) {
    this.tokenService.setActiveFileName(fileName);
  }

  onVariantSelect(groupId: string, fileName: string) {
    this.tokenService.setActiveFileName(fileName);
    this.tokenService.selectVariant(groupId, fileName);
  }

  onVariantEyeClick(groupId: string, fileName: string, event: MouseEvent) {
    event.stopPropagation();
    this.tokenService.selectVariant(groupId, fileName);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver.set(false);
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.readAndAddFiles(files);
    }
  }

  onFileInput(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.readAndAddFiles(files);
    }
  }

  private readAndAddFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const json = JSON.parse(e.target.result);
          this.tokenService.addFile(file.name, json);
        } catch (err) {
          console.error('Failed to parse JSON', err);
          alert(`Erro ao ler o arquivo ${file.name}: JSON inválido.`);
        }
      };
      reader.readAsText(file);
    }
  }

  startRename(fileName: string) {
    this.editingFileName.set(fileName);
    this.editingFileValue.set(fileName);
  }

  commitRename(oldName: string) {
    const newName = this.editingFileValue().trim();
    if (newName && newName !== oldName) {
      this.tokenService.renameFile(oldName, newName);
    }
    this.editingFileName.set(null);
  }

  cancelRename() {
    this.editingFileName.set(null);
  }

  onDeleteFile(fileName: string, event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (confirm(`Tem certeza de que deseja excluir o arquivo "${fileName}"?`)) {
      this.tokenService.deleteFile(fileName);
    }
  }

  openMenu(fileName: string, event: MouseEvent) {
    event.stopPropagation();
    this.activeMenuFile.set(fileName);
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.menuPosition.set({ x: rect.left, y: rect.top + 20 });
  }

  onMenuRename() {
    const file = this.activeMenuFile();
    if (file) {
      this.startRename(file);
    }
    this.activeMenuFile.set(null);
  }

  onMenuExport() {
    const fileName = this.activeMenuFile();
    if (fileName) {
      const file = this.tokenService.files().find(f => f.name === fileName);
      if (file) {
        this.downloadJson(file.name, file.content);
      }
    }
    this.activeMenuFile.set(null);
  }

  onMenuDelete() {
    const file = this.activeMenuFile();
    if (file) {
      this.onDeleteFile(file);
    }
    this.activeMenuFile.set(null);
  }

  onExportAll() {
    const duplicates = this.tokenService.duplicateTokensInfo();
    if (duplicates.length > 0) {
      alert('Aviso: Existem tokens duplicados em seus arquivos. Verifique os conflitos no rodapé antes de exportar.');
    }

    const files = this.tokenService.files();
    for (const file of files) {
      this.downloadJson(file.name || 'design-tokens.json', file.content);
    }
  }

  private downloadJson(filename: string, content: any) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(content, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', filename);
    dlAnchorElem.click();
    dlAnchorElem.remove();
  }
}
