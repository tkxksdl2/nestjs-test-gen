"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicPage = void 0;
const mock_repository_1 = require("./mock-repository");
function basicPage(info) {
    return `import { Test } from "@nestjs/testing";
${(0, mock_repository_1.mockRepository)(info)}

describe(${info.testTarget}){
sdfsdf
}
  `;
}
exports.basicPage = basicPage;
//# sourceMappingURL=basic-page.js.map