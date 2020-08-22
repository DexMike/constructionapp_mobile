import React, {Component} from 'react';
import {Text} from 'react-native-elements';
import {StyleSheet, Switch, View, Dimensions, ActivityIndicator} from 'react-native';
import PINCode, {deleteUserPinCode, hasUserSetPinCode} from '@haskkor/react-native-pincode';
import {translate} from "../../i18n";

class SecuritySettings extends Component {

  constructor(props) {
    super(props);

    this.state = {
      pinEnabled: false,
      loaded: false,
      choosePin: false
    };

    this.togglePinEnabled = this.togglePinEnabled.bind(this);
    this.handleChoosePin = this.handleChoosePin.bind(this);
  }

  async componentDidMount() {
    const pinEnabled = await hasUserSetPinCode();
    this.setState({pinEnabled, loaded: true});
  }

  async togglePinEnabled(value) {
    let {choosePin} = {...this.state};
    if (value) {
      // choose pin
      choosePin = true;
    } else {
      // remove pin
      await deleteUserPinCode();
    }
    this.setState({pinEnabled: value, choosePin});
  }

  handleChoosePin() {
    this.setState({choosePin: false});
  }

  render() {
    const {loaded, pinEnabled, choosePin} = {...this.state};

    if (loaded) {
      return (
        <View style={{
          flex: 1,
          backgroundColor: '#E7E7E2',
          paddingLeft: 24,
          paddingRight: 24
        }}>
          {choosePin &&
          <PINCode
            status={'choose'}
            finishProcess={this.handleChoosePin}
          />
          }
          {!choosePin && (
            <React.Fragment>
              {/* TODO */}
              {/*<Text>Your Devices</Text>*/}
              <View style={{marginBottom: 16}}>
                <View>
                  <Text style={styles.title}>
                    {translate('Device Security')}
                  </Text>
                </View>
                <View style={styles.form}>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <View>
                      <Text style={{color: '#006F54', fontSize: 16, fontWeight: 'bold'}}>{translate('PIN Code')}</Text>
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', paddingLeft: 20, justifyContent: 'flex-end'}}>
                    </View>
                  </View>
                  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <View style={{flex: 1, alignSelf: 'stretch', flexDirection: 'row', marginTop: 10}}>
                      <View style={{width: 50, alignSelf: 'stretch', justifyContent: 'center'}}>
                        <Text style={{color: '#000', fontSize: 14}}>{translate('Off/On')}</Text>
                      </View>
                      <View style={{flex: 1, alignSelf: 'stretch', textAlign: 'center', paddingLeft: 20}}>
                        <Text style={{color: '#000', fontSize: 14}}>{translate('Enable PIN')}</Text>
                      </View>
                    </View>
                    <View style={{flex: 1, alignSelf: 'stretch', flexDirection: 'row', marginTop: 10}}>
                      <View style={{width: 50, alignSelf: 'stretch'}}>
                        <Switch
                          value={pinEnabled}
                          onValueChange={this.togglePinEnabled}
                        />
                      </View>
                      <View style={{flex: 1, alignSelf: 'stretch', paddingLeft: 20}}>
                        <Text>{translate('PIN_DESCRIPTION')}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              {/* TODO */}
              {/*<Text>Two-Factor Authentication</Text>*/}
            </React.Fragment>
          )}
        </View>
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

export default SecuritySettings;
