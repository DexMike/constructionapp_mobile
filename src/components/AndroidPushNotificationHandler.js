import React, {Component} from 'react';
import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import UserDeviceService from '../api/UserDeviceService';
import ProfileService from '../api/ProfileService';

let firebase;
if (Platform.OS === 'android') {
  firebase = require('react-native-firebase');
}

class AndroidPushNotificationHandler extends Component {
  async componentDidMount() {
    try {
      const profile = await ProfileService.getProfile();
      firebase.messaging().getToken().then(async fcmToken => {
        await this.onChangeToken(fcmToken, profile);
      }, profile);

      this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(async fcmToken => {
        await this.onChangeToken(fcmToken, profile);
      }, profile);
    } catch (err) {
      console.error(err);
    }
  }

  componentWillUnmount() {
    this.onTokenRefreshListener();
  }

  async onChangeToken(fcmToken, profile) {
    if (!DeviceInfo.isEmulator()) {
      let userDevice = {
        // name: '',
        // devicePhone: '',
        userId: profile.userId,
        deviceOS: Platform.OS,
        deviceId: DeviceInfo.getUniqueID(),
        notificationToken: fcmToken,
        deviceManufacturer: DeviceInfo.getManufacturer(),
        deviceModel: DeviceInfo.getModel(),
        deviceBrand: DeviceInfo.getBrand(),
        deviceCarrier: DeviceInfo.getCarrier(),
        deviceType: DeviceInfo.getDeviceType()
      };
      console.log(userDevice);
      await UserDeviceService.registerUserDeviceByUserId(userDevice);
    }
  }

  render() {
    return null;
  }
}

export default AndroidPushNotificationHandler;
