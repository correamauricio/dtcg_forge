import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileImportService } from './file-import.service';
import { TokenStateService } from './token-state.service';

describe('FileImportService', () => {
  let service: FileImportService;
  let mockTokenStateService: any;
  let mockFileReader: any;
  
  beforeEach(() => {
    mockTokenStateService = {
      addFile: vi.fn()
    };

    mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: null as any
    };

    vi.stubGlobal('FileReader', vi.fn().mockImplementation(() => mockFileReader));

    // Mock URL.createObjectURL and URL.revokeObjectURL
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
      revokeObjectURL: vi.fn()
    });

    TestBed.configureTestingModule({
      providers: [
        FileImportService,
        { provide: TokenStateService, useValue: mockTokenStateService }
      ]
    });
    service = TestBed.inject(FileImportService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should successfully read and add a valid JSON file', async () => {
    const mockFile = new File(['{"color": {"primary": {"$value": "#ff0000"}}}'], 'tokens.json', { type: 'application/json' });
    
    // Manually trigger the FileReader onload immediately after readAsText is called
    mockFileReader.readAsText.mockImplementation(function(this: any) {
      setTimeout(() => {
        this.result = '{"color": {"primary": {"$value": "#ff0000"}}}';
        if (this.onload) this.onload({ target: this });
      }, 0);
    });

    await service.readAndAddFiles([mockFile]);
    // The inner await happens outside our immediate control due to file reading, 
    // so we delay expectation by a tick to ensure promise resolution
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockFileReader.readAsText).toHaveBeenCalledWith(mockFile);
    expect(mockTokenStateService.addFile).toHaveBeenCalledWith('tokens.json', {
      color: { primary: { $value: '#ff0000' } }
    });
  });

  it('should not add file if JSON is invalid', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockFile = new File(['{invalid-json:'], 'bad.json', { type: 'application/json' });
    
    mockFileReader.readAsText.mockImplementation(function(this: any) {
      setTimeout(() => {
        this.result = '{invalid-json:';
        if (this.onload) this.onload({ target: this });
      }, 0);
    });

    await service.readAndAddFiles([mockFile]);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockTokenStateService.addFile).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should ignore non-JSON files', async () => {
    const mockFile = new File(['just text'], 'notes.txt', { type: 'text/plain' });
    
    await service.readAndAddFiles([mockFile]);
    
    expect(mockFileReader.readAsText).not.toHaveBeenCalled();
    expect(mockTokenStateService.addFile).not.toHaveBeenCalled();
  });

  it('should download JSON content by creating an anchor element', () => {
    // Mock the DOM interaction
    const mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      remove: vi.fn()
    } as any;
    
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);

    const content = { a: 1 };
    service.downloadJson('test.json', content);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test.json');
    expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.remove).toHaveBeenCalled();
  });
});
