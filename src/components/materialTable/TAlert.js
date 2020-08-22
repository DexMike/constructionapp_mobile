import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import PropTypes from "prop-types";
import styles from '../shared.style';

class TAlert extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: props.visible,
      alertText: props.alertText
    };
  }

  render() {
    const {visible, alertText} = this.state;
    if (visible) {
      return (
        <View hide={visible}><Text style={styles.alertText}>{alertText}</Text></View>
      )
    }
  }
}

TAlert.propTypes = {
  visible: PropTypes.bool.isRequired,
  alertText: PropTypes.string.isRequired
};

TAlert.defaultProps = {

};

export default TAlert;
