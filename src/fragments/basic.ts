import { ParsedInfo } from "../interfaces/interface";
import { importsSetter, mockImportsLib } from "./imports-setter";
import { mockModuleSetter } from "./mock-module-setter";
import { mockProviderInitialize, mockProviders } from "./mock-providers";
import { mockRepository } from "./mock-repository";
import { todos } from "./todos";

export function basicFragment(info: ParsedInfo): string {
  return `import { Test } from "@nestjs/testing";
${importsSetter(info)}
${mockRepository(info)}
${mockProviders(info)}
${mockImportsLib(info)}

describe("${info.testTarget}", () => {
  let test${info.testTarget}: ${info.testTarget};
${mockProviderInitialize(info, 2)}

  beforeAll(async () => {
${mockModuleSetter(info, 4)}
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
${todos(info)}
});
  `;
}
