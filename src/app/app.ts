import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileExplorerComponent } from './components/file-explorer.component';
import { SidebarComponent } from './components/sidebar.component';
import { EditorComponent } from './components/editor.component';
import { PreviewComponent } from './components/preview.component';
import { WelcomeModalComponent } from './components/welcome-modal.component';
import { ShortcutService } from './services/shortcut.service';
import { AppLifecycleService } from './services/app-lifecycle.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FileExplorerComponent, SidebarComponent, EditorComponent, PreviewComponent, WelcomeModalComponent],
  template: `
    <div class="h-screen w-screen flex bg-gray-900 overflow-hidden font-sans">
      <ng-container *ngIf="lifecycle.appState() === 'ready'">
        <app-file-explorer class="shrink-0"></app-file-explorer>
        <app-sidebar class="shrink-0"></app-sidebar>
        <app-editor class="shrink-0"></app-editor>
        <app-preview class="flex-1"></app-preview>
      </ng-container>
      
      <!-- Show nothing or a loading spinner if app is initializing -->
    </div>
    
    <app-welcome-modal 
      *ngIf="lifecycle.appState() === 'welcome'"
      [hasPreviousSession]="lifecycle.hasPreviousSession()"
      [lastUpdated]="lifecycle.lastUpdated()"
      (action)="lifecycle.handleWelcomeAction($event)">
    </app-welcome-modal>
  `,
  styles: []
})
export class App implements OnInit {
  shortcutService = inject(ShortcutService);
  lifecycle = inject(AppLifecycleService);

  constructor() {
    this.shortcutService.init();
  }

  ngOnInit() {
    this.lifecycle.initializeApp();
  }
}
