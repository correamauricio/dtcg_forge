import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-conflict-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
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
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
  `]
})
export class ConflictFooterComponent {
  tokenService = inject(TokenService);
}
