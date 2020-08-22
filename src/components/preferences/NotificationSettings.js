import React, {Component} from 'react';
// import {Link} from 'react-router-native';
import {
  View,
  ScrollView,
  Text,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Alert
} from 'react-native';
import {Button} from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import Amplify from 'aws-amplify-react-native';
import {Auth} from 'aws-amplify';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
// import AgentService from '../api/AgentService';
import ProfileService from '../../api/ProfileService';
import Dimensions from 'Dimensions';
import UserNotificationService from '../../api/UserNotificationService';
import {translate} from "../../i18n";

class NotificationSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: [],
      loaded: false,
      allJobsOffers: false,
      allJobs: false,
      allMaketplace: false,
      allPayments: false,
      jobs: [],
      jobOffers: [],
      marketplace: [],
      payments: []
      // dialogVisible: false
    };
    this.setOptionStatus = this.setOptionStatus.bind(this);
    this.setSectionStatus = this.setSectionStatus.bind(this);
  }

  async componentDidMount() {
    const { user } = this.props;
    let settings = [];
    try {
      settings = await UserNotificationService.getOrCreateOnBoardingDefaultUserNotifications(user.id);
    } catch (e) {
      // console.log(e);
    }
    // modal?
    if (user.loginCount == 1){
      this.showDialog();
      // this.setState({
      //   dialogVisible: true
      // })
    }

    this.setState({
      settings,
      loaded: true
    });		
    this.setNotifications();
  }

  componentWillUnmount() {
  }

  setNotifications() {
    const {settings} = this.state;
    const jobOffers = [];
    const marketplace = [];
    const payments = [];
    const jobs = [];
    
    let enabledOffers = 0;
    let enabledPayments = 0;
    let enabledJobs = 0;
    Object.values(settings).forEach((itm) => {
      if (itm.key === 'Job Offers') {
        jobOffers.push(itm);
        if (itm.sms === 1) enabledOffers += 1;
      }
      if (itm.key === 'Marketplace') marketplace.push(itm);
      if (itm.key === 'Payments') {
        payments.push(itm);
        if (itm.sms === 1) enabledPayments += 1;
      }
      if (itm.key === 'Jobs') {
        jobs.push(itm);
        if (itm.sms === 1) enabledJobs += 1;
      }
    });

    if (jobOffers.length === enabledOffers) {
      allJobsOffers = true;
    } else {
      allJobsOffers = false;
    }
    if (payments.length === enabledPayments) {
      allPayments = true;
    } else {
      allPayments = false;
    }
    if (jobs.length === enabledJobs) {
      allJobs = true;
    } else {
      allJobs = false;
    }

    this.setState({
      jobOffers,
      marketplace,
      payments,
      jobs,
      allJobsOffers,
      allJobs,
      allPayments
    });
  }

  setOptionStatus(notificationId) {
    const { user } = this.props;
    const { settings } = this.state;

    const notification = settings.find(x => x.id === notificationId);
    const enabled = notification.sms ? 0 : 1;
    notification.sms = enabled;
    notification.modifiedBy = user.id;
    notification.modifiedOn = moment.utc().format();

    try {
      UserNotificationService.updateUserNotification(notification);
      const index = settings.findIndex(x => x.id === notificationId);
      if (index !== -1) {
        this.setState({
          settings: [
            ...settings.slice(0, index),
            Object.assign({}, settings[index], notification),
            ...settings.slice(index + 1)
          ]
        });
      }
    } catch (e) {
      // console.log(e);
    }
    this.setNotifications();
  }

  // These function sets one section status
  // Enabling/disabling only SMS for now
  setSectionStatus(key, value, sectionValue) {
    const {user} = this.props;
    const { settings } = this.state;
    const newSettings = settings;

    const notificationsToUpdate = [];
    for (const i in newSettings) {
      if (newSettings[i].key === key) {
        newSettings[i].sms = value ? 0 : 1;
        newSettings[i].modifiedBy = user.id;
        newSettings[i].modifiedOn = moment.utc().format();
        notificationsToUpdate.push(newSettings[i]);
      }
    }

    UserNotificationService.updateUserNotificationSection(notificationsToUpdate);
    this.setState({
      settings: newSettings,
      [sectionValue]: !value
    });
    this.setNotifications();
  }

  // handleCancel = () => {
  //   this.setState({ dialogVisible: false });
  // };

  showDialog () {
    Alert.alert(
      'Welcome and thank you for joining Trelar',
      `\nTo start you should first set your notification settings.
       
       Once that's done you'll want to add a truck.`,
      [
        {
          text: 'Close',
          onPress: () => {}
        }
      ],
      {cancelable: false}
    );
    // return (
    //   <View>
    //     <Dialog.Container visible={dialogVisible}>
    //       <Dialog.Title>
    //         Welcome and thank you for joining Trelar
    //       </Dialog.Title>
    //       <Dialog.Description>
    //         To start you should first set your notification settings.
    //         {"\n\n"}
    //         Once that's done you'll want to add a truck.
    //       </Dialog.Description>
    //       <Dialog.Button label="Close" onPress={this.handleCancel} />
    //     </Dialog.Container>
    //   </View>
    // )
  }

  renderRow(notification) {
    return (
        <View key={notification.id} style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row', marginTop: 10 }}>
            <View style={{ width: 50, alignSelf: 'stretch' }}>
              <Switch
                value={notification.sms === 1 ? true : false}
                onValueChange={() => this.setOptionStatus(notification.id)}
              />
            </View>
            <View style={{ flex: 1, alignSelf: 'stretch', paddingLeft:20 }}>
              <Text>{translate(notification.description)}</Text>
            </View>
        </View>
    );
  }

  renderSection(name, notifications, sectionValue) {
    return (
      <View style={styles.form}>
        <View style={{ flex: 1, flexDirection: 'row'}}>
          <View>
            <Text style={{color: '#006F54', fontSize: 16, fontWeight: 'bold'}}>{name}</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', paddingLeft:20, justifyContent: 'flex-end'}}>
            {
              notifications.length > 1 ?
              <React.Fragment>
                <Text style={{paddingRight: 8, paddingTop: 4}}>{this.state[sectionValue] ? translate('Disable') : translate('Enable')} {translate('All')}</Text>
                <Switch
                    value={this.state[sectionValue]}
                    onValueChange={() =>
                      this.setSectionStatus(
                        notifications[0].key,
                        this.state[sectionValue],
                        sectionValue
                      )
                  }
                />
              </React.Fragment>
               : null
            }
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row', marginTop: 10 }}>
              <View style={{ width: 50, alignSelf: 'stretch', justifyContent: 'center'}}>
                <Text style={{color: '#000', fontSize: 14}}>{translate('Off/On')}</Text>
              </View>
              <View style={{ flex: 1, alignSelf: 'stretch', textAlign: 'center', paddingLeft:20}}>
                <Text style={{color: '#000', fontSize: 14}}>{translate('Notification')}</Text>
              </View>
          </View>
          {
            notifications.map((notification) => {
                return this.renderRow(notification);
            })
          }
        </View>
      </View>
    );
  }

  renderSettings() {
    const { profile } = this.props;
    const { 
      jobOffers,
      marketplace,
      payments,
      jobs
    } = this.state;
    if (!profile.isAdmin && profile.driverId) {
      return (
        <View style={{marginBottom: 16}}>
          <View>
            <Text style={styles.title}>
              {translate('SMS Notifications')}
            </Text>
          </View>
          {this.renderSection('Jobs', jobs, 'allJobs')}
        </View>
      );
    }
    return (
      <View style={{marginBottom: 16}}>
        <View>
          <Text style={styles.title}>
            {translate('SMS Notifications')}
          </Text>
        </View>
        {this.renderSection(translate('Job Offers'), jobOffers, 'allJobsOffers')}
        {this.renderSection(translate('Marketplace'), marketplace, 'allMarketplace')}
        {this.renderSection(translate('Payments'), payments, 'allPayments')}
      </View>
    );
  }

  render() {
    const { profile, loaded, dialogVisible } = this.state;
    if (loaded) {
      return (
        <ScrollView style={{
          flex: 1,
          backgroundColor: '#E7E7E2',
          paddingLeft: 24,
          paddingRight: 24
        }}>
          {this.renderSettings()}
        </ScrollView>
      );
    }
    return (
      <View style={{flex: 1, padding: 20, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }
}
let {width, height} = Dimensions.get('window');
height -= 150;
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    width: width,
    height: height
  },
  form: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 16,
    marginTop: 16,
    borderColor: '#CCCCCC',
    borderWidth: 1
  },
  title: {
    fontFamily: 'Interstate-Regular',
    textAlign: 'center',
    fontSize: 18,
    color: '#348A74',
    fontWeight: 'bold',
    paddingTop: 16
  },
});

export default NotificationSettings;

