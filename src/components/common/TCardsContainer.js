//import liraries
import React, { Component } from 'react';
import {
   View,
   StyleSheet,
   Dimensions
  } from 'react-native';
const SCREEN_WIDTH = Dimensions.get('window').width;

class TCardsContainer extends Component {
  renderCards() {
    return this.props.data.map((item, index) => {
       return (
          <View key={item.id}>
             {this.props.renderCard(item)}
          </View>
       )
    });
  }
  render() {
    return (
       <View>
          {this.renderCards()}
       </View>
    );
 }
}

export default TCardsContainer;