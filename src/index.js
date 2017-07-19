// @flow

import {
  dirname,
  resolve
} from 'path';
import babelPluginJsxSyntax from 'babel-plugin-syntax-jsx';
import BabelTypes from 'babel-types';
import createObjectExpression from './createObjectExpression';
import requireCssModule from './requireCssModule';
import resolveStringLiteral from './resolveStringLiteral';
import replaceJsxExpressionContainer from './replaceJsxExpressionContainer';
import {validateOption} from './validate'
import utils from './utils'

export default ({
  types: t
}: {
  types: BabelTypes
}) => {
  const filenameMap = {};

  const setupStyleInFile = (path, filename, style) => {
    const programPath = path.findParent((parentPath) => {
      return parentPath.isProgram();
    });

    /*
    if (!filenameMap[filename].importedHelperIndentifier) {
      filenameMap[filename].importedHelperIndentifier = programPath.scope.generateUidIdentifier('getClassName');
      programPath.unshiftContainer(
        'body',
        t.importDeclaration(
          [
            t.importDefaultSpecifier(
              filenameMap[filename].importedHelperIndentifier
            )
          ],
          t.stringLiteral('babel-plugin-react-css-modules/dist/browser/getClassName')
        )
      );
    }
    */

    const firstNonImportDeclarationNode = programPath.get('body').find((node) => {
      return !t.isImportDeclaration(node);
    });

    style.key = programPath.scope.generateUidIdentifier('Styles');
    firstNonImportDeclarationNode.insertBefore(
      t.variableDeclaration(
        'const',
        [
          t.variableDeclarator(
            style.key,
            t.valueToNode(style.value)
          )
        ]
      )
    );

    // eslint-disable-next-line
    // console.log('setting up', filename, util.inspect(filenameMap,{depth: 5}))
  };

  const addWebpackHotModuleAccept = (path) => {
    const test = t.memberExpression(t.identifier('module'), t.identifier('hot'));
    const consequent = t.blockStatement([
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(
            t.memberExpression(t.identifier('module'), t.identifier('hot')),
            t.identifier('accept')
          ),
          [
            t.stringLiteral(path.node.source.value),
            t.functionExpression(null, [], t.blockStatement([
              t.expressionStatement(
                t.callExpression(
                  t.identifier('require'),
                  [t.stringLiteral(path.node.source.value)]
                )
              )
            ]))
          ]
        )
      )
    ]);

    const programPath = path.findParent((parentPath) => {
      return parentPath.isProgram();
    });

    const firstNonImportDeclarationNode = programPath.get('body').find((node) => {
      return !t.isImportDeclaration(node);
    });

    const hotAcceptStatement = t.ifStatement(test, consequent);

    if (firstNonImportDeclarationNode) {
      firstNonImportDeclarationNode.insertBefore(hotAcceptStatement);
    } else {
      programPath.pushContainer('body', hotAcceptStatement);
    }
  };

  const getTargetResourcePath = (path: *, stats: *) => {
    const targetFileDirectoryPath = dirname(stats.file.opts.filename);

    if (path.node.source.value.startsWith('.')) {
      return resolve(targetFileDirectoryPath, path.node.source.value);
    }

    return require.resolve(path.node.source.value);
  };

  const notForPlugin = (path: *, stats: *) => {
    stats.opts.filetypes = stats.opts.filetypes || {};

    const extension = path.node.source.value.lastIndexOf('.') > -1 ? path.node.source.value.substr(path.node.source.value.lastIndexOf('.')) : null;

    if (extension !== '.css' && Object.keys(stats.opts.filetypes).indexOf(extension) < 0) {
      return true;
    }

    if (stats.opts.exclude && getTargetResourcePath(path, stats).match(new RegExp(stats.opts.exclude))) {
      return true;
    }

    return false;
  };

  return {
    inherits: babelPluginJsxSyntax,
    visitor: {
      ImportDeclaration (path: *, stats: *): void {
        if (notForPlugin(path, stats)) {
          return;
        }
        const filename = stats.file.opts.filename;
        if (!filenameMap[filename]) {
          filenameMap[filename] = {
            styleList: []
          };
        }
        const targetResourcePath = getTargetResourcePath(path, stats);
        let result = requireCssModule(targetResourcePath, {
          context: stats.opts.context,
          filetypes: stats.opts.filetypes || {},
        })
        const styleName = utils.getStyleNameFromPath(path);
        let style = filenameMap[filename].styleList.find(item => item.name == styleName);
        if (!style) {
          style = {
            name: styleName,
          }
          filenameMap[filename].styleList.push(style);
        }
        style.value = result;

        setupStyleInFile(path, filename, style);

        if (stats.opts.removeImport) {
          path.remove();
        }
      },
      JSXElement (path: *, stats: *): void {
        const filename = stats.file.opts.filename;
        const classAttribute = path.node.openingElement.attributes
          .find((attribute) => {
            return typeof attribute.name !== 'undefined' && attribute.name.name === 'class';
          });

        if (!classAttribute) {
          return;
        }

        if (t.isStringLiteral(classAttribute.value)) {
          resolveStringLiteral(
            path,
            filenameMap[filename].styleList,
            classAttribute
          );
        } else {
          console.error("only support string in class...")
        }
      },

      Program (path: *, stats: *): void {
        if (!validateOption(stats.opts)) {
          // eslint-disable-next-line no-console
          console.error(validateOption.errors);
          throw new Error('Invalid configuration');
        }
      }
    }
  };
};
