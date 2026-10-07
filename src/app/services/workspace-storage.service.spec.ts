import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { WorkspaceStorageService } from './workspace-storage.service';

describe('WorkspaceStorageService', () => {
  let service: WorkspaceStorageService;

  beforeEach(() => {
    service = new WorkspaceStorageService();
  });

  afterEach(async () => {
    // Para garantir que o banco seja fechado/limpo entre os testes,
    // usar a clearWorkspace ou limpar via API do IndexedDB se necessário.
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null when loading from an empty database', async () => {
    const workspace = await service.loadWorkspace();
    expect(workspace).toBeNull();
  });

  it('should save and load a workspace state', async () => {
    const mockState = {
      files: [{ name: 'test.json', content: { token: { $value: 'red' } } }],
      activeFileName: 'test.json',
      selectedVariants: {},
      disabledFileNames: [],
      selectedTokenPath: null,
      updatedAt: Date.now()
    };

    await service.saveWorkspace(mockState);
    const loaded = await service.loadWorkspace();
    expect(loaded).toEqual(mockState);
  });

  it('should clear the workspace state', async () => {
    const mockState = {
      files: [],
      activeFileName: '',
      selectedVariants: {},
      disabledFileNames: [],
      selectedTokenPath: null,
      updatedAt: Date.now()
    };

    await service.saveWorkspace(mockState);
    await service.clearWorkspace();
    const loaded = await service.loadWorkspace();
    expect(loaded).toBeNull();
  });

  it('should handle indexedDB open errors gracefully', async () => {
    // Simulando uma falha grave onde indexedDB lança erro ou é bloqueado
    const originalOpen = indexedDB.open;
    indexedDB.open = () => { throw new Error('Simulated SecurityError'); };

    const workspace = await service.loadWorkspace();
    expect(workspace).toBeNull();

    await service.saveWorkspace({ files: [], activeFileName: '', selectedVariants: {}, disabledFileNames: [], selectedTokenPath: null, updatedAt: Date.now() });
    await service.clearWorkspace();

    // Restaura a função
    indexedDB.open = originalOpen;
  });
});

