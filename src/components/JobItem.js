import React, {Component} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList} from 'react-native';
// import {Link} from 'react-router-native';
import moment from 'moment';
import NavigationService from '../service/NavigationService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AddressService from "../api/AddressService";
import TFormat from "./common/TFormat";

class JobItem extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  async componentDidMount() {
    this.setState({
      loading: false
    });
  }


  equipmentMaterialsAsString(materials) {
    let materialsString = '';
    if (materials) {
      let index = 0;
      for (const material of materials) {
        if (index !== materials.length - 1) {
          materialsString += `${material}, `;
        } else {
          materialsString += material;
        }
        index += 1;
      }
    }
    return materialsString;
  }

  render() {
    const {loading} = this.state;

    if (loading) {
      return null;
    } else {
      const {job, activeJob, profile, isMarketplace} = this.props;
      const thisJobIsActive = (activeJob !== null && activeJob.id && activeJob.id === job.id) ? true: false;
      return (
        <View
          id={job.id}
          style={{
            marginBottom: 2
          }}
        >
          <View
            style={{
              flexDirection: 'column',
              backgroundColor: (thisJobIsActive ? 'rgb(0, 111, 83)' : '#FFF')
            }}>

            <TouchableOpacity onPress={() => {
              NavigationService.push('JobDetailsPage', {
                itemId: job.id,
                jobName: job.name
              })
            }
            }
            >
              <View
                style={{
                  flexDirection: 'row',
                  padding: 16,
                  alignItems: 'center'
                }}
              >
                <View style={{flex: 0.95}}>
                  <React.Fragment>
                    <Text
                      style={{fontWeight: "normal", fontFamily: 'Interstate', fontSize: 16, color: (thisJobIsActive ? '#FFF': 'rgb(0, 111, 83)')}}>
                      {job.name}
                    </Text>
                    <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start'}}>
                      <Text style={{fontWeight: '100', fontFamily: 'Interstate', fontSize: 14, color: (thisJobIsActive ? '#FFF':'#666666'), width: '50%'}}>
                        {TFormat.asDateListItem(job.startTime, profile.timeZone)}
                      </Text>
                      {isMarketplace && (
                        <Text style={{fontWeight: '100', fontFamily: 'Interstate', fontSize: 14, color: (thisJobIsActive ? '#FFF':'#666666'), width: '50%'}}>
                          {job.rate > 0 ? TFormat.asMoney(job.rate) : 0.00} / {job.rateType}
                        </Text>
                      )}
                    </View>
                    {isMarketplace ?
                      <React.Fragment>
                        <Text style={{fontWeight: '100', fontFamily: 'Interstate', fontSize: 14, color: (thisJobIsActive ? '#FFF':'#666666')}}>
                          {job.startAddressCity}, {job.startAddressState}
                        </Text>
                        <Text
                        style={{fontWeight: "normal", fontFamily: 'Interstate', fontSize: 14, color: (thisJobIsActive ? '#FFF':'#666666')}}>
                          Haul (One Way): {TFormat.asDistance(job.haulDistance)}
                        </Text>
                      </React.Fragment>
                    :
                      <Text style={{fontWeight: '100', fontFamily: 'Interstate', fontSize: 14, color: (thisJobIsActive ? '#FFF':'#666666')}}>
                        {job.startAddressFull}, {job.startAddressCity}, {job.startAddressState}, {job.startAddressZip}
                      </Text>
                    }
                  </React.Fragment>
                </View>
                <View style={{flex: 0.05}}>
                  <Icon
                    name="chevron-right"
                    size={24}
                    color={thisJobIsActive ? '#FFF':'rgb(0, 111, 83)'}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
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

  container: {
    // flex: 1,
    borderWidth: 0,
    borderRadius: 3,
    padding: 8,
    marginBottom: 13,
    backgroundColor: '#ffffff',
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

  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch'
  },

  leftDetail: {
    paddingLeft: 5,
    width: '90%',
    paddingRight: 10
    // backgroundColor: 'red'
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

export default JobItem;
