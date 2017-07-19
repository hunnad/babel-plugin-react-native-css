import foo from './bar.css';
import React from 'react'
import {Text} from 'react-native'

export default class Test extends React.Component {
  render() {
    return (<Text styleName="bar__a"></Text>)
  }
}
