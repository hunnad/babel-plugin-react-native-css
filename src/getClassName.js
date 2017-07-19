// @flow

import type {StyleModuleImportMapType, StyleModuleMapType} from "./types";
import * as t from 'babel-types';

const isNamespacedClassName = (className: string): boolean => {
  return className.indexOf('.') !== -1;
};

const getClassNameForNamespacedClassName = (className: string, styleModuleImportMap: StyleModuleImportMapType): string => {
  // Note:
  // Do not use the desctructing syntax with Babel.
  // Desctructing adds _slicedToArray helper.
  const classNameParts = className.split('.');
  const importName = classNameParts[0];
  const moduleName = classNameParts[1];

  if (!moduleName) {
    throw new Error('Invalid class name.');
  }

  if (!styleModuleImportMap[importName]) {
    throw new Error('CSS module import does not exist.');
  }

  if (!styleModuleImportMap[importName][moduleName]) {
    throw new Error('CSS module does not exist.');
  }

  return styleModuleImportMap[importName][moduleName];
};

export default (classValue: string, styleList: StyleModuleImportMapType): string => {
  let classes = classValue
    .split(' ')
    .filter((className) => {
      return className;
    })
    .map((className) => {
    let result = [];
      styleList.forEach(style => {
         let value = style.value;
         if (!value) {
           return;
         }
         if (value[className]) {
            result.push({
              styleKey: style.key,
              className:className,
            })
         }
      })

      if (result.length == 0) {
        throw new Error('Could not resolve the styleName \'' + className + '\'.');
      }
      return result;
    });

  let arr = [];
  classes.forEach(clazz => {
    clazz.forEach(item => {
      let property = t.memberExpression(item.styleKey, t.stringLiteral(item.className), true);
      arr.push(property);
    })
  })
  return t.arrayExpression(arr);
};
