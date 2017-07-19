export default class Utils {

	static arrayContains(value, arr) {
		for (let i = 0; i < arr.length; i++) {
			if (value === arr[i]) {
				return true;
			}
		}
		return false;
	}

	static clean(string) {
		return string.replace(/\r?\n|\r/g, '');
	}

	static contains(string, needle) {
		const search = string.match(needle);
		return search && search.length > 0;
	}

	static getStyleNameFromPath(path) {
    if (path.node.specifiers.length === 0) {
      // use imported file path as import name
      return path.node.source.value;
    } else if (path.node.specifiers.length === 1) {
      return path.node.specifiers[0].local.name;
    } else {
      // eslint-disable-next-line no-console
      console.warn('Please report your use case. https://github.com/gajus/babel-plugin-react-css-modules/issues/new?title=Unexpected+use+case.');
      throw new Error('Unexpected use case.');
    }
  }

  static getStyle(styleList, styleName) {

  }
}
