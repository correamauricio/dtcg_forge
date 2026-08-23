import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlatToken } from '../models/token.model';
import { PrimitiveNodeComponent } from './nodes/primitive-node.component';
import { ColorNodeComponent } from './nodes/color-node.component';
import { CompositeNodeComponent } from './nodes/composite-node.component';

@Component({
  selector: 'app-token-node',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PrimitiveNodeComponent,
    ColorNodeComponent,
    CompositeNodeComponent
  ],
  template: `
    <div [class.pl-2]="depth > 0" [class.border-l]="depth > 0" class="border-gray-800/80 ml-1">
      @for (key of getKeys(node); track key) {
        
        <!-- Token Leaf -->
        @if (isToken(node, key)) {
          <div class="group flex flex-col py-1 px-1.5 mt-0.5 hover:bg-gray-800/60 rounded text-xs transition-all border border-transparent min-h-7"
               [class.!bg-gray-800]="isSelected(node, key)"
               [class.!border-gray-700]="isSelected(node, key)"
               (click)="onSelectToken(node, key)">
            <div class="flex items-center justify-between gap-2 w-full min-w-0">
              <!-- Left: Token Key (max-w-[45%] with truncate) -->
              <span class="max-w-[45%] shrink-0 font-mono text-xs text-gray-300 truncate"
                    [class.text-blue-400]="isSelected(node, key)"
                    [title]="key">{{ key }}</span>
              
              <!-- Right: Value Editor (flex-1 min-w-0 for maximum visible value width) -->
              <div class="flex-1 min-w-0 flex items-center justify-end" (click)="$event.stopPropagation()">
                @switch (getNodeType(node[key]._token)) {
                  @case ('color') {
                    <app-color-node class="w-full min-w-0" [token]="node[key]._token" [nodeData]="node" [nodeKey]="key" (updateToken)="onUpdateTokenEvent($event)"></app-color-node>
                  }
                  @case ('composite') {
                    <app-composite-node class="w-full min-w-0" [token]="node[key]._token" [nodeData]="node" [nodeKey]="key" (updateToken)="onUpdateTokenEvent($event)"></app-composite-node>
                  }
                  @default {
                    <app-primitive-node class="w-full min-w-0" [token]="node[key]._token" [nodeData]="node" [nodeKey]="key" (updateToken)="onUpdateTokenEvent($event)"></app-primitive-node>
                  }
                }
              </div>
            </div>
          </div>
        }
        
        <!-- Token Group -->
        @if (hasChildren(node, key)) {
          <div class="mt-0.5">
            @if (!isToken(node, key)) {
              <div class="sticky h-6.5 px-2 font-bold text-gray-400 text-[10px] uppercase tracking-wider flex items-center space-x-1.5 bg-gray-900 border-b border-gray-800 shadow-xs -mx-1"
                   [style.top.px]="depth * 26"
                   [style.z-index]="30 - depth">
                <svg class="w-3 h-3 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                <span class="truncate font-mono" [title]="key">{{ key }}</span>
              </div>
            }
            <app-token-node
              [node]="node[key]"
              [selectedPath]="selectedPath"
              [depth]="depth + 1"
              (selectToken)="selectToken.emit($event)"
              (updateToken)="updateToken.emit($event)">
            </app-token-node>
          </div>
        }
        
      }
    </div>
  `
})
export class TokenNodeComponent {
  @Input() node: any = {};
  @Input() selectedPath: string[] | null = null;
  @Input() depth: number = 0;

  @Output() selectToken = new EventEmitter<{ path: string[] }>();
  @Output() updateToken = new EventEmitter<{ path: string[], value: any }>();

  getKeys(node: any): string[] {
    return Object.keys(node || {}).filter(k => k !== '_token');
  }

  hasChildren(node: any, key: string): boolean {
    const child = node[key];
    return child && typeof child === 'object' && this.getKeys(child).length > 0;
  }

  isToken(node: any, key: string): boolean {
    return !!node[key]?._token;
  }

  isSelected(node: any, key: string): boolean {
    if (!this.selectedPath) return false;
    return node[key]._token.originalPath.join('.') === this.selectedPath.join('.');
  }

  onSelectToken(node: any, key: string): void {
    this.selectToken.emit({ path: node[key]._token.originalPath });
  }

  onUpdateTokenEvent(event: { path: string[], value: any }): void {
    this.updateToken.emit(event);
  }

  isAlias(val: any): boolean {
    return typeof val === 'string' && /^\{[^}]+\}$/.test(val.trim());
  }

  getNodeType(token: FlatToken): string {
    if (token.type === 'color') return 'color';
    if (token.value && typeof token.value === 'object') return 'composite';
    return 'primitive';
  }
}
