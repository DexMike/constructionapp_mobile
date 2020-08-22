import React, {Component} from 'react';
import {Text, View, TouchableHighlight, Animated} from 'react-native'; //Step 1
// import styles from '../shared.style';
import PropTypes from "prop-types";
import {StyleSheet} from 'react-native';
import {Button} from "react-native-elements";
import Icon from 'react-native-vector-icons/FontAwesome';
import RF from "react-native-responsive-fontsize";

class TPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.title,
      expanded: true,
      animation: new Animated.Value()
    };
    this.toggle = this.toggle.bind(this);
    this._setMinHeight = this._setMinHeight.bind(this);
    this._setMaxHeight = this._setMaxHeight.bind(this);
  }

  toggle() {
    let initialValue = this.state.expanded ? this.state.maxHeight + this.state.minHeight : this.state.minHeight,
      finalValue = this.state.expanded ? this.state.minHeight : this.state.maxHeight + this.state.minHeight;

    this.setState({
      expanded: !this.state.expanded
    });

    this.state.animation.setValue(initialValue);
    Animated.spring(     //Step 4
      this.state.animation,
      {
        toValue: finalValue
      }
    ).start();
  }

  _setMaxHeight(event) {
    this.setState({
      maxHeight: event.nativeEvent.layout.height
    });
  }

  _setMinHeight(event) {
    this.setState({
      minHeight: event.nativeEvent.layout.height
    });
  }

  // make this into an animated view
  render() {
    return (
      <React.Fragment>
        <View style={{flexDirection: 'row'}}>
          <Text>{this.state.title}</Text>
          <View style={styles.containerDropdown}>
            <TouchableHighlight
              style={styles.button}
              onPress={this.toggle}
              underlayColor="#f1f1f1">
              <Icon name={this.state.expanded ? "chevron-down" : "chevron-up"} size={15} color="black"/>
            </TouchableHighlight>
          </View>
        </View>
        {this.state.expanded &&
        <View style={styles.container}>
          <View style={styles.body}>
            {this.props.children}
          </View>
        </View>
        }
      </React.Fragment>
    );
  }
}

{/*<Animated.View*/
}
{/*  style={[styles.containerPanel, {height: this.state.animation}]}>*/
}
{/*    <View onLayout={this._setMinHeight}>*/
}
{/*      <TouchableHighlight*/
}
{/*        style={styles.buttonLoads}*/
}
{/*        onPress={this.toggle.bind(this)}*/
}
{/*        underlayColor="#f1f1f1">*/
}
{/*        <View style={{flexDirection: 'row'}}>*/
}
{/*          <Text*/
}
{/*            style={{color: 'white', paddingRight: 10, fontSize: 16, fontWeight: "bold"}}>{this.state.title}</Text>*/
}
{/*          <Icon name={this.state.expanded ? "chevron-down" : "chevron-up"} size={15} color="white"*/
}
{/*                paddingTop={10}/>*/
}
{/*        </View>*/
}
{/*      </TouchableHighlight>*/
}
{/*    </View>*/
}

{/*    <View style={styles.bodyPanel} onLayout={this._setMaxHeight}>*/
}
{/*      {this.props.children}*/
}
{/*    </View>*/
}
{/*</Animated.View>*/
}


const styles = StyleSheet.create({
  container: {
    borderWidth: 0.5,
    borderRadius: 5,
    borderColor: 'white',
    padding: 5,
    marginBottom: 13,
    backgroundColor: '#ffffff',
  },
  containerDropdown: {
    borderWidth: 0.5,
    borderRadius: 5,
    borderColor: 'white',
    padding: 5,
    marginBottom: 13,
    backgroundColor: '#ffffff',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'stretch'
  },
  title: {
    flex: 1,
    padding: 10,
    color: '#2a2f43',
    fontWeight: 'bold'
  },
  button: {},
  buttonImage: {
    width: 30,
    height: 25
  },
  body: {
    padding: 10,
    paddingTop: 0
  }
});


TPanel.propTypes = {
  title: PropTypes.string.isRequired
};

TPanel.defaultProps = {};

export default TPanel;
