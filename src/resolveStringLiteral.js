// @flow

import {
  isJSXExpressionContainer,
  isStringLiteral,
  JSXAttribute,
  stringLiteral
} from 'babel-types';
import conditionalClassMerge from './conditionalClassMerge';
import getClassName from './getClassName';
import type {
  StyleModuleImportMapType
} from './types';
import * as t from 'babel-types';

/**
 * Updates the className value of a JSX element using a provided styleName attribute.
 */
export default (path: *, styeList: StyleModuleImportMapType, classAttribute: JSXAttribute): void => {
  const styleAttribute = path.node.openingElement.attributes
    .find((attribute) => {
      return typeof attribute.name !== 'undefined' && attribute.name.name === 'style';
    });

  if (styleAttribute) {
    path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(styleAttribute), 1);
  }
  path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(classAttribute), 1);

  const styleArrayExpression = getClassName(classAttribute.value.value, styeList);

  if (styleAttribute) {
    /**
    if (isJSXExpressionContainer(styleAttribute.value)) {
      styleAttribute.value.expression = conditionalClassMerge(
        styleAttribute.value.expression,
        stringLiteral(resolvedClassName)
      );
    } else {
      throw new Error('Unexpected attribute value.');
    }

    path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(classAttribute), 1);
     **/
  }
  path.node.openingElement.attributes.push(t.jSXAttribute(t.jSXIdentifier('style'), t.jSXExpressionContainer(styleArrayExpression)));
};
