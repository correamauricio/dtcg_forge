import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workspace-action-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-gray-900 border border-gray-700 p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4" (click)="$event.stopPropagation()">
        <div class="flex items-center space-x-3 mb-4 text-orange-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h3 class="text-lg font-bold text-white">Atenção</h3>
        </div>
        <p class="text-gray-300 text-sm mb-6 leading-relaxed">
          Essa ação substituirá o seu Workspace atual. Deseja baixar um backup antes de prosseguir?
        </p>
        <div class="flex flex-col space-y-2">
          <button (click)="confirm.emit(true)" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span>Baixar Backup e Continuar</span>
          </button>
          <button (click)="confirm.emit(false)" class="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-medium rounded-lg transition-colors">
            Continuar sem Salvar
          </button>
          <button (click)="cancel.emit()" class="w-full py-2 border border-gray-700 hover:bg-gray-800 text-gray-300 font-medium rounded-lg transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `
})
export class WorkspaceActionModalComponent {
  @Output() confirm = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();
}
