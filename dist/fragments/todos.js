"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todos = void 0;
const indent = require("indent");
function todos(info) {
    const methodTodos = info.testMethods
        .map((method) => `it.todo("${method}");`)
        .join("\n");
    return indent(`
it("should be defined", () => {
    expect(test${info.testTarget}).toBeDefined();
});

${methodTodos}        
`, 2);
}
exports.todos = todos;
//# sourceMappingURL=todos.js.map