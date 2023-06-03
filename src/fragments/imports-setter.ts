import { mockBlacklists } from "../interfaces/constants";
import { ParsedInfo } from "../interfaces/interface";

export function importsSetter(info: ParsedInfo) {
  const imports = info.imports
    .map(({ from, elements, isNameSpaceImport }) => {
      if (typeof elements === "string")
        return `import ${
          isNameSpaceImport ? "* as " + elements : elements
        } from "${from}";`;
      else return `import { ${elements.join(", ")} } from "${from}";`;
    })
    .join("\n");

  return imports;
}

export function mockImportsLib(info: ParsedInfo) {
  const mockLib = info.imports.filter(({ from, elements }) =>
    Array.isArray(elements)
      ? elements.some(
          (element) =>
            info.genaralFunc.has(element) && !mockBlacklists.includes(from)
        )
      : info.genaralFunc.has(elements) && !mockBlacklists.includes(from)
  );
  console.log(mockLib);

  return mockLib.map(({ from }) => `jest.mock("${from}")`).join("\n");
}
