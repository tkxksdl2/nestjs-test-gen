"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicFragment = void 0;
const imports_setter_1 = require("./imports-setter");
const mock_module_setter_1 = require("./mock-module-setter");
const mock_providers_1 = require("./mock-providers");
const mock_repository_1 = require("./mock-repository");
const todos_1 = require("./todos");
function basicFragment(info) {
    return `import { Test } from "@nestjs/testing";
${(0, imports_setter_1.importsSetter)(info)}
${(0, mock_repository_1.mockRepository)(info)}
${(0, mock_providers_1.mockProviders)(info)}
${(0, imports_setter_1.mockImportsLib)(info)}

describe("${info.testTarget}"){
  let test${info.testTarget}: ${info.testTarget};
${(0, mock_providers_1.mockProviderInitialize)(info, 2)}

  beforeAll(async () => {
${(0, mock_module_setter_1.mockModuleSetter)(info, 4)}
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
${(0, todos_1.todos)(info)}
}
  `;
}
exports.basicFragment = basicFragment;
//# sourceMappingURL=basic.js.map