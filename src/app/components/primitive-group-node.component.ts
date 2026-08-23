import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TokenNodeComponent } from './token-node.component';
import { FlatToken } from '../models/token.model';
import { PaletteConfigModalComponent } from './palette-config-modal.component';
import { PaletteGeneratorService } from '../services/palette-generator.service';

@Component({
  selector: 'app-primitive-group-node',
  standalone: true,
  imports: [CommonModule, FormsModule, forwardRef(() => TokenNodeComponent), PaletteConfigModalComponent],
  template: `
    <div class="mt-0.5 border border-gray-800 rounded bg-gray-900/50 p-2">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-2">
          <span class="font-bold text-gray-400 text-[10px] uppercase tracking-wider">{{ nodeName }}</span>
          <button class="text-gray-500 hover:text-gray-300" title="Configure Generator Script" (click)="openConfig()">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
        </div>
        <button (click)="toggleExpanded()" class="text-[10px] uppercase font-bold tracking-wider text-blue-400 hover:text-blue-300">
          {{ isExpanded ? 'Collapse' : 'Expand' }}
        </button>
      </div>
      
      @if (!isExpanded) {
        <div class="flex flex-row flex-wrap gap-1.5">
          @for (key of getKeys(); track key) {
            <div class="relative w-6 h-6 rounded-full overflow-hidden border border-gray-600 shadow-xs cursor-pointer group"
                 [title]="key + ' (' + getToken(key)?.value + ')'"
                 (click)="onSelectToken([nodeName, key])">
              <input type="color" 
                     [ngModel]="formatToHex(getToken(key)?.value)"
                     (change)="onColorChange([nodeName, key], $any($event.target).value)"
                     class="absolute -top-2 -left-2 w-10 h-10 cursor-pointer">
            </div>
          }
        </div>
      } @else {
        <div class="-mx-2 -mb-2 border-t border-gray-800">
          <app-token-node
            [node]="node"
            [depth]="0"
            (selectToken)="selectToken.emit($event)"
            (updateToken)="updateToken.emit($event)">
          </app-token-node>
        </div>
      }
    </div>

    <app-palette-config-modal
      [isOpen]="isConfigModalOpen"
      [currentScript]="generatorScript"
      (save)="onSaveConfig($event)"
      (cancel)="onCancelConfig()"
    ></app-palette-config-modal>
  `
})
export class PrimitiveGroupNodeComponent {
  @Input() node: any = {};
  @Input() nodeName: string = '';
  @Input() depth: number = 0;

  @Output() selectToken = new EventEmitter<{ path: string[] }>();
  @Output() updateToken = new EventEmitter<{ path: string[], value: any }>();

  isExpanded = false;
  isConfigModalOpen = false;
  generatorScript = '';

  constructor(private paletteService: PaletteGeneratorService) {}

  getKeys(): string[] {
    return Object.keys(this.node || {}).filter(k => k !== '_token');
  }

  getToken(key: string): FlatToken | undefined {
    return this.node[key]?._token;
  }

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  openConfig() {
    this.generatorScript = this.paletteService.getScript();
    this.isConfigModalOpen = true;
  }

  onSaveConfig(script: string) {
    this.paletteService.saveScript(script);
    this.isConfigModalOpen = false;
  }

  onCancelConfig() {
    this.isConfigModalOpen = false;
  }

  onSelectToken(path: string[]) {
    const key = path[path.length - 1];
    const token = this.getToken(key);
    this.selectToken.emit({ path: token ? token.originalPath : path });
  }

  onColorChange(path: string[], value: string) {
    const seedName = path[path.length - 1];
    const seedToken = this.getToken(seedName);
    
    // We must use the originalPath of the seed token to know the full absolute path from the root
    // because path here only contains [nodeName, seedName].
    const basePath = seedToken ? seedToken.originalPath.slice(0, -1) : path.slice(0, -1);
    
    try {
      const generatedGroup = this.paletteService.generate(value, seedName, this.node);
      
      // Emit update for each generated color
      for (const [key, generatedData] of Object.entries(generatedGroup)) {
        const updatePath = [...basePath, key];
        
        // Handle both formats: script returning { value: '#fff' } or just '#fff'
        const colorValue = typeof generatedData === 'object' && generatedData !== null && 'value' in generatedData
          ? generatedData.value
          : generatedData;

        this.updateToken.emit({ path: updatePath, value: colorValue });
      }
    } catch (e) {
      console.error('Failed to generate palette:', e);
      // Fallback: just emit the single color change if generation fails
      this.updateToken.emit({ path: [...basePath, seedName], value });
    }
  }

  formatToHex(val: string): string {
    if (!val || typeof val !== 'string') return '#000000';
    if (val.startsWith('#')) {
      if (val.length === 4) return '#' + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
      if (val.length === 7 || val.length === 9) return val.substring(0, 7);
    }
    return '#000000';
  }
}
