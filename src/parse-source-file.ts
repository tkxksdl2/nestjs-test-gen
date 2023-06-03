import * as ts from "typescript";
import {
  DELETED_IMPORT,
  GET_REPOSITORY_TOKEN_IMPORT_OBJ,
} from "./interfaces/constants";
import { ParsedInfo } from "./interfaces/interface";

export function parseSourceFile(node: ts.Node, fileName: string): ParsedInfo {
  const parsedInfo: ParsedInfo = {
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

  function basicParser(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
        const cNode = node as ts.ClassDeclaration;
        if (isTargetClass(cNode)) {
          parsedInfo.testTarget = cNode.name?.escapedText.toString();
          ts.forEachChild(node, basicParser);
        }
        break;
      case ts.SyntaxKind.ImportDeclaration:
        importParser(node as ts.ImportDeclaration);
        break;
      case ts.SyntaxKind.Constructor:
        constructorParser(node as ts.ConstructorDeclaration);
        break;
      case ts.SyntaxKind.MethodDeclaration:
        const name = (node as ts.MethodDeclaration).name as ts.Identifier;
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

  function importParser(node: ts.ImportDeclaration) {
    const importClause = node.importClause as ts.ImportClause;
    const from = (node.moduleSpecifier as ts.StringLiteral).text.toString();
    let isNameSpaceImport =
      importClause.namedBindings?.kind === ts.SyntaxKind.NamespaceImport;

    const importElementNames = importClause.name
      ? (importClause.name as ts.Identifier).escapedText.toString()
      : importClause.namedBindings?.kind === ts.SyntaxKind.NamedImports
      ? (importClause.namedBindings as ts.NamedImports).elements.map(
          (specifier) => specifier.name.escapedText.toString()
        )
      : (
          importClause.namedBindings as ts.NamespaceImport
        ).name.escapedText.toString();

    parsedInfo.imports.push({
      from,
      elements: importElementNames,
      isNameSpaceImport,
    });
  }

  function constructorParser(node: ts.ConstructorDeclaration) {
    node.parameters.map((child: ts.ParameterDeclaration) => {
      let isRepo = false;
      let inject = findInjectModifier(child);
      const name = (child.name as ts.Identifier).escapedText.toString();
      const typeNode = child.type as ts.TypeReferenceNode;
      let typeName = (
        typeNode.typeName as ts.Identifier
      ).escapedText.toString();
      if (typeName === "Repository" && typeNode.typeArguments) {
        parsedInfo.hasRepo = true;
        const typeArg = (
          (typeNode.typeArguments[0] as ts.TypeReferenceNode)
            .typeName as ts.Identifier
        ).escapedText;
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

  function funcParser(node: ts.Node) {
    if (!!(node.flags & ts.NodeFlags.DecoratorContext)) return;
    if (node.kind === ts.SyntaxKind.CallExpression) {
      const expressions: string[] = [];
      getExpressions(
        (node as ts.CallExpression).expression as
          | ts.PropertyAccessExpression
          | ts.Identifier,
        expressions
      );
      if (expressions[expressions.length - 1] === "__this") {
        const methodName = expressions[expressions.length - 2];
        if (!parsedInfo.mockProviders[methodName]) return;
        if (parsedInfo.mockProviders[methodName].isRepo) {
          parsedInfo.repoMethods.add(expressions[expressions.length - 3]);
        } else
          parsedInfo.mockProviders[methodName].usingFunc.add(
            expressions[expressions.length - 3]
          );
      } else if (expressions.length > 0)
        parsedInfo.genaralFunc.add(expressions[expressions.length - 1]);
    }
    ts.forEachChild(node, funcParser);
  }

  function filterImports() {
    parsedInfo.imports = parsedInfo.imports.map((ImportObject) => {
      if (Array.isArray(ImportObject.elements))
        return {
          ...ImportObject,
          elements: ImportObject.elements.filter(filterDecide),
        };
      else
        return filterDecide(ImportObject.elements)
          ? ImportObject
          : { ...ImportObject, elements: DELETED_IMPORT };
    });
    parsedInfo.imports = parsedInfo.imports.filter(({ elements }) =>
      typeof elements === "string"
        ? elements !== DELETED_IMPORT
        : elements.length > 0
    );

    if (parsedInfo.hasRepo)
      parsedInfo.imports.push(GET_REPOSITORY_TOKEN_IMPORT_OBJ);
    if (parsedInfo.testTarget)
      parsedInfo.imports.push({
        from: "./" + fileName,
        elements: [parsedInfo.testTarget],
        isNameSpaceImport: false,
      });
  }

  function filterDecide(element: string) {
    return (
      (element === "Repository" && parsedInfo.hasRepo) ||
      parsedInfo.genaralFunc.has(element) ||
      Object.values(parsedInfo.mockProviders).some(
        (mockProvider) =>
          element === mockProvider.typeName || element === mockProvider.inject
      )
    );
  }

  function findInjectModifier(child: ts.ParameterDeclaration) {
    let inject;
    child.modifiers?.map((modifier) => {
      const decoratorCallExpression = (modifier as ts.Decorator)
        .expression as ts.CallExpression;
      if (
        modifier.kind == ts.SyntaxKind.Decorator &&
        (decoratorCallExpression.expression as ts.Identifier).escapedText ===
          "Inject"
      ) {
        inject = (decoratorCallExpression.arguments[0] as ts.Identifier)
          .escapedText;
      }
    });
    return inject;
  }

  function getExpressions(
    node: ts.PropertyAccessExpression | ts.Identifier,
    exp: string[]
  ) {
    if (node.kind === ts.SyntaxKind.Identifier) {
      exp.push(node.escapedText.toString());
    } else if (node.kind === ts.SyntaxKind.PropertyAccessExpression) {
      exp.push((node.name as ts.Identifier).escapedText.toString());
      if (node.expression.kind === ts.SyntaxKind.ThisKeyword) {
        exp.push("__this");
      } else {
        getExpressions(
          node.expression as ts.PropertyAccessExpression | ts.Identifier,
          exp
        );
      }
    }
  }

  function isTargetClass(node: ts.ClassDeclaration) {
    const hasExport = node.modifiers
      ? node.modifiers.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword)
      : false;
    const hasDecorator = node.modifiers
      ? node.modifiers.some((mod) => mod.kind === ts.SyntaxKind.Decorator)
      : false;
    return hasExport && hasDecorator && !parsedInfo.testTarget;
  }
}
