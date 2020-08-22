import React, {Component} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList} from 'react-native';
import {translate} from '../i18n';
// import {Link} from 'react-router-native';
import moment from 'moment';
import NavigationService from '../service/NavigationService';
import Icon from 'react-native-vector-icons/FontAwesome';
import TFormat from "./common/TFormat";
import NumberFormatting from '../utils/NumberFormatting';
import UserService from "../api/UserService";

class LoadItem extends Component {

  constructor(props) {
    super(props);
    this.state = {
      driver: null
    }
  }

  async componentDidMount() {
    const { load } = this.props;
    let driver = null;
    try {
      driver = await UserService.getDriverByBookingEquipmentId(load.bookingEquipmentId);
    } catch (e) {
      // console.log(e);
    }    
    this.setState({
      driver
    })
  }

  render() {
    const {jobName, load, index, profile} = this.props;
    const driver = this.state;    
    const loadDriver = driver.driver;
    const startTime = (!load.startTime ? null : TFormat.asTime(load.startTime, profile.timeZone));
    const endTime = (!load.endTime ? null : TFormat.asTime(load.endTime, profile.timeZone));

    return (
      <React.Fragment>
        <View style={styles.container} id={load.id}>
          {/* disabled={!endTime} */}
          <TouchableOpacity onPress={() => {
            NavigationService.push('LoadDetailsPage', {
              load,
              index,
              jobName: jobName
            })
          }}>
            <View style={styles.sectionInfo}>
              <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{flex: 1, flexDirection: 'column'}}>
                  <Text style={styles.primaryText}>
                    {translate("Load")} #{index} { loadDriver ? `- ${loadDriver.firstName} ${loadDriver.lastName}` : ''}
                  </Text>
                  <Text style={styles.tertiaryText}>
                    @ {(!startTime ? 'Error creating load' : startTime)} - {(!endTime ? 'In Progress' : endTime)}
                  </Text>
                  {endTime &&
                  <View>
                    {load.rateType === "Ton" &&
                    <Text style={styles.secondaryText}>{NumberFormatting.asMoney(load.tonsEntered, '.', 2, ',', '')} {translate("tons")}</Text>
                    }
                    {load.rateType === "Hour" &&
                    <Text style={styles.secondaryText}>{NumberFormatting.asMoney(load.tonsEntered, '.', 2, ',', '')} {translate("tons")}
                      - {TFormat.asHoursAndMinutes(load.hoursEntered)}</Text>
                    }

                    <Text style={styles.tertiaryText}>
                      ticket# {load.ticketNumber}
                    </Text>
                  </View>
                  }
                </View>
                { /* endTime && */
                <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end'}}>
                  <Icon name="chevron-right" size={12} color='rgb(0, 111, 83)'/>
                </View>
                }
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({

  activeJobContainer: {
    // flex: 1,
    borderWidth: 0,
    borderRadius: 2,
    padding: 8,
    marginBottom: 13,
    backgroundColor: 'rgb(127,170,181)',
  },

  primaryText: {
    fontSize: 16,
    color: 'rgb(0, 111, 83)'
  },

  secondaryText: {
    fontSize: 16,
    color: 'rgb(54,54,54)'
  },

  tertiaryText: {
    fontSize: 14,
    color: 'rgb(155,155,155)'
  },

  container: {
    // flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    paddingTop: 8,
    paddingBottom: 8,
    marginBottom: 3,
    backgroundColor: 'rgb(255,255,255)',
  },

  jobSummary: {
    paddingTop: 5,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch'
  },

  startTime: {
    paddingTop: 7,
    borderBottomWidth: 3,
    borderBottomColor: 'rgb(207,227,232)'
  },

  sectionInfo: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch'
  },


  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch'
  },

  rightDetail: {
    paddingLeft: 10,
    paddingRight: 10,
    width: '10%'
  },

  estimatedTons: {
    textAlign: 'center',
    fontWeight: '600',
    position: 'relative',
    paddingTop: 30
  }

});

export default LoadItem;
