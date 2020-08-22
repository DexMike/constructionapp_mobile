import React, {Component} from 'react';
import {requireNativeComponent, NativeModules, StyleSheet} from 'react-native';
import * as PropTypes from 'prop-types';

class MainBulb extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Bulb style={ styles.bottom }  isOn={this.props.isOn} onStatusChange={(e) => this.props.onStatusChange(e)} />
    )
  }
}

MainBulb.propTypes = {
  isOn: PropTypes.bool.isRequired,
  onStatusChange: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

const Bulb = requireNativeComponent('Bulb', MainBulb);

export default MainBulb;
