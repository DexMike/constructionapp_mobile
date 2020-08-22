import React, {Component} from 'react';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import {ActivityIndicator, Text, StyleSheet, TextInput, View, ScrollView} from 'react-native';
// import {Link} from 'react-router-native';
import {Button, Input, ThemeProvider} from 'react-native-elements';
import TMultiImageUploader from './common/TMultiImageUploader';
import ConfigProperties from '../ConfigProperties';
import LoadInvoiceService from '../api/LoadInvoiceService';
import styles from './shared.style';
import LoadService from '../api/LoadService';
import NavigationService from '../service/NavigationService';
import ProfileService from '../api/ProfileService';
import ShiftService from '../api/ShiftService';
import {translate} from "../i18n";
import TFormat from "./common/TFormat";
import Icon from 'react-native-vector-icons/MaterialIcons';
import JobService from '../api/JobService';
import GPSTrackingService from '../api/GPSTrackingService';
import NumberFormatting from '../utils/NumberFormatting';

class LoadCompletedPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      load: null,
      jobId: null,
      bookingId: null,
      job: {},
      booking: null,
      loadRateType: '',
      ticketNumber: '',
      error: '',
      hoursWorked: '',
      minutesWorked: '',
      tonsMoved: '',
      startUpload: false,
      invoiceImages: [],
      isUploading: false,
      driversShift: false,
      driversLastLoad: false,
      profile: {}
    };
    this.updateInvoiceImages = this.updateInvoiceImages.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.handleReturningLoad = this.handleReturningLoad.bind(this);
    this.handleReturnToJobList = this.handleReturnToJobList.bind(this);
  }

  validateForm() {
    const {ticketNumber, loadRateType, hoursWorked, minutesWorked, tonsMoved} = {...this.state};
    const images = this.refs.imageUploadChild.getImageUploadNum();
    if (images.length === 0 || ticketNumber === '' || (loadRateType === 'Hour' && (hoursWorked === '' || minutesWorked === ''))
      || tonsMoved === '') {
      this.setState({
        error: 'Please fill all fields and upload a ticket before submitting.',
        isUploading: false
      });
      return false;
    }
    this.setState({error: ''});
    return true;
  }

  async componentDidMount() {
    let {load, booking, driversShift, profile, job} = this.state;
    try {
      const {params} = NavigationService.getCurrentRoute();
      const id = params.id;
      const jobId = params.jobId;
      const bookingId = params.bookingId;
      // const id = 389;
      try {
        load = await LoadService.getLoadById(id);
        job = await JobService.getJobById(jobId);
      } catch (err) {
        console.error(err);
      }
      /* if (load) { // we do not need the Booking
        booking = await BookingService.getBookingById(load.bookingEquipmentId);
        if (booking && booking.length > 0) {
          booking = booking[0];
        }
      } */
      // load.loadStatus = 'Ended';
      // load.endTime = new Date();
      // load = await LoadService.updateLoad(load);
      this.props.screenProps.setReloadJobs(true);
      const loadRateType = load.rateType;
      profile = await ProfileService.getProfile();
      driversShift = await ShiftService.isDriverOnShift(profile.driverId);

      this.setState({
        isLoading: false,
        load,
        jobId,
        job,
        bookingId,
        // booking,
        loadRateType,
        driversShift
      });
    } catch (err) {
      console.error(err);
    }
  }

  async updateInvoiceImages(imageKeys) {
    const configObject = ConfigProperties.instance.getEnv();
    const API_UPLOADS_ENDPOINT = configObject.AWS_UPLOADS_ENDPOINT;
    const {
      job,
      bookingId,
      load,
      loadRateType,
      ticketNumber,
      hoursWorked,
      minutesWorked,
      tonsMoved,
      driversShift,
      profile
    } = this.state;
    const invoiceImages = [];
    let driversLastLoad = false;

    for (const imageKey of imageKeys) {
      invoiceImages.push(`${API_UPLOADS_ENDPOINT}/public/${imageKey}`);
    }
    // 1 update Load Invoices
    const loadInvoices = invoiceImages.map(invoiceImage => {
      return {
        loadId: load.id,
        image: invoiceImage
      }
    }, load);
    if (loadInvoices.length > 0) {
      await LoadInvoiceService.createLoadInvoices(loadInvoices);
    }

    if (job.status === 'Job Ended' || job.status === 'Job Completed' || job.status === 'Paused') {
      const { toggleGeoLocation } = this.props.screenProps;
      driversLastLoad = true;

      // check if this is this job's last in progress load
      let allLoads = await LoadService.getLoadsByBookingId(bookingId);
      if (allLoads && Object.keys(allLoads).length > 0 && job.status !== 'Paused') {
        allLoads = allLoads.filter(load => load.loadStatus !== 'Submitted');
        if (allLoads.length === 1) { // there's only one load in progress (last load)
          let newJob = CloneDeep(job);
          newJob.status = 'Job Completed';
          newJob.actualEndTime = moment.utc().format();
          newJob.modifiedOn = moment.utc().format();
          newJob.modifiedBy = profile.userId;
          try {
            newJob = await JobService.updateJob(newJob);
          } catch (err) {
            console.error(err);
          }
        }
      }

      load.loadStatus = 'Submitted';
      load.ticketNumber = ticketNumber;
      if (loadRateType === 'Hour') {
        load.hoursEntered = parseInt(hoursWorked) + (Math.floor((minutesWorked / 60) * 100) / 100);
      }
      load.tonsEntered = tonsMoved;
      load.endTime = moment.utc().format();
      load.modifiedOn = moment.utc().format();
      load.modifiedBy = profile.userId;

      // get actual distance
      const route = await GPSTrackingService.getDistanceByLoadId(load.id);
      const distance = route.distance;
      load.actualTravelDistance = ((distance / 1.609) / 1000);

      load.jobRate = job.rate;

      try {
        const response = await LoadService.updateLoad(load);
      } catch (err) {
        console.error(err);
      }

      toggleGeoLocation(true, driversShift.id, null);
    } else {
      load.loadStatus = 'Submitted';
      load.ticketNumber = ticketNumber;
      if (loadRateType === 'Hour') {
        load.hoursEntered = parseInt(hoursWorked) + (Math.floor((minutesWorked / 60) * 100) / 100);
      }
      load.tonsEntered = tonsMoved;
      load.endTime = moment.utc().format();
      load.modifiedOn = moment.utc().format();
      load.modifiedBy = profile.userId;
      try {
        await LoadService.updateLoad(load);
      } catch (err) {
        console.error(err);
      }
    }

    this.props.screenProps.setReloadJobs(true);
    this.setState({invoiceImages, load, driversLastLoad});
  }

  async handleSubmit() {
    if (this.validateForm()) {
      this.setState({startUpload: true, isUploading: true});
    }
  }

  async handleReturningLoad() {
    const {
      load,
      driversShift,
      bookingEquipment,
      profile,
      jobId,
      job
    } = this.state;

    load.loadStatus = 'Returning';
    load.modifiedOn = moment.utc().format();
    load.returnStartedDate = moment.utc().format();
    load.modifiedBy = profile.userId;
    try {
      const response = await LoadService.updateLoad(load);
    } catch (err) {
      console.error(err);
    }
    NavigationService.navigate('JobDetailsPage', {
      itemId: jobId,
      jobName: job.name
    });
    this.props.screenProps.setReloadLoads(true);
  }

  async handleReturnToJobList() {
    const {toggleGeoLocation} = this.props.screenProps;
    const { job, driversShift, load, profile, driversLastLoad } = this.state;

    if (driversLastLoad) {
      this.props.screenProps.setReloadLoads(true);
      this.props.screenProps.setReloadJobs(true);
      NavigationService.navigate('Drawer');
    } else {
      load.loadStatus = 'Submitted';
      load.endTime = moment.utc().format();
      load.modifiedOn = moment.utc().format();
      load.modifiedBy = profile.userId;

      // get actual distance
      const route = await GPSTrackingService.getDistanceByLoadId(load.id);
      const distance = route.distance;
      load.actualTravelDistance = ((distance / 1.609) / 1000);

      load.jobRate = job.rate;

      try {
        const response = await LoadService.updateLoad(load);
      } catch (err) {
        console.error(err);
      }

      toggleGeoLocation(true, driversShift.id, null);
      this.props.screenProps.setReloadLoads(true);
      this.props.screenProps.setReloadJobs(true);
      NavigationService.navigate('Drawer');
    }
  }

  renderLoadError() {
    return (
      <View>
        <Text
          style={{
            color: 'rgb(37,100,119)',
            padding: 10
          }}
        >
          No job found, please contact customer support.
        </Text>
        {this.renderButtons()}
      </View>
    );
  }

  renderCompleteForm() {
    return (
      <View style={{flex: 1}}>
        <Text style={styles.sectionTitle}>
          Upload Ticket Image
        </Text>
        {this.renderMultiUploader()}
        <View
          style={{
            paddingTop: 15,
            borderBottomColor: 'rgb(203,203,203)',
            borderBottomWidth: 1,
          }}
        />
        {/*<View>*/}
        {/*  <Text style={styles.description}>*/}
        {/*    To complete this load, please complete the following information.*/}
        {/*  </Text>*/}
        {/*</View>*/}
        {this.renderCompleteFormSection()}
        {this.renderButtons(true)}
      </View>

    );
  }

  renderCompleted() {
    // const jobId = 252;
    const { load, loadRateType, invoiceImages, driversShift, driversLastLoad } = this.state;
    const uploadLength = (invoiceImages && invoiceImages.length) ? invoiceImages.length : 0;
    return (
      <View style={{flex: 1}}>
        <View>
          <Text style={styles.description}>
            Thank you! Load information has been successfully submitted to the customer for review.
          </Text>
          <View style={styles.inlineRow}>
            <Text style={styles.sectionTitle}>
              Ticket Number
            </Text>
            <Text style={styles.sectionTitle}>
              {load.ticketNumber}
            </Text>
          </View>
          {loadRateType === 'Hour' &&
          <View style={styles.inlineRow}>
            <Text style={styles.sectionTitle}>
              Hours Worked
            </Text>
            <Text style={styles.sectionTitle}>
              {TFormat.asHoursAndMinutes(load.hoursEntered)}
            </Text>
          </View>
          }
          <View style={styles.inlineRow}>
            <Text style={styles.sectionTitle}>
              Tons Hauled
            </Text>
            <Text style={styles.sectionTitle}>
              {NumberFormatting.asMoney(load.tonsEntered, '.', 2, ',', '')}
            </Text>
          </View>
          <Text style={styles.sectionTitle}>
            Uploaded {uploadLength} image(s)
          </Text>
        </View>
        <View style={[styles.bottomFloat, {'justify-content':'space-between'}]}>
          {!driversLastLoad && (
            <React.Fragment>
              <Button
                buttonStyle={{
                  backgroundColor: '#006F54'
                }}
                onPress={this.handleReturningLoad}
                title={translate('New Load')}
              />
              <Button
                buttonStyle={{
                  backgroundColor: '#006F54'
                }}
                onPress={this.handleReturnToJobList}
                title={translate('Done with this Job')}
              />
            </React.Fragment>
          )}
          {driversLastLoad && (
            <Button
              buttonStyle={{
                backgroundColor: '#006F54'
              }}
              onPress={this.handleReturnToJobList}
              title={translate('Return to Job List')}
            />
          )}
        </View>
      </View>
    );
  }

  renderCompleteFormSection() {
    const {loadRateType, ticketNumber, hoursWorked, tonsMoved, minutesWorked} = this.state;
    return (
      <View>
        <View styles={styles.inlineRow}>
          <Text style={styles.sectionTitle}>
            Ticket #
          </Text>
          <Input
            style={styles.input}
            value={ticketNumber}
            maxLength={45}
            placeholder="Please enter the ticket number"
            placeholderTextStyle={{color: 'orange'}}
            onChangeText={(ticketNumber) => this.setState({ticketNumber, error: ''})}
            leftIcon={(<Icon name="confirmation-number" size={20} color='rgb(102,102,102)'/>
            )}
            leftIconContainerStyle={styles.inputRegularIconContainer}
          />
        </View>
        {loadRateType === 'Hour' &&
        <View styles={styles.inlineRow}>
          <Text style={styles.sectionTitle}>Hours Worked</Text>
          <View style={{flexDirection: 'row'}}>
            <View style={{
              flex: 1,
              flexDirection: 'column',
              paddingRight: 15
            }}>
              <Input
                style={styles.input}
                onChangeText={(hoursWorked) => {
                  this.setState({hoursWorked: hoursWorked.replace(/\D/g, ''), error: ''})
                }}
                value={hoursWorked}
                maxLength={3}
                placeholder="hours"
                keyboardType="number-pad"
                returnKeyType="done"
                leftIcon={(<Icon name="schedule" size={20} color='rgb(102,102,102)'/>
                )}
                leftIconContainerStyle={styles.inputRegularIconContainer}
              />
            </View>
            <View style={{
              flex: 1,
              flexDirection: 'column',
            }}>
              <Input
                style={styles.input}
                onChangeText={(minutesWorked) => {
                  if (minutesWorked === "" || parseInt(minutesWorked.replace(/\D/g, '')) <= 60) {
                    this.setState({minutesWorked: minutesWorked.replace(/\D/g, ''), error: ''})
                  }
                }}
                value={minutesWorked}
                maxLength={3}
                placeholder="minutes"
                keyboardType="number-pad"
                returnKeyType="done"
              />
            </View>
          </View>
        </View>
        }
        <View styles={styles.inlineRow}>
          <Text style={styles.sectionTitle}>Tons Moved</Text>
          <Input
            style={styles.input}
            onChangeText={(tonsMoved) => this.setState({tonsMoved, error: ''})}
            value={tonsMoved}
            maxLength={5}
            placeholder="0.00"
            keyboardType="decimal-pad"
            returnKeyType="done"
            leftIcon={(<Icon name="landscape" size={20} color='rgb(102,102,102)'/>
            )}
            leftIconContainerStyle={styles.inputRegularIconContainer}
          />
        </View>
      </View>
    );
  }


  renderButtons(showSubmit) {
    const {params} = NavigationService.getCurrentRoute();
    // const jobId = 252;
    const {error, isUploading} = this.state;
    return (
      <View style={{flex: 1, justifyContent: 'flex-end', paddingTop: 50, paddingBottom: 50}}>
        <View>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          {/* <View>
            <Button
              title={translate('Cancel')}
              buttonStyle={{
                width: 100,
                backgroundColor: '#006F54'
              }}
              onPress={() => {
                NavigationService.navigate('JobDetailsPage', {
                  itemId: jobId,
                });
                this.props.screenProps.setReloadLoads(true);
              }}
            />
          </View> */}
          {showSubmit && (
            <View>
              <Button
                raised
                loading={isUploading}
                buttonStyle={{
                  width: 200,
                  backgroundColor: '#006F54'
                }}
                onPress={this.handleSubmit}
                title="SUBMIT TICKET"
                icon={
                  <Icon
                    name="call-made"
                    size={15}
                    color="white"
                    style={{paddingRight: 6}}
                  />
                }
              />
            </View>
          )}
        </View>
      </View>
    );
  }

  renderMultiUploader() {
    const {startUpload} = this.state;
    return (
      <View style={styles.mtFifteen}>
        <TMultiImageUploader
          startUpload={startUpload}
          buttonTitle={'SELECT IMAGE'}
          imagesUploadedHandler={this.updateInvoiceImages}
          ref="imageUploadChild"
        />
      </View>
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
          fontFamily: 'Interstate-Regular',
          // fontColor: 'yellow'
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

    // const {job, booking, isLoading} = this.state;
    const {load, isLoading} = this.state;
    if (isLoading) {
      return (
        <View style={{flex: 1, padding: 20, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
          <ActivityIndicator size="large"/>
        </View>
      )
    }
    return (
      <ThemeProvider theme={theme}>
        <ScrollView style={{flex: 1,
          backgroundColor: 'rgb(230, 230, 225)',
          padding: 24}}>
          {/*<Text style={styles.title}>*/}
          {/*  Load Completed: {this.props.id}*/}
          {/*</Text>*/}
          {!load && this.renderLoadError()}
          {load && (
            <ScrollView style={{flex: 1, paddingTop: 10}}>
              {(load.loadStatus !== 'Submitted') && this.renderCompleteForm()}
              {(load.loadStatus === 'Submitted') && this.renderCompleted()}
            </ScrollView>
          )}
        </ScrollView>
      </ThemeProvider>
    );
  }
}


export default LoadCompletedPage;
