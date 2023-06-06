"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockModuleSetter = void 0;
const mock_name_1 = require("../hook/mock-name");
const indent = require("indent");
function mockModuleSetter(info, curIndent) {
    return indent(`
const module = await Test.createTestingModule({
imports: [],
providers: [
${indent(info.testTarget, 2)},
${indent(providerValueSet(), 2)},
  ],
}).compile();

test${info.testTarget} = module.get<${info.testTarget}>(${info.testTarget});
${providerGet()}
`, curIndent);
    function providerValueSet() {
        return Object.entries(info.mockProviders)
            .map(([name, mockProvider]) => mockProvider.isRepo
            ? `{
provide: getRepositoryToken(${mockProvider.typeName}),
useValue: mockRepository(),
},`
            : `{
provide: ${mockProvider.inject ? mockProvider.inject : mockProvider.typeName},
useValue: ${(0, mock_name_1.mockName)(name)},
},`)
            .join("\n");
    }
    function providerGet() {
        return Object.entries(info.mockProviders)
            .map(([name, mockProvider]) => `${name} = module.get${mockProvider.isRepo
            ? `(getRepositoryToken(${mockProvider.typeName}));`
            : `<${mockProvider.inject
                ? mockProvider.inject
                : mockProvider.typeName}>(${mockProvider.typeName});`}`)
            .join("\n");
    }
}
exports.mockModuleSetter = mockModuleSetter;
//# sourceMappingURL=mock-module-setter.js.map