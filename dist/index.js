"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const ts = __importStar(require("typescript"));
const basic_1 = require("./fragments/basic");
const parse_source_file_1 = require("./parse-source-file");
const program = new commander_1.Command();
program
    .name("nestjs-test-gen")
    .usage("<options> <filepath>")
    .description("make a NestJS unit test file")
    .argument("<filepath>", "filepath to generate test")
    .option("-s, --suffix <suffix>", "suffix of created test file [default:spec]")
    .action((filepath, options, command) => {
    const fileExtension = path.extname(filepath);
    const fileName = path.basename(filepath, fileExtension);
    const suffix = options.suffix ? "." + options.suffix : ".sepc";
    const outputFilename = fileName + suffix + fileExtension;
    const outputDir = path.dirname(filepath);
    const finalOutputDir = path.resolve(outputDir, outputFilename);
    const source = (0, fs_1.readFileSync)(filepath).toString();
    const sourcefile = ts.createSourceFile(filepath, source, ts.ScriptTarget.Latest);
    const parsedInfo = (0, parse_source_file_1.parseSourceFile)(sourcefile, fileName);
    const outpurFile = generateTest(parsedInfo);
    (0, fs_1.writeFileSync)(finalOutputDir, outpurFile);
})
    .showHelpAfterError();
if (process.argv.length > 2) {
    program.parse(process.argv);
}
else {
    program.outputHelp();
}
function generateTest(info) {
    return (0, basic_1.basicFragment)(info);
}
//# sourceMappingURL=index.js.map