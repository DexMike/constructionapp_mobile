import React, {Component} from 'react';
import {FlatList, ScrollView, View} from 'react-native';
import {Button, Card, Overlay, Text, ThemeProvider} from 'react-native-elements';
import theme from '../../Theme';
import globalStyles from '../AppStyles';
import * as PropTypes from 'prop-types';
import styles from './AddFirstDriverStyles';
import AddDriverForm from '../AddDriverForm';
import {translate} from '../../i18n';

class AddFirstDriverPage extends Component {

  constructor(props) {
    super(props);
    const { user } = { ...this.props };

    this.state = {
      isVisible: false,
      drivers: [ {...user, driverStatus: 'Enabled'} ]
    };
    //getDriverByCompanyId

    this.handleAddedDriver = this.handleAddedDriver.bind(this);
    this.handleContinue = this.handleContinue.bind(this);
  }

  handleAddedDriver(savedDriver) {
    const { drivers } = { ...this.state };
    let newDriver = { ...savedDriver };
    newDriver.id = drivers.length + 1;
    drivers.push(newDriver);
    this.setState({ isVisible: false, drivers });
  }

  handleContinue() {
    const { onDriverAdded } = { ...this.props };
    onDriverAdded();
  }

  renderDriver({item}) {
    let user = item;
    return (
      <View style={styles.driverSection}>
        <Text>{user.firstName} {user.lastName}</Text>
        <Text>{user.driverStatus}</Text>
      </View>
    );
  }

  renderAddDriverOverlay() {
    return (
      <Overlay
        isVisible={this.state.isVisible}        
      >
        <AddDriverForm
          isFirstDriverPage
          onSuccess={this.handleAddedDriver}
          toggleOverlay={() => {this.setState({isVisible: false})}}
        />
      </Overlay>
    );
  }

  render() {
    const { drivers } = { ...this.state };

    return (
      <ThemeProvider theme={theme}>
        <View style={globalStyles.container}>
          {this.renderAddDriverOverlay()}
          <View style={styles.addFirstContainer}>
            <Card title={translate('Welcome to TRELAR')}>
              <ScrollView style={styles.addFirstBody}>
                <Text style={{marginBottom: 10}}>
                  {translate('Drivers')}:
                </Text>
                { drivers.length > 0 && (
                  <FlatList
                    renderItem={this.renderDriver}
                    data={drivers}
                    extraData={this.state} // to reload the flatlist when state changes
                    keyExtractor={item => `list-item-${item.id}`}
                  />
                )}
                <Text style={{marginTop: 10, marginBottom: 10}}>
                  {translate('ADD_DRIVER_ASK')}
                </Text>
                <View style={styles.addFirstButtonSection}>
                  <Button
                    buttonStyle={globalStyles.buttonStyle}
                    title={translate('Add Driver')}
                    onPress={() => {this.setState({isVisible: true})}}
                    // onPress={this.addTruckTest}
                  />
                  <Button
                    buttonStyle={globalStyles.buttonStyle}
                    title={ drivers.length > 1 ? translate('Continue') : translate('Skip')}
                    onPress={this.handleContinue}
                  />
                </View>
              </ScrollView>
            </Card>
          </View>
        </View>
      </ThemeProvider>
    )
  }
}

AddFirstDriverPage.propTypes = {
  user: PropTypes.object.isRequired,
  onDriverAdded: PropTypes.func.isRequired
};

export default AddFirstDriverPage;
