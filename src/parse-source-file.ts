import * as ts from "typescript";
import { ParsedInfo } from "./interfaces/interface";

export function parseSourceFile(node: ts.Node): ParsedInfo {
  const parsedInfo: ParsedInfo = {
    testTarget: undefined,
    testMethods: [],
    mockProviders: {},
    genaralFunc: [],
    repoMethods: new Set(),
    imports: [],
  };
  basicParser(node);
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
    if (node.kind === ts.SyntaxKind.CallExpression) {
      const expressions: string[] = [];
      getExpressions(
        (node as ts.CallExpression).expression as ts.PropertyAccessExpression,
        expressions
      );
      console.log(expressions);
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
        parsedInfo.genaralFunc.push(
          expressions.reduce((acc, cur) => cur + "." + acc)
        );
    }
    ts.forEachChild(node, funcParser);
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

  function getExpressions(node: ts.PropertyAccessExpression, exp: string[]) {
    if (node.name) {
      const expression = (node.name as ts.Identifier).escapedText.toString();
      exp.push(expression);
      if (node.expression) {
        if (ts.isPropertyAccessExpression(node.expression)) {
          getExpressions(node.expression as ts.PropertyAccessExpression, exp);
        } else if (ts.isIdentifier(node.expression)) {
          exp.push(node.expression.escapedText.toString());
        } else if (node.expression.kind === ts.SyntaxKind.ThisKeyword) {
          exp.push("__this");
        }
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
