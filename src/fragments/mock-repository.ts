import { ParsedInfo } from "../interfaces/interface";

export function mockRepository(info: ParsedInfo) {
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
