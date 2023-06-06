"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockProviderInitialize = exports.mockProviders = void 0;
const mock_name_1 = require("../hook/mock-name");
const indent = require("indent");
function mockProviders(info) {
    const notRepoProviders = Object.entries(info.mockProviders)
        .filter(([_, mockProvider]) => !mockProvider.isRepo)
        .map(([name, mockProvider]) => `const ${(0, mock_name_1.mockName)(name)} = {
${Array.from(mockProvider.usingFunc)
        .map((func) => `\t${func}: jest.fn(),`)
        .join("\n")}
}`);
    return notRepoProviders.length > 0
        ? `${notRepoProviders.join("\n")}
`
        : "";
}
exports.mockProviders = mockProviders;
function mockProviderInitialize(info, curIndent) {
    return indent(Object.entries(info.mockProviders)
        .map(([name, mockProvider]) => mockProvider.isRepo
        ? `let ${name}: MockRepository<${mockProvider.typeName}>;`
        : `let ${name}: ${mockProvider.typeName};`)
        .join("\n"), curIndent);
}
exports.mockProviderInitialize = mockProviderInitialize;
//# sourceMappingURL=mock-providers.js.map