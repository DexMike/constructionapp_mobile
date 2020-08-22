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
  Alert, FlatList, TouchableOpacity, Picker
} from 'react-native';
import {
  Text,
  Button,
  Image,
  ThemeProvider,
  Overlay,
  ListItem,
  Input
} from 'react-native-elements';
import moment from 'moment';
import * as PropTypes from 'prop-types';
import MultiSelect from 'react-native-quick-select';
import JobService from '../../api/JobService';
import CompanyService from '../../api/CompanyService';
import JobMaterialsService from '../../api/JobMaterialsService';
import TMultiImageUploader from '../common/TMultiImageUploader';
import AddressService from '../../api/AddressService';
import TFormat from '../common/TFormat';
import NumberFormatting from '../../utils/NumberFormatting';
import BookingService from '../../api/BookingService';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import BookingInvoiceService from '../../api/BookingInvoiceService';
import BidService from '../../api/BidService';
import UserService from '../../api/UserService';
import EquipmentService from '../../api/EquipmentService';
import ConfigProperties from '../../ConfigProperties';
import LoadService from '../../api/LoadService';
import TPanel from '../materialTable/TPanel';
import NavigationService from '../../service/NavigationService';
import theme from '../../Theme';
import CloneDeep from 'lodash.clonedeep';
import GroupListService from '../../api/GroupListService';
import GeoCodingService from '../../api/GeoCodingService';
import ProfileService from '../../api/ProfileService';
import {translate} from '../../i18n';
// import MapView from 'react-native-heremaps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import JobItem from '../JobItem';
import LoadItem from '../LoadItem';
import TMap from '../common/TMap';
import ShiftService from '../../api/ShiftService';
import LookupsService from '../../api/LookupsService';
import GPSTrackingService from '../../api/GPSTrackingService';
import RatesDeliveryService from '../../api/RatesDeliveryService';
import CompanySettingsService from '../../api/CompanySettingsService';
import styles from './JobDetailsStyles';
import JobAllocate from './JobAllocate';
import JobDetailsService from "../../api/JobDetailsService";

// const mapCenter = '30.274983,-97.739604' // Austin city center
const configObject = ConfigProperties.instance.getEnv();

class JobDetailsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      job: {},
      equipments: [],
      bid: null,
      driverUser: null,
      booking: null,
      bookingEquipment: null,
      driversShift: null,
      bookingInvoices: [],
      company: {},
      materials: [],
      // equipment: null,
      isLoading: true,
      austinCoordinates: [
        -97.747958, 30.266144
      ],
      directions: {},
      mapLoaded: false,
      route: null,
      noLoads: false, // this flag is to check is no loads have been done yet
      loading: false, // this flag is to check whether user is currently in the middle of a load
      returning: false, // this flag is to check whether a driver is returning to the quarry to get a new load
      activeJob: true, // only true if no other jobs are in the middle of a load for this user
      allLoads: [],
      latestJobLoad: {},
      favoriteCompany: [],
      profile: {},
      allocateDriversModal: false,
      modalLiability: false,
      modalCancelRequest: false,
      drivers: [],
      selectedDrivers: [],
      savingSelectedDrivers: false,
      tonsDelivered: 0,
      hoursDelivered: 0,
      customerAdmin: [],
      companyCarrier: [],
      actionLoader: false,
      activeDrivers: [],
      allTtruckTypes: [],
      userIsAllocated: false,
      jobWithActiveLoad: null,
      visible: false,
      loadNoByDriver: 0,
      trelarFees: 0,
      latestUserLoad: null,
      modalCarrierCancel: false,
      cancelReason: '',
      approveCancelReason: '',
      showOtherReasonInput: false,
      showLateCancelNotice: false,
      carrierCancelReasons: [],
      cancelError: '',
      producerBillingType: ''
    };

    this.baseClient = null;

    // this.handleNewClick = this.handleNewClick.bind(this);
    this.handleJobClick = this.handleJobClick.bind(this);
    this.handleCompleteClick = this.handleCompleteClick.bind(this);
    this.handleDeclineClick = this.handleDeclineClick.bind(this);
    this.handleStartLoad = this.handleStartLoad.bind(this);
    this.handleEndLoad = this.handleEndLoad.bind(this);
    this.handleUpdateLoads = this.handleUpdateLoads.bind(this);
    this.handleEndAddressRoute = this.handleEndAddressRoute.bind(this);
    this.handleStartAddressRoute = this.handleStartAddressRoute.bind(this);
    this.onStartJobPress = this.onStartJobPress.bind(this);
    this.showMaterialsAlert = this.showMaterialsAlert.bind(this);
    this.handleCall = this.handleCall.bind(this);
    this.toggleLiabilityModal = this.toggleLiabilityModal.bind(this);
    this.toggleCarrierCancelModal = this.toggleCarrierCancelModal.bind(this);
    this.toggleCancelRequest = this.toggleCancelRequest.bind(this);
    this.handleGoToJobWithActiveLoad = this.handleGoToJobWithActiveLoad.bind(this);
    this.handleCarrierCancelJob = this.handleCarrierCancelJob.bind(this);
    this.handleFinishReturningLoad = this.handleFinishReturningLoad.bind(this);
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('jobName', ''),
    };
  };

  async componentDidMount() {
    const {params} = NavigationService.getCurrentRoute();
    // const params = { itemId: 162 };
    const {screenProps} = this.props;
    const id = params.itemId;
    const configObject = ConfigProperties.instance.getEnv();

    let {
      job,
      driverUser,
      materials,
      company,
      startAddress,
      endAddress,
      booking,
      bookingEquipment,
      driversShift,
      bookingInvoices,
      loading,
      returning,
      noLoads,
      activeJob,
      allLoads,
      latestJobLoad,
      favoriteCompany,
      profile,
      selectedDrivers,
      drivers,
      tonsDelivered,
      hoursDelivered,
      customerAdmin,
      companyCarrier,
      userIsAllocated,
      jobWithActiveLoad,
      otherJobModalVisible,
      loadNoByDriver,
      latestUserLoad,
      showLateCancelNotice,
      carrierCancelReasons,
      trelarFees,
      producerBillingType
    } = this.state;
    let bid = null;
    let bookings = [];
    let activeDrivers = [];
    try {

      const jobDetails = await JobDetailsService.getJobDetailsMobile(id);

      profile = jobDetails.profile;
      job = jobDetails.job;
      driverUser = jobDetails.driverUser;
      materials = !jobDetails.materials ? [] : jobDetails.materials;
      company = jobDetails.company;
      startAddress = jobDetails.startAddress;
      endAddress = jobDetails.endAddress;
      bid = jobDetails.bid;
      loading = Boolean(jobDetails.loading);
      returning = Boolean(jobDetails.driverIsReturning);
      noLoads = Boolean(jobDetails.noLoads);
      allLoads = !jobDetails.allLoads ? [] : jobDetails.allLoads;
      booking = jobDetails.booking;
      activeJob = Boolean(jobDetails.activeJob);
      jobWithActiveLoad = jobDetails.jobWithActiveLoad;
      otherJobModalVisible = Boolean(jobDetails.otherJobModalVisible);
      bookingEquipment = jobDetails.bookingEquipment;
      driversShift = jobDetails.driversShift;
      bookingInvoices = !jobDetails.bookingInvoices ? [] : jobDetails.bookingInvoices;
      latestJobLoad = jobDetails.latestJobLoad;
      favoriteCompany = !jobDetails.favoriteCompany ? [] : jobDetails.favoriteCompany;
      selectedDrivers = !jobDetails.selectedDrivers ? [] : jobDetails.selectedDrivers;
      let enabledDrivers = !jobDetails.enabledDrivers ? [] : jobDetails.enabledDrivers;
      tonsDelivered = !jobDetails.tonsDelivered ? 0 : jobDetails.tonsDelivered;
      hoursDelivered = !jobDetails.hoursDelivered ? 0 : jobDetails.hoursDelivered;
      companyCarrier = !jobDetails.companyCarrier ? [] : jobDetails.companyCarrier;
      customerAdmin = !jobDetails.customerAdmin ? [] : jobDetails.customerAdmin;
      activeDrivers = !jobDetails.activeDrivers ? [] : jobDetails.activeDrivers;
      userIsAllocated = Boolean(jobDetails.userIsAllocated);
      loadNoByDriver = !jobDetails.loadNoByDriver ? 0 : jobDetails.loadNoByDriver;
      latestUserLoad = jobDetails.latestUserLoad;
      const lookups = !jobDetails.lookupCancelReasons ? [] : jobDetails.lookupCancelReasons;
      trelarFees = !jobDetails.trelarFees ? 0 : jobDetails.trelarFees;
      producerBillingType = jobDetails.billingType;
      const allTtruckTypes = !jobDetails.allTruckTypes ? [] : jobDetails.allTruckTypes;

      // profile = await ProfileService.getProfile();
      // job = await JobService.getJobById(id);
      // if (job) {
      //   materials = await JobMaterialsService.getJobMaterialsByJobId(job.id);
      //   materials = materials.map(materialItem => materialItem.value);
      //   company = await CompanyService.getCompanyById(job.companiesId); // Producer
      //   if (profile.companyType === 'Carrier') {
      //     companyCarrier = await CompanyService.getCompanyById(profile.companyId);
      //   }
      //   startAddress = await AddressService.getAddressById(job.startAddress);
      //   endAddress = null;
      //
      //   // removing for now so that we get the end addresses
      //   if (job.rateType === 'Ton') {
      //   endAddress = await AddressService.getAddressById(job.endAddress);
      //   }
      //
      //   const producerCompanySettings = await CompanySettingsService.getCompanySettings(job.companiesId);
      //   if (producerCompanySettings && producerCompanySettings.length > 0) {
      //     producerBillingType = producerCompanySettings.filter(obj => obj.key === 'billingType');
      //     producerBillingType = producerBillingType[0].value;
      //   }
      //
      //   const companyRates = {
      //     companyId: company.id,
      //     rate: job.rate,
      //     rateEstimate: job.rateEstimate
      //   };
      //   trelarFees = await RatesDeliveryService.calculateTrelarFee(companyRates);
      //
      //   let bids = await BidService.getBidsByJobId(job.id);
      //
      //   if (bids && bids.length > 0) {
      //     // bid = bids[0];
      //     bids = bids.filter((filteredBid) => {
      //       if (filteredBid.hasCustomerAccepted === 1
      //         && filteredBid.hasSchedulerAccepted === 0
      //         && filteredBid.companyCarrierId === profile.companyId) { // "Marketplace" bid
      //         bid = filteredBid;
      //       } else if (filteredBid.companyCarrierId === profile.companyId
      //         && filteredBid.hasSchedulerAccepted === 1
      //         & (filteredBid.status === 'Pending' || filteredBid.status === 'Declined')) { // "Requested" or "Declied" bid
      //         bid = filteredBid;
      //         return filteredBid;
      //       }
      //       return bid;
      //     });
      //     if (bid !== null) {
      //       driverUser = await UserService.getUserById(bid.userId);
      //       if (bid.status === 'Pending' && profile.companyType === 'Carrier') {
      //         job.status = 'You have requested this job'
      //       }
      //     }
      //   }
      //   bookings = await BookingService.getBookingsByJobId(job.id);
      //   if (bookings && bookings.length > 0) {
      //     booking = bookings[0];
      //
      //     customerAdmin = await UserService.getAdminByCompanyId(job.companiesId);
      //
      //     const allocatedDrivers = await BookingEquipmentService.getBookingEquipmentsByBookingId(booking.id);
      //     // we verify if the logged user/driver has been allocated to this job
      //     bookingEquipment = allocatedDrivers.find((selectedBookingEquipment) => {
      //       if (selectedBookingEquipment.driverId === profile.driverId) {
      //         return selectedBookingEquipment;
      //       }
      //       return null;
      //     });
      //
      //     try {
      //       latestUserLoad = await LoadService.getLatestLoadByDriverId(profile.driverId);
      //     } catch (err) {
      //       console.error(err);
      //     }
      //     if (latestUserLoad.loadStatus === 'Returning') {
      //       returning = true;
      //     }
      //     selectedDrivers = allocatedDrivers.map(bookingEquipmentItem => bookingEquipmentItem.driverId);
      //     if (bookingEquipment && Object.keys(bookingEquipment).length > 0) {
      //       // bookingEquipment = bookingEquipment[0];
      //       latestJobLoad = await LoadService.getLatestLoadByBookingEquipmentId(bookingEquipment.id);
      //       if (latestUserLoad.id && !latestUserLoad.endTime && latestJobLoad.id !== latestUserLoad.id) {
      //         otherJobModalVisible = true;
      //         activeJob = false;
      //         jobWithActiveLoad = await JobService.getJobByLoad(latestUserLoad.id);
      //       } else if (latestJobLoad.id && !latestJobLoad.endTime) {
      //         loading = true;
      //       }
      //     }
      //     if (selectedDrivers.includes(profile.driverId)) { // logged driver is allocated, can do shifts and loads
      //       userIsAllocated = true;
      //       driversShift = await ShiftService.isDriverOnShift(profile.driverId);
      //     }
      //     allLoads = await LoadService.getLoadsByBookingId(booking.id);
      //     if (allLoads && allLoads.length > 0) {
      //       allLoads.map(function (load, i) {
      //         tonsDelivered += load.tonsEntered;
      //         hoursDelivered += load.hoursEntered;
      //         if((bookingEquipment) && load.bookingEquipmentId === bookingEquipment.id) {
      //           loadNoByDriver += 1;
      //         }
      //       });
      //     }
      //
      //     // To get the active drivers if load status = 'Started'(In progress)
      //     // if (allLoads && allLoads.length > 0) {
      //     //   const promises = allLoads.map(async load => {
      //     //     if (load.loadStatus === 'Started') {
      //     //       const activeDriver = await UserService.getDriverByBookingEquipmentId(load.bookingEquipmentId);
      //     //       activeDrivers.push(activeDriver.driverId);
      //     //     }
      //     //   });
      //     //   await Promise.all(promises);
      //     // }
      //     let driversResponse = await LoadService.getActiveDriversByBookingId(booking.id);
      //     if (driversResponse && driversResponse.length > 0) {
      //       driversResponse.map(function (driver, i) {
      //         activeDrivers.push(driver.id);
      //       });
      //     }
      //
      //     if (!latestJobLoad.id) {
      //       noLoads = true;
      //     }
      //     bookingInvoices = await BookingInvoiceService.getBookingInvoicesByBookingId(booking.id);
      //   }
      //
      //   const allTtruckTypes = await JobService.getEquipmentsByJobId(job.id);
      //   this.setState({
      //     allTtruckTypes
      //   })
      // }

      if (profile.companyType === 'Carrier') {
        // check if Carrier Company [profile.companyId]
        // is Customer's Company favorite [job.companiesId]
        // favoriteCompany = await GroupListService.getGroupListsByCompanyId(
        //   profile.companyId, job.companiesId
        // );

        if (job.status === 'Booked' || job.status === 'Allocated') {
          // dayBeforeJobDate is a day before job.startTime
          const dayBeforeJobDate = moment(job.startTime).tz(
            profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
          ).subtract(1, 'days').format('MM/DD/YYYY HH:mm:ss');
          // console.log('1 day before job date: ', dayBeforeJobDate);

          // cancelDueDate is a day before at 15:00:00
          const cancelDueDate = `${moment().tz(
            profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
          ).subtract(1, 'days').format('MM/DD/YYYY')} 15:00:00`;
          // console.log('cancel due date: ', cancelDueDate);

          const timeFormat = 'MM/DD/YYYY hh:mm:ss';

          // Check if dayBeforeJobDate is after cancelDueDate with moment's isAfter().
          // If true, a carrier will see a late cancelling warning notice when trying to cancel
          showLateCancelNotice = moment(dayBeforeJobDate, timeFormat).tz(
            profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
          ).isBefore(moment(cancelDueDate, timeFormat).tz(
            profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
          ));
            // const lookups = await LookupsService.getLookupsCarrierCancelReasons();
          if (Object.keys(lookups).length > 0) {
            Object.values(lookups).forEach((itm) => {
              carrierCancelReasons.push({
                id: String(itm.val1),
                name: itm.val1
              });
            });
          }
          carrierCancelReasons.push({
            id: 'Other',
            name: 'Other'
          });
        }

      }

      // const drivers = await UserService.getDriversWithUserInfoByCompanyId(profile.companyId);
      // let enabledDrivers = [];
      // Object.values(drivers).forEach((itm) => {
      //   if (itm.driverStatus === 'Enabled' || itm.userStatus === 'Enabled') {
      //     enabledDrivers.push(itm);
      //   }
      // });
      // // Setting id to driverId since is getting the userId and saving it as driverId
      // enabledDrivers = enabledDrivers.map((driver) => {
      //   const newDriver = driver;
      //   newDriver.id = newDriver.driverId;
      //   return newDriver;
      // });
      let distance = 0;
      let time = 0;
      if (startAddress.longitude && startAddress.latitude && endAddress.longitude && endAddress.latitude) {
        try {
          const response = await GeoCodingService
            .getDistance(startAddress.longitude, startAddress.latitude,
              endAddress.longitude, endAddress.latitude);
          distance = response.routes[0].distance;
          time = response.routes[0].duration;
        } catch (e) {
          // console.log(e)
        }
      }

      this.setState({
        isLoading: false,
        job,
        allTtruckTypes,
        driverUser,
        materials,
        company,
        startAddress,
        endAddress,
        bid,
        loading,
        returning,
        noLoads,
        allLoads,
        booking,
        activeJob,
        jobWithActiveLoad,
        otherJobModalVisible,
        bookingEquipment,
        driversShift,
        bookingInvoices,
        latestJobLoad,
        favoriteCompany,
        profile,
        selectedDrivers,
        drivers: enabledDrivers,
        tonsDelivered,
        hoursDelivered,
        distance,
        time,
        companyCarrier,
        customerAdmin,
        activeDrivers,
        userIsAllocated,
        loadNoByDriver,
        latestUserLoad,
        showLateCancelNotice,
        carrierCancelReasons,
        trelarFees,
        producerBillingType
      });
      screenProps.setReloadLoads(false);
    } catch (err) {
      console.error(err);
    }

    // disabling MB in order to transition to HERE
    // if (Platform.OS === 'ios'){
    //   this.fetchDirections(startAddress, endAddress);
    // }
  }

  componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
    // console.log(nextProps);
    const {screenProps} = this.props;
    const {job} = this.state;
    // console.log(nextProps.screenProps.reloadLoads);
    if (nextProps.screenProps.reloadLoads && job.id) {
      this.handleUpdateLoads();
      nextProps.screenProps.setReloadLoads(false);
    }
  }

  handleCall() {
    const {customerAdmin} = {...this.state};
    const phone = customerAdmin[0].mobilePhone;
    const url = `tel:${phone}`;
    // console.log(url);
    Linking.canOpenURL(url).then(supported => {
      if (!supported) {
        console.error('Can\'t handle url: ' + url);
      } else {
        Linking.openURL(url)
          .catch(err => {
            console.warn('openURL error', err)
          });
      }
    }).catch(err => console.warn('An unexpected error happened', err));
  }

  async handleUpdateLoads() {
    const {booking, bookingEquipment, profile} = {...this.state};
    let {
      allLoads,
      latestUserLoad,
      latestJobLoad,
      otherJobModalVisible,
      activeJob,
      jobWithActiveLoad,
      loading,
      returning
    } = {...this.state};
    let tonsDelivered = 0;
    let hoursDelivered = 0;
    let loadNoByDriver = 0;
    try {
      allLoads = await LoadService.getLoadsByBookingId(booking.id);
      if (allLoads && allLoads.length > 0) {
        allLoads.map(function (load, i) {
          tonsDelivered += load.tonsEntered;
          hoursDelivered += load.hoursEntered;
          if(load.bookingEquipmentId === bookingEquipment.id) {
            loadNoByDriver += 1;
          }
        });
      }
      latestUserLoad = await LoadService.getLatestLoadByDriverId(profile.driverId);
      if (latestUserLoad.loadStatus === 'Returning') {
        returning = true;
      }
      latestJobLoad = await LoadService.getLatestLoadByBookingEquipmentId(bookingEquipment.id);
      if (
        latestUserLoad && latestUserLoad.id
        && (latestUserLoad.loadStatus === 'Started' || latestUserLoad.loadStatus === 'Returning')
        && latestJobLoad.id !== latestUserLoad.id
      ) {
        otherJobModalVisible = true;
        activeJob = false;
        jobWithActiveLoad = await JobService.getJobByLoad(latestUserLoad.id);
      } else {
        otherJobModalVisible = false;
        activeJob = true;
        jobWithActiveLoad = null;
      }
    } catch (err) {
      console.log(err);
    }
    loading = !!(latestJobLoad.id && (latestJobLoad.loadStatus === 'Started' || latestJobLoad.loadStatus === 'Returning'));

    this.setState({
      allLoads,
      tonsDelivered,
      hoursDelivered,
      latestUserLoad,
      latestJobLoad,
      otherJobModalVisible,
      activeJob,
      jobWithActiveLoad,
      loading,
      returning,
      loadNoByDriver
    });
  }

  moveCamera = () => {
    this.mapRef.moveCamera();
  };

  handleGoToJobWithActiveLoad() {
    const { jobWithActiveLoad } = {...this.state};
    NavigationService.push('JobDetailsPage', {
      itemId: jobWithActiveLoad.id,
      jobName: jobWithActiveLoad.name
    });
    this.setState({otherJobModalVisible: false})
  };


  renderOtherJobInProgressModal() {
    const {otherJobModalVisible, jobWithActiveLoad} = {...this.state};
    if (!jobWithActiveLoad) {
      return null;
    }
    return (
      <View>
        <Overlay
          isVisible={otherJobModalVisible}
          onBackdropPress={() => this.setState({otherJobModalVisible: false})}
          height={150}
        >
          <View style={{
            flex: 1,
            flexDirection: 'column'
          }}>
            <View>
              <Text style={{color: 'rgb(0, 111, 83)', fontSize: 14}}>Other Job In Progress</Text>
            </View>
            <View>
              <Text style={{
                marginTop: 10,
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>{jobWithActiveLoad.name} is in progress. Finish load for this job if you want to start or resume
                another job.</Text>
            </View>
          </View>
          <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
            <Button
              title="See Job"
              onPress={() => this.handleGoToJobWithActiveLoad()}
            />
            <Button
              type="outline"
              title={translate('Close')}
              onPress={() => this.setState({otherJobModalVisible: false})}
            />
          </View>
        </Overlay>
      </View>
    );
  }

  // For when the Load is in a Returning state, and the Carrier doesn't want to start a new one
  async handleFinishReturningLoad() {
    const {toggleGeoLocation} = this.props.screenProps;
    const { driversShift, profile } = this.state;
    let {job, latestUserLoad} = this.state;

    this.setState({actionLoader: true});

    try {
      job = await JobService.getJobById(job.id);
    } catch (err) {
      console.error(err);
    }

    latestUserLoad.loadStatus = 'Submitted';
    latestUserLoad.endTime = moment.utc().format();
    latestUserLoad.modifiedOn = moment.utc().format();
    latestUserLoad.modifiedBy = profile.userId;

    try {
      // get actual distance
      const route = await GPSTrackingService.getDistanceByLoadId(latestUserLoad.id);
      const distance = route.distance;
      latestUserLoad.actualTravelDistance = ((distance / 1.609) / 1000);

      latestUserLoad.jobRate = job.rate;

      // update load
      latestUserLoad = await LoadService.updateLoad(latestUserLoad);
    } catch (err) {
      console.error(err);
    }

    toggleGeoLocation(true, driversShift.id, null);

    this.setState({
      job,
      latestUserLoad,
      loading: false,
      returning: false,
      actionLoader: false
    });

    this.props.screenProps.setReloadLoads(true);
    this.props.screenProps.setReloadJobs(true);
  }

  async handleStartLoad() {
    const {
      driversShift,
      bookingEquipment,
      booking,
      latestJobLoad,
      profile
    } = {...this.state}; // hard coded now but change so you grab it from the state
    let {job} = {...this.state};

    try {
      job = await JobService.getJobById(job.id);
    } catch (err) {
      console.error(err);
    }

    if (job.status !== 'Job Ended' && job.status !== 'Job Completed' && job.status !== 'Paused') {
      this.setState({actionLoader: true});
      let {loadNoByDriver} = this.state;
      const {toggleGeoLocation} = this.props.screenProps;

      if (job.status === 'Booked' || job.status === 'Allocated') {
        job.status = 'In Progress';
        try {
          job = await JobService.updateJob(job);
        } catch (err) {
          console.error(err);
        }
      }

      // If we're still tracking by Load (driver 'Returning' to quarry)
      if (latestJobLoad && latestJobLoad.loadStatus === 'Returning') {
        toggleGeoLocation(true, driversShift.id, null);
        let oldLoad = CloneDeep(latestJobLoad);
        oldLoad.loadStatus = 'Submitted';
        oldLoad.endTime = moment.utc().format();

        // get actual distance
        const route = await GPSTrackingService.getDistanceByLoadId(oldLoad.id);
        const distance = route.distance;
        oldLoad.actualTravelDistance = ((distance / 1.609) / 1000);

        oldLoad.jobRate = job.rate;
        oldLoad.modifiedBy = profile.userId;
        oldLoad.modifiedOn = moment.utc().format();
        const response = await LoadService.updateLoad(oldLoad);
      }

      const materials = await JobMaterialsService.getJobMaterialsByJobId(job.id);
      const bookingEquipmentId = bookingEquipment.id;
      const newLoad = {
        bookingEquipmentId,
        customerSchedulerCompanyId: job.companiesId, // producer's company ID
        loadStatus: 'Started',
        rateType: job.rateType,
        startTime: moment.utc().format(),
        material: materials[0].value,
        createdBy: profile.userId,
        createdOn: moment.utc().format(),
        modifiedBy: profile.userId,
        modifiedOn: moment.utc().format()
      };
      const response = await LoadService.createLoad(newLoad);
      toggleGeoLocation(true, driversShift.id, response.id);
      const allLoads = await LoadService.getLoadsByBookingId(booking.id);
      loadNoByDriver += 1;
      this.setState({
        noLoads: false,
        loading: true,
        returning: false,
        allLoads,
        job,
        latestJobLoad: response,
        latestUserLoad: response,
        actionLoader: false,
        loadNoByDriver
      });
      this.props.screenProps.setReloadJobs(true);
    } else if (job.status === 'Paused') { // if job has been paused
      Alert.alert(
        '',
        translate('This job has been paused by the producer'),
        [
          {text: 'Ok'}
        ]
      );
      this.setState({
        job,
        actionLoader: false
      });
      this.props.screenProps.setReloadLoads(true);
      this.props.screenProps.setReloadJobs(true);
    } else { // the job has ended
      Alert.alert(
        '',
        translate('This job has been ended by the producer'),
        [
          {text: 'Ok'}
        ]
      );
      this.setState({
        job,
        actionLoader: false
      });
      this.props.screenProps.setReloadLoads(true);
      this.props.screenProps.setReloadJobs(true);
    }
  }

  async handleEndLoad() {
    const {
      driversShift,
      booking,
      job,
      latestJobLoad
    } = this.state; // hard coded now but change so you grab it from the state
    const {toggleGeoLocation} = this.props.screenProps;
    const bookingId = booking.id;
    // toggleGeoLocation(true, driversShift.id, null);
    const allLoads = await LoadService.getLoadsByBookingId(bookingId);
    this.setState({loading: false, allLoads});
    NavigationService.push('LoadCompletedPage', {
      id: latestJobLoad.id,
      jobId: job.id,
      bookingId: booking.id
    });
    // this.props.screenProps.setReloadJobs(true);
    // to={`/jobs/${job.id}/loads/${latestJobLoad.id}/complete`}
  }

  async handleCarrierCancelJob() {
    const {
      job,
      company,
      cancelError,
      customerAdmin,
      showOtherReasonInput,
      approveCancelReason,
      companyCarrier,
      profile
    } = this.state;
    let {cancelReason} = this.state;
    let newJob;

    if (cancelReason === '') {
      this.setState({
        cancelError: 'Please fill all fields and upload a ticket before submitting.'
      });
      return;
    }

    if (showOtherReasonInput && approveCancelReason === '') {
      this.setState({
        cancelError: 'Please fill all fields and upload a ticket before submitting.'
      });
      return;
    }

    if (cancelReason === 'Other') {
      cancelReason = approveCancelReason;
    }

    this.setState({actionLoader: true});
    try {
      await JobService.cancelJobAsCarrier(job.id, cancelReason);
      newJob = await JobService.getJobById(job.id);
    } catch (err) {
      console.error(err);
    }
    this.props.screenProps.setReloadJobs(true);
    this.setState({
      job: newJob,
      actionLoader: false
    });
    this.toggleCarrierCancelModal();
  }

  toggleLiabilityModal() {
    const {modalLiability} = this.state;
    this.setState({
      modalLiability: !modalLiability
    });
  }

  toggleCarrierCancelModal() {
    const {modalCarrierCancel, reqHandlerCarrierCancel} = this.state;
    this.setState({
      modalCarrierCancel: !modalCarrierCancel
    });
  }

  toggleCancelRequest() {
    const {modalCancelRequest} = this.state;
    this.setState({
      modalCancelRequest: !modalCancelRequest
    });
  }

  // save after the user has checked the info
  async handleJobClick(action) {
    const {
      job,
      favoriteCompany,
      profile
    } = this.state;
    let {
      bid,
      booking
    } = this.state;
    let notification;

    // Is the Carrier this Company's favorite? If so, accepting the job
    // if (favoriteCompany.length > 0) {
    if (action === 'Accept') {
      const acceptedBid = await BidService.acceptBid(job.id, bid.id);
      job.status = "Booked";
      //console.log('finishing accepting');
      this.setState({
        job,
        bid: acceptedBid,
        booking
      });
      this.props.screenProps.setReloadJobs(true);
    } else if (action === 'Request') { 
      // A non-favorite Carrier "requests" the job
      // console.log('carrier is not this company´s favorite, requesting');
      const response = await JobService.requestJob(job.id);
      job.status = 'Requested';
      // console.log('finishing request');
      this.setState({
        job,
        bid: response
      });
    } else if (action === 'Decline') {
      // A Carrier "declines" a job request
      const declinedBid = await BidService.declineBid(job.id, bid.id);
      this.setState({
        bid: declinedBid
      });
      this.props.screenProps.setReloadJobs(true);
    } else if (action === "Cancel Request") {
      try {
        await BidService.deleteBidbById(bid.id);
        this.setState({bid: null});
        this.props.navigation.goBack()
      } catch (err) {
        console.error(err);
      }
    }
    this.setState({actionLoader: false});
    this.props.screenProps.setReloadMarketplace(true);
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

  async handleCompleteClick() {
    const {job} = this.state;
    job.status = 'Job Completed';
    await JobService.updateJob(job);
    this.setState({job});
  }

  async handleDeclineClick() {
    const {job} = this.state;
    job.status = 'Declined';
    await JobService.updateJob(job);
    this.setState({job});
  }

  formatPhone(phone) {
    if (phone && phone.length === 10) {
      phone = [phone.slice(0, 3), '-', phone.slice(3)].join('');
      phone = [phone.slice(0, 7), '-', phone.slice(7)].join('');
    }
    return phone;
  }

  jobMaterialsAsString(materials) {
    let materialsString = '';
    if (materials) {
      const material = materials[0];
      materialsString += `${material}`;
      /*
      let index = 0;
      for (const material of materials) {
        if (index !== materials.length - 1) {
          materialsString += `${material}, `;
        } else {
          materialsString += material;
        }
        index += 1;
      }
      */
    }
    return materialsString;
  }

  showMaterialsAlert() {
    const {materials} = this.state;
    Alert.alert(
      '',
      `Have you picked up material ${this.jobMaterialsAsString(materials)}?`,
      [
        {
          text: 'No', onPress: () => Alert.alert(
            '',
            `Please pick up material ${this.jobMaterialsAsString(materials)} and then start the load`,
            [
              {text: 'OK', onPress: this.setState({actionLoader: false})}
            ]
          )
        },
        {text: 'Yes', onPress: this.handleStartLoad}
      ]
    );
  }

  onStartJobPress() {
    const {job, profile} = this.state;

    const currDate = new Date();
    currDate.setHours(0, 0, 0, 0);
    const jobDate = new Date(job.startTime);
    jobDate.setHours(0, 0, 0, 0);
    if (jobDate > currDate) {
      Alert.alert(
        '',
        `The start date for this job is ${TFormat.asDateOrdinal(jobDate, profile.timeZone)}, but today is ${TFormat.asDateOrdinal(currDate, profile.timeZone)}.\n\nAre you sure you want to start this job early?`,
        [
          {
            text: 'No', onPress: () => Alert.alert(
              '',
              `This job will not be started yet.`,
              [
                {text: 'OK', onPress: this.setState({actionLoader: false})}
              ]
            )
          },
          {text: 'Yes', onPress: () => this.showMaterialsAlert()}
        ]
      );
    } else {
      this.showMaterialsAlert()
    }
  }

  // render functions begin
  renderStatusButton() {
    const {
      job,
      bid,
      noLoads,
      loading,
      returning,
      activeJob,
      latestJobLoad,
      favoriteCompany,
      bookingEquipment,
      materials,
      hoursDelivered,
      tonsDelivered,
      company,
      companyCarrier,
      profile,
      allLoads,
      actionLoader,
      userIsAllocated,
      driversShift,
      jobWithActiveLoad
    } = this.state;
    let {loadNoByDriver} = this.state;
    const {id} = this.props;
    let closingMessage = '';

    const companyProducer = company;

    const currDate = new Date();
    currDate.setHours(0, 0, 0, 0);
    const jobDate = new Date(job.startTime);
    jobDate.setHours(0, 0, 0, 0);

    return (
      <React.Fragment>
        {job.status === 'Allocated' && activeJob && userIsAllocated
        /*&& (currDate.toString() == jobDate.toString())*/ && (
          <React.Fragment>
            {(driversShift && driversShift.id) && (
              <View style={[styles.row, {'justifyContent': 'space-between'}]}>
                <TouchableOpacity
                  disabled={actionLoader}
                  style={[styles.button, styles.actionButton]}
                  onPress={() => this.onStartJobPress()}
                >
                  <Icon
                    name="timer"
                    size={20}
                    color="white"
                  />
                  <Text style={styles.buttonLightText}>&nbsp;START JOB&nbsp;</Text>
                  {
                    actionLoader && (<ActivityIndicator color="#FFF"/>)
                  }
                </TouchableOpacity>
              </View>
            )}
          </React.Fragment>
        )
        }
        {!activeJob && jobWithActiveLoad
        && (
          <View style={{paddingLeft: 15, paddingTop: 10}}>
            <Text>Finish load in progress for job {jobWithActiveLoad.name}.</Text>
          </View>
        )
        }
        {(job.status === 'In Progress' || job.status === 'Job Ended' || job.status === 'Paused')
        && (
          <React.Fragment>
            {loading && !returning && driversShift && (
              <View style={[styles.row, {justifyContent: 'space-between'}]}>
                <TouchableOpacity
                  disabled={driversShift.id ? false : true}
                  style={[styles.button, driversShift.id ? styles.actionOutlinedButton : styles.actionDisabledButton]}
                  onPress={this.handleEndLoad}
                >
                  <Icon
                    name="close"
                    size={20}
                    color={driversShift.id ? "#006F53" : "#CCC"}
                  />
                  <Text style={driversShift.id ? styles.buttonDarkText : styles.buttonDisabledText}>&nbsp;FINISH LOAD</Text>
                </TouchableOpacity>
              </View>
            )}
            {loading && returning && (driversShift && driversShift.id) && job.status === 'Job Ended' && (
              <View style={[styles.row, {justifyContent: 'space-between'}]}>
                <TouchableOpacity
                  style={[styles.button, styles.actionOutlinedButton]}
                  onPress={this.handleEndLoad}
                >
                  <Icon
                    name="close"
                    size={20}
                    color="#006F53"
                  />
                  <Text style={styles.buttonDarkText}>&nbsp;FINISH LOAD</Text>
                </TouchableOpacity>
              </View>
            )}
            {(job.status !== 'Job Ended' && job.status !== 'Job Completed')
            && (!loading || noLoads || returning) &&  activeJob &&
            userIsAllocated && (driversShift && driversShift.id) && (
              <View style={[styles.row, {justifyContent: 'space-between'}]}>
                {(job.status !== 'Paused' &&
                  <TouchableOpacity
                    disabled={actionLoader}
                    style={[styles.button, styles.actionButton]}
                    onPress={() => {
                      Alert.alert(
                        '',
                        `Have you picked up material ${this.jobMaterialsAsString(materials)}?`,
                        [
                          {
                            text: 'No', onPress: () => Alert.alert(
                              '',
                              `Please pick up material ${this.jobMaterialsAsString(materials)} and then start the load`,
                              [
                                {text: 'OK', onPress: this.setState({actionLoader: false})}
                              ]
                            )
                          },
                          {text: 'Yes', onPress: this.handleStartLoad}
                        ]
                      );
                    }}
                  >
                    <Icon
                      name="check"
                      size={20}
                      color="white"
                    />
                    <Text style={styles.buttonLightText}>&nbsp;BEGIN LOAD #{loadNoByDriver === 0 ? 1 : loadNoByDriver += 1}&nbsp;</Text>
                    {
                      actionLoader && (<ActivityIndicator color="#FFF"/>)
                    }
                  </TouchableOpacity>
                )}
                {(returning) && (
                  <TouchableOpacity
                    disabled={actionLoader}
                    style={[styles.button, styles.actionOutlinedButton]}
                    onPress={() => {
                      Alert.alert(
                        '',
                        "Are you done with this job for now?",
                        [
                          {text: 'No'},
                          {
                            text: 'Yes',
                            onPress: this.handleFinishReturningLoad
                          }
                        ]
                      );
                    }}
                  >
                    <Icon
                      name="check"
                      size={20}
                      color="#006F53"
                    />
                    <Text style={styles.buttonDarkText}>&nbsp;DONE WITH THIS JOB&nbsp;</Text>
                    {
                      actionLoader && (<ActivityIndicator color="#006F53"/>)
                    }
                  </TouchableOpacity>
                )}
              </View>
            )}
            {(loading || noLoads) && !activeJob
            && (
              <View style={{paddingLeft: 15, paddingTop: 10}}>
                <Text>Finish load in progress.</Text>
              </View>
            )
            }
            {/* ((!loading && !noLoads) && profile.isAdmin) // we removed COMPLETED JOB from Carrier
            && (
              <View style={[styles.row, {justifyContent: 'space-between'}]}>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => {
                    if (job.rateType === 'Hour') {
                      closingMessage = `${hoursDelivered} out of ${job.rateEstimate} estimated hours have been worked for this job. Are you sure you want to close it?`;
                    } else {
                      closingMessage = `${tonsDelivered} out of ${job.rateEstimate} estimated tons have been delivered for this job. Are you sure you want to close it?`;
                    }
                    Alert.alert(
                      '',
                      closingMessage,
                      [
                        {text: 'No'},
                        {
                          text: 'Yes', onPress: () => {
                            NavigationService.push('JobCompletedPage', {
                              id: job.id
                            });
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Icon
                    name="timer-off"
                    size={20}
                    color="#006F53"
                  />
                  <Text style={styles.buttonDarkText}>&nbsp;COMPLETE JOB</Text>
                </TouchableOpacity>
              </View>
            ) */}
          </React.Fragment>
        )
        }
        {(job.status === 'On Offer' || job.status === 'Published And Offered' || job.status === 'Published')
        /* && (bid !== null && bid.status !== 'Declined')
        && favoriteCompany.length > 0 */
        && (favoriteCompany.length > 0 || (bid && bid.hasCustomerAccepted === 1 && bid.status === 'Pending'))
        && (
          <View style={[styles.row, {justifyContent: 'space-between'}]}>
            <TouchableOpacity
              disabled={actionLoader}
              style={[
                styles.button,
                (bid && bid.status == 'Declined' && bid.hasSchedulerAccepted === 0 && bid.hasCustomerAccepted === 1)
                ? styles.actionDisabledButton
                : styles.actionOutlinedButton
              ]}
              onPress={() => {
                if (bid
                  && bid.status == 'Declined'
                  && bid.hasSchedulerAccepted === 0
                  && bid.hasCustomerAccepted === 1) {
                  return;
                } else {
                  Alert.alert(
                    '',
                    "Are you sure you want to decline this job?",
                    [
                      {text: 'No'},
                      {
                        text: 'Yes, decline', onPress: () => {
                          this.setState({actionLoader: true});
                          this.handleJobClick('Decline');
                          NavigationService.navigate('Drawer');
                        }
                      }
                    ]
                  );
                }
              }}
            >
              <Icon
                name="event-busy"
                size={20}
                color={
                  (bid !== null && bid.status == 'Declined' && bid.hasSchedulerAccepted === 0 && bid.hasCustomerAccepted === 1)
                  ? "#CCC"
                  : "#006F53"
                }
              />
              <Text style={
                (bid && bid.status == 'Declined' && bid.hasSchedulerAccepted === 0 && bid.hasCustomerAccepted === 1)
                ? styles.buttonDisabledText
                : styles.buttonDarkText
                }>&nbsp;DECLINE JOB&nbsp;</Text>
              {
                actionLoader && (<ActivityIndicator color="#006F53"/>)
              }
            </TouchableOpacity>
            <TouchableOpacity
              disabled={actionLoader}
              style={[
                styles.button,
                (bid && bid.status == 'Declined' && bid.hasSchedulerAccepted === 0 && bid.hasCustomerAccepted === 1)
                ? styles.actionDisabledButton
                : styles.actionButton
              ]}
              onPress={() => {
                if (bid
                  && bid.status == 'Declined'
                  && bid.hasSchedulerAccepted === 0
                  && bid.hasCustomerAccepted === 1) {
                  return;
                } else {
                  if ((companyProducer.liabilityGeneral > 0.01 || companyProducer.liabilityAuto > 0.01)
                  && ((companyCarrier.liabilityGeneral < companyProducer.liabilityGeneral) || (companyCarrier.liabilityAuto < companyProducer.liabilityAuto))) {
                    this.toggleLiabilityModal();
                  } else {
                    this.setState({actionLoader: true});
                    this.handleJobClick('Accept');
                  }
                }
              }}
            >
              <Icon
                name="event-available"
                size={20}
                color="white"
                color={
                  (bid !== null && bid.status == 'Declined' && bid.hasSchedulerAccepted === 0 && bid.hasCustomerAccepted === 1)
                  ? "#CCC"
                  : "white"
                }
              />
              <Text style={
              (bid && bid.status == 'Declined' && bid.hasSchedulerAccepted === 0 && bid.hasCustomerAccepted === 1)
              ? styles.buttonDisabledText
              : styles.buttonLightText
              }>&nbsp;ACCEPT JOB&nbsp;</Text>
              {
                actionLoader && (<ActivityIndicator color="#FFF"/>)
              }
            </TouchableOpacity>
          </View>
        )
        }
        {(job.status === 'On Offer' || job.status === 'Published And Offered' || job.status === 'Published')
        && (bid !== null && bid.status == 'Declined' && bid.hasSchedulerAccepted === 0 && bid.hasCustomerAccepted === 1) // Job "Declined" by the carrier
        && (
          <React.Fragment>
            <View style={{paddingRight: 15, paddingTop: 10}}>
              <Text>You have declined this offer.</Text>
            </View>
          </React.Fragment>
        )
        }
        {(job.status === 'On Offer' || job.status === 'Published And Offered' || job.status === 'Published')
        && (bid !== null && bid.status == 'Declined' && bid.hasSchedulerAccepted === 1 && bid.hasCustomerAccepted === 0) // // Job "Declined" by the customer
        && (
          <React.Fragment>
            <View style={{paddingRight: 15, paddingTop: 10}}>
              <Text>Your request for this job has been declined.</Text>
            </View>
          </React.Fragment>
        )
        }
        {((job.status === 'Published And Offered' || job.status === 'Published')
          // Checking if there's no bid to request and create a new one, or if a bid exists ignoring Declined and Pending statuses
          && (bid === null || (bid !== null && bid.status !== 'Declined' && bid.status !== 'Pending')) && favoriteCompany.length === 0)
        && (
          <View style={styles.row}>
            <TouchableOpacity
              disabled={actionLoader}
              style={[styles.button, styles.actionButton]}
              onPress={() => {
                if ((companyProducer.liabilityGeneral > 0.01 || companyProducer.liabilityAuto > 0.01)
                && ((companyCarrier.liabilityGeneral < companyProducer.liabilityGeneral) || (companyCarrier.liabilityAuto < companyProducer.liabilityAuto))) {
                  this.toggleLiabilityModal();
                } else {
                  this.setState({actionLoader: true});
                  this.handleJobClick('Request');
                }
              }}
            >
              <Icon
                name="inbox"
                size={20}
                color="white"
              />
              <Text style={styles.buttonLightText}>&nbsp;REQUEST&nbsp;</Text>
              {
                actionLoader && (<ActivityIndicator color="#FFF"/>)
              }
            </TouchableOpacity>
          </View>
        )
        }
        {(job.status === 'You have requested this job') &&
        (bid !== null && bid.status === 'Pending'
          && bid.hasCustomerAccepted === 0 && bid.hasSchedulerAccepted === 1) // Carrier Requests Marketplace job
        && (
          <View>
          <View style={[styles.row, {justifyContent: 'space-between'}]}>
            <View style={[styles.flatButton]}>
              <Icon
                name="inbox"
                size={20}
                color="#333333"
              />
              <Text style={{fontWeight: 'bold', color: '#333333'}}>&nbsp;Requested</Text>
            </View>
          </View>
            <View style={styles.row}>
                <TouchableOpacity
                  disabled={actionLoader}
                  style={[styles.button, styles.actionButton]}
                  onPress={() => {
                    this.toggleCancelRequest();
                  }}
                >
                  <Icon
                    name="inbox"
                    size={20}
                    color="white"
                  />
                  <Text style={styles.buttonLightText}>&nbsp;CANCEL REQUEST&nbsp;</Text>
                  {
                    actionLoader && (<ActivityIndicator color="#FFF"/>)
                  }
                </TouchableOpacity>
            </View>
          </View>
        )
        }
        {(bid !== null && bid.status === 'Pending'
          && bid.hasCustomerAccepted === 1 && bid.hasSchedulerAccepted === 0) // Customer Requested this Carrier (via Carrier Search)
        && (
          <View style={[styles.row, {justifyContent: 'space-between'}]}>
            <TouchableOpacity
              disabled={actionLoader}
              style={[styles.button, styles.actionOutlinedButton]}
              onPress={() => {
                Alert.alert(
                  '',
                  "Are you sure you want to decline this job?",
                  [
                    {text: 'No'},
                    {
                      text: 'Yes, decline', onPress: () => {
                        this.setState({actionLoader: true});
                        this.handleJobClick('Decline');
                        NavigationService.navigate('Drawer');
                      }
                    }
                  ]
                );
              }}
            >
              <Icon
                name="event-busy"
                size={20}
                color="#006F53"
              />
              <Text style={styles.buttonDarkText}>&nbsp;DECLINE JOB&nbsp;</Text>
              {
                actionLoader && (<ActivityIndicator color="#006F53"/>)
              }
            </TouchableOpacity>
            <TouchableOpacity
              disabled={actionLoader}
              style={[styles.button, styles.actionButton]}
              onPress={() => {
                if((companyProducer.liabilityGeneral > 0.01 || companyProducer.liabilityAuto > 0.01)
                && ((companyCarrier.liabilityGeneral < companyProducer.liabilityGeneral) || (companyCarrier.liabilityAuto < companyProducer.liabilityAuto))) {
                  this.toggleLiabilityModal();
                } else {
                  this.setState({actionLoader: true});
                  this.handleJobClick('Accept');
                }
              }}
            >
              <Icon
                name="event-available"
                size={20}
                color="white"
              />
              <Text style={styles.buttonLightText}>&nbsp;ACCEPT JOB&nbsp;</Text>
              {
                actionLoader && (<ActivityIndicator color="#FFF"/>)
              }
            </TouchableOpacity>
          </View>
        )
        }
        {(job.status === 'Booked'
          && profile.companyType === 'Carrier' && (bid !== null && bid.status === 'Accepted')) && (
          <View style={[styles.row, {justifyContent: 'space-between'}]}>
            <View style={[styles.flatButton]}>
              <Icon
                name="event-available"
                size={20}
                color="#333333"
              />
              <Text style={{fontWeight: 'bold', color: '#333333'}}>&nbsp;Accepted</Text>
            </View>
            {
              /*
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}>
                <Text style={styles.buttonDarkText}>&nbsp;CANCEL</Text>
              </TouchableOpacity>
              */
            }
          </View>
        )}
        {((job.status === 'Booked' || job.status === 'Allocated' || job.status === 'In Progress' || job.status === 'Paused')
          && profile.companyType === 'Carrier' && profile.isAdmin) && (
          <React.Fragment>
            {(job.status === 'Booked' || job.status === 'Allocated') && (
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.button, styles.actionButton]}
                  onPress={() => {
                    this.setState({modalCarrierCancel: true});
                  }}
                >
                  <Icon
                    name="highlight-off"
                    size={20}
                    color="white"
                  />
                  <Text style={styles.buttonLightText}>&nbsp;CANCEL JOB</Text>
                </TouchableOpacity>
              </View>
            )}
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }

  renderHeaders() {
    const {job, company} = this.state;
    if (job.status === 'Booked' || job.status === 'Allocated' || job.status === 'In Progress' ||
    job.status === 'Job Ended' || job.status === 'Job Completed' || job.status === 'Paused') {
      return (
        <React.Fragment>
          <View style={styles.nameContainer}>
            <Text style={styles.nameLabel}>
              {job.id} / {job.name}
            </Text>
          </View>
          <View style={styles.companyContainer}>
            <Text style={styles.companyLabel}>
              {company.legalName}
            </Text>
            <Text style={styles.companyLabel}>
              {TFormat.mobilePhone(company.phone)}
            </Text>
          </View>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <View style={styles.nameContainer}>
            <Text style={styles.nameLabel}>
              {job.id} / {job.name}
            </Text>
          </View>
          <View style={styles.companyContainer}>
            <Text style={styles.companyLabel}>
              {company.legalName}
            </Text>
          </View>
        </React.Fragment>
      );
    }
  }

  renderCompletedJobSection(total, tons, distance, time, loads) {
    const {job, materials, profile} = this.state;
    let tonnage;
    let totalHours = 0;
    if (job.rateType === 'Ton') {
      tonnage = `${NumberFormatting.asMoney(tons, '.', 2, ',', '')} of ${NumberFormatting.asMoney(total, '.', 2, ',', '')} tons`;
    } else {
      tonnage = `${NumberFormatting.asMoney(tons, '.', 2, ',', '')} tons`;
    }
    return (
      <React.Fragment>
        <View style={{flexDirection: 'row'}}>
          <View>
            <View
              style={{
                height: 40,
                width: 40,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon
                name="landscape"
                size={24}
                color="#666666"
              />
            </View>
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{paddingLeft: 16}}>
              <Text style={styles.superTitle}>
                {tonnage} -
              </Text>
              <Text style={styles.subtitle}>
                &nbsp;{this.jobMaterialsAsString(materials)}
              </Text>
            </Text>
          </View>
        </View>
        <View style={{flexDirection: 'row'}}>
          <View>
            <View
              style={{
                height: 40,
                width: 40,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon
                name="timeline"
                size={24}
                color="#666666"
              />
            </View>
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{paddingLeft: 16}}>
              {distance ? (
                <React.Fragment>
                  <Text style={styles.superTitle}>
                    {TFormat.asMetersToMiles(distance)}
                  </Text>
                  <Text style={styles.subtitle}>
                    &nbsp;total
                  </Text>
                </React.Fragment>
              ) : (
                <Text style={[styles.subtitle, {textAlign: 'center', paddingLeft: 16}]}>
                  &nbsp;Avg. distance {'\n'} not available
                </Text>
              )}
            </Text>
          </View>
        </View>
        <View style={{flexDirection: 'row'}}>
          <View>
            <View
              style={{
                height: 40,
                width: 40,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon
                name="timer"
                size={24}
                color="#666666"
              />
            </View>
          </View>
          <View style={{
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{paddingLeft: 16}}>
              {job.rateType === 'Hour' && (
                <Text style={styles.superTitle}>
                  {totalHours}h {"\n"}
                </Text>
              )}
              {
                loads.length > 0 ?
                  loads.map((load) => (
                    <Text>
                      <Text style={styles.subtitle}>
                        {TFormat.asTime(load.endTime, profile.timeZone)} - {TFormat.asDateOrdinal(load.endTime, profile.timeZone)}
                      </Text>
                      {"\n"}
                    </Text>
                  )) : 'No loads registered'
              }
            </Text>
          </View>
        </View>
      </React.Fragment>
    );
  }

  renderStatusBlockTop() {
    const {
      job,
      company,
      bid,
      distance,
      favoriteCompany,
      allLoads,
      loading,
      loadNoByDriver,
      latestUserLoad,
      latestJobLoad,
      profile
    } = this.state;
    let icon = 'assignment';
    let backgroundColor = '#006F53';
    let statusText = null;
    let subtitle = null;

    const total = job.rateEstimate;
    let tonsDelivered = 0;
    let hoursDelivered = 0;
    if (allLoads.length > 0) {
      for (const i in allLoads) {
        if (allLoads[i].loadStatus === 'Submitted' || allLoads[i].loadStatus === 'Approved') {
          tonsDelivered += allLoads[i].tonsEntered;
          hoursDelivered += allLoads[i].hoursEntered;
        }
      }
    }
    const currDate = new Date();
    currDate.setHours(0, 0, 0, 0);
    const jobDate = new Date(job.startTime);
    const jobDateText = `${TFormat.asDateOrdinal(jobDate, profile.timeZone)} @ ${TFormat.asTime(jobDate, profile.timeZone)}`;
    jobDate.setHours(0, 0, 0, 0);

    switch (job.status) {
      case 'Allocated': {
        icon = 'assignment-turned-in';
        if (currDate.toString() == jobDate.toString()) {
          icon = 'assignment';
          statusText = 'Today';
        }
      }
        break;
      case 'Booked': {
        icon = 'assignment-turned-in';
        if (currDate.toString() == jobDate.toString()) {
          icon = 'assignment';
          statusText = 'Today';
        }
      }
        break;
      case 'Job Completed': {
        icon = 'done-all';
        statusText = 'Completed';
        if (job.rateType === 'Ton') {
          subtitle = `${NumberFormatting.asMoney(tonsDelivered, '.', 2, ',', '')} of ${TFormat.asNumber(total)} tons`;
        } else {
          subtitle = `${NumberFormatting.asMoney(tonsDelivered, '.', 2, ',', '')} tons`;
        }
      }
        break;
      case 'Published And Offered': {
        icon = 'assignment-late';
        backgroundColor = '#A9DA1C';
        if (bid && bid.status === 'New' && bid.hasCustomerAccepted === 1) {
          statusText = 'Invited';
        } else if (bid && bid.status === 'Pending' && bid.hasSchedulerAccepted === 1) {
          statusText = 'Requested';
        } else {
          statusText = 'Published';
        }
      }
        break;
      case 'On Offer': {
        icon = 'assignment';
        backgroundColor = '#006F53';
        statusText = 'Posted';
      }
        break;
      case 'You have requested this job': {
        if ((bid !== null && bid.status === 'Pending') /*&& favoriteCompany.length === 0*/) {
          icon = 'assignment';
          backgroundColor = '#CCCCCC';
          statusText = 'Requested';
        }
      }
        break;
      case 'In Progress': {
        icon = 'local-shipping';
        statusText = 'Job Started';
      }
        break;
      case 'Job Ended': {
        if (profile.isAdmin && profile.companyType === 'Carrier') {
          icon = 'local-shipping';
          statusText = 'Job Finishing';
          if (loading) {
            statusText = 'Final Load';
          }
        } else if (!profile.isAdmin && profile.companyType === 'Carrier') {
          icon = 'local-shipping';
          statusText = 'Job Completed';
          if (loading) {
            statusText = 'Final Load';
          }
        } else {
          icon = 'local-shipping';
          statusText = 'Job Ended';
        }
      }
        break;
      default:
        break;
    }

    if (job.status === 'In Progress' && loadNoByDriver > 0) {
      return (
        <View style={{flexDirection: 'row'}}>
          <View>
            <View
              style={{
                height: 40,
                width: 40,
                borderRadius: 20,
                backgroundColor,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon
                name={icon}
                size={24}
                color="white"
              />
            </View>
          </View>
          <View>
            <Text style={{paddingLeft: 16, paddingRight: 32}}>
              <Text style={styles.superTitle}>
                {translate('Load')} #{loadNoByDriver} - {latestJobLoad.loadStatus === 'Started'
                ? 'In Progress' : latestJobLoad.loadStatus}
              </Text>
              {'\n'}
              {job.amountType === 'Ton'
              ? 
                <Text style={styles.subtitle}>
                  {NumberFormatting.asMoney(tonsDelivered, '.', 2, ',', '')} {translate('of')} {NumberFormatting.asMoney(total, '.', 2, ',', '')} {translate('tons')}
                </Text>
              : 
                <Text style={styles.subtitle}>
                  {TFormat.asHoursAndMinutes(hoursDelivered)} {translate('of')} {TFormat.asHoursAndMinutes(total)}
                </Text>
              }
            </Text>
          </View>
        </View>
      );
    }

    return (
      <React.Fragment>
        <View style={{flexDirection: 'row'}}>
          <View>
            <View
              style={{
                height: 40,
                width: 40,
                borderRadius: 20,
                backgroundColor,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon
                name={icon}
                size={24}
                color="white"
              />
            </View>
          </View>
          <View>
            <Text style={{paddingLeft: 16, paddingRight: 32}}>
              <Text style={styles.superTitle}>
                {/*<Text style={[styles.superTitle, {color: '#333333'}]}>{job.name}</Text>*/}
                {/*'\n'*/}
                {statusText ? statusText : job.status} {jobDateText
              && (
                <Text style={styles.subtitle}>
                  - {jobDateText}
                </Text>
              )}
              </Text>
              {'\n'}
              <Text style={styles.subtitle}>
                {company.legalName}
              </Text>
            </Text>
          </View>
        </View>
        {
          job.status === 'Job Completed' && (
            this.renderCompletedJobSection(
              total, tonsDelivered, distance, hoursDelivered, allLoads
            )
          )
        }
      </React.Fragment>
    );
  }

  renderStatusBlock() {
    const {job, bid} = this.state;
    return (
      <View
        style={{
          marginTop: 16,
          marginBottom: 8
        }}
      >
        <View
          style={{
            flexDirection: 'column'
          }}
        >
          <Text
            style={styles.sectionTitle}
          >
            {translate('Status')}
          </Text>
        </View>

        <View
          style={[{
            flexDirection: 'column',
            backgroundColor: '#FFF',
            borderRadius: 3,
            padding: 12,
            justifyContent: 'center'
          }, styles.boxShadow]}>
          {this.renderStatusBlockTop(job, bid)}
          {this.renderStatusButton()}
          {/* this.renderCompletedJobSection() */}
        </View>
      </View>
    );
  }

  // renderMapByOs(os) {
  //
  //   return (
  //     <View>
  //       {this.renderJobDetailsMap()}
  //     </View>
  //   )
  // }

  renderWhenAndWhereBlock() {
    const {job, distance, time, profile} = this.state;
    return (
      <View
        style={{
          marginTop: 8,
          marginBottom: 8
        }}
      >
        <View
          style={{
            flexDirection: 'column'
          }}
        >
          <Text
            style={styles.sectionTitle}
          >
            {translate('When and Where')}
          </Text>
        </View>
        {this.renderJobDetailsMap()}
        <View
          style={[{
            flexDirection: 'column',
            backgroundColor: '#FFF'
          }, styles.boxShadow]}>
          <View
            style={{
              flexDirection: 'row',
              height: 50,
              padding: 16,
              borderBottomColor: '#F0F0ED',
              borderBottomWidth: 1
            }}
          >
            <View>
              <Text style={styles.subtitle}>
                {TFormat.asDateOrdinal(job.starTime, profile.timeZone)} @ {TFormat.asTime(job.starTime, profile.timeZone)}
              </Text>
            </View>
          </View>
          <View>
            <View
              style={{
                flexDirection: 'row',
                padding: 16,
                alignItems: 'center'
              }}
            >
              <View style={{flex: 0.95}}>
                <Text style={styles.superTitle}>
                  {translate("Pickup")} {"\n"}
                  {this.state.startAddress.address1},&nbsp;
                  {this.state.startAddress.city}, {this.state.startAddress.state}, {this.state.startAddress.zipCode}
                </Text>
                <Text style={styles.subtitle}>
                  {"\n"}
                  {translate("Delivery")} {"\n"}
                  {this.state.endAddress.address1},&nbsp;
                  {this.state.endAddress.city}, {this.state.endAddress.state}, {this.state.endAddress.zipCode}
                </Text>
              </View>
              {/* <View style={{flex: 0.05}}>
                <Icon
                  name="chevron-right"
                  size={24}
                  color="black"
                />
              </View> */}
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <View style={{
              flex: 0.5, flexDirection: 'row',
              paddingLeft: 16,
              paddingRight: 16,
              paddingBottom: 16,
              alignItems: 'center'
            }}>
              <Icon
                name="near-me"
                size={24}
                color="#666666"
              />
              {distance ? (
                <Text style={styles.subtitle}>
                  &nbsp;{TFormat.asMetersToMiles(distance)}
                </Text>
              ) : (
                <Text style={[styles.subtitle, {textAlign: 'center', paddingLeft: 16}]}>
                  &nbsp;Avg. distance {'\n'} not available
                </Text>
              )}
            </View>
            <View style={{
              flex: 0.5,
              flexDirection: 'row',
              paddingLeft: 16,
              paddingRight: 16,
              paddingBottom: 16,
              alignItems: 'center'
            }}>
              <Icon
                name="schedule"
                size={24}
                color="#666666"
              />
              {time ? (
                <Text style={styles.subtitle}>
                  &nbsp;{TFormat.asSecondsToHms(time)}
                </Text>
              ) : (
                <Text style={[styles.subtitle, {textAlign: 'center', paddingLeft: 16}]}>
                  &nbsp;Avg. time {'\n'} not available
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }

  renderPickupAndDeliveryBlock() {
    const {job, company} = this.state;
    return (
      <View
        style={{
          marginTop: 8,
          marginBottom: 8
        }}
      >
        <View
          style={{
            flexDirection: 'column'
          }}
        >
          <Text
            style={styles.sectionTitle}
          >
            {translate("Pickup and Delivery Locations")}
          </Text>
        </View>
        <View
          style={[{
            flexDirection: 'column',
            backgroundColor: '#FFF'
          }, styles.boxShadow]}>
          <View>
            <View
              style={{
                flexDirection: 'row',
                padding: 16,
                alignItems: 'center'
              }}
            >
              <View style={{flex: 0.95}}>
                <Text style={styles.superTitle}>
                  {this.state.startAddress.address1},&nbsp;
                  {this.state.startAddress.city}, {this.state.startAddress.state}, {this.state.startAddress.zipCode}
                </Text>
                <Text style={styles.subtitle}>
                  {this.state.endAddress.address1},&nbsp;
                  {this.state.endAddress.city}, {this.state.endAddress.state}, {this.state.endAddress.zipCode}
                </Text>
              </View>
              <View style={{flex: 0.05}}>
                <Icon
                  name="chevron-right"
                  size={24}
                  color='rgb(0, 111, 83)'
                />
              </View>
            </View>
          </View>

        </View>
      </View>
    );
  }

  renderMinimumInsurance() {
    const {job, company} = this.state;
    let liabilityGeneral;
    let liabilityAuto;
    if (company.liabilityGeneral > 0.01) {
      liabilityGeneral = (
        <View>
          <Text>
            <Text style={styles.superTitle}>
              Minimum General Liability:
            </Text>
            <Text style={styles.subtitle}>
              &nbsp;{TFormat.asMoneyNoDecimals(company.liabilityGeneral)}
            </Text>
          </Text>
        </View>
      );
    }
    if (company.liabilityAuto > 0.01) {
      liabilityAuto = (
        <View>
          <Text>
            <Text style={styles.superTitle}>
              Minimum Auto Liability:
            </Text>
            <Text style={styles.subtitle}>
              &nbsp;{TFormat.asMoneyNoDecimals(company.liabilityAuto)}
            </Text>
          </Text>
        </View>
      );
    }

    if (company.liabilityGeneral < 0.01 && company.liabilityAuto < 0.01) {
      return false;
    }
    return (
      <View
        style={{
          flexDirection: 'column',
          padding: 16,
          borderBottomColor: '#F0F0ED',
          borderBottomWidth: 1
        }}
      >
        {liabilityGeneral}
        {liabilityAuto}
      </View>
    );
  }

  renderJobDetailsBlock() {
    const {
      job,
      company,
      materials,
      customerAdmin,
      allTtruckTypes,
      profile
    } = this.state;
    const equipmentsList = allTtruckTypes.join(', ');
    return (
      <View
        style={{
          marginTop: 8,
          marginBottom: 8
        }}
      >
        <View
          style={{
            flexDirection: 'column',
            width: 320,
            justifyContent: 'center'
          }}
        >
          <Text
            style={styles.sectionTitle}
          >
            {translate('Job Details')}
          </Text>
        </View>
        <View
          style={[{
            flexDirection: 'column',
            backgroundColor: '#FFF'
          }, styles.boxShadow]}
        >
          <TouchableHighlight onPress={this.handleCall} underlayColor='rgb(255,255,255)'>
            <View
              style={{
                flexDirection: 'row',
                padding: 16,
                alignItems: 'center',
                borderBottomColor: '#F0F0ED',
                borderBottomWidth: 1
              }}
            >
              <View style={{flex: 0.95}}>
                <Text style={styles.superTitle}>
                  {company.legalName}
                </Text>
                {/*<Text style={styles.subtitle}>*/}
                {/*  Aggregate Company Name*/}
                {/*</Text>*/}
                {customerAdmin && customerAdmin.length > 0
                && (
                  job.status !== 'Published And Offered'
                  && job.status !== 'You have requested this job'
                ) && (
                  <View>
                    <Text style={styles.subtitle}>
                      {customerAdmin[0].firstName} {customerAdmin[0].lastName}
                    </Text>
                    <Text style={styles.subtitlePhone}>
                      {TFormat.mobilePhone(customerAdmin[0].mobilePhone)}
                    </Text>
                  </View>
                )}
              </View>
              {/* <View style={{flex: 0.05}}>
                  <Icon
                    name="chevron-right"
                    size={24}
                    color="black"
                  />
                </View> */}
            </View>
          </TouchableHighlight>

          <View
            style={{
              flexDirection: 'row',
              padding: 16,
              borderBottomColor: '#F0F0ED',
              borderBottomWidth: 1,
              alignItems: 'center'
            }}
          >
            <Icon
              name="landscape"
              size={24}
              color="#666666"
            />
            <Text>
              <Text style={styles.superTitle}>
                &nbsp;{NumberFormatting.asMoney(job.rateEstimate, '.', 2, ',', '')} {job.rateType}s&nbsp;
              </Text>
              <Text style={styles.subtitle}>
                - {this.jobMaterialsAsString(materials)}
              </Text>
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              padding: 16,
              borderBottomColor: '#F0F0ED',
              borderBottomWidth: 1,
              alignItems: 'center'
            }}
          >
            <Icon
              name="local-shipping"
              size={24}
              color="#666666"
            />
            <Text style={styles.subtitleContainer}>
              <Text style={styles.superTitle}>
                &nbsp;{
                job.numEquipments ? `${job.numEquipments} ${translate("trucks")}` : `${translate("Any trucks")}`
              } &nbsp;
              </Text>
              <Text style={styles.subtitle}>
                - {equipmentsList}
              </Text>
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              padding: 16,
              borderBottomColor: '#F0F0ED',
              borderBottomWidth: 1,
              alignItems: 'center'
            }}
          >
            <Icon
              name="date-range"
              size={24}
              color="#666666"
              style={{paddingRight: 5}}
            />
            <Text style={styles.subtitleContainer}>
              <Text style={styles.superTitle}>
              {
                TFormat.asDateOrdinalAbbreviated(job.startTime, profile.timeZone)
              },&nbsp;
              </Text>
              <Text style={styles.subtitle}>
                {TFormat.asTime(job.startTime, profile.timeZone)}
              </Text>
              {job.endTime && (
                <React.Fragment>
                  <Text style={styles.superTitle}>
                    &nbsp;—&nbsp;{
                    TFormat.asDateOrdinalAbbreviated(job.endTime, profile.timeZone)
                  },&nbsp;
                  </Text>
                  <Text style={styles.subtitle}>
                    {TFormat.asTime(job.endTime, profile.timeZone)}
                  </Text>
                </React.Fragment>
              )}
            </Text>
          </View>

          {this.renderMinimumInsurance()}

        </View>
      </View>
    );
  }

  renderFinancialDetailsBlock() { // TODO we will need a similar block for producers, changing the earnings/rates accordingly
    const {job, company, trelarFees, producerBillingType} = this.state;
    return (
      <View
        style={{
          marginTop: 8
        }}
      >
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Text
            style={styles.sectionTitle}
          >
            {translate("Financial Details")}
          </Text>
        </View>
        <View
          style={[{
            flexDirection: 'column',
            backgroundColor: '#FFF'
          }, styles.boxShadow]}>
          <View
            style={{
              padding: 16
            }}
          >
            <View>
              <Text style={[styles.superTitle, {color: 'black'}]}>
                {
                  (
                  producerBillingType === 'Excluded'
                  ) ? TFormat.asMoneyByRate(job.rateType, job.rate, job.rateEstimate)
                    : TFormat.asMoneyByRate(job.rateType, job.rate - trelarFees.perTonPerHourFee, job.rateEstimate)
                }
                &nbsp;{translate('Potential Earnings')}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row'
              }}>
              <Text style={[styles.superTitle, {flex: 0.33}]}>
                {
                  (
                    producerBillingType === 'Excluded'
                  ) ? TFormat.asMoney(job.rate)
                    : TFormat.asMoney(job.rate - trelarFees.perTonPerHourFee)
                } / {job.rateType}
              </Text>
              <Text style={[styles.subtitle, {flex: 0.33}]}>
                {NumberFormatting.asMoney(job.rateEstimate, '.', 2, ',', '')} {job.rateType}(s)
              </Text>
              {/*<Text style={[styles.subtitle, {flex: 0.33}]}>*/}
              {/*  Price per mile*/}
              {/*</Text>*/}
            </View>
          </View>
        </View>
      </View>
    );
  }

  renderNotesBlock() {
    const {job, profile} = this.state;
    return (
      <View
        style={{
          marginTop: 8
        }}
      >
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Text
            style={styles.sectionTitle}
          >
            {translate("Public Notes")}
          </Text>
        </View>
        <View
          style={[{
            flexDirection: 'column',
            backgroundColor: '#FFF'
          }, styles.boxShadow]}>
          <View
            style={{
              padding: 16
            }}
          >
            <View
              style={{
                flexDirection: 'row'
              }}>
              <Text style={styles.subtitle}>
                {
                  job.notes ? job.notes : `${translate("JOB_WITHOUT_COMMENTS")}`
                }
              </Text>
            </View>
          </View>
        </View>
        {((job.status === 'Booked'
          || job.status === 'Allocated'
          || job.status === 'In Progress'
          || job.status === 'Paused'
          || job.status === 'Job Ended'
          || job.status === 'Job Completed') || (profile.companyType === 'Customer')) && (
          <React.Fragment>
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Text
                style={styles.sectionTitle}
              >
                {translate("Private Notes")}
              </Text>
            </View>
            <View
              style={[{
                flexDirection: 'column',
                backgroundColor: '#FFF'
              }, styles.boxShadow]}>
              <View
                style={{
                  padding: 16
                }}
              >
                <View
                  style={{
                    flexDirection: 'row'
                  }}>
                  <Text style={styles.subtitle}>
                    {
                      job.privateNotes ? job.privateNotes : `${translate("JOB_WITHOUT_PRIVATE_COMMENTS")}`
                    }
                  </Text>
                </View>
              </View>
            </View>
          </React.Fragment>
        )}
      </View>
    );
  }

  renderLoadHistoryBlock() {
    const {job, isLoading, allLoads} = this.state;
    return (
      <View
        style={{
          marginTop: 8,
          marginBottom: 8
        }}
      >
        <Text style={styles.sectionTitle}>{translate("Total Load History")}</Text>
        <FlatList
          renderItem={({item, index}) => this.renderLoad(item, allLoads.length - index)}
          data={Object.values(allLoads)}
          extraData='Asc'
          keyExtractor={item => `list-item-${item.id}`}
          onRefresh={this.handleUpdateLoads}
          refreshing={isLoading}
          style={styles.jobList}
        />
      </View>
    );
  }

  renderSection1() {
    const {job} = this.state;
    return (
      <View style={styles.section1}>
        <View style={styles.section1a}>
          <View style={styles.cardContainer}>
            <View style={styles.section1aTitle}>
              <Text>
                ${job.rate} per {job.rateType}
              </Text>
            </View>
            <Text style={styles.section1aDetails}>
              Estimated {job.rateType} - {job.rateEstimate}
            </Text>

          </View>
        </View>
        <View style={styles.section1b}>
          <View style={[styles.cardContainer, styles.incomeCard]}>
            {TFormat.asMoney(job.rate * job.rateEstimate, styles.incomeTotal)}
            <Text style={styles.estimatedIncome}>
              {translate('Potential Earnings')}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  renderJobDetails() {
    const {profile} = this.state;
    return (
      <View style={styles.section1}>
        <View style={[styles.cardContainer, {width: '100%'}]}>
          <View style={{
            marginBottom: 7,
            padding: 7,
            borderBottomWidth: 4.5,
            borderBottomColor: 'rgb(148,189,200)'
          }}>
            <Text>{translate('Job Details')}</Text>
          </View>
          <View>
            <Text style={styles.dateHeader}>
              {TFormat.asDateOrdinal('', profile.timeZone)}
            </Text>
          </View>
          {this.renderJobDetailsMap()}
        </View>
      </View>
    );

  }

  renderJobDetailsMap() {
    const {
      startAddress,
      endAddress
    } = this.state;


    if (startAddress && endAddress) {
      return (
        <View>
          <TMap
            startAddress={startAddress}
            endAddress={endAddress}
            trackings={[]}
          />
        </View>
      )
    }
    /**/
    return (
      <Text>
        Map not available
      </Text>
    )
  }

  handleStartAddressRoute() {
    const {startAddress} = {...this.state};

    const scheme = Platform.select({ios: 'http://maps.apple.com/?address=', android: 'geo:0,0?q='});
    const latLng = `${startAddress.latitude},${startAddress.longitude}`;
    const label = "Start Address";
    const address = `${startAddress.address1},${startAddress.city},${startAddress.state},${startAddress.zipCode}`
    const addressReplaced = address.split(' ').join('+');
    const url = Platform.select({
      ios: `${scheme}${addressReplaced}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          const browser_url = `https://www.google.com/maps/place/${addressReplaced}`;
          return Linking.openURL(browser_url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('error', err));
  }

  handleEndAddressRoute() {
    const {endAddress} = {...this.state};

    const scheme = Platform.select({ios: 'http://maps.apple.com/?address=', android: 'geo:0,0?q='});
    const latLng = `${endAddress.latitude},${endAddress.longitude}`;
    const label = "Start Address";
    const address = `${endAddress.address1},${endAddress.city},${endAddress.state},${endAddress.zipCode}`
    const addressReplaced = address.split(' ').join('+');
    const url = Platform.select({
      ios: `${scheme}${addressReplaced}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          const browser_url = `https://www.google.com/maps/place/${addressReplaced}`;
          return Linking.openURL(browser_url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('error', err));
  }

  renderAddresses() {
    const {job} = this.state;
    return (
      <View style={[styles.cardContainer, {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'stretch',
        width: '100%',
        padding: 7
      }]}>
        <View style={[{width: '50%', padding: 5,}]}>
          <Text style={{
            flex: 1,
            borderBottomWidth: 4.5,
            borderBottomColor: 'rgb(207,227,232)'
          }}>{translate('Start Location')}</Text>
          {this.state.startAddress && (
            <TouchableHighlight
              onPress={this.handleStartAddressRoute}
              underlayColor='rgb(255,255,255)'
            >
              <View>
                <Text style={{textDecorationLine: 'underline'}}>{this.state.startAddress.address1},</Text>
                <Text
                  style={{textDecorationLine: 'underline'}}>{this.state.startAddress.city}, {this.state.startAddress.state}, {this.state.startAddress.zipCode}
                </Text>
              </View>
            </TouchableHighlight>
          )}
          {!this.state.startAddress && (
            <View>
              <Text>Start address not available.</Text>
            </View>
          )}
        </View>
        <View style={[{width: '50%', padding: 5,}]}>
          <Text style={{
            flex: 1,
            borderBottomWidth: 4.5,
            borderBottomColor: 'rgb(207,227,232)',
          }}>{translate('End Location')}</Text>
          {this.state.endAddress && (
            <TouchableHighlight
              onPress={this.handleEndAddressRoute}
              underlayColor='rgb(255,255,255)'
            >
              <View>
                <Text style={{textDecorationLine: 'underline'}}>{this.state.endAddress.address1},</Text>
                <Text
                  style={{textDecorationLine: 'underline'}}>{this.state.endAddress.city}, {this.state.endAddress.state}, {this.state.endAddress.zipCode}</Text>
              </View>
            </TouchableHighlight>
          )
          }
          {!this.state.endAddress && (
            <View>
              <Text>End address not available.</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  renderMaterials() {
    const {materials} = this.state;
    return (
      <View style={[styles.cardContainer, {width: '100%'}]}>
        <View style={styles.columnBox}>
          <Text style={styles.titleBox}>Materials </Text>
          <Text>
            {this.jobMaterialsAsString(materials)}
          </Text>
        </View>
      </View>
    );
  }

  renderDriverInfo() {
    const {driverUser, job, profile} = this.state;
    return (
      <View style={styles.section1}>
        {driverUser && (
          <View style={[styles.cardContainer, {width: '100%', padding: 7}]}>
            <View style={{
              marginBottom: 10,
              paddingBottom: 7,
              borderBottomWidth: 4.5,
              borderBottomColor: 'rgb(207,227,232)'
            }}>
              <Text styles={styles.titleBox}>
                Dispatcher Details:
              </Text>
            </View>
            <View style={[styles.containerBox, {flexDirection: 'column'}]}>
              <Text>Name: {driverUser.firstName} {driverUser.lastName}</Text>
              <Text>Cell Number: {TFormat.mobilePhone(driverUser.mobilePhone)}</Text>
              <Text>Email: {TFormat.mobileEmail(driverUser.email)}</Text>
            </View>
            <View style={{flexDirection: 'row', padding: 10}}>
              {/*<Text style={{paddingTop: 10}}>Here we put the list of materials</Text>*/}
              {/*</View>*/}
            </View>
          </View>
        )}
      </View>
    );
  }

  renderNotes() {
    const {job} = this.state;
    return (
      <React.Fragment>
        <Text>{translate('Customer Comments')}</Text>
        <View style={[styles.section1, {paddingTop: 5}]}>
          <View style={[styles.cardContainer, {width: '100%'}]}>
            <View style={{padding: 5}}>
              <Text>{job.notes}</Text>
            </View>
          </View>
        </View>
      </React.Fragment>
    );
  }


  renderTotalTonsHours() {
    const {job, allLoads, tonsDelivered, hoursDelivered, bookingInvoices, profile} = this.state;
    return (
      <React.Fragment>
        {profile.isAdmin && (
          job.status !== 'Published And Offered'
          && job.status !== 'On Offer'
          && job.status !== 'Published'
        ) && (
          <React.Fragment>
            {job.rateType === 'Ton' && (
              <View style={styles.section1}>
                <View style={[styles.cardContainer, {width: '100%'}]}>
                  <View style={{padding: 5}}>
                    <Text>Total Tons Delivered: {tonsDelivered} out of {job.rateEstimate} estimated tons</Text>
                  </View>
                </View>
              </View>
            )}
            {job.rateType === 'Hour' && (
              <View style={styles.section1}>
                <View style={[styles.cardContainer, {width: '100%'}]}>
                  <View style={{padding: 5}}>
                    <Text>Total Hours Worked: {hoursDelivered} out of {job.rateEstimate} estimated hours</Text>
                    <Text>Total Tons Delivered: {tonsDelivered} tons</Text>
                  </View>
                </View>
              </View>
            )}
            {job.status === 'Job Completed' && (
              <View style={styles.section1}>
                <View style={[styles.cardContainer, {width: '100%'}]}>
                  <View style={{padding: 5}}>
                    <Text>Total Earned: {TFormat.asMoney(Math.round(job.rateTotal * 100) / 100)}</Text>
                    {bookingInvoices && bookingInvoices.length > 0 && (
                      <View>
                        <Text>Images</Text>
                        <View style={{flexDirection: 'row'}}>
                          {bookingInvoices.map(bookingInvoice => {
                            return this.renderPickedImage(bookingInvoice.image);
                          })}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }

  renderMultiUploader() {
    return (
      <React.Fragment>
        <Text>Take Photo of Ticket</Text>
        <View style={[styles.section1, {paddingTop: 5}]}>
          <View style={[styles.cardContainer, {width: '100%'}]}>
            <View style={{padding: 5}}>
              <TMultiImageUploader/>
            </View>
          </View>
        </View>
      </React.Fragment>
    );
  }

  renderBookingInfo() {
    const {booking} = this.state;
    return (
      <View>
        {booking && (
          <View>
            <Text>Ticket Number</Text>
            <Text>{booking.ticketNumber}</Text>
          </View>
        )}
      </View>
    )
  }

  renderBookingEquipmentInfo() {
    const {job, bookingEquipment} = this.state;
    return (
      <View>
        {bookingEquipment && (
          <View>
            <Text>Hours Worked</Text>
            <Text>{bookingEquipment.rateActual}</Text>
          </View>
        )}
        <Text>Total Earned</Text>
        <Text>{Math.round(job.rateTotal * 100) / 100}</Text>
      </View>
    );
  }

  renderBookingInvoicesInfo() {
    const {bookingInvoices} = this.state;
    return (
      <View>
        {bookingInvoices && bookingInvoices.length > 0 && (
          <View>
            <Text>Images</Text>
            <View style={{flexDirection: 'row'}}>
              {bookingInvoices.map(bookingInvoice => {
                return this.renderPickedImage(bookingInvoice.image);
              })}
            </View>
          </View>
        )}
      </View>
    )
  }

  renderPickedImage(image) {
    return (
      <View key={image} style={{padding: 5}}>
        <Image
          source={{uri: image}}
          style={{width: 50, height: 50, borderWidth: 1, borderColor: 'gray'}}
        />
      </View>
    )
  }

  renderJobCompletedInfo() {
    return (
      <View>
        {this.renderBookingInfo()}
        {this.renderBookingEquipmentInfo()}
        {this.renderBookingInvoicesInfo()}
      </View>
    )
  }

  renderLoad(item, index) {
    const { profile, job } = this.state;
    return (
      <LoadItem jobName={job.name} load={item} index={index} profile={profile}/>
    );
  }

  renderCancelRequestConfirmation() {
    const {
      modalCancelRequest,
      actionLoader
    } = this.state;

    if (modalCancelRequest) {
      return (
        <Overlay
          isVisible={modalCancelRequest}
          onBackdropPress={() => this.setState({modalCancelRequest: false})}
          height="auto"
        >
          <View>
            <View>
              <View>
                <Text h4>Request Cancellation</Text>
              </View>
            </View>
            <ScrollView style={{maxHeight: (Dimensions.get('window').height - 180)}}>
              <View>
                <Text>
                  Are you sure you want to cancel your request for this job?
                </Text>
              </View>
            </ScrollView>
            <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
                <Button
                  title="Cancel Request"
                  loading={actionLoader}
                  onPress={() => {
                    this.setState({actionLoader: true});
                    this.handleJobClick('Cancel Request');
                    this.setState({modalCancelRequest: false});
                  }
                  }
                />
              <Button
                type="outline"
                title={translate('Close')}
                onPress={() => this.setState({modalCancelRequest: false})}
              />
            </View>
          </View>
        </Overlay>
      );
    }
    return null;
  }

  renderLiabilityConfirmation() {
    const {
      modalLiability,
      job,
      bid,
      company,
      companyCarrier,
      actionLoader,
      favoriteCompany
    } = this.state;
    let action = "";

    const companyProducer = company;

    if ((job.status === 'Published And Offered' || job.status === 'Published')
      && favoriteCompany.length === 0) {
      action = 'Request';
    }
    if ((job.status === 'On Offer' || job.status === 'Published And Offered' || job.status === 'Published')
      && (favoriteCompany.length > 0 || (bid && bid.hasCustomerAccepted === 1 && bid.status === 'Pending'))
      || (bid !== null && bid.status === 'Pending'
        && bid.hasCustomerAccepted === 1 && bid.hasSchedulerAccepted === 0) // Customer Requested this Carrier (via Carrier Search)
    ) {
      action = 'Accept';
    }

    if (modalLiability) {
      return (
        <Overlay
          isVisible={modalLiability}
          onBackdropPress={() => this.setState({modalLiability: false})}
          height="auto"
        >
          <View>
            <View>
              <View>
                <Text h4>Liability Insurance</Text>
              </View>
            </View>
            <ScrollView style={{maxHeight: (Dimensions.get('window').height - 180)}}>
              <View>
                <Text style={{textAlign: 'justify'}}>
                  This job requires a minimum&nbsp;
                  {TFormat.asMoneyNoDecimals(companyProducer.liabilityGeneral)} of
                  General Liability Insurance and&nbsp;
                  {TFormat.asMoneyNoDecimals(companyProducer.liabilityAuto)} of Auto
                  Liability Insurance. Our records show that you have&nbsp;
                  {TFormat.asMoneyNoDecimals(companyCarrier.liabilityGeneral)} of General
                  Liability Insurance and&nbsp;
                  {TFormat.asMoneyNoDecimals(companyCarrier.liabilityAuto)}&nbsp;
                  of Auto Liability Insurance.
                </Text>
                <Text style={{textAlign: 'justify'}}>
                  You risk being rejected by {companyProducer.legalName} due to your
                  insurance levels. If you have updated your insurance levels please
                  contact Trelar Support: {TFormat.mobileEmail('csr@trelar.com')}.
                </Text>
                <Text>
                  Are you sure you want to {action.toLowerCase()} this job?
                </Text>
              </View>
            </ScrollView>
            <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
              {action.length > 0 && action === 'Request' && (
                <Button
                  title="Request Job"
                  loading={actionLoader}
                  onPress={() => {
                    this.setState({actionLoader: true});
                    this.handleJobClick('Request');
                    this.setState({modalLiability: false});
                  }
                  }
                />
              )}
              {action.length > 0 && action === 'Accept' && (
                <Button
                  title="Accept Job"
                  loading={actionLoader}
                  onPress={() => {
                    this.setState({actionLoader: true});
                    this.handleJobClick('Accept');
                    this.setState({modalLiability: false});
                  }
                  }
                />
              )}
              <Button
                type="outline"
                title={translate('Close')}
                onPress={() => this.setState({modalLiability: false})}
              />
            </View>
          </View>
        </Overlay>
      );
    }
    return null;
  }

  renderCancelCarrierModal() {
    const {
      modalCarrierCancel,
      actionLoader,
      job,
      company,
      cancelReason,
      approveCancelReason,
      showLateCancelNotice,
      carrierCancelReasons,
      cancelError
    } = this.state;
    let {showOtherReasonInput} = this.state;

    return (
      <Overlay
        isVisible={modalCarrierCancel}
        onBackdropPress={() => this.setState({modalCarrierCancel: false})}
        height="auto"
      >
        <View>
          <View>
            <View>
              <Text h4>Cancel Job</Text>
            </View>
          </View>
          <ScrollView style={{maxHeight: (Dimensions.get('window').height - 180)}}>
            <View>
              <Text>Are you sure you want to cancel this job [{job.name}]?</Text>
            </View>
            <View style={{display: showLateCancelNotice ? null : 'none'}}>
              <Text style={{color:'red'}}>You are canceling this job after 3pm the previous day of a job.
              If you cancel short notice too many times on a posting that is posted
              before 3pm the day before a job, you may face suspension from
              the platform and a Trelar CSR will be in contact with you.</Text>
            </View>
            <View>
              <Text style={styles.label}>Reason for cancelling (This will be shared with the producer {company.legalName} who posted this job)</Text>
              <MultiSelect
                style={{}}
                items={carrierCancelReasons}
                uniqueKey="id"
                onSelectedItemsChange={(item) => {
                  if (item[0] === 'Other') {
                    showOtherReasonInput = true;
                  } else {
                    showOtherReasonInput = false;
                  }
                  this.setState({ cancelReason: item[0], showOtherReasonInput, cancelError: '' });
                }}
                fixedHeight={false}
                selectedItems={[cancelReason]}
                selectText={cancelReason}
                single={true}
                searchInputPlaceholderText="Select a reason..."
                fontFamily='Interstate-Regular'
                tagRemoveIconColor='rgb(102, 102, 102)'
                tagBorderColor='rgb(102, 102, 102)'
                textColor='#000'
                tagTextColor='#000'
                selectedItemTextColor='#000'
                selectedItemIconColor='rgb(102, 102, 102)'
                itemTextColor='#000'
                searchInputStyle={{color: 'rgb(102, 102, 102)'}}
                submitButtonColor='rgb(102, 102, 102)'
                submitButtonText="Submit"
              />
            </View>
          <View style={{display: showOtherReasonInput ? 'flex' : 'none'}}>
            <Input
              style={styles.input}
              value={approveCancelReason}
              maxLength={45}
              placeholder="Reason of your cancellation"
              placeholderTextStyle={{color: 'orange'}}
              onChangeText={(approveCancelReason) => this.setState({approveCancelReason, cancelError: ''})}
            />
          </View>
          </ScrollView>
          <View>
            <Text style={styles.errorText}>{cancelError}</Text>
          </View>
          <View style={{paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
            <Button
              title={translate('Yes')}
              loading={actionLoader}
              onPress={() => {
                this.handleCarrierCancelJob();
              }}
            />
            <Button
              type="outline"
              title={translate('No')}
              onPress={() => {
                this.setState({modalCarrierCancel: false});
              }}
            />
          </View>
        </View>
      </Overlay>
    );
  }

  render() {
    const {job, isLoading, allLoads, profile, booking} = this.state;
    if (isLoading) {
      return (
        <View style={{flex: 1, padding: 20, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
          <ActivityIndicator size="large"/>
        </View>
      )
    }

    return (
      <ThemeProvider theme={theme}>
        {this.renderOtherJobInProgressModal()}
        {/*{this.renderAllocateDriversOverlay()}*/}
        {this.renderCancelCarrierModal()}
        {this.renderLiabilityConfirmation()}
        {this.renderCancelRequestConfirmation()}
        <ScrollView style={{backgroundColor: 'rgb(230,230,225)'}}>
          <View style={styles.container}>
            {this.renderStatusBlock()}
            {((job.status === 'Booked' || job.status === 'Allocated' || job.status === 'In Progress')
            && profile.companyType === 'Carrier' && profile.isAdmin)
            && <JobAllocate profile={profile} booking={booking} job={job} />
            }
            {
              profile.isAdmin &&
              this.renderFinancialDetailsBlock()
            }
            {this.renderJobDetailsBlock()}
            {
              job.status === 'Job Completed' ?
                this.renderPickupAndDeliveryBlock()
                : this.renderWhenAndWhereBlock()
            }
            {this.renderNotesBlock()}
            {((job.status === 'Booked' || job.status === 'Allocated' || job.status === 'In Progress' ||
              job.status === 'Job Ended' || job.status === 'Job Completed' || job.status === 'Paused') && allLoads.length > 0) &&
            this.renderLoadHistoryBlock()
            }

            {/* <Text style={styles.superTitle}>{translate(job.status)}</Text> */}
            {!isLoading && (
              <View>
                {/* this.renderHeaders() */}
                <View style={styles.detailsSection}>
                  {/*this.renderSection1()*/}
                  {/*this.renderJobDetails()*/}
                  {/*this.renderAddresses()*/}
                  {/*this.renderMaterials()*/}
                  {/* {this.renderDriverInfo() }*/}
                  {/*this.renderNotes()*/}

                  {/*((job.status === 'Booked' || job.status === 'Allocated' || job.status === 'In Progress' ||
                    job.status === 'Job Completed') && allLoads.length > 0) &&
                  <View>
                    <Text style={styles.sectionTitle}>Load History</Text>
                    <FlatList
                      renderItem={({item, index}) => this.renderLoad(item, index + 1)}
                      data={Object.values(allLoads)}
                      extraData='Asc'
                      keyExtractor={item => `list-item-${item.id}`}
                      onRefresh={this.handleUpdateLoads}
                      refreshing={isLoading}
                      style={styles.jobList}
                    />
                  </View>
            */}
                  {/* job.status === 'Job Completed' && this.renderJobCompletedInfo() */}


                  {/*{(job.status === 'Booked' || job.status === 'Allocated' || job.status === 'In Progress' ||*/}
                  {/*  job.status === 'Job Completed') && this.renderLoads()}*/}
                  {/*this.renderTotalTonsHours()*/}
                </View>
              </View>
            )}
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              {/* Hiding 'Close' button since we have a Back button on the top, and to give more space to the buttons area */}
              {/* <View style={{paddingLeft: 7}}>
                  <Button
                  type="outline"
                  title={translate('Close')}
                  onPress={() => {
                    NavigationService.navigate('Drawer');
                  }}/>
                  </View> */}
            </View>

          </View>
        </ScrollView>
      </ThemeProvider>
    );
  }
}

JobDetailsPage.propTypes = {
  screenProps: PropTypes.object
};

export default JobDetailsPage;
