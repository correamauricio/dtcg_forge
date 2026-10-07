import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { TokenService } from './services/token.service';
import { TokenStateService } from './services/token-state.service';
import { HistoryService } from './services/history.service';
import { TestBed } from '@angular/core/testing';
import { WorkspaceStorageService } from './services/workspace-storage.service';

describe('TokenService Variant Behavior', () => {
  it('should maintain token listing for active file even when different variant is active', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: WorkspaceStorageService, useValue: { saveWorkspace: async () => {}, loadWorkspace: async () => null } },
        TokenStateService,
        HistoryService,
        TokenService
      ]
    });

    const service = TestBed.inject(TokenService);

    expect(service.activeFileName()).toBe('semantics.json');
    const initialCount = service.flatTokens().length;
    expect(initialCount).toBeGreaterThan(0);

    // Change variant to semantics-dark.json
    const groups = service.variantGroups();
    expect(groups.length).toBeGreaterThan(0);
    service.selectVariant(groups[0].id, 'semantics-dark.json');

    // The viewed file is still semantics.json
    expect(service.activeFileName()).toBe('semantics.json');
    // Tokens list must NOT disappear
    expect(service.flatTokens().length).toBe(initialCount);
    expect(service.groupedTokens()['color']).toBeDefined();
  });
});
