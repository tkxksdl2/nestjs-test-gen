import { ParsedInfo } from "../interfaces/interface";
const indent = require("indent");

export function todos(info: ParsedInfo) {
  const methodTodos = info.testMethods
    .map((method) => `it.todo("${method}");`)
    .join("\n");

  return indent(
    `
it("should be defined", () => {
    expect(test${info.testTarget}).toBeDefined();
});

${methodTodos}        
`,
    2
  );
}
