import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { TokenService } from '../services/token.service';
import { signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

vi.mock('@material/material-color-utilities', () => {
  return {
    themeFromSourceColor: vi.fn(),
    argbFromHex: vi.fn(),
    hexFromArgb: (v: number) => '#000000',
    TonalPalette: { fromInt: vi.fn() }
  };
});

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let tokenServiceMock: any;

  beforeEach(async () => {
    tokenServiceMock = {
      isJsonEditorOpen: signal(false),
      selectedTokenPath: signal(null),
      groupedTokens: signal({
        color: {
          brand: {
            primary: {
              _token: {
                path: 'color.brand.primary',
                originalPath: ['color', 'brand', 'primary'],
                value: '#3b82f6',
                type: 'color'
              }
            }
          }
        }
      }),
      searchQuery: signal(''),
      allFlatTokens: signal([]),
      flatTokens: signal([]),
      totalTokenCount: signal(5),
      filteredTokenCount: signal(5),
      toggleJsonEditor: vi.fn(),
      setSelectedTokenPath: vi.fn(),
      updateTokenValue: vi.fn(),
      setSearchQuery: vi.fn((q: string) => tokenServiceMock.searchQuery.set(q)),
      clearSearchQuery: vi.fn(() => tokenServiceMock.searchQuery.set(''))
    };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent, FormsModule],
      providers: [
        { provide: TokenService, useValue: tokenServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the search input with search icon', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[data-testid="token-search-input"]');
    expect(input).toBeDefined();
    expect(input.placeholder).toContain('Buscar tokens');
  });

  it('should update search query when typing into search input', async () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[data-testid="token-search-input"]');
    input.value = 'brand';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(tokenServiceMock.setSearchQuery).toHaveBeenCalledWith('brand');
  });

  it('should show clear button when searchQuery is active and clear when clicked', async () => {
    tokenServiceMock.searchQuery.set('brand');
    fixture.detectChanges();
    await fixture.whenStable();

    const clearBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="clear-search-btn"]');
    expect(clearBtn).toBeDefined();

    clearBtn.click();
    expect(tokenServiceMock.clearSearchQuery).toHaveBeenCalled();
  });

  it('should clear query when Escape key is pressed in search input', async () => {
    tokenServiceMock.searchQuery.set('brand');
    fixture.detectChanges();
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[data-testid="token-search-input"]');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(tokenServiceMock.clearSearchQuery).toHaveBeenCalled();
  });

  it('should display match counter badge when search is active', async () => {
    tokenServiceMock.searchQuery.set('primary');
    tokenServiceMock.totalTokenCount.set(10);
    tokenServiceMock.filteredTokenCount.set(2);
    fixture.detectChanges();
    await fixture.whenStable();

    const counter = fixture.nativeElement.querySelector('[data-testid="search-count-badge"]');
    expect(counter).toBeDefined();
    expect(counter.textContent).toContain('2 de 10');
  });

  it('should display Empty State when no tokens match the active search query', async () => {
    tokenServiceMock.searchQuery.set('nonexistent');
    tokenServiceMock.filteredTokenCount.set(0);
    tokenServiceMock.groupedTokens.set({});
    fixture.detectChanges();
    await fixture.whenStable();

    const emptyState = fixture.nativeElement.querySelector('[data-testid="search-empty-state"]');
    expect(emptyState).toBeDefined();
    expect(emptyState.textContent).toContain('Nenhum token encontrado');

    const resetBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="empty-state-reset-btn"]');
    expect(resetBtn).toBeDefined();
    resetBtn.click();
    expect(tokenServiceMock.clearSearchQuery).toHaveBeenCalled();
  });

  it('should delegate setSelectedTokenPath and updateTokenValue', () => {
    component.onSelectToken({ path: ['color', 'primary'] });
    expect(tokenServiceMock.setSelectedTokenPath).toHaveBeenCalledWith(['color', 'primary']);

    component.onUpdateToken({ path: ['color', 'primary'], value: '#fff' });
    expect(tokenServiceMock.updateTokenValue).toHaveBeenCalledWith(['color', 'primary'], '#fff');
  });

  it('should toggle JSON editor when clicking JSON button', () => {
    const jsonBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button[title*="JSON"]');
    jsonBtn.click();
    expect(tokenServiceMock.toggleJsonEditor).toHaveBeenCalled();
  });
});
