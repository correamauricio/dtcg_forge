import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200"
         (click)="onBackdropClick($event)">
      <div class="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-300"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-lg">
            D
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">DTCG Forge</h2>
            <p class="text-sm text-gray-400">Design Token Community Group</p>
          </div>
        </div>

        <div class="space-y-3">
          <!-- Continue Button -->
          <button *ngIf="hasPreviousSession" 
                  (click)="onSelect('continue')"
                  class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg flex items-center space-x-3 transition-colors group">
            <svg class="w-5 h-5 text-blue-200 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="text-left">
              <div class="text-base">Continuar de onde parei</div>
              <div class="text-xs text-blue-200 opacity-80" *ngIf="lastUpdated">Última edição: {{ lastUpdated | date:'short' }}</div>
            </div>
          </button>

          <!-- Divider -->
          <div *ngIf="hasPreviousSession" class="flex items-center space-x-4 py-2">
            <div class="flex-1 border-t border-gray-800"></div>
            <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">ou inicie do zero</span>
            <div class="flex-1 border-t border-gray-800"></div>
          </div>

          <!-- Load Presets Button -->
          <button (click)="onSelect('presets')"
                  class="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium py-3 px-4 rounded-lg flex items-center space-x-3 transition-colors group border border-gray-700 hover:border-gray-600">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
            <div class="text-left">
              <div class="text-sm">Carregar Workspace de Exemplo</div>
              <div class="text-xs text-gray-500">Inicia com tokens semânticos e primitivos</div>
            </div>
          </button>

          <!-- New Empty Workspace Button -->
          <button (click)="onSelect('empty')"
                  class="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium py-3 px-4 rounded-lg flex items-center space-x-3 transition-colors group border border-gray-700 hover:border-gray-600">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <div class="text-left">
              <div class="text-sm">Novo Workspace em Branco</div>
              <div class="text-xs text-gray-500">Comece com uma área vazia</div>
            </div>
          </button>
        </div>
        
        <div class="mt-4 text-center">
          <p class="text-xs text-gray-600">Escrito e otimizado para o padrão W3C Design Tokens</p>
        </div>
      </div>
    </div>
  `
})
export class WelcomeModalComponent {
  @Input() hasPreviousSession = false;
  @Input() lastUpdated: number | null = null;

  @Output() action = new EventEmitter<'continue' | 'presets' | 'empty' | 'dismiss'>();

  onSelect(actionType: 'continue' | 'presets' | 'empty') {
    this.action.emit(actionType);
  }

  onBackdropClick(event: MouseEvent) {
    this.action.emit('dismiss');
  }
}
