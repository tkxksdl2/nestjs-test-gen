export interface ParsedInfo {
  testTarget: string | undefined;
  testMethods: string[];
  mockProviders: { [name: string]: MockProvider };
  genaralFunc: string[];
  repoMethods: Set<string>;
  imports: string[];
}
export interface MockProvider {
  typeName: string;
  usingFunc: Set<string>;
  isRepo: boolean;
}
