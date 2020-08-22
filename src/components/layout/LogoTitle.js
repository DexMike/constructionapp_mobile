import React, {Component} from 'react';
import AppLogo from '../../img/logo.png'
import {Image} from 'react-native-elements';
class LogoTitle extends Component {
  render() {
    return (
      <Image
        source={AppLogo}
        placeholderStyle={{backgroundColor: 'rgba(0, 0, 0, 0)'}}
        style={{ width: 100, height: 25 }}
      />
    );
  }
}

export default LogoTitle;
