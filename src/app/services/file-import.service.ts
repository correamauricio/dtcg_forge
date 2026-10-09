import { Injectable, inject } from '@angular/core';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class FileImportService {
  private tokenService = inject(TokenService);

  readAndAddFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const json = JSON.parse(e.target.result);
          this.tokenService.addFile(file.name, json);
        } catch (err) {
          console.error('Failed to parse JSON', err);
          alert(`Erro ao ler o arquivo ${file.name}: JSON inválido.`);
        }
      };
      reader.readAsText(file);
    }
  }

  downloadJson(filename: string, content: any) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(content, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', filename);
    dlAnchorElem.click();
    dlAnchorElem.remove();
  }
}
