#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
import * as ts from "typescript";
import { ParsedInfo } from "./interfaces/interface";
import { basicFragment } from "./fragments/basic";
import { parseSourceFile } from "./parse-source-file";

const program = new Command();

program
  .name("nestjs-test-gen")
  .usage("<options> <filepath>")
  .description("make a NestJS unit test file")
  .argument("<filepath>", "filepath to generate test")
  .option("-s, --suffix <suffix>", "suffix of created test file [default:spec]")
  .action((filepath, options, command) => {
    const fileExtension = path.extname(filepath);
    const fileName = path.basename(filepath, fileExtension);
    const suffix = options.suffix ? "." + options.suffix : ".spec";

    const outputFilename = fileName + suffix + fileExtension;

    const outputDir = path.dirname(filepath);
    const finalOutputDir = path.resolve(outputDir, outputFilename);

    const source = readFileSync(filepath).toString();

    const sourcefile = ts.createSourceFile(
      filepath,
      source,
      ts.ScriptTarget.Latest
    );
    const parsedInfo = parseSourceFile(sourcefile, fileName);

    const outputFile = generateTest(parsedInfo);
    writeFileSync(finalOutputDir, outputFile);
  })
  .showHelpAfterError();

if (process.argv.length > 2) {
  program.parse(process.argv);
} else {
  program.outputHelp();
}

function generateTest(info: ParsedInfo) {
  return basicFragment(info);
}
