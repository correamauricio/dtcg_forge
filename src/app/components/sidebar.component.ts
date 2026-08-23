import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../services/token.service';
import { TokenNodeComponent } from './token-node.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, TokenNodeComponent],
  template: `
    <aside class="w-80 h-full bg-gray-900 border-r border-gray-800 flex flex-col text-gray-300">
      <!-- Header: Title & JSON Toggle -->
      <div class="p-3 border-b border-gray-800 font-semibold flex items-center justify-between bg-gray-900 z-10 shrink-0">
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          <span class="text-sm font-bold text-white tracking-wide">Design Tokens</span>
        </div>
        
        <button 
          (click)="tokenService.toggleJsonEditor()"
          [title]="tokenService.isJsonEditorOpen() ? 'Esconder editor JSON' : 'Mostrar editor JSON'"
          class="flex items-center space-x-1.5 px-2 py-1 rounded text-xs font-mono transition-all duration-150 border cursor-pointer"
          [class.bg-blue-600]="tokenService.isJsonEditorOpen()"
          [class.text-white]="tokenService.isJsonEditorOpen()"
          [class.border-blue-500]="tokenService.isJsonEditorOpen()"
          [class.shadow-xs]="tokenService.isJsonEditorOpen()"
          [class.bg-gray-800]="!tokenService.isJsonEditorOpen()"
          [class.text-gray-400]="!tokenService.isJsonEditorOpen()"
          [class.border-gray-700]="!tokenService.isJsonEditorOpen()"
          [class.hover:text-gray-200]="!tokenService.isJsonEditorOpen()"
          [class.hover:border-gray-600]="!tokenService.isJsonEditorOpen()">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
          </svg>
          <span>JSON</span>
        </button>
      </div>

      <!-- Search Bar Area -->
      <div class="p-2 border-b border-gray-800/80 bg-gray-900/50 shrink-0">
        <div class="relative flex items-center">
          <svg class="w-3.5 h-3.5 text-gray-500 absolute left-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>

          <input
            data-testid="token-search-input"
            type="text"
            [ngModel]="tokenService.searchQuery()"
            (ngModelChange)="tokenService.setSearchQuery($event)"
            (keydown.escape)="tokenService.clearSearchQuery()"
            placeholder="Buscar tokens..."
            class="w-full bg-gray-800/70 hover:bg-gray-800 focus:bg-gray-950 text-gray-200 focus:text-white placeholder-gray-500 text-xs pl-8 pr-7 py-1.5 rounded border border-gray-700/60 focus:border-blue-500 outline-none transition-all"
          />

          <!-- Clear Search Button -->
          <button
            *ngIf="tokenService.searchQuery()"
            data-testid="clear-search-btn"
            (click)="tokenService.clearSearchQuery()"
            title="Limpar busca (Esc)"
            class="absolute right-1.5 p-1 text-gray-400 hover:text-white hover:bg-gray-700/60 rounded cursor-pointer transition-colors"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Filter Count Badge -->
        <div *ngIf="tokenService.searchQuery()" data-testid="search-count-badge" class="flex items-center justify-between mt-1.5 px-1 text-[10px] text-gray-400">
          <span class="text-gray-500">Filtrando ativos</span>
          <span class="bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800/60 font-mono font-medium">
            {{ tokenService.filteredTokenCount() }} de {{ tokenService.totalTokenCount() }}
          </span>
        </div>
      </div>

      <!-- Token Tree List Area -->
      <div class="flex-1 overflow-y-auto custom-scrollbar px-2 pb-2">
        <!-- Matching Token Tree Nodes -->
        <app-token-node
          *ngIf="tokenService.filteredTokenCount() > 0"
          [node]="tokenService.groupedTokens()"
          [selectedPath]="tokenService.selectedTokenPath()"
          (selectToken)="onSelectToken($event)"
          (updateToken)="onUpdateToken($event)">
        </app-token-node>

        <!-- Empty Search State -->
        <div
          *ngIf="tokenService.filteredTokenCount() === 0 && tokenService.searchQuery()"
          data-testid="search-empty-state"
          class="flex flex-col items-center justify-center p-6 text-center text-gray-400 my-auto h-56 space-y-2"
        >
          <div class="w-10 h-10 rounded-full bg-gray-800/80 border border-gray-700/70 flex items-center justify-center text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div class="flex flex-col space-y-0.5">
            <span class="text-xs font-semibold text-gray-200">Nenhum token encontrado</span>
            <span class="text-[11px] text-gray-400 truncate max-w-55">
              Nenhum token corresponde a "{{ tokenService.searchQuery() }}"
            </span>
          </div>
          <button
            data-testid="empty-state-reset-btn"
            (click)="tokenService.clearSearchQuery()"
            class="mt-1 px-2.5 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded transition-colors cursor-pointer shadow-xs"
          >
            Limpar busca
          </button>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  tokenService = inject(TokenService);

  onSelectToken(event: { path: string[] }) {
    this.tokenService.setSelectedTokenPath(event.path);
  }

  onUpdateToken(event: { path: string[], value: string }) {
    this.tokenService.updateTokenValue(event.path, event.value);
  }
}
