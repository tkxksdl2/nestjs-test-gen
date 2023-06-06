"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockRepository = void 0;
function mockRepository(info) {
    const mockRepoMethods = Array.from(info.repoMethods)
        .map((method) => `\t${method}: jest.fn(),`)
        .join("\n");
    return mockRepoMethods.length > 0
        ? `
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockRepository = () => ({
${mockRepoMethods}
});
`
        : "";
}
exports.mockRepository = mockRepository;
//# sourceMappingURL=mock-repository.js.map