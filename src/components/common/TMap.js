import React, {Component} from 'react';
import {Platform, View} from 'react-native';
import MapView from '../MapView';
import * as PropTypes from 'prop-types';
import HRMap from '../HRMap';

class TMap extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {startAddress, endAddress, trackings, multiPolygon} = this.props;
    //testing purposes
    // startAddress.latitude = 30.3515677;
    // startAddress.longitude = -97.7965427;
    // endAddress.latitude = 30.274983;
    // endAddress.longitude = -97.739604;
    if (Platform.OS === 'android') {
      if(trackings && trackings.length === 1) {
        // android map crashes if there is just 1 gps point
        trackings.push(trackings[0]);
      }
      return (
        <MapView
          style={{
            flex: 1,
            backgroundColor: '#FFF',
            width: '100%',
            height: 350
          }}
          startCoords={{latitude: startAddress.latitude, longitude: startAddress.longitude}}
          endCoords={{latitude: endAddress.latitude, longitude: endAddress.longitude}}
          trackings={trackings}
          multiPolygon={multiPolygon}
        />
      );
    } else {
      return (
        <View style={{
          flex: 1,
          backgroundColor: '#FFF',
          width: '100%',
          height: 350
        }}>
          <HRMap
            startCoords={{latitude: startAddress.latitude, longitude: startAddress.longitude}}
            endCoords={{latitude: endAddress.latitude, longitude: endAddress.longitude}}
            trackings={trackings}
            multiPolygon={multiPolygon}
          />
        </View>
      );
    }
  }
}

TMap.propTypes = {
  startAddress: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number
  }),
  endAddress: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number
  }),
  trackings: PropTypes.array,
  multiPolygon: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number
      })
    )
  )
};

export default TMap;
