export interface ParsedInfo {
  testTarget: string | undefined;
  testMethods: string[];
  mockProviders: { [name: string]: MockProvider };
  genaralFunc: Set<string>;
  hasRepo: boolean;
  repoMethods: Set<string>;
  imports: ImportObject[];
}
export interface MockProvider {
  typeName: string;
  usingFunc: Set<string>;
  isRepo: boolean;
  inject?: string;
}

export interface ImportObject {
  from: string;
  elements: string | string[];
  isNameSpaceImport: boolean;
}
