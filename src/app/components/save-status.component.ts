import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-save-status',
  standalone: true,
  imports: [CommonModule],
  template: `
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
  `
})
export class SaveStatusComponent {
  tokenService = inject(TokenService);
}
