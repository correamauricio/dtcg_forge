import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-palette-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" (click)="onCancel()">
        <div class="bg-gray-900 border border-gray-800 rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]" (click)="$event.stopPropagation()">
          
          <div class="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 class="text-lg font-bold text-gray-200">Generator Script</h2>
            <button class="text-gray-500 hover:text-gray-300 transition-colors" (click)="onCancel()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div class="p-4 flex-1 overflow-y-auto">
            <p class="text-sm text-gray-400 mb-4">
              Edit the javascript code used to generate the color palette. 
              The function receives <code class="bg-gray-800 px-1 py-0.5 rounded">seedColor</code>, 
              <code class="bg-gray-800 px-1 py-0.5 rounded">tokenName</code>, and 
              <code class="bg-gray-800 px-1 py-0.5 rounded">currentGroup</code>, and must return a new group object.
            </p>
            
            <textarea 
              [(ngModel)]="currentScript" 
              class="w-full h-80 bg-gray-950 border border-gray-800 rounded p-4 font-mono text-xs text-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              spellcheck="false"
            ></textarea>
          </div>

          <div class="p-4 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/50 rounded-b-lg">
            <button class="btn-cancel px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-transparent hover:bg-gray-800 rounded transition-colors" (click)="onCancel()">
              Cancel
            </button>
            <button class="btn-save px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded shadow transition-colors" (click)="onSave()">
              Save Script
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class PaletteConfigModalComponent {
  @Input() isOpen: boolean = false;
  @Input() currentScript: string = '';

  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  onCancel() {
    this.cancel.emit();
  }

  onSave() {
    this.save.emit(this.currentScript);
  }
}
