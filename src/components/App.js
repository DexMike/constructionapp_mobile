import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  YellowBox,
  Alert,
  Linking
} from 'react-native';
// import {NativeRouter, Route} from 'react-router-native';
import DeviceInfo from 'react-native-device-info';
import Amplify, {Auth} from 'aws-amplify';
import {
  VerifyContact,
  ConfirmSignIn,
  AmplifyTheme,
  withAuthenticator
} from 'aws-amplify-react-native';
import {createAppContainer, createStackNavigator, StackActions, NavigationActions} from 'react-navigation';
import JobListPage from './JobListPage';
import MarketplacePage from './MarketplacePage';
import JobDetailsPage from './jobDetails/JobDetailsPage';
import JobCompletedPage from './jobDetails/JobCompletedPage';
import TruckListPage from './TruckListPage';
import AddTruckForm from './addTruckForm/AddTruckForm';
import DriverListPage from './DriverListPage';
import AddDriverForm from './AddDriverForm';
import LoginPage from './LoginPage';
import PreferencesPage from './preferences/PreferencesPage';
// import BackgroundGeoPage from './BackgroundGeoPage';
import BackgroundGeolocation from 'react-native-background-geolocation-android';
import GPSTrackingService from '../api/GPSTrackingService';
import ProfileService from '../api/ProfileService';
import SignUpPage from './signUp/SignUpPage';
import ConfirmSignUpPage from './signUp/ConfirmSignUpPage';
import ForgotPasswordPage from './forgotPassword/ForgotPasswordPage';
import ConfigProperties from '../ConfigProperties';
import LoadService from '../api/LoadService';
import LoadCompletedPage from './LoadCompletedPage';
import LoadDetailsPage from './LoadDetailsPage';
import TicketDetailsPage from './TicketDetailsPage';
import NavigationService from '../service/NavigationService';
import Drawer from './layout/Drawer';
import {MenuProvider} from 'react-native-popup-menu';
import IOSPushNotificationHandler from './IOSPushNotificationHandler';
import AndroidPushNotificationHandler from './AndroidPushNotificationHandler';
// import I18n from "react-native-i18n";
import UserService from "../api/UserService";
import 'moment/locale/es';
import * as moment from "moment";
// import SplashScreen from 'react-native-splash-screen';
import VersionCheck from 'react-native-version-check';
import AppMetaService from '../api/AppMetaService';
import CompanySettings from './preferences/CompanySettings';
import UserSettings from './preferences/UserSettings';
import NativeModuleScreen from './NativeModuleScreen';
import LanguageUtils from '../utils/LanguageUtils';
import JobService from "../api/JobService";
import DriverService from '../api/DriverService';
import ShiftService from '../api/ShiftService';
import {Button} from "react-native-elements";
import CoiAttachmentService from "../api/CoiAttachmentService";
import UploadCOIPage from "./UploadCOIPage";
import AddFirstEquipmentPage from './addFirstEquipment/AddFirstEquipmentPage';
import EquipmentService from '../api/EquipmentService';
import AddFirstDriverPage from './addFirstDriver/AddFirstDriverPage';
import VersionCheckerUtil from '../utils/VersionCheckerUtil';
import MapPolygonTestPage from './testPage/MapPolygonTestPage';

let gpsEnabled = false;
let gpsShiftId = null;
let gpsLoadId = null;

function setAmplify(environment) {
  ConfigProperties.instance.setEnv(environment);
  const configObject = ConfigProperties.instance.getEnv();
  Amplify.configure({
    Auth: {
      mandatorySignIn: false,
      region: configObject.AWS_REGION,
      userPoolId: configObject.AWS_USER_POOL_ID,
      identityPoolId: configObject.AWS_IDENTITY_POOL_ID,
      userPoolWebClientId: configObject.AWS_USER_POOL_WEB_CLIENT_ID
    },
    Storage: {
      AWSS3: {
        bucket: configObject.AWS_UPLOADS_BUCKET,
        region: configObject.AWS_REGION
      }
    }
  });
}

setAmplify('prod');

// React native 0.55.4 is currently migrating to a new React API.
// Some warnings are expected in this version.
YellowBox.ignoreWarnings([
  'Warning: isMounted(...) is deprecated',
  'Module RCTImageLoader requires main queue setup',
  'Module RNFetchBlob requires main queue setup',
]);

type Props = {};

// some references I found helpful
// https://reactnavigation.org/docs/en/navigation-prop.html
// https://reactnavigation.org/docs/en/stack-actions.html
// https://reactnavigation.org/docs/en/navigating-without-navigation-prop.html
// https://github.com/react-navigation/react-navigation/issues/1439#issuecomment-303661539
// https://github.com/react-navigation/react-navigation/issues/131#issuecomment-281493120
// https://github.com/kyaroru/ReactNavDrawer
const Stack = {
  JobListPage: JobListPage,
  MarketplacePage: MarketplacePage,
  PreferencesPage: PreferencesPage,
  JobDetailsPage: JobDetailsPage,
  LoadDetailsPage: LoadDetailsPage,
  TicketDetailsPage: TicketDetailsPage,
  DriverListPage: DriverListPage,
  AddDriverForm: AddDriverForm,
  TruckListPage: TruckListPage,
  AddTruckForm: AddTruckForm,
  CompanySettings: CompanySettings,
  UserSettings: UserSettings,
  JobCompletedPage: {
    screen: JobCompletedPage,
    navigationOptions: () => ({
      header: null,
    }),
  },
  LoadCompletedPage: {
    screen: LoadCompletedPage,
    navigationOptions: () => ({
      header: null,
    }),
  },
  NativeModuleScreen: NativeModuleScreen,
  MapPolygonTestPage
};

const RootStack = createStackNavigator({
  ...Stack,
  Drawer: Drawer
}, {
  initialRouteName: 'Drawer',
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: '#0c5e42',
    },
    headerTitleStyle: {
      color: 'white',
    },
    headerTintColor: 'white'
}
});

// Set's the app / date language based on the device settings
LanguageUtils.setAppLanguage(LanguageUtils.getDeviceLanguage());

const AppContainer = createAppContainer(RootStack);

class App extends Component<Props> {

  constructor(props) {
    super(props);
    this.eventId = 1;
    this.state = {
      // enabled: false,
      // loadId: null,
      // isMoving: false,
      profile: null,
      user: null,
      loadInProgress: 0,
      jobInProgress: 0,
      events: [],
      reloadJobs: true,
      reloadMarketplace: true,
      reloadLoads: true,
      reloadDriverList: true,
      reloadTruckList: true,
      language: "English",
      backButtonTitle: "Back",
      isAdmin: false,
      userMissingCOI: false,
      needsToAddEquipment: false,
      locationPermitted: false,
      needsToAddDriver: false
    };

    // this.renderRoutes = this.renderRoutes.bind(this);
    this.setGeoLocation = this.setGeoLocation.bind(this);
    this.onLocation = this.onLocation.bind(this);
    this.onError = this.onError.bind(this);
    this.onActivityChange = this.onActivityChange.bind(this);
    this.onProviderChange = this.onProviderChange.bind(this);
    this.onMotionChange = this.onMotionChange.bind(this);
    this.onPowerSaveChange = this.onPowerSaveChange.bind(this);
    this.onHttp = this.onHttp.bind(this);
    this.onHeartbeat = this.onHeartbeat.bind(this);
    this.toggleGeoLocation = this.toggleGeoLocation.bind(this);
    this.testLocationServices = this.testLocationServices.bind(this);
    this.gpsTrackingOnLaunch = this.gpsTrackingOnLaunch.bind(this);
    this.checkGeoLocation = this.checkGeoLocation.bind(this);
    this.onEquipmentAdded = this.onEquipmentAdded.bind(this);
    this.onDriverAdded = this.onDriverAdded.bind(this);
  }

  // componentWillMount() {
  //   SplashScreen.hide();
  // }

  async componentDidMount() {
    let { userMissingCOI, needsToAddEquipment, needsToAddDriver } = this.state;
    this.checkForNewVersion();
    const profile = await ProfileService.getProfile();
    const user = await UserService.getUserById(profile.userId);
    const companyCOI = await CoiAttachmentService.getCoiAttachmentsByCompany(profile.companyId);

    // if (profile.isAdmin && (!companyCOI || companyCOI.length < 1)) {
    if (profile.isAdmin && (user.userStatus === 'COI Pending' || (!companyCOI || companyCOI.length < 1))) {
      userMissingCOI = true;
    }

    const allowedLogin = ["First Login", "Enabled", "Driver Enabled", "COI Pending"];

    if (!allowedLogin.includes(user.userStatus)) {
      try {
        // NOTE: have to pass props to change auth state like this
        // ref https://github.com/aws-amplify/amplify-js/issues/1529
        const {onStateChange} = this.props;
        // {global: true} NOTE we might need this
        await Auth.signOut();
        onStateChange('signedOut', null);
      } catch (err) {
        // POST https://cognito-idp.us-east-1.amazonaws.com/ 400
        // Uncaught (in promise) {code: "NotAuthorizedException",
        // name: "NotAuthorizedException", message: "Access Token has been revoked"}
        onStateChange('signedOut', null);
      }
    }
    const { data } = await EquipmentService.getEquipmentByCompanyId(profile.companyId, 50, 0);
    if (data.length <= 0) {
      needsToAddEquipment = true;
    }
    // Set's the app language based on the user's settings in the app instead of the device's settings
    const language = user.preferredLanguage;
    LanguageUtils.setAppLanguage(LanguageUtils.getAppLanguageCode(language));
    this.gpsTrackingOnLaunch();
    BackgroundGeolocation.onLocation(this.onLocation, this.onError);
    BackgroundGeolocation.onMotionChange(this.onMotionChange);
    BackgroundGeolocation.onActivityChange(this.onActivityChange);
    BackgroundGeolocation.onProviderChange(this.onProviderChange);
    BackgroundGeolocation.onPowerSaveChange(this.onPowerSaveChange);
    BackgroundGeolocation.onHttp(this.onHttp);
    BackgroundGeolocation.onHeartbeat(this.onHeartbeat);

    BackgroundGeolocation.ready({
      // Geolocation ConfigProperties
      // ref: https://transistorsoft.github.io/react-native-background-geolocation/interfaces/_react_native_background_geolocation_.config.html
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 50,
      geofenceModeHighAccuracy: true, // Android only

      // For testing GPS Tracking
      // isMoving: true,
      // distanceFilter: 0,
      // locationUpdateInterval: 5000,
      // allowIdenticalLocations: true,
      // stopTimeout: 3,

      // Activity Recognition
      stopTimeout: 1,
      // Application config
      debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,   // <-- Allow the background-service to continue tracking when user closes the app.
      preventSuspend: true,
      startOnBoot: true,        // <-- Auto start tracking when device is powered-up.
      foregroundService: true,
      heartbeatInterval: 60,
      // HTTP / SQLite config
      // url: TRACKER_HOST,
      batchSync: false,       // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
      autoSync: true,         // <-- [Default: true] Set true to sync each location to server as it arrives.
      headers: {              // <-- Optional HTTP headers
        'X-FOO': 'bar'
      },
      params: {               // <-- Optional HTTP params
        'auth_token': 'maybe_your_server_authenticates_via_token_YES?',
        // Required for tracker.transistorsoft.com
        device: {
          uuid: (DeviceInfo.getModel() + '-' + DeviceInfo.getSystemVersion()).replace(/[\s\.,]/g, '-'),
          model: DeviceInfo.getModel(),
          platform: DeviceInfo.getSystemName(),
          manufacturer: DeviceInfo.getManufacturer(),
          version: DeviceInfo.getSystemVersion(),
          framework: 'ReactNative'
        }
      }
    }, (state) => {
      console.log('- BackgroundGeolocation is configured and ready: ', state);

      // this.setState({
      //   enabled: false,
      //   isMoving: true
      // });
    });
    this.setState({
      language,
      isAdmin: profile.isAdmin,
      profile,
      user,
      userMissingCOI,
      needsToAddEquipment,
      needsToAddDriver
    });
  }

  onEquipmentAdded() {
    this.setState({ needsToAddEquipment: false, needsToAddDriver: true })
  }

  onDriverAdded() {
    this.setState({ needsToAddDriver: false });
  }

  checkForNewVersion() {
    VersionCheck.getLatestVersion({
      forceUpdate: true,
      provider: () => AppMetaService.getAppMeta()
        .then(({version}) => {
          return version
        }), // get latest version from our own api.
    }).then(async (latestVersion) => {
      const appVersion = VersionCheck.getCurrentVersion();     // 1.11.0
      if(VersionCheckerUtil.checkVersionUpdate(appVersion, latestVersion)) {
        let url = '';
        if(Platform.OS === 'android') {
          url = `https://play.google.com/store/apps/details?id=${VersionCheck.getPackageName()}`;
        }
        if(Platform.OS === 'ios') {
          const appStoreId = '1460303864';
          url = `itms-apps://itunes.apple.com/us/app/id${appStoreId}?mt=8`;
        }
        this.showUpdateAlert(latestVersion, url);
      }
    });
  }

  showUpdateAlert(latestVersion, url) {
    Alert.alert(
      'Update Available',
      `A new version of Trelar is available. Please update to version ${latestVersion} now.`,
      [
        {
          text: 'Update',
          onPress: async () => {
            await Linking.openURL(url); // redirect on app / play store
            this.showUpdateAlert(latestVersion, url);
          }},
      ],
      {cancelable: false},
    );
  }

  addEvent(name, date, object) {
    const {events} = this.state;
    let event = {
      key: this.eventId++,
      name: name,
      timestamp: date.toLocaleTimeString(),
      object
    };
    let rs = events;
    rs.unshift(event);
    // this.setState({
    //   events: rs
    // });
  }

  async toggleGeoLocation(enabled, shiftId, loadId) {
    await this.setGeoLocation(enabled, shiftId, loadId);
  }

  async checkGeoLocation(enabled) {
    const permitted = await this.testLocationServices(enabled);
    this.setState({locationPermitted: permitted});
  }

  async gpsTrackingOnLaunch() {
    try {
      const profile = await ProfileService.getProfile();
      try {
        let driversShift = await ShiftService.isDriverOnShift(profile.driverId); // check if driver's on a shift
        if(driversShift && driversShift.id > 0) {
          // driversShift = driversShift[0];
          this.toggleGeoLocation(true, driversShift.id); // start tracking
          const job = await JobService.getActiveJobByDriverId(profile.driverId);
          if (job.id) { // If there's a load in progress
            const latestUserLoad = await LoadService.getLatestLoadByDriverId(profile.driverId);
            this.toggleGeoLocation(true, driversShift.id, latestUserLoad.id); // tracking load in progress
            NavigationService.navigate('JobDetailsPage', {
              itemId: job.id,
              jobName: job.name
            });
            // debugger;
          }
        }
      } catch (err) {
        // no driver record
      }
    } catch (err) {
      console.error(err);
    }
  }

  async testLocationServices(enabled) {
    gpsEnabled = enabled;
    if (enabled) {
      try {
        const response = await BackgroundGeolocation.start();
        if (Platform.OS === 'android') {

          return true;
        }
        if (Platform.OS === 'ios') {
          if (response.lastLocationAuthorizationStatus === 3) {

            return true;
          } else {

            return false;
          }
        }
      } catch (err) {
        console.log(err);

        return false;
      }
    } else {
      // BackgroundGeolocation.stop();
      return false;
    }
  }

  async setGeoLocation(enabled, shiftId, loadId) {
    gpsEnabled = enabled;
    gpsShiftId = shiftId;
    gpsLoadId = loadId;
    if (gpsEnabled) {
      console.log('STARTING location tracking!');

      try {
        await BackgroundGeolocation.start();
        BackgroundGeolocation.changePace(true);
      } catch (err) {
        console.log(err);

      }
    } else {
      console.log('STOPPING location tracking!');
      BackgroundGeolocation.stop();
      BackgroundGeolocation.changePace(false);
    }
  }

  // You must remove listeners when your component unmounts
  componentWillUnmount() {
    BackgroundGeolocation.removeListeners();
  }

  async onLocation(location) {
    // const { enabled,loadId } = this.state;
    // NOTE: we could add some other useful stuff like speed, distance, battery life, altitude, accuracy, ismoving, activity
    const gpsLocation = {
      recordedAt: location.timestamp,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      createdOn: location.timestamp,
      shiftId: gpsShiftId,
      loadId: gpsLoadId
    };

    if (gpsEnabled && gpsShiftId) {
      await GPSTrackingService.createGPSTracking(gpsLocation);
    }
    this.addEvent('location', new Date(location.timestamp), location);
  }

  onError(error) {
    this.addEvent('error', new Date(location.timestamp), error);
  }

  onMotionChange(event) {
    // this.setState({
    //   isMoving: event.isMoving
    // });
    this.addEvent('motionchange', new Date(event.location.timestamp), event.location);
  }

  onActivityChange(event) {
    this.addEvent('activitychange', new Date(), event);
  }

  onProviderChange(event) {
    this.addEvent('providerchange', new Date(), event);
  }

  onPowerSaveChange(isPowerSaveMode) {
    this.addEvent('powersavechange', new Date(), {isPowerSaveMode: isPowerSaveMode});
  }

  // This doesn't seem to actually make a post call to the specified server
  onHttp(response) {
    this.addEvent('http', new Date(), response);
  }

  onHeartbeat(event) {
    this.addEvent('heartbeat', new Date(), event);
  }

  // you can pass props to a screen like this: return <AppContainer screenProps={{id: '112', ...this.props}} />;
  render() {
    const {
      reloadJobs,
      reloadMarketplace,
      reloadLoads,
      reloadDriverList,
      reloadTruckList,
      language,
      backButtonTitle,
      isAdmin,
      userMissingCOI,
      profile,
      needsToAddEquipment,
      needsToAddDriver,
      user,
      locationPermitted
    } = this.state;
    const { onStateChange } = { ...this.props };
    if (userMissingCOI) {
      return (
        <UploadCOIPage profile={profile} onStateChange={onStateChange} />
      );
    }
    return (
      <React.Fragment>
        { needsToAddEquipment && (
          <AddFirstEquipmentPage onStateChange={onStateChange} onEquipmentAdded={this.onEquipmentAdded} />
        )}
        { !needsToAddEquipment && needsToAddDriver && (
          <AddFirstDriverPage user={user} onDriverAdded={this.onDriverAdded} />
        )}
        { !needsToAddEquipment && !needsToAddDriver && (
        <MenuProvider>
          {Platform.OS !== 'ios' && <AndroidPushNotificationHandler/>}
          {Platform.OS === 'ios' && <IOSPushNotificationHandler/>}
          <AppContainer
            screenProps={
              {
                onStateChange,
                toggleGeoLocation: this.toggleGeoLocation,
                checkGeoLocation: this.checkGeoLocation,
                profile: this.state.profile,
                reloadJobs,
                reloadMarketplace,
                reloadLoads,
                reloadDriverList,
                reloadTruckList,
                setReloadJobs: (reloadJobs) => {
                  this.setState({reloadJobs})
                },
                setReloadLoads: (reloadLoads) => {
                  this.setState({reloadLoads})
                },
                setReloadMarketplace: (reloadMarketplace) => {
                  this.setState({reloadMarketplace})
                },
                setReloadDrivers: (reloadDriverList) => {
                  this.setState({reloadDriverList})
                },
                setReloadTrucks: (reloadTruckList) => {
                  this.setState({reloadTruckList})
                },
                setBackButtonTitle: (backButtonTitle) => {
                  this.setState({backButtonTitle})
                },
                setLanguage: (language) => {
                  LanguageUtils.setAppLanguage(LanguageUtils.getAppLanguageCode(language))
                },
                language,
                backButtonTitle,
                isAdmin
              }
            }
            ref={navigationRef => {
              NavigationService.setTopLevelNavigator(navigationRef);
            }}
          />
        </MenuProvider>
        )}
      </React.Fragment>
    );
  }
}

// workaround funky ios background amplify
// https://github.com/aws-amplify/amplify-js/issues/2618
const theme = StyleSheet.create({
  ...AmplifyTheme,
  container: {
    ...AmplifyTheme.container,
    flex: 1,
    backgroundColor: 'rgb(230, 230, 225)'
  }
});
const includeGreetings = false;
const authenticatorComponents = [
  <LoginPage setAmplify={setAmplify}/>,
  <ConfirmSignIn/>,
  <VerifyContact/>,
  <ConfirmSignUpPage/>,
  <ForgotPasswordPage/>
];
const federated = null;
const signUpConfig = {};
export default withAuthenticator(App, includeGreetings, authenticatorComponents, federated, theme, signUpConfig);
