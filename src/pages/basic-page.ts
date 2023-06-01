import { ParsedInfo } from "../interfaces/interface";

export function basicPage(info: ParsedInfo): string {
  return `import { Test } from "@nestjs/testing";


    describe(${info.testTarget}){
        sdfsdf
    }
    `;
}
