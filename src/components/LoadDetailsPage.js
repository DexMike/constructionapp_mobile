import React, {Component} from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  Platform,
  Linking,
  Dimensions,
  Alert, TouchableOpacity
} from 'react-native';
import {
  Text,
  Button,
  Image,
  ThemeProvider,
  Overlay,
} from 'react-native-elements';
// import MapboxGL from '@mapbox/react-native-mapbox-gl';
import AddressService from '../api/AddressService';
import PropTypes from 'prop-types';
import {translate} from '../i18n';

import MapView from './MapView';
import HRMap from './HRMap';

import theme from '../Theme';
import NavigationService from "../service/NavigationService";
import Icon from 'react-native-vector-icons/MaterialIcons';
import TFormat from "./common/TFormat";
import NumberFormatting from '../utils/NumberFormatting';
import ProfileService from '../api/ProfileService';
import LoadService from '../api/LoadService';
import TMapLive from './common/TMapLive';
import GPSTrackingService from '../api/GPSTrackingService';
import MapService from '../api/MapService';

class LoadDetailsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      load: null,
      index: null,
      loading: true,
      startAddressFull: null,
      endAddressFull: null,
      trackings: null,
      gpsTrackings: [],
      driver: null
    }
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('jobName', ''),
    };
  };

  async componentDidMount() {
    let {trackings} = {...this.state};
    const profile = await ProfileService.getProfile();
    const {params} = NavigationService.getCurrentRoute();
    const load = params.load;
    
    let gps = [];

    // if addresses not null, retreive coords
    let startAddress = null;
    let endAddress = null;
    let driverUser = {
      firstName: '',
      lastName: ''
    };

    try {
      driverUser = await LoadService.getDriverUserForLoad(load.id);
    } catch (e) {
      // console.log('Unable to obtain driver\'s data');
      // console.log(e);
    }

    try {
      if (load.startAddressId !== null) {
        startAddress = await AddressService.getAddressById(load.startAddressId);
      }
      if (load.endAddressId !== null) {
        endAddress = await AddressService.getAddressById(load.endAddressId);
      }
    } catch(e) {
      // console.log('>>>LOAD ERROR: ')
      // console.log(e)
    }

    try {
      gps = await GPSTrackingService.getGPSTrackingByLoadId(load.id);
    } catch (err) {
      console.log("ERROR: ", err);
    }

    const index = params.index;
    this.setState({
      load,
      index,
      profile,
      loading: false,
      startAddressFull: startAddress,
      endAddressFull: endAddress,
      trackings,
      gpsTrackings: gps,
      driver: driverUser
    });
    this.renderMap = this.renderMap.bind(this);
  }

  renderMap() {
    const {
      gpsTrackings,
      load
    } = this.state;
    // debugger;
    // if (startAddressFull !== null && endAddressFull !== null) {
    if(gpsTrackings.length > 0) {

      let startAddress = {
        latitude: gpsTrackings[0][1],
        longitude: gpsTrackings[0][0],        
        isReturning: gpsTrackings[0][2]
      };
      let endAddress = {
        latitude: gpsTrackings[gpsTrackings.length - 1][1],
        longitude: gpsTrackings[gpsTrackings.length - 1][0],
        isReturning: gpsTrackings[gpsTrackings.length - 1][2]
      };

      return (
        <View style={{width: '100%'}}>
          <TMapLive
            startAddress={startAddress}
            endAddress={endAddress}
            trackings={gpsTrackings}
            loadId={load.id}
            loadStatus={load.loadStatus}
          />
        </View>
      );
    } else {
      return <React.Fragment />;
    }
  }

  renderTicketItem(endTime) {
    const {load} = {...this.state};
    return (
      <React.Fragment>
        <View style={styles.container} id={load.ticketNumber}>
          <TouchableOpacity onPress={() => {
            NavigationService.push('TicketDetailsPage', {
              load,
              endTime
            })
          }}>
            <View style={styles.sectionInfo}>
              <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={styles.subSectionRow}>
                  <View>
                    <View
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 20,
                        backgroundColor: 'rgb(62,110,85)',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon
                        name='done-all'
                        size={24}
                        color="white"
                      />
                    </View>
                  </View>
                  {/*<View style={{justifyContent: 'center'}}>*/}
                  {/*  <Icon name={'done-all'} size={40} color='rgb(62,110,85)'/>*/}
                  {/*</View>*/}
                  <View style={{justifyContent: 'center'}}>
                    <Text style={styles.quaternaryText}>Ticket# {load.ticketNumber}</Text>
                    <Text style={styles.secondaryText}>{endTime}</Text>
                  </View>
                </View>
                <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end'}}>
                  <Icon name="chevron-right" size={24} color='rgb(0, 111, 83)'/>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </React.Fragment>
    )
  }

  render() {
    const {load, index, profile, loading, driver} = {...this.state};
    if (loading) {
      return (
        <View style={{flex: 1, padding: 20, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
          <ActivityIndicator size="large"/>
        </View>
      )
    }
    const startTimeHourMin = (!load.startTime ? null : TFormat.asDayWeek(load.startTime, profile.timeZone));
    const endTimeHourMin = (!load.endTime ? null : TFormat.asDayWeek(load.endTime, profile.timeZone));

    return (
      <ThemeProvider theme={theme}>

        <ScrollView style={{backgroundColor: 'rgb(230,230,225)'}}>
          <View style={styles.backgroundContainer}>
            <Text style={styles.sectionTitle}>{translate('Load Details')}</Text>
            <View style={styles.container}>
              <View style={styles.sectionInfo}>
                <View style={styles.subSectionInfo}>
                  <View style={styles.subSectionRow}>
                    <View>
                      <View
                        style={{
                          height: 40,
                          width: 40,
                          borderRadius: 20,
                          backgroundColor: 'rgb(62,110,85)',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon
                          name='local-shipping'
                          size={24}
                          color="white"
                        />
                      </View>
                    </View>
                    {/*<Icon name={'local-shipping'} size={35} color='rgb(62,110,86)'/>*/}
                    <Text style={styles.primaryText}>{translate("Load")} #{index}</Text>
                  </View>
                  <View style={styles.subSectionRow}>
                    <Icon name={'landscape'} size={35} color='rgb(102,102,102)'/>
                    <Text style={styles.primaryText}>{NumberFormatting.asMoney(load.tonsEntered, '.', 2, ',', '')} {translate('tons')}{` `}
                      <Text style={styles.secondaryText}>
                        - {load.material}
                      </Text>
                    </Text>
                  </View>
                  {/*<View style={styles.subSectionRow}>*/}
                  {/*  <Icon name={'timeline'} size={35} color='rgb(102,102,102)'/>*/}
                  {/*  <Text style={styles.primaryText}>xx.x miles</Text>*/}
                  {/*</View>*/}
                  <View style={styles.subSectionInfo}>
                    <View style={styles.subSectionRow}>
                      <Icon name={'person'} size={35} color='rgb(102,102,102)'/>
                      <View>
                        <Text style={styles.secondaryText}>{`${driver.firstName} ${driver.lastName}`}</Text>
                      </View>
                    </View>
                    <View style={styles.subSectionRow}>
                      <Icon name={'schedule'} size={35} color='rgb(102,102,102)'/>
                      <View>
                        {load.rateType === "Hour" && <Text style={styles.primaryText}>{TFormat.timeDifferenceAsHoursAndMinutes(load.endTime, load.startTime)}</Text>}
                        <Text style={styles.secondaryText}>{startTimeHourMin}</Text>
                        <Text style={styles.secondaryText}>{endTimeHourMin}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <Text style={styles.sectionTitle}>{translate('Ticket Details')}</Text>
            {this.renderTicketItem(endTimeHourMin)}
            <Text style={styles.sectionTitle}>{translate('Load Map')}</Text>
            <View style={styles.container}>
              <View style={styles.sectionInfo}>
                {this.renderMap()}
              </View>
            </View>
          </View>
        </ScrollView>
      </ThemeProvider>
    );
  }
}

const styles = StyleSheet.create({
  backgroundContainer: {flex: 1, paddingBottom: 17, backgroundColor: 'rgb(230,230,225)'},

  primaryText: {
    fontSize: 18,
    color: 'rgb(38,38,38)',
    paddingLeft: 15,
    paddingTop: 10
  },

  secondaryText: {
    fontSize: 15,
    color: 'rgb(102,102,102)',
    paddingLeft: 15,
    paddingTop: 8
  },

  tertiaryText: {
    fontSize: 18,
    color: 'rgb(169,169,169)'
  },

  quaternaryText: {
    fontSize: 18,
    color: 'rgb(62,110,85)',
    paddingLeft: 15,
    paddingTop: 0
  },

  sectionInfo: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch'
  },

  subSectionInfo: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  subSectionRow: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10
  },

  container: {
    backgroundColor: 'rgb(255,255,255)',
    borderBottomWidth: 1,
    borderRadius: 2,
    borderColor: 'rgb(183,182,179)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 5,
  },

  sectionTitle: {color: 'rgb(89,89,89)', padding: 10, paddingTop: 20, paddingLeft: 20}

});

LoadDetailsPage.propTypes = {
  screenProps: PropTypes.object
};

export default LoadDetailsPage;
