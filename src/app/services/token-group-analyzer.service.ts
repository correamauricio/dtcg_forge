import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenGroupAnalyzerService {

  constructor() { }

  /**
   * Returns true if all leaf tokens within this group are of type 'color'
   * and none of them are aliases (strings containing '{' and '}').
   */
  isPrimitiveColorGroup(groupNode: any): boolean {
    if (!groupNode || typeof groupNode !== 'object' || Object.keys(groupNode).length === 0) {
      return false;
    }

    let hasLeaves = false;

    const checkNode = (node: any): boolean => {
      // If it's a leaf token (has _token)
      if (node && node._token) {
        hasLeaves = true;
        const token = node._token;
        if (token.type !== 'color') {
          return false;
        }
        if (typeof token.value === 'string' && /^\{[^}]+\}$/.test(token.value.trim())) {
          return false; // It's an alias
        }
        return true;
      }

      // If it's a group, recurse
      const keys = Object.keys(node).filter(k => k !== '_token');
      if (keys.length === 0) {
        return true; // Empty sub-group doesn't violate, but the root needs at least one leaf
      }

      for (const key of keys) {
        if (!checkNode(node[key])) {
          return false;
        }
      }
      return true;
    };

    const result = checkNode(groupNode);
    return result && hasLeaves;
  }
}
