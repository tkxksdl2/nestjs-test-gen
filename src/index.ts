import { Command } from "commander";
import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
import * as ts from "typescript";
import { ParsedInfo } from "./interfaces/interface";
import { basicPage } from "./pages/basic-page";
import { parseSourceFile } from "./parse-source-file";
const program = new Command();

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program
  .name("nest-test-gen")
  .usage("filepath")
  .argument("<filepath>", "filepath to generate test")
  .action((filepath, options, command) => {
    const fileExtension = path.extname(filepath);
    const fileName = path.basename(filepath, fileExtension);
    const outputFilename = fileName + ".spec" + fileExtension;

    const outputDir = path.dirname(filepath);
    const finalOutputDir = path.resolve(outputDir, outputFilename);

    const source = readFileSync(filepath).toString();

    const sourcefile = ts.createSourceFile(
      filepath,
      source,
      ts.ScriptTarget.Latest
    );
    const parsedInfo = parseSourceFile(sourcefile);
    console.log(parsedInfo);
    Object.values(parsedInfo.mockProviders).map((v) => {
      console.log(v);
    });

    const outpurFile = generateTest(parsedInfo);
    writeFileSync(finalOutputDir, outpurFile);
  })
  .parse(process.argv);

function generateTest(info: ParsedInfo) {
  return basicPage(info);
}
