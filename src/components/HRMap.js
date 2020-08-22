import React, {Component} from 'react';
import {requireNativeComponent, StyleSheet} from 'react-native';
import * as PropTypes from 'prop-types';

// NOTE the map defaults to Vancouver if the latitude / longitude coordinates are invalid.
class MainHRMap extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { startCoords, endCoords, multiPolygon } = this.props;
    const { trackings } = this.props;
    // if there are tracking points use those instead of job address.
    if(trackings && trackings.length && trackings.length > 0) {
      startCoords = {
        latitude: trackings[0][1],
        longitude: trackings[0][0]
      };
      endCoords = {
        latitude: trackings[trackings.length - 1][1],
        longitude: trackings[trackings.length - 1][0]
      };
    }
    if(multiPolygon && multiPolygon.length > 0) {
      multiPolygon = multiPolygon.map(polygon => {
        return polygon.map(geoCoordinate => {
          return [geoCoordinate.latitude, geoCoordinate.longitude];
        })
      });
    }
    return (
      <HRMap
        startCoords={startCoords}
        endCoords={endCoords}
        trackings={trackings}
        style={styles.bottom}
        multiPolygon={multiPolygon}
      />
    );
  };
}

MainHRMap.propTypes = {
  startCoords: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number
  }),
  endCoords: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number
  }),
  trackings: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.number)
  ),
  multiPolygon: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number
      })
    )
  )
};

// MainHRMap.defaultProps = {
//   startCoords: {
//     latitude: 0,
//     longitude: 0
//   },
//   endCoords: {
//     latitude: 0,
//     longitude: 0
//   },
//   trackings: []
// };

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const HRMap = requireNativeComponent('HRMap', MainHRMap);

export default MainHRMap;
