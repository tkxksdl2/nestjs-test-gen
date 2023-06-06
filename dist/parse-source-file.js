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
exports.parseSourceFile = void 0;
const ts = __importStar(require("typescript"));
const constants_1 = require("./interfaces/constants");
function parseSourceFile(node, fileName) {
    const parsedInfo = {
        testTarget: undefined,
        testMethods: [],
        mockProviders: {},
        genaralFunc: new Set(),
        hasRepo: false,
        repoMethods: new Set(),
        imports: [],
    };
    basicParser(node);
    filterImports();
    return parsedInfo;
    function basicParser(node) {
        var _a;
        switch (node.kind) {
            case ts.SyntaxKind.ClassDeclaration:
                const cNode = node;
                if (isTargetClass(cNode)) {
                    parsedInfo.testTarget = (_a = cNode.name) === null || _a === void 0 ? void 0 : _a.escapedText.toString();
                    ts.forEachChild(node, basicParser);
                }
                break;
            case ts.SyntaxKind.ImportDeclaration:
                importParser(node);
                break;
            case ts.SyntaxKind.Constructor:
                constructorParser(node);
                break;
            case ts.SyntaxKind.MethodDeclaration:
                const name = node.name;
                parsedInfo.testMethods.push(name.escapedText.toString());
                ts.forEachChild(node, funcParser);
                break;
            case ts.SyntaxKind.CallExpression:
                funcParser(node);
                break;
            default:
                ts.forEachChild(node, basicParser);
        }
    }
    function importParser(node) {
        var _a, _b;
        const importClause = node.importClause;
        const from = node.moduleSpecifier.text.toString();
        let isNameSpaceImport = ((_a = importClause.namedBindings) === null || _a === void 0 ? void 0 : _a.kind) === ts.SyntaxKind.NamespaceImport;
        const importElementNames = importClause.name
            ? importClause.name.escapedText.toString()
            : ((_b = importClause.namedBindings) === null || _b === void 0 ? void 0 : _b.kind) === ts.SyntaxKind.NamedImports
                ? importClause.namedBindings.elements.map((specifier) => specifier.name.escapedText.toString())
                : importClause.namedBindings.name.escapedText.toString();
        parsedInfo.imports.push({
            from,
            elements: importElementNames,
            isNameSpaceImport,
        });
    }
    function constructorParser(node) {
        node.parameters.map((child) => {
            let isRepo = false;
            let inject = findInjectModifier(child);
            const name = child.name.escapedText.toString();
            const typeNode = child.type;
            let typeName = typeNode.typeName.escapedText.toString();
            if (typeName === "Repository" && typeNode.typeArguments) {
                parsedInfo.hasRepo = true;
                const typeArg = typeNode.typeArguments[0]
                    .typeName.escapedText;
                typeName = typeArg.toString();
                isRepo = true;
            }
            parsedInfo.mockProviders[name] = {
                typeName,
                usingFunc: new Set(),
                isRepo,
                inject,
            };
        });
    }
    function funcParser(node) {
        if (!!(node.flags & ts.NodeFlags.DecoratorContext))
            return;
        if (node.kind === ts.SyntaxKind.CallExpression) {
            const expressions = [];
            getExpressions(node.expression, expressions);
            if (expressions[expressions.length - 1] === "__this") {
                const methodName = expressions[expressions.length - 2];
                if (!parsedInfo.mockProviders[methodName])
                    return;
                if (parsedInfo.mockProviders[methodName].isRepo) {
                    parsedInfo.repoMethods.add(expressions[expressions.length - 3]);
                }
                else
                    parsedInfo.mockProviders[methodName].usingFunc.add(expressions[expressions.length - 3]);
            }
            else if (expressions.length > 0)
                parsedInfo.genaralFunc.add(expressions[expressions.length - 1]);
        }
        ts.forEachChild(node, funcParser);
    }
    function filterImports() {
        parsedInfo.imports = parsedInfo.imports.map((ImportObject) => {
            if (Array.isArray(ImportObject.elements))
                return Object.assign(Object.assign({}, ImportObject), { elements: ImportObject.elements.filter(filterDecide) });
            else
                return filterDecide(ImportObject.elements)
                    ? ImportObject
                    : Object.assign(Object.assign({}, ImportObject), { elements: constants_1.DELETED_IMPORT });
        });
        parsedInfo.imports = parsedInfo.imports.filter(({ elements }) => typeof elements === "string"
            ? elements !== constants_1.DELETED_IMPORT
            : elements.length > 0);
        if (parsedInfo.hasRepo)
            parsedInfo.imports.push(constants_1.GET_REPOSITORY_TOKEN_IMPORT_OBJ);
        if (parsedInfo.testTarget)
            parsedInfo.imports.push({
                from: "./" + fileName,
                elements: [parsedInfo.testTarget],
                isNameSpaceImport: false,
            });
    }
    function filterDecide(element) {
        return ((element === "Repository" && parsedInfo.hasRepo) ||
            parsedInfo.genaralFunc.has(element) ||
            Object.values(parsedInfo.mockProviders).some((mockProvider) => element === mockProvider.typeName || element === mockProvider.inject));
    }
    function findInjectModifier(child) {
        var _a;
        let inject;
        (_a = child.modifiers) === null || _a === void 0 ? void 0 : _a.map((modifier) => {
            const decoratorCallExpression = modifier
                .expression;
            if (modifier.kind == ts.SyntaxKind.Decorator &&
                decoratorCallExpression.expression.escapedText ===
                    "Inject") {
                inject = decoratorCallExpression.arguments[0]
                    .escapedText;
            }
        });
        return inject;
    }
    function getExpressions(node, exp) {
        if (node.kind === ts.SyntaxKind.Identifier) {
            exp.push(node.escapedText.toString());
        }
        else if (node.kind === ts.SyntaxKind.PropertyAccessExpression) {
            exp.push(node.name.escapedText.toString());
            if (node.expression.kind === ts.SyntaxKind.ThisKeyword) {
                exp.push("__this");
            }
            else {
                getExpressions(node.expression, exp);
            }
        }
    }
    function isTargetClass(node) {
        const hasExport = node.modifiers
            ? node.modifiers.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword)
            : false;
        const hasDecorator = node.modifiers
            ? node.modifiers.some((mod) => mod.kind === ts.SyntaxKind.Decorator)
            : false;
        return hasExport && hasDecorator && !parsedInfo.testTarget;
    }
}
exports.parseSourceFile = parseSourceFile;
//# sourceMappingURL=parse-source-file.js.map