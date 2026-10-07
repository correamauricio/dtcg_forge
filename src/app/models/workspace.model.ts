import { TokenFile } from './token.model';

export interface WorkspaceState {
  files: TokenFile[];
  activeFileName: string;
  selectedVariants: Record<string, string>;
  disabledFileNames: string[];
  selectedTokenPath: string[] | null;
  updatedAt: number;
}
