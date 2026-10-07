import { Injectable, signal, effect, inject } from '@angular/core';
import { TokenFile } from '../models/token.model';
import { TokenStateMemento } from '../models/history.model';
import { WorkspaceStorageService } from './workspace-storage.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TokenStateService {
  private _files = signal<TokenFile[]>([]);
  files = this._files.asReadonly();
  
  private _activeFileName = signal<string>('semantics.json');
  activeFileName = this._activeFileName.asReadonly();
  
  private _selectedTokenPath = signal<string[] | null>(null);
  selectedTokenPath = this._selectedTokenPath.asReadonly();
  
  private _isJsonEditorOpen = signal<boolean>(false);
  isJsonEditorOpen = this._isJsonEditorOpen.asReadonly();
  
  private _duplicateTokensInfo = signal<string[]>([]);
  duplicateTokensInfo = this._duplicateTokensInfo.asReadonly();
  
  private _selectedVariants = signal<Record<string, string>>({});
  selectedVariants = this._selectedVariants.asReadonly();
  
  private _disabledFileNames = signal<Set<string>>(new Set());
  disabledFileNames = this._disabledFileNames.asReadonly();

  private _searchQuery = signal<string>('');
  searchQuery = this._searchQuery.asReadonly();

  saveStatus = signal<'saved' | 'saving' | 'error'>('saved');

  private saveSubject = new Subject<void>();
  private initialLoadDone = false;

  constructor(private workspaceStorage: WorkspaceStorageService) {
    this.saveSubject.pipe(
      debounceTime(400)
    ).subscribe(() => this.performSave());

    effect(() => {
      // Registrar dependências para o effect
      const files = this._files();
      const activeFileName = this._activeFileName();
      const selectedVariants = this._selectedVariants();
      const disabledFileNames = this._disabledFileNames();
      const selectedTokenPath = this._selectedTokenPath();

      if (this.initialLoadDone) {
        this.saveStatus.set('saving');
        this.saveSubject.next();
      }
    });
  }

  async initializeSession(): Promise<'restored' | 'new'> {
    const isSessionActive = sessionStorage.getItem('dtcg_forge_session_active');
    
    if (isSessionActive) {
      const workspace = await this.workspaceStorage.loadWorkspace();
      if (workspace) {
        this._files.set(workspace.files);
        this._activeFileName.set(workspace.activeFileName);
        this._selectedTokenPath.set(workspace.selectedTokenPath);
        this._selectedVariants.set(workspace.selectedVariants);
        this._disabledFileNames.set(new Set(workspace.disabledFileNames));
        
        this.initialLoadDone = true;
        return 'restored';
      }
    }
    
    return 'new';
  }

  private async performSave() {
    try {
      await this.workspaceStorage.saveWorkspace({
        files: this._files(),
        activeFileName: this._activeFileName(),
        selectedVariants: this._selectedVariants(),
        disabledFileNames: Array.from(this._disabledFileNames()),
        selectedTokenPath: this._selectedTokenPath(),
        updatedAt: Date.now()
      });
      this.saveStatus.set('saved');
    } catch (e) {
      console.error('Failed to auto-save workspace', e);
      this.saveStatus.set('error');
    }
  }

  loadPreset() {
    const primitives = {
      color: {
        blue: {
          500: { $value: "#3b82f6", $type: "color" },
          600: { $value: "#2563eb", $type: "color" }
        },
        white: { $value: "#ffffff", $type: "color" },
        gray: {
          100: { $value: "#f3f4f6", $type: "color" },
          500: { $value: "#6b7280", $type: "color" },
          900: { $value: "#111827", $type: "color" }
        }
      },
      spacing: {
        sm: { $value: "0.5rem", $type: "dimension" },
        md: { $value: "1rem", $type: "dimension" },
        lg: { $value: "1.5rem", $type: "dimension" },
        xl: { $value: "2rem", $type: "dimension" }
      },
      radii: {
        md: { $value: "0.375rem", $type: "dimension" },
        full: { $value: "9999px", $type: "dimension" }
      },
      typography: {
        fontFamily: {
          sans: { $value: "Inter, sans-serif", $type: "fontFamily" }
        }
      }
    };

    const semantics = {
      color: {
        primary: {
          main: { $value: "{color.blue.500}", $type: "color" },
          dark: { $value: "{color.blue.600}", $type: "color" }
        },
        background: {
          DEFAULT: { $value: "{color.white}", $type: "color" },
          muted: { $value: "{color.gray.100}", $type: "color" }
        },
        text: {
          main: { $value: "{color.gray.900}", $type: "color" },
          muted: { $value: "{color.gray.500}", $type: "color" },
          onPrimary: { $value: "{color.white}", $type: "color" }
        }
      }
    };

    const semanticsDark = {
      color: {
        background: {
          DEFAULT: { $value: "{color.gray.900}", $type: "color" },
          muted: { $value: "{color.gray.900}", $type: "color" }
        },
        text: {
          main: { $value: "{color.white}", $type: "color" },
          muted: { $value: "{color.gray.400}", $type: "color" },
          onPrimary: { $value: "{color.white}", $type: "color" }
        }
      }
    };
    
    this._files.set([
      { name: 'primitives.json', content: primitives },
      { name: 'semantics.json', content: semantics },
      { name: 'semantics-dark.json', content: semanticsDark }
    ]);
    this._activeFileName.set('semantics.json');
    this.initialLoadDone = true;
  }

  initEmptyWorkspace() {
    this._files.set([]);
    this._activeFileName.set('');
    this._selectedTokenPath.set(null);
    this._selectedVariants.set({});
    this._disabledFileNames.set(new Set());
    this._searchQuery.set('');
    this.initialLoadDone = true;
  }

  setDuplicateTokensInfo(duplicates: string[]) {
    this._duplicateTokensInfo.set(duplicates);
  }

  selectVariant(groupId: string, fileName: string) {
    this._selectedVariants.update(prev => ({
      ...prev,
      [groupId]: fileName
    }));
  }

  toggleFileDisabled(fileName: string) {
    this._disabledFileNames.update(prev => {
      const next = new Set(prev);
      if (next.has(fileName)) {
        next.delete(fileName);
      } else {
        next.add(fileName);
      }
      return next;
    });
  }

  updateTokenValue(path: string[], newValue: string) {
    const activeName = this.activeFileName();
    const currentFiles = this.files();
    const fileIndex = currentFiles.findIndex(f => f.name === activeName);
    
    if (fileIndex === -1) return;
    
    const fileContent = JSON.parse(JSON.stringify(currentFiles[fileIndex].content));
    let obj = fileContent;
    for (let i = 0; i < path.length - 1; i++) {
       if (!obj[path[i]]) obj[path[i]] = {};
       obj = obj[path[i]];
    }
    const lastKey = path[path.length - 1];
    if (obj[lastKey] && (obj[lastKey].$value !== undefined || obj[lastKey].value !== undefined)) {
       if (obj[lastKey].$value !== undefined) {
         obj[lastKey].$value = newValue;
       } else {
         obj[lastKey].value = newValue;
       }
    } else {
       obj[lastKey] = { $value: newValue };
    }
    
    const newFiles = [...currentFiles];
    newFiles[fileIndex] = { ...newFiles[fileIndex], content: fileContent };
    this._files.set(newFiles);
  }

  updateActiveFileContent(newContent: any) {
    const activeName = this.activeFileName();
    const currentFiles = this.files();
    const fileIndex = currentFiles.findIndex(f => f.name === activeName);
    if (fileIndex === -1) return;
    
    const newFiles = [...currentFiles];
    newFiles[fileIndex] = { ...newFiles[fileIndex], content: newContent };
    this._files.set(newFiles);
  }

  addFile(name: string, newTokens: any) {
    const currentFiles = this.files();
    
    const existingIndex = currentFiles.findIndex(f => f.name === name);
    if (existingIndex >= 0) {
       const newFiles = [...currentFiles];
       newFiles[existingIndex] = { name, content: newTokens };
       this._files.set(newFiles);
    } else {
       this._files.set([...currentFiles, { name, content: newTokens }]);
    }
    
    this._activeFileName.set(name);
  }

  deleteFile(name: string) {
    const currentFiles = this.files();
    const newFiles = currentFiles.filter(f => f.name !== name);
    this._files.set(newFiles);

    if (this.activeFileName() === name) {
      this._activeFileName.set(newFiles.length > 0 ? newFiles[0].name : '');
    }

    if (this._disabledFileNames().has(name)) {
      this._disabledFileNames.update(prev => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }

    this._selectedVariants.update(prev => {
      const next = { ...prev };
      let changed = false;
      for (const [groupId, activeFile] of Object.entries(next)) {
        if (activeFile === name) {
          delete next[groupId];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }

  renameFile(oldName: string, newName: string): boolean {
    const trimmed = (newName || '').trim();
    if (!trimmed) return false;
    if (oldName === trimmed) return true;

    const currentFiles = this.files();
    const existingIndex = currentFiles.findIndex(f => f.name === oldName);
    if (existingIndex === -1) return false;

    const collision = currentFiles.some(f => f.name === trimmed);
    if (collision) return false;

    const newFiles = currentFiles.map(f => f.name === oldName ? { ...f, name: trimmed } : f);
    this._files.set(newFiles);

    if (this.activeFileName() === oldName) {
      this._activeFileName.set(trimmed);
    }

    if (this._disabledFileNames().has(oldName)) {
      this._disabledFileNames.update(prev => {
        const next = new Set(prev);
        next.delete(oldName);
        next.add(trimmed);
        return next;
      });
    }

    this._selectedVariants.update(prev => {
      let changed = false;
      const next = { ...prev };
      for (const [groupId, activeFile] of Object.entries(next)) {
        if (activeFile === oldName) {
          next[groupId] = trimmed;
          changed = true;
        }
      }
      return changed ? next : prev;
    });

    return true;
  }

  toggleJsonEditor() {
    this._isJsonEditorOpen.update(v => !v);
  }

  setJsonEditorOpen(isOpen: boolean) {
    this._isJsonEditorOpen.set(isOpen);
  }

  setActiveFileName(name: string) {
    this._activeFileName.set(name);
  }

  setSelectedTokenPath(path: string[] | null) {
    this._selectedTokenPath.set(path);
  }

  setSearchQuery(query: string) {
    this._searchQuery.set(query);
  }

  clearSearchQuery() {
    this._searchQuery.set('');
  }

  createMemento(): TokenStateMemento {
    return {
      // Deep copy files to ensure memento is truly isolated from future mutations
      files: JSON.parse(JSON.stringify(this.files())),
      selectedVariants: { ...this.selectedVariants() },
      disabledFileNames: Array.from(this.disabledFileNames())
    };
  }

  restoreMemento(memento: TokenStateMemento) {
    this._files.set(JSON.parse(JSON.stringify(memento.files))); // Deep copy again just to be safe
    this._selectedVariants.set({ ...memento.selectedVariants });
    this._disabledFileNames.set(new Set(memento.disabledFileNames));
  }
}
