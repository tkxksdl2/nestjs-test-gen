import { mockName } from "../hook/mock-name";
import { ParsedInfo } from "../interfaces/interface";
const indent = require("indent");

export function mockProviders(info: ParsedInfo) {
  const notRepoProviders = Object.entries(info.mockProviders)
    .filter(([_, mockProvider]) => !mockProvider.isRepo)
    .map(
      ([name, mockProvider]) => `const ${mockName(name)} = {
${Array.from(mockProvider.usingFunc)
  .map((func) => `\t${func}: jest.fn(),`)
  .join("\n")}
}`
    );

  return notRepoProviders.length > 0
    ? `${notRepoProviders.join("\n")}
`
    : "";
}

export function mockProviderInitialize(info: ParsedInfo, curIndent: number) {
  return indent(
    Object.entries(info.mockProviders)
      .map(([name, mockProvider]) =>
        mockProvider.isRepo
          ? `let ${name}: MockRepository<${mockProvider.typeName}>;`
          : `let ${name}: ${mockProvider.typeName};`
      )
      .join("\n"),
    curIndent
  );
}
