import { Injectable, signal } from '@angular/core';
import { TokenFile } from '../models/token.model';
import { TokenStateMemento } from '../models/history.model';
import { extractFileTokenPaths } from '../utils/token-extractor.util';
import { heuristicTokenMatch } from '../utils/heuristic-linker.util';

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

  constructor() {
    this.loadPreset();
  }

  loadPreset() {
    const defaultPreviewSheet = {
      preview: {
        global: {
          fontFamily: {
            base: { $value: "Inter, sans-serif", $type: "fontFamily" },
            mono: { $value: "monospace", $type: "fontFamily" }
          },
          fontSize: {
            sm: { $value: "12px", $type: "fontSizes" },
            base: { $value: "16px", $type: "fontSizes" },
            lg: { $value: "20px", $type: "fontSizes" },
            xl: { $value: "24px", $type: "fontSizes" }
          },
          borderRadius: {
            sm: { $value: "4px", $type: "borderRadius" },
            md: { $value: "8px", $type: "borderRadius" },
            lg: { $value: "16px", $type: "borderRadius" },
            full: { $value: "9999px", $type: "borderRadius" }
          },
          spacing: {
            sm: { $value: "8px", $type: "spacing" },
            md: { $value: "16px", $type: "spacing" },
            lg: { $value: "24px", $type: "spacing" },
            xl: { $value: "32px", $type: "spacing" }
          },
          shadow: {
            sm: { $value: "0 1px 2px rgba(0,0,0,0.05)", $type: "boxShadow" },
            md: { $value: "0 4px 6px rgba(0,0,0,0.1)", $type: "boxShadow" }
          }
        },
        surface: {
          page: { $value: "#f9fafb", $type: "color" },
          card: { $value: "#ffffff", $type: "color" },
          panel: { $value: "#f3f4f6", $type: "color" },
          overlay: { $value: "rgba(0,0,0,0.5)", $type: "color" },
          border: { $value: "#e5e7eb", $type: "color" }
        },
        typography: {
          main: { $value: "#111827", $type: "color" },
          muted: { $value: "#6b7280", $type: "color" },
          inverse: { $value: "#ffffff", $type: "color" },
          link: { $value: "#2563eb", $type: "color" }
        },
        button: {
          cta: {
            background: { $value: "#000000", $type: "color" },
            hover: { $value: "#374151", $type: "color" },
            text: { $value: "#ffffff", $type: "color" }
          },
          secondary: {
            background: { $value: "#f3f4f6", $type: "color" },
            hover: { $value: "#e5e7eb", $type: "color" },
            text: { $value: "#111827", $type: "color" }
          },
          danger: {
            background: { $value: "#ef4444", $type: "color" },
            hover: { $value: "#dc2828", $type: "color" },
            text: { $value: "#ffffff", $type: "color" }
          }
        },
        input: {
          background: { $value: "#ffffff", $type: "color" },
          border: { $value: "#d1d5db", $type: "color" },
          text: { $value: "#111827", $type: "color" },
          placeholder: { $value: "#9ca3af", $type: "color" },
          ring: { $value: "#3b82f6", $type: "color" }
        },
        alert: {
          success: {
            background: { $value: "#dcfce7", $type: "color" },
            border: { $value: "#86efac", $type: "color" },
            text: { $value: "#166534", $type: "color" }
          },
          warning: {
            background: { $value: "#fef9c3", $type: "color" },
            border: { $value: "#fde047", $type: "color" },
            text: { $value: "#854d0e", $type: "color" }
          }
        }
      }
    };
    
    this._files.set([
      { name: 'default-preview-sheet.json', content: defaultPreviewSheet }
    ]);
    this._activeFileName.set('default-preview-sheet.json');
  }

  setDuplicateTokensInfo(duplicates: string[]) {
    this._duplicateTokensInfo.set(duplicates);
  }

  linkFileToPreview(importedFileName: string) {
    const currentFiles = this.files();
    const importedFile = currentFiles.find(f => f.name === importedFileName);
    const previewFile = currentFiles.find(f => f.name === 'default-preview-sheet.json');

    if (!importedFile || !previewFile) return;

    const extracted = extractFileTokenPaths([importedFile, previewFile]);
    const importedTokens = extracted.get(importedFileName)?.tokens || [];
    const previewTokens = extracted.get('default-preview-sheet.json')?.tokens || [];

    const matchedTokens = heuristicTokenMatch(importedTokens, previewTokens);

    const newPreviewContent = JSON.parse(JSON.stringify(previewFile.content));

    for (const token of matchedTokens) {
      let obj = newPreviewContent;
      const path = token.originalPath;
      for (let i = 0; i < path.length - 1; i++) {
        if (!obj[path[i]]) obj[path[i]] = {};
        obj = obj[path[i]];
      }
      const lastKey = path[path.length - 1];
      if (obj[lastKey] && (obj[lastKey].$value !== undefined || obj[lastKey].value !== undefined)) {
        if (obj[lastKey].$value !== undefined) {
          obj[lastKey].$value = token.value;
        } else {
          obj[lastKey].value = token.value;
        }
      } else {
        obj[lastKey] = { $value: token.value };
      }
    }

    const previewIndex = currentFiles.findIndex(f => f.name === 'default-preview-sheet.json');
    const newFiles = [...currentFiles];
    newFiles[previewIndex] = { ...previewFile, content: newPreviewContent };
    
    this._files.set(newFiles);
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
    if (name === 'default-preview-sheet.json') return;
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
    if (oldName === 'default-preview-sheet.json') return false;
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
