import React, {Component} from 'react';
// import {Link} from 'react-router-native';
import {View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList, ScrollView, Alert} from 'react-native';
// import {Button} from 'react-native-elements';
import {SwipeListView} from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/FontAwesome';
// import Amplify from 'aws-amplify-react-native';
// import {Auth} from 'aws-amplify';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
// import AgentService from '../api/AgentService';
import JobItem from './JobItem';
import JobService from '../api/JobService';
// import JobMaterialsService from '../api/JobMaterialsService';
// import AddressService from '../api/AddressService';
import ProfileService from '../api/ProfileService';
import BidService from '../api/BidService';
import BookingService from '../api/BookingService';
import BookingEquipmentService from '../api/BookingEquipmentService';
import EquipmentService from '../api/EquipmentService';
import UserService from '../api/UserService';
import ShiftService from '../api/ShiftService';
import LoadService from '../api/LoadService';
import {translate} from '../i18n';
import {Button, ThemeProvider} from "react-native-elements";
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import CompanyService from "../api/CompanyService";
import CoiAttachmentService from "../api/CoiAttachmentService";
import {Auth} from "aws-amplify";
import ConfigProperties from "../ConfigProperties";
import NavigationService from '../service/NavigationService';
import EquipmentDetailService from '../api/EquipmentDetailService';
import JobDashboardService from "../api/JobDashboardService";

class JobListPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      topMenu: 'activeNav',
      statusFilter: 'Today',
      startTimeSort: 'Asc',
      jobs: [],
      myJobs: [],
      jobsForToday: [],
      jobsBooked: [],
      jobsInProgress: [],
      jobsCompleted: [],
      jobOffers: [],
      marketOffers: [],
      marketPlace: [],
      profile: null,
      actionLoader: false,
      driversShift: null,
      activeJob: null,
      mostRecentDriver: {},
      isUpdating: true
    };

    // this.onPressJob = this.onPressJob.bind(this);
    this.renderJob = this.renderJob.bind(this);
    this.compareJobsByStartTime = this.compareJobsByStartTime.bind(this);
    this.handleUpdateJobs = this.handleUpdateJobs.bind(this);
    // this.logOut = this.logOut.bind(this);
    this.promptDefaultDriverAlert = this.promptDefaultDriverAlert.bind(this);
  }

  async componentDidMount() {
    const { navigation, screenProps } = this.props;
    try {      
      let {
        jobs,
        myJobs,
        jobsForToday,
        jobsBooked,
        jobsInProgress,
        jobsCompleted,
        jobOffers,
        marketOffers,
        driversShift,
        mostRecentDriver
      } = this.state;
  
      const filters = {
        equipmentType: [],
        materialType: [],
        materials: "Any",
        minCapacity: "",
        minHours: "",
        minTons: "",
        numEquipments: "",
        page: 0,
        range: null,
        rate: "",
        rateType: "Any",
        rows: 999,
        searchType: "Carrier Job",
        sortBy: "Hourly ascending"
      };
  
      const profile = await ProfileService.getProfile();
  
      let response = null;
      try {
        response = await JobDashboardService.getJobsDashboardMobile(filters);
      } catch (err) {
        console.log(err);
      }
  
      let activeJob = null;
  
      if (response.paginatedJobs) {
        jobs = response.paginatedJobs.data;
        myJobs = response.paginatedMyJobs.data;
        jobsBooked = response.paginatedBookedJobs.data;
        jobsInProgress = response.paginatedJobsInProgress.data;
        jobsForToday = response.paginatedJobsForToday.data;
        jobsCompleted = response.paginatedCompletedJobs.data;
        jobOffers = response.paginatedMarketOffers.data;
        mostRecentDriver = response.mostRecentDriver;
        activeJob = response.activeJob;
        driversShift = response.driverShift;
      }
  
      this.setState({
        filters,
        profile,
        isLoading: false,
        isUpdating: false,
        jobs,
        jobsForToday,
        jobsBooked,
        jobsInProgress,
        jobsCompleted,
        jobOffers,
        myJobs,
        marketOffers,
        driversShift,
        activeJob,
        mostRecentDriver
      });
      screenProps.setReloadJobs(false);
    } catch (err) {
      console.error(err);
    }
    this.focusListener = navigation.addListener('didFocus', () => {
      this.handleUpdateJobs();
      screenProps.setReloadMarketplace(false);
    });
  }

  componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
    const {screenProps} = this.props;
    if (nextProps.screenProps.reloadJobs) {
      this.handleUpdateJobs();
      nextProps.screenProps.setReloadJobs(false);
    }
  }

  checkPromptDefaultDriver(user, mostRecentDriver) {
    if (user.defaultDriverPrompt) {
      this.promptDefaultDriverAlert(user, mostRecentDriver);
    }
  }

  promptDefaultDriverAlert(user, mostRecentDriver) {
    Alert.alert(
      translate('Default Driver'),
      `${translate('A Driver')} ${mostRecentDriver.firstName} ${mostRecentDriver.lastName} `
      + `${translate('DEFAULT_DRIVER_PROMPT')}`,
      [
        {
          text: translate('Ask me later'),
          onPress: () => {} // No need to do anything here, they'll get prompted the next time they log in.
        },
        {
          text: translate('Skip'),
          onPress: () => {
            user.defaultDriverPrompt = false;
            UserService.updateUser(user).then(() => {}).catch(err => { console.log(err)});
          }
        },
        {
          text: translate('Yes'),
          onPress: () => {
            user.defaultDriverPrompt = false;
            UserService.updateUser(user).then(() => {}).catch(err => { console.log(err)});
            this.props.navigation.dispatch(
              {
                type: 'Navigation/NAVIGATE',
                routeName: 'Drawer',
                action: {
                  type: 'Navigation/NAVIGATE',
                  routeName: 'TruckList',
                }
              }
            );
          }
        }
      ],
      {cancelable: false},
    );
  }

  async handleUpdateJobs() {
    this.setState({ isUpdating: true });
    let {
      jobs,
      startTimeSort,
      myJobs,
      jobsForToday,
      jobsBooked,
      jobsInProgress,
      jobsCompleted,
      jobOffers,
      marketOffers,
      driversShift,
      profile,
      mostRecentDriver
    } = this.state;
    try {
      const {screenProps} = this.props;

      let {filters} = this.state;

      let response = null;
      try {
        response = await JobDashboardService.getJobsDashboardMobile(filters);
      } catch (err) {
        console.log(err);
      }

      let activeJob = null;

      if (response.paginatedJobs) {
        jobs = response.paginatedJobs.data;
        myJobs = response.paginatedMyJobs.data;
        jobsBooked = response.paginatedBookedJobs.data;
        jobsInProgress = response.paginatedJobsInProgress.data;
        jobsForToday = response.paginatedJobsForToday.data;
        jobsCompleted = response.paginatedCompletedJobs.data;
        jobOffers = response.paginatedMarketOffers.data;
        mostRecentDriver = response.mostRecentDriver;
        activeJob = response.activeJob;
        driversShift = response.driverShift;
        // Preserve sorting
        if (startTimeSort === 'Desc') {
          jobsForToday = jobsForToday.sort(this.compareJobsByStartTime).reverse();
          jobsBooked = jobsBooked.sort(this.compareJobsByStartTime).reverse();
          jobsInProgress = jobsInProgress.sort(this.compareJobsByStartTime).reverse();
          jobsCompleted = jobsCompleted.sort(this.compareJobsByStartTime).reverse();
          jobOffers = jobOffers.sort(this.compareJobsByStartTime).reverse();
          marketOffers = marketOffers.sort(this.compareJobsByStartTime).reverse();
        } else {
          jobsForToday = jobsForToday.sort(this.compareJobsByStartTime);
          jobsBooked = jobsBooked.sort(this.compareJobsByStartTime);
          jobsInProgress = jobsInProgress.sort(this.compareJobsByStartTime);
          jobsCompleted = jobsCompleted.sort(this.compareJobsByStartTime);
          jobOffers = jobOffers.sort(this.compareJobsByStartTime);
          marketOffers = marketOffers.sort(this.compareJobsByStartTime);
        }
      }

      this.setState({
        jobs,
        jobsForToday,
        jobsBooked,
        jobsInProgress,
        jobsCompleted,
        jobOffers,
        myJobs,
        marketOffers,
        activeJob,
        driversShift,
        mostRecentDriver,
        isUpdating: false
      });
      screenProps.setReloadJobs(false);
    } catch (err) {
      console.error(err);
    }
  }

  onStatusFilterChange(statusFilter) {
    const {screenProps} = this.props;
    this.setState({statusFilter}, function fetchJobs() {
      this.handleUpdateJobs();
      screenProps.setReloadJobs(false);
    });
  }

  onToggleStartTimeSort() {
    let {startTimeSort, jobsForToday, jobsBooked, jobsInProgress, jobsCompleted, jobOffers, marketOffers, topMenu} = this.state;
    if (startTimeSort === 'Asc') {
      startTimeSort = 'Desc';
      jobsForToday = jobsForToday.sort(this.compareJobsByStartTime).reverse();
      jobsBooked = jobsBooked.sort(this.compareJobsByStartTime).reverse();
      jobsInProgress = jobsInProgress.sort(this.compareJobsByStartTime).reverse();
      jobsCompleted = jobsCompleted.sort(this.compareJobsByStartTime).reverse();
      jobOffers = jobOffers.sort(this.compareJobsByStartTime).reverse();
      marketOffers = marketOffers.sort(this.compareJobsByStartTime).reverse();
    } else {
      startTimeSort = 'Asc';
      jobsForToday = jobsForToday.sort(this.compareJobsByStartTime);
      jobsBooked = jobsBooked.sort(this.compareJobsByStartTime);
      jobsInProgress = jobsInProgress.sort(this.compareJobsByStartTime);
      jobsCompleted = jobsCompleted.sort(this.compareJobsByStartTime);
      jobOffers = jobOffers.sort(this.compareJobsByStartTime);
      marketOffers = marketOffers.sort(this.compareJobsByStartTime);
    }
    this.setState({startTimeSort, jobsForToday, jobsBooked, jobsInProgress, jobsCompleted, jobOffers, marketOffers, topMenu});
  }

  // handling driver's start/end shifts
  async handleShifts(action) {
    const {toggleGeoLocation, checkGeoLocation} = this.props.screenProps;
    const {driversShift, activeJob, profile} = this.state;
    if (action === 'Start') {
      // console.log('starting shift...');
      const newShift = {
        driverId: profile.driverId,
        status: 'Started',
        start: moment.utc().format(),
        createdBy: profile.userId,
        createdOn: moment.utc().format(),
        modifiedBy: profile.userId,
        modifiedOn: moment.utc().format()
      };
      try {
        await checkGeoLocation(true);
        const {locationPermitted} = this.props.screenProps;

        // if (locationPermitted) {
        const response = await ShiftService.createShift(newShift);

        if (activeJob && activeJob.id) { // there's a load in progress
          const activeLoad = await LoadService.getLatestLoadByDriverId(profile.driverId);
          await toggleGeoLocation(true, response.id, activeLoad.id);
          // console.log('load in progress, track by shift and load');
        } else {
          await toggleGeoLocation(true, response.id); // no load in progress

          // console.log('no load in progress, track only by shift');
        }
        this.setState({driversShift: response, actionLoader: false});
        /* } else {
          await checkGeoLocation(false);
        } */
      } catch (err) {
        // console.log(err);
      }
    } else if (action === 'End') {
      // console.log('ending shift...');
      const updatedShift = CloneDeep(driversShift);
      updatedShift.status = 'Ended';
      updatedShift.end = moment.utc().format();
      updatedShift.modifiedBy = profile.userId;
      updatedShift.modifiedOn = moment.utc().format();
      try {
        await ShiftService.updateShift(updatedShift);
        toggleGeoLocation(false);
        this.setState({driversShift: [], actionLoader: false});
      } catch (err) {
        // console.log(err);
      }
    } else {
      return;
    }
  }

  getJobsByStatus() {
    const {statusFilter, jobsForToday, jobsBooked, jobsInProgress, jobsCompleted, jobOffers, marketOffers} = this.state;
    if (statusFilter === 'Today') {
      return jobsForToday;
    }
    if (statusFilter === 'Booked') {
      return jobsBooked;
    }
    if (statusFilter === 'In Progress') {
      return jobsInProgress;
    }
    if (statusFilter === 'Job Completed') {
      return jobsCompleted;
    }
    if (statusFilter === 'On Offer') {
      return jobOffers;
    }
    if (statusFilter === 'Published And Offered') {
      return marketOffers;
    }
  }

  getZeroJobsText() {
    const {statusFilter} = this.state;
    if (statusFilter === 'Today') {
      return translate('You have no jobs scheduled today');
    }
    if (statusFilter === 'Booked') {
      return translate('You have no booked jobs');
    }
    if (statusFilter === 'In Progress') {
      return translate('You have no in progress jobs');
    }
    if (statusFilter === 'Job Completed') {
      return translate('You have not yet completed your first job');
    }
    if (statusFilter === 'On Offer') {
      return translate('You have no job invites');
    }
  }

  compareJobsByStartTime(a, b) {
    const {startTimeSort} = this.state;
    const startTimeA = a.startTime;
    const startTimeB = b.startTime;
    if (startTimeSort === 'Desc') {
      const startTimeA = b.startTime;
      const startTimeB = a.startTime;
    }
    let comparison = 0;
    if (startTimeA > startTimeB) {
      comparison = 1;
    } else if (startTimeA < startTimeB) {
      comparison = -1;
    }
    return comparison;
  }

  // async logOut() {
  //   try {
  //     // NOTE: have to pass props to change auth state like this
  //     // ref https://github.com/aws-amplify/amplify-js/issues/1529
  //     debugger;
  //     const {onStateChange} = this.props.screenProps;
  //     // debugger;
  //     // {global: true} NOTE we might need this
  //     await Auth.signOut();
  //     onStateChange('signedOut', null);
  //   } catch (err) {
  //     // POST https://cognito-idp.us-east-1.amazonaws.com/ 400
  //     // Uncaught (in promise) {code: "NotAuthorizedException",
  //     // name: "NotAuthorizedException", message: "Access Token has been revoked"}
  //     onStateChange('signedOut', null);
  //   }
  // }

  isFilterActive(status) {
    const {statusFilter} = this.state;
    if (statusFilter === status) {
      return true;
    }
    return false;
  }

  closeRow(rowMap, rowKey) {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  }

  deleteRow(rowMap, rowKey) {
    const {jobOffers} = this.state;
    this.closeRow(rowMap, rowKey);
    const newData = [...jobOffers];
    const prevIndex = jobOffers.findIndex(item => item.key === rowKey);
    newData.splice(prevIndex, 1);
    this.setState({jobOffers: newData});
  }

  // remove non numeric
  phoneToNumberFormat(phone) {
    const num = Number(phone.replace(/\D/g, ''));
    return num;
  }

  // check format ok
  checkPhoneFormat(phone) {
    const phoneNotParents = String(this.phoneToNumberFormat(phone));
    const areaCode3 = phoneNotParents.substring(0, 3);
    const areaCode4 = phoneNotParents.substring(0, 4);
    if (areaCode3.includes('555') || areaCode4.includes('1555')) {
      return false;
    }
    return true;
  }

  renderJob({item}) {
    const {profile, activeJob} = {...this.state};
    const job = item;
    return (
      <JobItem job={job} activeJob={activeJob} profile={profile}/>
    );
  }

  renderMarketPlaceLink() {
    return (
      <React.Fragment>
        <View style={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 10
        }}>
          <Text style={styles.noJobText}>{translate("Find More Work at the TRELAR")}</Text>
        </View>
        <View style={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Button
            title={translate('MARKETPLACE')}
            type='outline'
            onPress={() => {
              this.props.navigation.dispatch(
                {
                  type: 'Navigation/NAVIGATE',
                  routeName: 'Drawer',
                  action: {
                    type: 'Navigation/NAVIGATE',
                    routeName: 'Marketplace',
                  }
                }
              );
            }}
            buttonStyle={{
              backgroundColor: 'white',
              borderTopWidth: 0,
              borderLeftWidth: 0,
              borderRightWidth: 0,
              borderBottomWidth: 1,
              borderRadius: 2,
              borderColor: 'rgb(183,182,179)',
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 1},
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 1,
              marginBottom: 5
            }}
            icon={
              <Icon
                name="arrow-right"
                size={15}
                color='rgb(0, 111, 83)'
                style={{paddingRight: 6}}
              />
            }
          />
        </View>
      </React.Fragment>
    );
  }

  render() {

    const theme = {
      colors: {
        primary: 'rgb(0, 111, 83)'
      },
      Text: {
        style: {
          fontFamily: 'Interstate-Regular',
          color: 'rgb(102, 102, 102)'
        }
      },
      Button: {
        titleStyle: {
          fontFamily: 'Interstate-Regular'
        },
        buttonStyle: {
          borderColor: 'white',
          borderWidth: 2
        },
        placeholderStyle: {
          fontFamily: 'Interstate-Regular',
        }
      },
      Input: {
        inputStyle: {
          fontFamily: 'Interstate-Regular',
        },
        inputContainerStyle: {
          borderBottomWidth: 0
        },
        containerStyle: {
          backgroundColor: 'white',
          borderColor: 'rgb(203, 203, 203)',
          borderWidth: 2
        }
      },
      CheckBox: {
        fontFamily: 'Interstate-Regular',
        containerStyle: {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
        uncheckedColor: 'rgb(0, 111, 83)'
      }
    };

    const {
      isLoading,
      jobs,
      myJobs,
      startTimeSort,
      jobsForToday,
      jobsBooked,
      jobsInProgress,
      jobsCompleted,
      jobOffers,
      marketOffers,
      topMenu,
      statusFilter,
      driversShift,
      activeJob,
      profile,
      actionLoader,
      isUpdating
    } = this.state;
    const cogIcon = <Icon name={'cog'} light/>;
    if (isLoading) {
      return (
        <View style={{flex: 1, padding: 20, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
          <ActivityIndicator size="large"/>
        </View>
      );
    }

    const jobData = this.getJobsByStatus();
    return (
      <ThemeProvider theme={theme}>
        <View style={styles.container}>
          <View style={styles.rowTitle}>
            <Text
              style={{
                fontSize: 16
              }}
            >
              {translate('Job Dashboard')}
            </Text>
            {(driversShift && driversShift.id) /*&& (activeJob && !activeJob.id)*/ && (
              <TouchableOpacity
                disabled={actionLoader}
                style={[styles.button, styles.actionOutlinedButton]}
                onPress={() => {
                  this.setState({actionLoader: true});
                  this.handleShifts('End');
                }}
              >
                <IconMaterial
                  name="timer-off"
                  size={20}
                  color="#006F53"
                />
                <Text style={styles.buttonDarkText}>&nbsp;{translate('END SHIFT')}</Text>
                {
                  actionLoader && (<ActivityIndicator color="#006F53"/>)
                }
              </TouchableOpacity>
            )}
            {(driversShift && !driversShift.id) && (
              <TouchableOpacity
                disabled={actionLoader}
                style={[styles.button, styles.actionButton]}
                onPress={() => {
                  this.setState({actionLoader: true});
                  this.handleShifts('Start');
                }}
              >
                <IconMaterial
                  name="timer"
                  size={20}
                  color="#FFF"
                />
                <Text style={styles.buttonLightText}>&nbsp;{translate('START SHIFT')}</Text>
                {
                  actionLoader && (<ActivityIndicator color="#FFF"/>)
                }
              </TouchableOpacity>
            )}
            {/* (driversShift && driversShift.id) && activeJob.id && activeJob.id > 0 && (
              <TouchableOpacity
                disabled
                style={[styles.button, styles.actionDisabledButton]}
              >
                <IconMaterial
                  name="timer-off"
                  size={20}
                  color="#CCC"
                />
                <Text style={styles.buttonDisabledText}>&nbsp;END SHIFT</Text>
              </TouchableOpacity>
            ) */}
          </View>
          {
            /*
              <Text style={styles.dateHeader}>{moment().format('dddd, MMMM Do')}</Text>
            */
          }
          <View style={styles.topNav}>
            {
              /*
              <TouchableOpacity style={statusFilter === 'Booked' ? styles.activeNav : styles.otherNav}
                              onPress={() => this.onStatusFilterChange('Booked')}>
              <Text>{translate('My Jobs')} {myJobs.length}</Text>
            </TouchableOpacity>
              */
            }
          </View>
          <View
            style={styles.filtersView}
            // visibility={((statusFilter === 'On Offer') || (statusFilter === 'Published And Offered')) ? 'hidden' : 'visible'}
          >
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              ref={(node) => this.scroll = node}
              style={{backgroundColor: 'white'}}
            >
              <TouchableOpacity
                onPress={() => {
                  this.onStatusFilterChange('Today');
                  this.scroll.scrollTo({x: 0, animated: true});
                }}>
                <Text style={[styles.filterItem, this.isFilterActive('Today') ? styles.active : {}]}>
                  {translate('Today').toUpperCase()} ({jobsForToday.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.onStatusFilterChange('Booked');
                  this.scroll.scrollTo({x: 60, animated: true});
                }}>
                <Text style={[styles.filterItem, this.isFilterActive('Booked') ? styles.active : {}]}>
                  {translate('Booked').toUpperCase()} ({jobsBooked.length})
                </Text>
              </TouchableOpacity>
              {
                profile.isAdmin && (
                  <TouchableOpacity
                    onPress={() => {
                      this.onStatusFilterChange('On Offer');
                      this.scroll.scrollTo({x: 210, animated: true})
                    }}>
                    <Text style={[styles.filterItem, this.isFilterActive('On Offer') ? styles.active : {}]}>
                      {translate('Invited').toUpperCase()} ({jobOffers.length})</Text>
                  </TouchableOpacity>
                )
              }
              <TouchableOpacity
                onPress={() => {
                  this.onStatusFilterChange('In Progress');
                  this.scroll.scrollTo({x: 540, animated: true});
                }}>
                <Text style={[styles.filterItem, this.isFilterActive('In Progress') ? styles.active : {}]}>
                  {translate('In Progress').toUpperCase()} ({jobsInProgress.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.onStatusFilterChange('Job Completed');
                  this.scroll.scrollTo({x: 1020, animated: true})
                }}>
                {/*<View style={{flex: 1}}>*/}
                <Text style={[styles.filterItem, this.isFilterActive('Job Completed') ? styles.active : {}]}>
                  {translate('Completed').toUpperCase()} ({jobsCompleted.length})
                </Text>
                {/*</View>*/}
              </TouchableOpacity>
              {profile.isAdmin // show New Offers and Marketplace only to admins
              && (
                <React.Fragment>
                  {/*<TouchableOpacity style={{flex: 1}}*/}
                  {/*                  onPress={() => this.onStatusFilterChange('Published And Offered')}>*/}
                  {/*  <Text style={[styles.filterItem, this.isFilterActive('Published And Offered') ? styles.active : {}]}>MARKETPLACE ({marketOffers.length})</Text>*/}
                  {/*</TouchableOpacity>*/}
                </React.Fragment>
              )}
            </ScrollView>
          </View>
          {/*<Text style={styles.searchBar}> Search by key word </Text>*/}

          <TouchableOpacity
            onPress={() => this.onToggleStartTimeSort()}
          >
            <View style={styles.sortBar}>
              <Text style={styles.sortText}>
                {translate('Sort by')}:
              </Text>
              <View style={{paddingLeft: 7}}>
                {startTimeSort === 'Asc' &&
                <Text style={{fontWeight: 'bold', fontFamily: 'Interstate'}}>
                  {translate('Start Date')} ({translate('Older')})
                </Text>
                }
                {startTimeSort === 'Desc' &&
                <Text style={{fontWeight: 'bold', fontFamily: 'Interstate',}}>
                  {translate('Start Date')} ({translate('Recent')})
                </Text>}
              </View>
              {
                /*
                <View style={{paddingLeft: 7, paddingTop: 2, marginLeft: 'auto'}}>
                  {startTimeSort === 'Asc' && <Icon name="chevron-up" size={12} color="#666666"/>}
                  {startTimeSort === 'Desc' && <Icon name="chevron-down" size={12} color="#666666"/>}
                </View>
                */
              }
              <View style={{paddingLeft: 7, paddingTop: 2, marginLeft: 'auto'}}>
                <Icon name="sort" size={12} color="#666666"/>
              </View>
            </View>
          </TouchableOpacity>

          {(jobData && jobData.length > 0 || isUpdating) &&
          <FlatList
            renderItem={this.renderJob}
            data={jobData}
            extraData={startTimeSort}
            keyExtractor={item => `list-item-${item.id}`}
            onRefresh={this.handleUpdateJobs}
            refreshing={isUpdating}
            // style={styles.jobList}
          />
          }

          {jobData && jobData.length === 0 && !isUpdating &&
          <View style={{
            flex: 1,
            flexDirection: 'column',
            top: 0,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <View style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 50
            }}>
              <Text style={styles.noJobText}>{this.getZeroJobsText()}</Text>
              <TouchableOpacity
                disabled={isLoading}
                style={[styles.button, styles.actionButton, {height: 45, marginTop: 10}]}
                onPress={() => this.handleUpdateJobs()}
              >
                <Text style={{color: '#FFF'}}>&nbsp;{translate('REFRESH')}&nbsp;</Text>
                {
                  isLoading && (<ActivityIndicator color="#FFF"/>)
                }
              </TouchableOpacity>
            </View>
            {profile.isAdmin && this.renderMarketPlaceLink()}
          </View>
          }
        </View>
      </ThemeProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7E7E2',
    width: '100%'
  },
  rowTitle: {
    flexDirection: 'row',
    marginTop: 16,
    paddingRight: 12,
    paddingLeft: 12,
    paddingBottom: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  active: {
    width: 160,
    height: 40,
    color: 'rgb(0, 111, 83)',
    borderBottomColor: 'rgb(0, 111, 83)',
    borderBottomWidth: 2,
    textAlign: 'center',
    fontFamily: 'Interstate',
  },

  noJobText: {
    color: 'rgb(152, 152, 152)',
    fontFamily: 'Interstate',
    fontSize: 18
  },

  filtersView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    color: 'rgb(0, 111, 83)',
    borderBottomColor: '#DBDBD6',
    borderBottomWidth: 1
  },

  button: {
    height: 32,
    paddingLeft: 8,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgb(183,182,179)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 5,
  },
  actionButton: {
    backgroundColor: '#006F53',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF'
  },

  filterItem1: {
    padding: 14,
    borderWidth: 1,
    borderColor: 'white',
    flex: 1,
    color: 'gray',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14
  },

  filterItem: {
    width: 160,
    height: 40,
    padding: 10,
    paddingLeft: 16,
    paddingRight: 16,
    borderWidth: 1,
    borderColor: 'white',
    color: 'gray',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontFamily: 'Interstate',
    textAlign: 'center'
  },

  activeNav: {
    fontSize: 24,
    fontWeight: '700',
    color: 'red',
    backgroundColor: 'rgb(0, 111, 83)', // top tabs
    padding: 10,
    width: '33%',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 5
  },

  otherNav: {
    fontSize: 24,
    fontWeight: '700',
    color: 'gray',
    backgroundColor: 'silver',
    padding: 10,
    width: '33%',
    textAlign: 'center'
  },

  topNav: {
    // flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch'
  },

  dateHeader: {
    // flex: 1,
    // paddingVertical: 36,
    padding: 7,
    color: 'gray',
    // backgroundColor: 'rgb(102,151,164)'
    backgroundColor: 'silver'
    // fontSize: 16
  },

  pageTitle: {
    height: 32,
    fontSize: 24,
    textAlignVertical: 'center',
    backgroundColor: 'purple',
    color: '#ffffff'
  },

  sortBar: {
    flexDirection: 'row',
    fontSize: 16,
    // backgroundColor: '#7caab5',
    padding: 10,
    borderBottomColor: '#DBDBD6',
    borderBottomWidth: 1
  },

  sortText: {
    fontFamily: 'Interstate',
    color: '#666666'
  },

  jobList: {
    // flex: 1,
    backgroundColor: 'silver',
    margin: 10
  },

  backTextWhite: {
    color: '#FFF'
  },

  rowBack: {
    color: '#FFF',
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15
  },

  button: {
    height: 32,
    paddingLeft: 8,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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

  backLeftBtn: {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    height: 100,
    width: 75,
    backgroundColor: 'rgb(184,184,184)',
    borderRadius: 10,
    left: 0
  },

  backRightBtn: {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    height: 100,
    width: 75,
    backgroundColor: 'rgb(0, 111, 83)',
    borderRadius: 10,
    right: 0
  },

  actionButton: {
    backgroundColor: '#006F53',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF'
  },
  actionOutlinedButton: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#006F53'
  },
  actionDisabledButton: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#CCC'
  },
  buttonDarkText: {
    fontWeight: 'bold',
    color: '#006F53'
  },
  buttonLightText: {
    fontWeight: 'bold',
    color: '#FFF'
  },
  buttonDisabledText: {
    fontWeight: 'bold',
    color: '#CCC'
  }

});

export default JobListPage;
