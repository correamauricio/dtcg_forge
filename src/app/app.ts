import { Component } from '@angular/core';
import { FileExplorerComponent } from './components/file-explorer.component';
import { SidebarComponent } from './components/sidebar.component';
import { EditorComponent } from './components/editor.component';
import { PreviewComponent } from './components/preview.component';
import { ShortcutService } from './services/shortcut.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FileExplorerComponent, SidebarComponent, EditorComponent, PreviewComponent],
  template: `
    <div class="h-screen w-screen flex bg-gray-900 overflow-hidden font-sans">
      <app-file-explorer class="shrink-0"></app-file-explorer>
      <app-sidebar class="shrink-0"></app-sidebar>
      <app-editor class="shrink-0"></app-editor>
      <app-preview class="flex-1"></app-preview>
    </div>
  `,
  styles: []
})
export class App {
  constructor(shortcutService: ShortcutService) {
    shortcutService.init();
  }
}
