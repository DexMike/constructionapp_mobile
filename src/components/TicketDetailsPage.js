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
import {translate} from '../i18n';
import PropTypes from 'prop-types';

import theme from '../Theme';
import NavigationService from '../service/NavigationService';
import LoadInvoiceService from "../api/LoadInvoiceService";
import Icon from 'react-native-vector-icons/MaterialIcons';
import TFormat from "./common/TFormat";
import NumberFormatting from '../utils/NumberFormatting';
import {Modal} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';


class TicketDetailsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      load: null,
      endTime: null,
      loading: true,
      images: [],
      imageZoomVisible: false,
      imageIndex: 0
    }
  }

  async componentDidMount() {
    const {params} = NavigationService.getCurrentRoute();
    let {images} = {...this.state};
    const load = params.load;
    const endTime = params.endTime;
    try {
      const loadInvoices = await LoadInvoiceService.getLoadInvoicesByLoadId(load.id);
      loadInvoices.forEach(function (loadInvoice) {
        images.push({url: loadInvoice.image, props: {}});
      });
    } catch (err) {
      console.log(err);
    }
    this.setState({load, endTime, loading: false});
  }

  renderTicketImages(load, index) {
    return (
      <TouchableOpacity
        key={load.url} style={{padding: 5, flex: 1}}
        onPress={() => {
          this.setState({imageZoomVisible: true, imageIndex: index})
        }}>
        <Image
          source={{uri: load.url}}
          style={{width: 200, height: 200, borderWidth: 1, borderColor: 'gray'}}
        />
      </TouchableOpacity>
    )
  }

  renderTicketItem() {
    const {load, endTime} = {...this.state};
    return (
      <React.Fragment>
        <View style={styles.container} id={load.ticketNumber}>
          <View style={styles.sectionInfo}>
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
                <Text style={styles.primaryText}>Ticket# {load.ticketNumber}</Text>
                <Text style={styles.secondaryText}>{endTime}</Text>
              </View>
            </View>
          </View>
        </View>
      </React.Fragment>
    )
  }

  render() {
    const {load, loading, images, imageZoomVisible, imageIndex} = {...this.state};
    if (loading) {
      return (
        <View style={{flex: 1, padding: 20, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
          <ActivityIndicator size="large"/>
        </View>
      )
    }
    return (
      <ThemeProvider theme={theme}>
        <Modal visible={imageZoomVisible} transparent={true}>
          <ImageViewer
            imageUrls={images}
            enableSwipeDown={true}
            onSwipeDown={() => {
              this.setState({imageZoomVisible: false})
            }}
            index={imageIndex}
          />
        </Modal>
        <ScrollView style={{backgroundColor: 'rgb(230,230,225)'}}>
          <View style={styles.backgroundContainer}>
            <Text style={styles.sectionTitle}>{translate('Ticket Details')}</Text>
            {this.renderTicketItem()}
            <View style={styles.containerShadow} id='loadDetails'>
              <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingTop: 7,
                paddingBottom: 7
              }}>
                {/*<View style={styles.subSectionRow}>*/}
                {/*  <Icon name={'done-all'} size={28} color='rgb(62,110,85)'/>*/}
                {/*  <Text style={styles.quaternaryText}>Ticket# {ticket.number}*/}
                {/*    <Text style={styles.secondaryText}>*/}
                {/*      Sand{` `}*/}
                {/*      <Text style={styles.secondaryText}>*/}
                {/*        load end time*/}
                {/*      </Text>*/}
                {/*    </Text>*/}
                {/*  </Text>*/}
                {/*</View>*/}
                <View style={{justifyContent: 'center'}}>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <Icon name={'landscape'} size={35} color='rgb(102,102,102)'/>
                    <Text style={styles.loadDets}>{NumberFormatting.asMoney(load.tonsEntered, '.', 2, ',', '')} {translate('tons')}</Text>
                  </View>
                </View>
                {load.rateType === "Hour" &&
                <View style={{justifyContent: 'center'}}>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <Icon name={'schedule'} size={35} color='rgb(102,102,102)'/>
                    <Text style={styles.loadDets}>{TFormat.asHoursAndMinutes(load.hoursEntered)}</Text>
                  </View>
                </View>
                }
              </View>
            </View>
            <View style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 20
            }}>
              {
                images.map((load, index) => {
                  return this.renderTicketImages(load, index);
                })
              }
            </View>
          </View>
        </ScrollView>
      </ThemeProvider>
    );


  }
}

// const layerStyles = MapboxGL.StyleSheet.create({
//   origin: {
//     circleRadius: 5,
//     circleColor: 'white',
//   },
//   destination: {
//     circleRadius: 5,
//     circleColor: 'white',
//   },
//   route: {
//     lineColor: 'white',
//     lineWidth: 3,
//     lineOpacity: 0.84,
//   },
//   progress: {
//     lineColor: '#314ccd',
//     lineWidth: 3,
//   },
// });

const styles = StyleSheet.create({
  backgroundContainer: {flex: 1, paddingBottom: 17, backgroundColor: 'rgb(230,230,225)'},

  primaryText: {
    fontSize: 18,
    color: 'rgb(38,38,38)',
    paddingLeft: 15,
    paddingTop: 8
  },

  loadDets: {
    fontSize: 18,
    color: 'rgb(38,38,38)',
    paddingLeft: 8,
    paddingTop: 8
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
    paddingTop: 8
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
    paddingBottom: 10
  },

  container: {
    backgroundColor: 'rgb(255,255,255)',
    marginBottom: 3,
    padding: 10
  },

  containerShadow: {
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

  sectionTitle: {color: 'rgb(89,89,89)', padding: 10, paddingTop: 20, paddingLeft: 20},
});

TicketDetailsPage.propTypes = {
  screenProps: PropTypes.object
};

export default TicketDetailsPage;
