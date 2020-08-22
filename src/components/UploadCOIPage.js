import React, {Component} from 'react';
import {Platform, ScrollView, StatusBar, StyleSheet, Text, View} from "react-native";
import {Button, Header, Image, ThemeProvider} from "react-native-elements";
import {Auth} from "aws-amplify";

import CompanyService from "../api/CompanyService";
import TMultiImageUploader from "./common/TMultiImageUploader";
import ConfigProperties from "../ConfigProperties";
import CoiAttachmentService from "../api/CoiAttachmentService";
import {translate} from "../i18n";
import TFormat from "./common/TFormat";
import UserService from "../api/UserService";
import Icon from 'react-native-vector-icons/FontAwesome';
import AppLogo from "../img/logo.png";
import DeviceInfo from "react-native-device-info";



class UploadCOIPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadComplete: false
    };

    this.updateCoiAttachments = this.updateCoiAttachments.bind(this);
  }

  async updateCoiAttachments(imageKeys) {
    const configObject = ConfigProperties.instance.getEnv();
    const API_UPLOADS_ENDPOINT = configObject.AWS_UPLOADS_ENDPOINT;
    const usersCompany = await CompanyService.getCompanyById(this.props.profile.companyId);
    const user = await UserService.getUserById(this.props.profile.userId);
    const attachments = [];
    for (const imageKey of imageKeys) {
      attachments.push(`${API_UPLOADS_ENDPOINT}/public/${imageKey}`);
    }
    // 1 update Load Invoices
    const coiAttachments = attachments.map(image => {
      return {
        companyId: usersCompany.id,
        image: image
      }
    }, usersCompany);
    if (coiAttachments.length > 0) {
      try {
        await CoiAttachmentService.createCoiAttachments(coiAttachments);
        user.userStatus = "Pending Review";
        await UserService.updateUser(user);
        await Auth.signOut();
        this.setState({uploadComplete: true});
      } catch (err) {
        console.log(err);
      }
    }
  }

  renderCOIUploadComplete() {
    return (
      <React.Fragment>
        {/*<Header*/}
        {/*  innerContainerStyles={{flexDirection: 'row'}}*/}
        {/*  leftComponent={*/}
        {/*    <Image*/}
        {/*      source={AppLogo}*/}
        {/*      placeholderStyle={{backgroundColor: 'rgba(0, 0, 0, 0)'}}*/}
        {/*      style={{width: 100, height: 25, paddingTop: 0}}*/}
        {/*    />*/}
        {/*  }*/}
        {/*  containerStyle={{*/}
        {/*    backgroundColor: 'rgb(0, 111, 83)',*/}
        {/*    height: height,*/}
        {/*    paddingBottom: paddingBottom,*/}
        {/*    marginTop: marginTop*/}
        {/*  }}*/}
        {/*/>*/}
        <View style={{padding: 30, backgroundColor: 'rgb(230, 230, 225)', paddingTop: 60, flex: 1}}>
          <Text style={{fontSize: 15, fontFamily: 'Interstate-Regular',
            color: 'rgb(0, 111, 83)'}}>
            {translate('COI_UNDER_REVIEW')}
          </Text>
          <View style={{flex: 1, paddingTop: 20, flexDirection: 'row', justifyContent: 'flex-end'}}>
            <Button
              title="Logout"
              iconRight={true}
              onPress={async () => {
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
              }
              icon={
                <Icon
                  name="arrow-right"
                  size={15}
                  color="white"
                  style={{paddingLeft: 6}}
                />
              }
            />
          </View>
          {/*<Button*/}
          {/*  onPress={async () => {*/}
          {/*    try {*/}
          {/*      // NOTE: have to pass props to change auth state like this*/}
          {/*      // ref https://github.com/aws-amplify/amplify-js/issues/1529*/}
          {/*      const {onStateChange} = this.props;*/}
          {/*      // {global: true} NOTE we might need this*/}
          {/*      await Auth.signOut();*/}
          {/*      onStateChange('signedOut', null);*/}
          {/*    } catch (err) {*/}
          {/*      // POST https://cognito-idp.us-east-1.amazonaws.com/ 400*/}
          {/*      // Uncaught (in promise) {code: "NotAuthorizedException",*/}
          {/*      // name: "NotAuthorizedException", message: "Access Token has been revoked"}*/}
          {/*      onStateChange('signedOut', null);*/}
          {/*    }*/}
          {/*  }*/}
          {/*  }*/}
          {/*  title="Logout"*/}
          {/*  type='outline'*/}
          {/*  buttonStyle={{*/}
          {/*    borderWidth: 0*/}
          {/*  }}*/}
          {/*/>*/}
        </View>
      </React.Fragment>
    );
  }


  renderMultiUploader() {
    const {startUpload} = this.state;
    return (
      <View style={styles.mtFifteen}>
        <TMultiImageUploader
          buttonTitle={translate('SELECT IMAGE')}
          cameraTitle={translate('TAKE PHOTO')}
          startUpload={startUpload}
          imagesUploadedHandler={this.updateCoiAttachments}
        />
      </View>
    );
  }

  render() {
    const {uploadComplete} = this.state;

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
      // Button: {
      //   buttonStyle: {
      //     backgroundColor: 'rgb(0, 111, 83)'
      //   }
      // }
    };

    const marginTop = (DeviceInfo.hasNotch() ? 0 : -35);
    const marginImage = (DeviceInfo.hasNotch() ? 0 : 50);
    const paddingBottom = (DeviceInfo.hasNotch() ? 35 : 35);
    const height = (DeviceInfo.hasNotch() ? 70 : 70);
    const statusBarHeight = Platform.OS === 'ios' ? 0 : StatusBar.currentHeight;

    if (uploadComplete) {
      return (
        <ThemeProvider theme={theme}>
          <StatusBar barStyle='light-content'/>
          <Header
            innerContainerStyles={{flexDirection: 'row'}}
            leftComponent={
              <Image
                source={AppLogo}
                placeholderStyle={{backgroundColor: 'rgba(0, 0, 0, 0)'}}
                style={
                  Platform.OS === 'ios' ?
                    {width: 100, height: 25, marginTop: marginImage + statusBarHeight}
                    :
                    {width: 100, height: 25}
                }
              />
            }
            containerStyle={
              Platform.OS === 'ios' ?
                {
                  backgroundColor: 'rgb(0, 111, 83)',
                  height: height + statusBarHeight,
                  paddingBottom: paddingBottom,
                  marginTop: marginTop
                }
                :
                {
                  backgroundColor: 'rgb(0, 111, 83)',
                  height: height,
                  marginTop: marginTop
                }
            }
          />
          {this.renderCOIUploadComplete()}
        </ThemeProvider>
      )
    }

    return (
      <ThemeProvider theme={theme}>
        <StatusBar barStyle='light-content'/>
        <Header
          innerContainerStyles={{flexDirection: 'row'}}
          leftComponent={
            <Image
              source={AppLogo}
              placeholderStyle={{backgroundColor: 'rgba(0, 0, 0, 0)'}}
              style={
                Platform.OS === 'ios' ?
                  {width: 100, height: 25, marginTop: marginImage + statusBarHeight}
                  :
                  {width: 100, height: 25}
              }
            />
          }
          containerStyle={
            Platform.OS === 'ios' ?
              {
                backgroundColor: 'rgb(0, 111, 83)',
                height: height + statusBarHeight,
                paddingBottom: paddingBottom,
                marginTop: marginTop
              }
              :
              {
                backgroundColor: 'rgb(0, 111, 83)',
                height: height,
                marginTop: marginTop
              }
          }
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{flex: 1, backgroundColor: 'rgb(230, 230, 225)', paddingTop: 20}}>
          <View style={{margin: 20}}>
            <View style={styles.signUpPageTitle}>
              <Text style={{fontSize: 20}}>Carrier Documentation</Text>
            </View>
            <View style={styles.signUpPageBody}>
              <Text style={{fontSize: 15, paddingBottom: 20}}>
                In order to ACTIVATE you account, you will need to provide
                the information:
              </Text>
              <Text style={{fontSize: 15}}>Certificate of Insurance (COI)</Text>
              {/*<Button*/}
              {/*  title="UPLOAD INSURANCE CERTIFICATE"*/}
              {/*  titleStyle={{fontSize: 15}}*/}
              {/*  containerStyle={{paddingTop: 15}}*/}
              {/*  // onPress={this.createCognitoAccount} upload photo*/}
              {/*  icon={*/}
              {/*    <Icon*/}
              {/*      name="download"*/}
              {/*      size={15}*/}
              {/*      color="white"*/}
              {/*      style={{paddingRight: 6}}*/}
              {/*    />*/}
              {/*  }*/}
              {/*/>*/}
              {/*<Button*/}
              {/*  title="TAKE PHOTO OF INSURANCE"*/}
              {/*  titleStyle={{fontSize: 15}}*/}
              {/*  containerStyle={{paddingTop: 7}}*/}
              {/*  // onPress={this.createCognitoAccount} upload photo*/}
              {/*  icon={*/}
              {/*    <Icon*/}
              {/*      name="camera"*/}
              {/*      size={15}*/}
              {/*      color="white"*/}
              {/*      style={{paddingRight: 6}}*/}
              {/*    />*/}
              {/*  }*/}
              {/*/>*/}
              {this.renderMultiUploader()}
              <Button
                onPress={async () => {
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
                }
                title="Logout"
                type='outline'
                buttonStyle={{
                  borderWidth: 0
                }}
              />
            </View>
          </View>
        </ScrollView>
      </ThemeProvider>
    )
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

export default UploadCOIPage;
