import { Injectable, signal } from '@angular/core';
import { WorkspaceState } from '../models/workspace.model';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceSessionService {
  private dbName = 'dtcg-forge-db';
  private storeName = 'workspace';
  private currentKey = 'current';

  saveStatus = signal<'saved' | 'saving' | 'error'>('saved');
  private saveSubject = new Subject<WorkspaceState>();

  constructor() {
    this.saveSubject.pipe(
      debounceTime(400)
    ).subscribe(workspace => this.performSave(workspace));
  }

  scheduleSave(workspace: WorkspaceState) {
    this.saveStatus.set('saving');
    this.saveSubject.next(workspace);
  }

  async initializeSession(): Promise<{ status: 'restored' | 'new', workspace: WorkspaceState | null }> {
    const isSessionActive = sessionStorage.getItem('dtcg_forge_session_active');
    
    if (isSessionActive) {
      const workspace = await this.loadWorkspace();
      if (workspace) {
        return { status: 'restored', workspace };
      }
    }
    return { status: 'new', workspace: null };
  }

  markSessionActive() {
    sessionStorage.setItem('dtcg_forge_session_active', 'true');
  }

  private async performSave(workspace: WorkspaceState): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(workspace, this.currentKey);

        request.onsuccess = () => {
          this.saveStatus.set('saved');
          resolve();
        };
        request.onerror = () => {
          this.saveStatus.set('error');
          reject(request.error);
        };
      });
    } catch (e) {
      console.warn('Failed to save workspace to IndexedDB', e);
      this.saveStatus.set('error');
    }
  }

  async loadWorkspace(): Promise<WorkspaceState | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(this.currentKey);

        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (e) {
      console.warn('Failed to load workspace from IndexedDB', e);
      return null;
    }
  }

  async clearSession(): Promise<void> {
    sessionStorage.removeItem('dtcg_forge_session_active');
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(this.currentKey);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Failed to clear workspace in IndexedDB', e);
    }
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      request.onsuccess = (event: Event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }
}
