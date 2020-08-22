import React, {Component} from 'react';
import {Platform, View, Text} from 'react-native';
import MapView from '../MapView';
import * as PropTypes from 'prop-types';
import HRMap from '../HRMap';
import LoadService from '../../api/LoadService';
// import console = require('console');

// timer has to be declared globaly so that it 
// is cleared from memory along with this component
let timerVar;
const refreshInterval = 15; // refresh every 15 seconds
let count = 0;

class TMapLive extends Component {
  constructor(props) {
    super(props);

    this.state = {
      liveCoords: {
        latitude: 0,
        longitude: 0
      },
      liveInitials: '',
      loaded: false
    }
  }

  async componentDidMount() {
    const { loadStatus, loadId } = this.props;
    if (loadStatus == 'Started') {
      this.getLatestGPSForLoad();
      this.programmedRefresh(false);
    } else {
      this.setState({ loaded: true });
    }
  }

  componentWillUnmount() {
    this.programmedRefresh(true);
  }

  async getLatestGPSForLoad() {
    const { loadId } = this.props;
    // this takes an array but in this case we need only one load id
    const allLoads = [String(loadId)];
    let gpsTrackings = [];
    // only get if there is one load or more
    try {
      gpsTrackings = await LoadService.getLatestGPSForLoads(allLoads);
    } catch (e) {
      // console.log(`Unable to get loads: ${e}`);
    }
    
    if (gpsTrackings.length > 0) {
      // this.map.addObject(groupTrackings);

      //get only the first one
      const data = gpsTrackings[0];
      const liveCoords = {
        latitude: data.latitude,
        longitude: data.longitude
      }
      const liveInitials = `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`;
      this.setState({
        liveCoords,
        liveInitials,
        loaded: true
      }, function loaded() {
        // test force update
        this.forceUpdate();
      })
    } else {
      // if there are no trackings, there's no point in reloading
      this.programmedRefresh(true);
      this.setState({ loaded: true });
      // console.log('No gpstracking to track');
    }
  }

  programmedRefresh(remove) {
    if (!remove) {
      const that = this;
      const timerTimer = function timerTimer() {
        count += 1;
        // console.log(`>>>REFRESHING: ${Date.now()} COUNT: ${count}`);
        that.getLatestGPSForLoad();
      };
      timerVar = setInterval(timerTimer, (refreshInterval * 1000));
    } else {
      clearInterval(timerVar);
    }
  }

  render() {
    const {
      startAddress,
      endAddress,
      trackings
    } = this.props;

    const {
      liveCoords,
      loaded
    } = this.state;

    //testing purposes
    // startAddress.latitude = 30.3515677;
    // startAddress.longitude = -97.7965427;
    // endAddress.latitude = 30.274983;
    // endAddress.longitude = -97.739604;
    
    const start = {
      latitude: startAddress.longitude,
      longitude: startAddress.latitude,
      isReturning: startAddress.isReturning
    };
    const end = {
      latitude: endAddress.longitude,
      longitude: endAddress.latitude,
      isReturning: startAddress.isReturning
    }

    // the liveCoords must be loaded
    if (Platform.OS === 'android' && loaded) {
      return (
        <MapView
          style={{
            flex: 1,
            backgroundColor: '#FFF',
            width: '100%',
            height: 350
          }}
          startCoords={ start }
          endCoords={ end }
          trackings={trackings}
          currentCoords={
            {
              latitude: liveCoords.latitude,
              longitude: liveCoords.longitude
            }
          }
        />
      );
    } else if (Platform.OS === 'ios') {
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
          />
        </View>
      );
    }
    return (
      <View style={{flex: 1, padding: 20, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
        <Text>Loading...</Text>
      </View>
    );
  }
}

TMapLive.propTypes = {
  startAddress: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number
  }),
  endAddress: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number
  }),
  trackings: PropTypes.array,
  loadId: PropTypes.number,
  loadStatus: PropTypes.string
};

export default TMapLive;
