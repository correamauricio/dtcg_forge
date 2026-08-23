import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenGroupAnalyzerService {

  constructor() { }

  /**
   * Returns true if all immediate children within this group are leaf tokens of type 'color',
   * and none of them are aliases (strings containing '{' and '}').
   * If any child is a nested group, it returns false.
   */
  isPrimitiveColorGroup(groupNode: any): boolean {
    if (!groupNode || typeof groupNode !== 'object' || Object.keys(groupNode).length === 0) {
      return false;
    }

    const keys = Object.keys(groupNode).filter(k => k !== '_token');
    if (keys.length === 0) return false;

    for (const key of keys) {
      const child = groupNode[key];
      // If it doesn't have _token, it's a nested group
      if (!child || !child._token) {
        return false;
      }
      
      const token = child._token;
      if (token.type !== 'color') {
        return false;
      }
      if (typeof token.value === 'string' && /^\{[^}]+\}$/.test(token.value.trim())) {
        return false; // It's an alias
      }
    }
    
    return true;
  }
}
