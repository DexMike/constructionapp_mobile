import React, {Component} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import JobItem from './JobItem';
import JobService from '../api/JobService';
import ProfileService from '../api/ProfileService';
import BidService from '../api/BidService';
import {translate} from '../i18n';
import {Button} from "react-native-elements";

class MarketplacePage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      topMenu: 'activeNav',
      statusFilter: 'Posted',
      startTimeSort: 'Asc',
      jobsPosted: [],
      jobsRequested: [],
      profile: null,
      loading: false
    };

    this.renderJob = this.renderJob.bind(this);
    this.compareJobsByStartTime = this.compareJobsByStartTime.bind(this);
    this.handleUpdateJobs = this.handleUpdateJobs.bind(this);
  }

  async componentDidMount() {
    const { navigation, screenProps } = this.props;
    try {
      let {jobsPosted, jobsRequested} = this.state;
      const profile = await ProfileService.getProfile();
      // TODO: check first if there is a job in progress, otherwise Orion throws an exception
      // TODO: we are setting the range to 250 but this needs to come from the company settings
      const filters = {
        companyLatitude: 30.47,
        companyLongitude: -97.81,
        equipmentType: [],
        materialType: [],
        materials: "Any",
        minCapacity: "",
        minHours: "",
        minTons: "",
        numEquipments: "",
        page: 0,
        range: "250",
        rate: "",
        rateType: "Any",
        rows: 999,
        searchType: "Carrier Job",
        sortBy: "Hourly ascending",
        companyCarrierId: null,
        userId: profile.userId
      };

      const marketplaceJobs = await JobService.getMarketplaceRequestedAndPostedJobsByFilters(filters);

      if (marketplaceJobs) {
        jobsPosted = marketplaceJobs.postedJobs;
        jobsRequested = marketplaceJobs.requestedJobs;
      }
      this.setState({
        filters,
        isLoading: false,
        jobsPosted,
        jobsRequested,
        profile
      });
      screenProps.setReloadMarketplace(false);
    } catch
      (err) {
      console.error(err);
    }    
    this.focusListener = navigation.addListener('didFocus', () => {
      this.handleUpdateJobs();
      screenProps.setReloadMarketplace(false);
    });
  }

  componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
    const {screenProps} = this.props;
    if (nextProps.screenProps.reloadMarketplace) {
      this.handleUpdateJobs();
      nextProps.screenProps.setReloadMarketplace(false);
    }
  }

  async handleUpdateJobs() {
    this.setState({isLoading: true});
    let jobsPosted = [];
    let jobsRequested = [];
    try {
      const {screenProps} = this.props;
      const profile = await ProfileService.getProfile();
      let {filters} = this.state;
      const marketplaceJobs = await JobService.getMarketplaceRequestedAndPostedJobsByFilters(filters);
      if (marketplaceJobs) {
        jobsPosted = marketplaceJobs.postedJobs;
        jobsRequested = marketplaceJobs.requestedJobs;
      }

      this.setState({
        filters,
        isLoading: false,
        jobsPosted,
        jobsRequested,
        profile
      });
      screenProps.setReloadMarketplace(false);
    } catch
      (err) {
      console.error(err);
    }
  }

  getZeroJobsText() {
    const {statusFilter} = this.state;
    if (statusFilter === 'Posted') {
      return translate('There are no jobs currently available in your area');
    }
    if (statusFilter === 'Requested') {
      return translate('You do not have any pending job requests');
    }
  }

  onStatusFilterChange(statusFilter) {
    const {screenProps} = this.props;
    this.setState({statusFilter}, function fetchJobs() {
      this.handleUpdateJobs();
      screenProps.setReloadMarketplace(false);
    });
  }

  onToggleStartTimeSort() {
    let {startTimeSort, jobsRequested, jobsPosted} = this.state;
    if (startTimeSort === 'Asc') {
      startTimeSort = 'Desc';
      jobsRequested = jobsRequested.sort(this.compareJobsByStartTime).reverse();
      jobsPosted = jobsPosted.sort(this.compareJobsByStartTime).reverse();
    } else {
      startTimeSort = 'Asc';
      jobsRequested = jobsRequested.sort(this.compareJobsByStartTime);
      jobsPosted = jobsPosted.sort(this.compareJobsByStartTime);
    }
    this.setState({startTimeSort, jobsRequested, jobsPosted});
  }

  getJobsByStatus() {
    const {statusFilter, jobsPosted, jobsRequested} = this.state;
    if (statusFilter === 'Posted') {
      return jobsPosted;
    }
    if (statusFilter === 'Requested') {
      return jobsRequested;
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

  isFilterActive(status) {
    const {statusFilter} = this.state;
    return statusFilter === status;

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
    const {profile} = {...this.state};
    const job = item;
    return (
      <JobItem job={job} activeJob={null} profile={profile} isMarketplace/>
    );
  }

  render() {
    const {
      isLoading,
      jobsPosted,
      jobsRequested,
      startTimeSort,
      loading
    } = this.state;
    const jobData = this.getJobsByStatus();
    return (
      <View style={styles.container}>
        <View
          style={{
            padding: 16
          }}
        >
          <Text
            style={{
              fontSize: 16
            }}
          >
            {translate('Marketplace')}
          </Text>
        </View>
        <View
          style={styles.filtersView}
        >
          <View
            style={{flex: 1, flexDirection: 'row', backgroundColor: 'white', justifyContent: 'center'}}
          >
            <TouchableOpacity
              onPress={() => {
                this.onStatusFilterChange('Posted');
              }}>
              <Text style={[styles.filterItem, this.isFilterActive('Posted') ? styles.active : {}]}>
                {translate('Posted').toUpperCase()} ({!jobsPosted ? 0 : jobsPosted.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.onStatusFilterChange('Requested');
              }}>
              <Text style={[styles.filterItem, this.isFilterActive('Requested') ? styles.active : {}]}>
                {translate('Requested').toUpperCase()} ({!jobsPosted ? 0 : jobsRequested.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
            <View style={{paddingLeft: 7, paddingTop: 2, marginLeft: 'auto'}}>
              <Icon name="sort" size={12} color="#666666"/>
            </View>
          </View>
        </TouchableOpacity>

        {(jobData && jobData.length > 0 || isLoading) &&
        <FlatList
          renderItem={this.renderJob}
          data={jobData}
          extraData={startTimeSort}
          keyExtractor={item => `list-item-${item.id}`}
          onRefresh={this.handleUpdateJobs}
          refreshing={isLoading}
        />
        }

        {jobData && jobData.length === 0 && !isLoading &&
        <View style={{
          flex: 1,
          flexDirection: 'column',
          top: 200,
          alignItems: 'stretch',
        }}>
          <View style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 50,
            paddingLeft:16,
            paddingRight: 16
          }}>
            <Text style={styles.noJobText}>{this.getZeroJobsText()}</Text>
            <TouchableOpacity
              disabled={loading}
              style={[styles.button, styles.actionButton, {height: 45}]}
              onPress={() => this.handleUpdateJobs()}
            >
              <Text style={{color: '#FFF'}}>&nbsp;REFRESH&nbsp;</Text>
              {
                loading && (<ActivityIndicator color="#FFF"/>)
              }
            </TouchableOpacity>
          </View>
        </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7E7E2',
    width: '100%'
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

  noJobText: {
    color: 'rgb(152, 152, 152)',
    fontFamily: 'Interstate',
    fontSize: 18
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

  sectionTitle: {color: 'rgb(89,89,89)', padding: 2, fontSize: 16}

});

export default MarketplacePage;
