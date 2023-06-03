import { mockName } from "../hook/mock-name";
import { ParsedInfo } from "../interfaces/interface";
const indent = require("indent");

export function mockModuleSetter(info: ParsedInfo, curIndent: number) {
  return indent(
    `
const module = await Test.createTestingModule({
imports: [],
providers: [
${indent(info.testTarget, 2)},
${indent(providerValueSet(), 2)},
  ],
}).compile();

test${info.testTarget} = module.get<${info.testTarget}>(${info.testTarget});
${providerGet()}
`,
    curIndent
  );

  function providerValueSet() {
    return Object.entries(info.mockProviders)
      .map(([name, mockProvider]) =>
        mockProvider.isRepo
          ? `{
provide: getRepositoryToken(${mockProvider.typeName}),
useValue: mockRepository(),
},`
          : `{
provide: ${mockProvider.inject ? mockProvider.inject : mockProvider.typeName},
useValue: ${mockName(name)},
},`
      )
      .join("\n");
  }

  function providerGet() {
    return Object.entries(info.mockProviders)
      .map(
        ([name, mockProvider]) =>
          `${name} = module.get${
            mockProvider.isRepo
              ? `(getRepositoryToken(${mockProvider.typeName}));`
              : `<${
                  mockProvider.inject
                    ? mockProvider.inject
                    : mockProvider.typeName
                }>(${mockProvider.typeName});`
          }`
      )
      .join("\n");
  }
}
