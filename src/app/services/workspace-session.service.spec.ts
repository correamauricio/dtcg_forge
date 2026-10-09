import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WorkspaceSessionService } from './workspace-session.service';
import { WorkspaceState } from '../models/workspace.model';

describe('WorkspaceSessionService', () => {
  let service: WorkspaceSessionService;
  
  // IndexedDB Mocks
  let mockRequest: any;
  let mockObjectStore: any;
  let mockTransaction: any;
  let mockDb: any;

  beforeEach(() => {
    mockRequest = {
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: null,
      error: null
    };

    mockObjectStore = {
      put: vi.fn().mockReturnValue(mockRequest),
      get: vi.fn().mockReturnValue(mockRequest),
      delete: vi.fn().mockReturnValue(mockRequest)
    };

    mockTransaction = {
      objectStore: vi.fn().mockReturnValue(mockObjectStore)
    };

    mockDb = {
      objectStoreNames: { contains: vi.fn().mockReturnValue(true) },
      createObjectStore: vi.fn(),
      transaction: vi.fn().mockReturnValue(mockTransaction)
    };

    vi.stubGlobal('indexedDB', {
      open: vi.fn().mockImplementation(() => {
        const req = { ...mockRequest, result: mockDb };
        setTimeout(() => { if (req.onsuccess) req.onsuccess({ target: req }); }, 0);
        return req;
      })
    });

    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    });

    TestBed.configureTestingModule({
      providers: [WorkspaceSessionService]
    });
    service = TestBed.inject(WorkspaceSessionService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should initialize correctly with empty session', async () => {
    vi.mocked(sessionStorage.getItem).mockReturnValue(null);
    const result = await service.initializeSession();
    expect(result.status).toBe('new');
    expect(result.workspace).toBeNull();
  });

  it('should initialize and load workspace if session is active', async () => {
    vi.mocked(sessionStorage.getItem).mockReturnValue('true');
    
    const mockWorkspace: WorkspaceState = { files: [], variantGroups: [], updatedAt: 123 };
    
    // Override indexedDB mock specific for this test to return data
    vi.mocked(indexedDB.open).mockImplementation(() => {
      const dbReq = { onsuccess: null as any, result: mockDb };
      
      mockObjectStore.get.mockImplementation(() => {
        const getReq = { onsuccess: null as any, result: mockWorkspace };
        setTimeout(() => getReq.onsuccess({}), 0);
        return getReq;
      });

      setTimeout(() => dbReq.onsuccess({ target: dbReq }), 0);
      return dbReq as any;
    });

    const result = await service.initializeSession();
    expect(result.status).toBe('restored');
    expect(result.workspace).toEqual(mockWorkspace);
  });

  it('should mark session as active in sessionStorage', () => {
    service.markSessionActive();
    expect(sessionStorage.setItem).toHaveBeenCalledWith('dtcg_forge_session_active', 'true');
  });

  it('should schedule save using debounce and update saveStatus', fakeAsync(() => {
    const mockWorkspace: WorkspaceState = { files: [], variantGroups: [], updatedAt: 123 };
    
    // Mocks for successful DB put
    mockObjectStore.put.mockImplementation(() => {
      const putReq = { onsuccess: null as any };
      setTimeout(() => putReq.onsuccess({}), 0);
      return putReq;
    });

    expect(service.saveStatus()).toBe('saved');
    
    service.scheduleSave(mockWorkspace);
    expect(service.saveStatus()).toBe('saving');
    
    // Advance time to pass the 400ms debounce
    tick(400);
    
    // Microtasks for promises inside performSave
    tick();

    expect(mockObjectStore.put).toHaveBeenCalledWith(mockWorkspace, 'current');
    expect(service.saveStatus()).toBe('saved');
  }));

  it('should set saveStatus to error if DB put fails', fakeAsync(() => {
    const mockWorkspace: WorkspaceState = { files: [], variantGroups: [], updatedAt: 123 };
    
    // Mocks for failed DB put
    mockObjectStore.put.mockImplementation(() => {
      const putReq = { onerror: null as any, error: new Error('DB Error') };
      setTimeout(() => putReq.onerror({}), 0);
      return putReq;
    });

    service.scheduleSave(mockWorkspace);
    tick(400); // Wait for debounce
    tick();    // Resolve promises

    expect(service.saveStatus()).toBe('error');
  }));

  it('should handle clearing the session completely', async () => {
    mockObjectStore.delete.mockImplementation(() => {
      const delReq = { onsuccess: null as any };
      setTimeout(() => delReq.onsuccess({}), 0);
      return delReq;
    });

    await service.clearSession();

    expect(sessionStorage.removeItem).toHaveBeenCalledWith('dtcg_forge_session_active');
    expect(mockObjectStore.delete).toHaveBeenCalledWith('current');
  });
});
