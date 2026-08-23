import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlatToken } from '../../models/token.model';
import { AliasAutocompleteComponent } from '../alias-autocomplete.component';

@Component({
  selector: 'app-composite-node',
  standalone: true,
  imports: [CommonModule, AliasAutocompleteComponent],
  host: {
    class: 'block w-full min-w-0'
  },
  template: `
    <div class="flex flex-col w-full text-xs min-w-0">
      <!-- Header / Accordion trigger -->
      <div class="flex items-center justify-end space-x-1 cursor-pointer py-0.5 text-gray-400 hover:text-gray-200 transition-colors" (click)="toggle()">
        <span class="font-mono text-[10px] px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700">
          {{ isArray ? '[' + getKeys().length + ']' : '{' + getKeys().length + '}' }}
        </span>
        <svg class="w-3.5 h-3.5 text-gray-500 transform transition-transform" [class.rotate-180]="isOpen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>

      <!-- Accordion body -->
      <div *ngIf="isOpen" class="pl-2 border-l border-gray-700/80 mt-1 space-y-1 w-full min-w-0">
        <!-- Primitive Fallback for Aliased Objects -->
        <div *ngIf="isStringAlias" class="mt-1 w-full min-w-0">
           <app-alias-autocomplete
              class="w-full min-w-0"
              [value]="token.value"
              [currentPath]="token.path"
              (valueChange)="onRootValueChange($event)"
            ></app-alias-autocomplete>
        </div>

        <ng-container *ngIf="!isStringAlias">
          <div *ngFor="let key of getKeys()" class="flex items-center justify-between gap-2 py-0.5 min-w-0">
            <span class="max-w-[45%] shrink-0 text-[10px] text-gray-500 font-mono truncate" [title]="key">{{ key }}</span>
            <div class="flex-1 min-w-0">
              <app-alias-autocomplete
                class="w-full min-w-0"
                [value]="getSubValueString(key)"
                [currentPath]="token.path + '.' + key"
                (valueChange)="onSubValueChange(key, $event)"
              ></app-alias-autocomplete>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `
})
export class CompositeNodeComponent {
  @Input({ required: true }) token!: FlatToken;
  @Input({ required: true }) nodeData!: any;
  @Input({ required: true }) nodeKey!: string;
  @Output() updateToken = new EventEmitter<{ path: string[], value: any }>();

  isOpen = false;

  get isArray() {
    return Array.isArray(this.token.value);
  }

  get isStringAlias() {
    return typeof this.token.value === 'string';
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  getKeys(): string[] {
    if (this.isStringAlias) return [];
    if (this.token.value && typeof this.token.value === 'object') {
      return Object.keys(this.token.value);
    }
    return [];
  }

  getSubValueString(key: string): string {
    const val = this.token.value[key];
    if (typeof val === 'object' && val !== null) {
      return JSON.stringify(val);
    }
    return String(val);
  }

  onSubValueChange(key: string, val: string) {
    let finalVal: any = val;
    if (!isNaN(Number(val)) && val.trim() !== '') {
      finalVal = Number(val);
    }

    const newValue = this.isArray ? [...this.token.value] : { ...this.token.value };
    (newValue as any)[key] = finalVal;

    this.updateToken.emit({ path: this.token.originalPath, value: newValue });
  }

  onRootValueChange(val: string) {
    this.updateToken.emit({ path: this.token.originalPath, value: val });
  }
}
