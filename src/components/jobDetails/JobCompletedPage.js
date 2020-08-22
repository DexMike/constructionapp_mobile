import React, {Component} from 'react';
import {
  ActivityIndicator,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  View,
  TouchableOpacity
} from 'react-native';
import {
  Image
} from 'react-native-elements';
import JobService from '../../api/JobService';
import BookingService from '../../api/BookingService';
import {Button} from 'react-native-elements';
import TMultiImageUploader from '../common/TMultiImageUploader';
import ConfigProperties from '../../ConfigProperties';
import BookingInvoiceService from '../../api/BookingInvoiceService';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import styles from '../shared.style';
import NavigationService from '../../service/NavigationService';
import {translate} from "../../i18n";
import UserService from '../../api/UserService';
import CompanyService from '../../api/CompanyService';
import LoadService from '../../api/LoadService';
import LoadInvoiceService from '../../api/LoadInvoiceService';
import ProfileService from '../../api/ProfileService';
import Icon from "react-native-vector-icons/MaterialIcons";
import moment from 'moment';
import TFormat from "../common/TFormat";

class JobCompletedPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      job: null,
      booking: null,
      bookingEquipment: null,
      ticketNumber: '',
      startUpload: false,
      invoiceImages: [],
      carrier: [],
      tonsDelivered: 0,
      hoursDelivered: 0,
      allLoads: {},
      allLoadsInvoices: {},
      profile: null
    };

    this.updateInvoiceImages = this.updateInvoiceImages.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    // this.handleGoback = this.handleGoback.bind(this);
  }

  async componentDidMount() {
    let {
      job,
      carrier,
      booking,
      bookingEquipment,
      tonsDelivered,
      hoursDelivered,
      allLoads,
      allLoadsInvoices
    } = this.state;
    try {
      const profile = await ProfileService.getProfile();
      const {params} = NavigationService.getCurrentRoute();
      const jobId = params.id;
      job = await JobService.getJobById(jobId);
      if (job) {
        const bookings = await BookingService.getBookingsByJobId(job.id);
        if (bookings && bookings.length > 0) {
          booking = bookings[0];
        }
        carrier  = await CompanyService.getCompanyById(booking.schedulersCompanyId);
        const bookingEquipments = await BookingEquipmentService.getBookingEquipments();
        bookingEquipment = bookingEquipments.find(bookingEquipment => {
          return bookingEquipment.bookingId === booking.id;
        }, booking);

        allLoads = await LoadService.getLoadsByBookingId(booking.id);
        if (allLoads && allLoads.length > 0) {
          allLoads.map(function (load, i) {
            tonsDelivered += load.tonsEntered;
            hoursDelivered += load.hoursEntered;
          });
          allLoadsInvoices = await LoadInvoiceService.getLoadsInvoicesByBookingId(booking.id);
        }
      }

      
      // 1 update job
      job.status = 'Job Completed';
      if (job.rateType === 'Hour') {
        job.rateTotal = hoursDelivered * job.rate;
      } else {
        job.rateTotal = tonsDelivered * job.rate;
      }
      // 3 update bookingEquipment
      if (bookingEquipment) {
        bookingEquipment.rateActual = hoursDelivered;
      }
      const request = {
        job,
        bookingEquipment: bookingEquipment || null
      };

      JobService.completeJobAsCarrier(request);

      this.setState({
        isLoading: false,
        job,
        booking,
        bookingEquipment,
        tonsDelivered,
        hoursDelivered,
        allLoads,
        allLoadsInvoices,
        profile
      });
    } catch (err) {
      console.error(err);
    }
    this.props.screenProps.setReloadJobs(true);
  }

  handleInputChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  async updateInvoiceImages(imageKeys) {
    const configObject = ConfigProperties.instance.getEnv();
    const API_UPLOADS_ENDPOINT = configObject.AWS_UPLOADS_ENDPOINT;
    const {
      job,
      booking,
      ticketNumber,
      bookingEquipment,
      hoursDelivered,
      tonsDelivered
    } = this.state;
    const invoiceImages = [];
    for (const imageKey of imageKeys) {
      invoiceImages.push(`${API_UPLOADS_ENDPOINT}/public/${imageKey}`);
    }
    // 1 update job
    job.status = 'Job Completed';
    job.rateTotal = hoursDelivered * job.rate;
    // 2 update booking
    booking.ticketNumber = ticketNumber;
    // 3 update bookingEquipment
    if (bookingEquipment) {
      bookingEquipment.rateActual = hoursDelivered;
    }
    // 4 update bookingInvoices
    const bookingInvoices = invoiceImages.map(invoiceImage => {
      return {
        bookingId: booking.id,
        image: invoiceImage
      }
    }, booking);

    const request = {
      job,
      booking,
      bookingEquipment,
      bookingInvoices
    };

    try {
      JobService.completeJobAsCarrier(request);
    } catch (e) {
      console.error(e);
    }
    this.props.screenProps.setReloadJobs(true);
    this.setState({job, booking, invoiceImages});
  }

  async handleSubmit() {
    this.setState({startUpload: true});
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

  // async handleGoback() {
  //   this.props.history.goBack();
  // }


  renderJobError() {
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

  renderBookingError() {
    return (
      <View>
        <Text
          style={{
            color: 'rgb(37,100,119)',
            padding: 10
          }}
        >
          Your job isn't booked, please contact customer support.
        </Text>
        {this.renderButtons()}
      </View>
    );
  }

  renderCompleteForm() {
    return (
      <View style={{flex: 1}}>
        <View>
          <Text style={styles.description}>
            To complete this job, please complete the following information.
          </Text>
        </View>
        {this.renderCompleteFormSection()}
        {/* this.renderMultiUploader() */}
        {this.renderButtons(true)}
      </View>

    );
  }

  renderCompleted() {
    const {job, booking, bookingEquipment, /*invoiceImages, */tonsDelivered, hoursDelivered} = this.state;
    // const uploadLength = (invoiceImages && invoiceImages.length) ? invoiceImages.length : 0;
    return (
      <View style={{backgroundColor: '#E7E7E2'}}>
        {
          /*
          <View>
          <Text style={styles.description}>
            Thank you! Job information has been successfully submitted to the customer for review. Customer has 48 hours
            to review and approve before job is automatically marked as "Completed" and payment amount is final.
          </Text>
        </View>
          */
        }
        {/* <View style={styles.inlineRow}>
          <Text style={styles.subTitle}>
            Ticket Number
          </Text>
          <Text style={styles.subTitle}>
            {booking.ticketNumber}
          </Text>
        </View> */}
        <View
          style={{
            backgroundColor: '#FFF',
            padding: 16,
            marginTop: 16,
            elevation: 1,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 1
          }}>
          <View style={{flexDirection: 'row'}}>
            <View>
              <View
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 20,
                  backgroundColor: '#006F53',
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
            <View style={{
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
              <Text style={[componentStyles.title, {paddingLeft: 16, fontSize: 18}]} >
                Job Completed
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              paddingTop: 16
            }}>
            <View>
              <Text style={componentStyles.subtitle}>
              Thank you! Job information has been successfully submitted to the customer for review. Customer has 48 hours
              to review and approve before job is automatically marked as "Approved".
              </Text>
            </View>
          </View>

          <View style={{flexDirection: 'row-reverse', paddingTop: 16}}>
            <TouchableOpacity
              style={[componentStyles.button, componentStyles.actionButton]}
              onPress={() => {
                NavigationService.navigate('Drawer');
              }}
            >
              <Icon
                name="close"
                size={20}
                color="white"
              />
              <Text style={componentStyles.buttonLightText}>&nbsp;CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text
            style={{
              marginTop: 16,
              marginLeft: 16,
              marginBottom: 8
            }}
          >
            Job Summary
          </Text>
        <View
          style={{
            backgroundColor: '#FFF',
            elevation: 1,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 1
          }}>

          {job.rateType === 'Hour' && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomColor: '#F0F0ED',
                borderBottomWidth: 1
              }}>
              <View
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon
                  name='timer'
                  size={24}
                  color="#666666"
                />
              </View>
              <Text style={[componentStyles.subtitle, {padding: 16}]}>
                Hours worked
              </Text>
              <Text style={[componentStyles.title, {padding: 16, marginLeft: 'auto'}]}>
                {hoursDelivered}
              </Text>
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomColor: '#F0F0ED',
              borderBottomWidth: 1
            }}>
            <View
              style={{
                height: 40,
                width: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon
                name='landscape'
                size={24}
                color="#666666"
              />
            </View>
            <Text style={[componentStyles.subtitle, {padding: 16}]}>
              Tons hauled
            </Text>
            <Text style={[componentStyles.title, {padding: 16, marginLeft: 'auto'}]}>
              {tonsDelivered}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomColor: '#F0F0ED',
              borderBottomWidth: 1
            }}>
            <View
              style={{
                height: 40,
                width: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon
                name='local-atm'
                size={24}
                color="#666666"
              />
            </View>
            <Text style={[componentStyles.subtitle, {padding: 16}]}>
              Estimated Earnings
            </Text>
            <Text style={[componentStyles.title, {padding: 16, marginLeft: 'auto'}]}>
              $ {(Math.round(job.rateTotal * 100) / 100).toFixed(2)}
            </Text>
          </View>
        </View>
        <Text
            style={{
              marginTop: 16,
              marginLeft: 16,
              marginBottom: 8
            }}
          >
            Load History
          </Text>
        <View>
          {this.renderLoads()}
        </View>
        {
          /*
          {job.rateType === 'Hour' && (
          <View style={styles.inlineRow}>
            <Text style={styles.subTitle}>
              Hours Worked
            </Text>
            <Text style={styles.subTitle}>
              {hoursDelivered}
            </Text>
          </View>
        )}
        <View style={styles.inlineRow}>
          <Text style={styles.subTitle}>
            Tons Hauled
          </Text>
          <Text style={styles.subTitle}>
            {tonsDelivered}
          </Text>
        </View>
        <View style={styles.inlineRow}>
          <Text style={styles.subTitle}>
            Payment Amount
          </Text>
          <Text style={styles.subTitle}>
            ${Math.round(job.rateTotal * 100) / 100}
          </Text>
        </View>
        {/* <View>
          <Text style={styles.subTitle}>
            Uploaded {uploadLength} image(s)
          </Text>
        </View> * /}
          */
        }
        {
          /*
          <View style={{paddingBottom:30}}>
          <Text style={styles.subTitle}>
            Loads:
          </Text>
          <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems:'flex-start'}}>
            <Text style={{flex: 1, flexDirection: 'column'}}>Ticket Number:</Text>
            <Text style={{flex: 1, flexDirection: 'column'}}>Images:</Text>
          </View>

        </View>
        <View style={ styles.bottomFloat }>
          <Button
            buttonStyle={{
              backgroundColor: '#006F54'
            }}
            title={translate('Close')}
            onPress={() => {
            NavigationService.navigate('Drawer');
            }}
          />
        </View>
          */
        }

      </View>
    );
  }

  renderLoads(){
    const {allLoads, allLoadsInvoices, profile} = this.state;
    return (
      <React.Fragment>
        {allLoads.map(load => {
          return (
            <View
              style={{
                backgroundColor: '#FFF',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottomColor: '#F0F0ED',
                borderBottomWidth: 1,
                padding: 8
              }}>
                {
                  /*
                  <View
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon
                  name='local-shipping'
                  size={24}
                  color="#666666"
                />
              </View>
                  */
                }

              <Text>
                <Text style={componentStyles.title}>
                  Load #{load.ticketNumber}&nbsp;
                </Text>
                <Text style={[componentStyles.title, {color: '#666666'}]}>
                  @ {TFormat.asTime(load.startTime, profile.timeZone)} - {TFormat.asTime(load.endTime, profile.timeZone)}
                </Text>
                {"\n"}
                <Text style={[componentStyles.title, {fontSize:14}]}>
                  {load.tonsEntered} tons {load.hoursEntered && `- ${load.hoursEntered}h`}
                </Text>
                {"\n"}
                <Text style={componentStyles.subtitle}>
                  ticket #{load.ticketNumber}
                </Text>
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  marginLeft: 'auto'
                }}>
                {allLoadsInvoices && allLoadsInvoices.length > 0 && (
                  <React.Fragment>
                    {allLoadsInvoices.filter(loadInvoice => loadInvoice.loadId === load.id).map(loadInvoice => {
                      return this.renderPickedImage(loadInvoice.image);
                    })}
                  </React.Fragment>
                )}
              </View>
            </View>
          )
        })}
      </React.Fragment>
    )
  }

  renderPickedImage(image) {
    return (
      <View key={image} style={{padding: 5}}>
        <Image
          source={{uri: image}}
          style={{
            width: 50,
            height: 50,
            borderRadius: 5,
            borderWidth: 2,
            borderColor: 'white',
            elevation: 5,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 1
          }}
        />
      </View>
    )
  }

  renderCompleteFormSection() {
    const {booking, ticketNumber} = this.state;
    return (
      <View>
        <View styles={styles.inlineRow}>
          <Text style={styles.subTitle}>
            Ticket Number
          </Text>
          <TextInput
            style={styles.input}
            value={ticketNumber}
            maxLength={45}
            placeholder="Enter your invoice # here"
            onChangeText={(ticketNumber) => this.setState({ticketNumber})}
          />
        </View>
      </View>
    );
  }

  renderButtons(showSubmit) {
    return (
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View>
            <Button
              title={translate('Cancel')}
              buttonStyle={{
                width: 100,
                backgroundColor: '#006F54'
              }}
              onPress={() => {
                NavigationService.navigate('Drawer');
              }}
            />
          </View>
          {showSubmit && (
            <View>
              <Button
                raised
                buttonStyle={{
                  width: 100,
                  backgroundColor: '#006F54'
                }}
                onPress={this.handleSubmit}
                title="Submit"
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
          buttonTitle={'Pick Photo(s) of Ticket'}
          imagesUploadedHandler={this.updateInvoiceImages}
        />
      </View>
    );
  }

  render() {
    const {job, booking, isLoading} = this.state;

    if (isLoading) {
      return (
        <View style={{flex: 1, padding: 20, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
          <ActivityIndicator size="large"/>
        </View>
      )
    }

    return (
      <View style={{backgroundColor: '#E7E7E2'}}>
        <ScrollView>
          {
            /*
            <Text style={styles.title}>
              Job Completed
            </Text>
            */
          }

          {!job && this.renderJobError()}
          {job && (
            <View>
              {!booking && job.status !== 'Job Completed' && this.renderBookingError()}
              {booking && job.status !== 'Job Completed' && this.renderCompleteForm()}
              {job.status === 'Job Completed' && this.renderCompleted()}
              {/*<Text>{this.state.ticketNumber}</Text>*/}
              {/*<Text>{JSON.stringify(this.state.booking)}</Text>*/}
              {/*<Text>{this.state.invoiceImages}</Text>*/}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}

const componentStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 16
  },
  flatButton: {
    height: 32,
    paddingLeft: 8,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    height: 32,
    paddingLeft: 8,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1
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
  secondaryButton: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF'
  },
  buttonDarkText: {
    fontWeight: 'bold',
    color: '#006F53'
  },
  buttonLightText: {
    fontWeight: 'bold',
    color: '#FFF'
  },
  title: {
    fontWeight: "normal",
    fontFamily: 'Interstate',
    fontSize: 16,
    color: '#333333'
  },
  subtitle: {
    fontWeight: '100',
    fontFamily: 'Interstate',
    fontSize: 14,
    color: '#666666'
  }
});

export default JobCompletedPage;
