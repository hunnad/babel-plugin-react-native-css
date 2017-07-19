// @flow
import BabelTypes, {
  binaryExpression,
  Identifier,
  isJSXExpressionContainer,
  isStringLiteral,
  jSXAttribute,
  JSXAttribute,
  jSXExpressionContainer,
  jSXIdentifier
} from 'babel-types';
import conditionalClassMerge from './conditionalClassMerge';

export default (
  t: BabelTypes,
  // eslint-disable-next-line flowtype/no-weak-types
  path: Object,
  styleNameAttribute: JSXAttribute,
  importedHelperIndentifier: Identifier,
  styleModuleImportMapIdentifier: Identifier
): void => {
  const expressionContainerValue = styleNameAttribute.value;
  const classNameAttribute = path.node.openingElement.attributes
    .find((attribute) => {
      return typeof attribute.name !== 'undefined' && attribute.name.name === 'className';
    });

  if (classNameAttribute) {
    path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(classNameAttribute), 1);
  }

  path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(styleNameAttribute), 1);

  const styleNameExpression = t.callExpression(
    importedHelperIndentifier,
    [
      expressionContainerValue.expression,
      styleModuleImportMapIdentifier
    ]
  );

  if (classNameAttribute) {
    if (isStringLiteral(classNameAttribute.value)) {
      path.node.openingElement.attributes.push(jSXAttribute(
        jSXIdentifier('className'),
        jSXExpressionContainer(
          binaryExpression(
            '+',
            t.stringLiteral(classNameAttribute.value.value + ' '),
            styleNameExpression
          )
        )
      ));
    } else if (isJSXExpressionContainer(classNameAttribute.value)) {
      path.node.openingElement.attributes.push(jSXAttribute(
        jSXIdentifier('className'),
        jSXExpressionContainer(
          conditionalClassMerge(
            classNameAttribute.value.expression,
            styleNameExpression
          )
        )
      ));
    } else {
      throw new Error('Unexpected attribute value.');
    }
  } else {
    path.node.openingElement.attributes.push(jSXAttribute(
      jSXIdentifier('className'),
      jSXExpressionContainer(
        styleNameExpression
      )
    ));
  }
};
