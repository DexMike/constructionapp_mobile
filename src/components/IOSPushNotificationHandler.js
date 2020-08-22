import React, { Component } from 'react';
import {PushNotificationIOS, Alert, Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import UserDeviceService from '../api/UserDeviceService';
import ProfileService from '../api/ProfileService';

class IOSPushNotificationHandler extends Component {
  async componentDidMount() {
    try {
      const profile = await ProfileService.getProfile();
      PushNotificationIOS.addEventListener('register', async (token) => {
        await this.onChangeToken(token, profile);
      }, profile);
    } catch (err) {
      console.error(err);
    }

    PushNotificationIOS.addEventListener('registrationError', registrationError => {
      // console.log(registrationError, '--');
    });

    PushNotificationIOS.addEventListener('notification', function(notification) {
      if (!notification) {
        return;
      }
      // const data = notification.getData();
      // Alert.alert(JSON.stringify({ data, source: 'CollapsedApp' }));
    });

    PushNotificationIOS.getInitialNotification().then(notification => {
      if (!notification) {
        return;
      }
      // const data = notification.getData();
      // Alert.alert(JSON.stringify({ data, source: 'ClosedApp' }));
    });
    PushNotificationIOS.requestPermissions();
  }

  // TODO you could put this in a parent class
  async onChangeToken(token, profile) {
    if (!DeviceInfo.isEmulator()) {
      let userDevice = {
          // name: '',
          // devicePhone: '',
          userId: profile.userId,
          deviceOS: Platform.OS,
          deviceId: DeviceInfo.getUniqueID(),
          notificationToken: token,
          deviceManufacturer: DeviceInfo.getManufacturer(),
          deviceModel: DeviceInfo.getModel(),
          deviceBrand: DeviceInfo.getBrand(),
          deviceCarrier: DeviceInfo.getCarrier(),
          deviceType: DeviceInfo.getDeviceType()
      };
      await UserDeviceService.registerUserDeviceByUserId(userDevice);
    }
  }

  render() {
    return null;
  }
}

export default IOSPushNotificationHandler;
