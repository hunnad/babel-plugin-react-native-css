import React from 'react';
import { Text } from 'react-native';

const _Styles2 = {
  header2: {
    backgroundColor: '#7C7DCD',
    width: 100
  },
  header3: {
    backgroundColor: '#7C7DCD',
    width: 100
  },
  'header--wwww': {
    backgroundColor: '#7C7DCD',
    width: 100
  }
};
const _Styles = {
  a: {
    height: 100
  },
  'title-is': {
    backgroundColor: '#7C7DCD',
    width: 100
  },
  'title-icccs': {
    backgroundColor: '#7C7DCD',
    width: 100
  },
  header: {
    backgroundColor: '#7C7DCD',
    width: 100
  }
};
export default class Test extends React.Component {
  render() {
    return <Text style={[_Styles['title-is'], _Styles['title-icccs'], _Styles2['header2'], _Styles2['header--wwww']]}></Text>;
  }
}
