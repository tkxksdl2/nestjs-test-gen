"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockImportsLib = exports.importsSetter = void 0;
const constants_1 = require("../interfaces/constants");
function importsSetter(info) {
    const imports = info.imports
        .map(({ from, elements, isNameSpaceImport }) => {
        if (typeof elements === "string")
            return `import ${isNameSpaceImport ? "* as " + elements : elements} from "${from}";`;
        else
            return `import { ${elements.join(", ")} } from "${from}";`;
    })
        .join("\n");
    return imports;
}
exports.importsSetter = importsSetter;
function mockImportsLib(info) {
    const mockLib = info.imports.filter(({ from, elements }) => Array.isArray(elements)
        ? elements.some((element) => info.genaralFunc.has(element) && !constants_1.mockBlacklists.includes(from))
        : info.genaralFunc.has(elements) && !constants_1.mockBlacklists.includes(from));
    return mockLib.map(({ from }) => `jest.mock("${from}");`).join("\n");
}
exports.mockImportsLib = mockImportsLib;
//# sourceMappingURL=imports-setter.js.map