"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockRepository = void 0;
function mockRepository(info) {
    const mockMethods = Array.from(info.repoMethods)
        .map((method) => `\t${method}: jest.fn(),`)
        .join("\n");
    return mockMethods.length > 0
        ? `const mockRepository = () => ({
${mockMethods}
});
`
        : "";
}
exports.mockRepository = mockRepository;
//# sourceMappingURL=mock-repository.js.map