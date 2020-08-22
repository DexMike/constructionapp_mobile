import React, {Component} from 'react';
import {FlatList, ScrollView, View} from 'react-native';
import {Button, Card, Overlay, Text, ThemeProvider} from 'react-native-elements';
import AddTruckForm from '../addTruckForm/AddTruckForm';
import {Auth} from 'aws-amplify';
import theme from '../../Theme';
import globalStyles from '../AppStyles';
import styles from './AddFirstEquipmentStyles.js';
import * as PropTypes from 'prop-types';
import {translate} from '../../i18n';

class AddFirstEquipmentPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isVisible: false,
      equipments: []
    };

    this.handleAddedEquipment = this.handleAddedEquipment.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    // this.addTruckTest = this.addTruckTest.bind(this);
    this.handleContinue = this.handleContinue.bind(this);
  }

  handleAddedEquipment(savedEquipment) {
    const {equipments} = {...this.state};
    let newEquipment = {...savedEquipment};
    newEquipment.id = equipments.length + 1;
    equipments.push(newEquipment);
    this.setState({isVisible: false, equipments});
  }

  handleContinue() {
    const { onEquipmentAdded } = { ...this.props };
    onEquipmentAdded();
  }

  async handleSignOut() {
    const {onStateChange} = {...this.props};
    try {
      await Auth.signOut();
      onStateChange('signedOut', null);
    } catch (err) {
      onStateChange('signedOut', null);
    }
  }

  renderEquipment({item}) {
    let equipment = item;
    return (
      <View style={styles.equipmentSection}>
        <Text>{translate('Type')}: {equipment.type}</Text>
        <Text>{translate('Number')}: {equipment.externalEquipmentNumber}</Text>
      </View>
    );
  }

  renderAddEquipmentOverlay() {
    return (
      <Overlay
        isVisible={this.state.isVisible}
      >
        <AddTruckForm
          isFirstTruckPage
          onSuccess={this.handleAddedEquipment}
          toggleOverlay={() => {this.setState({isVisible: false})}}
        />
      </Overlay>
    );
  }

  // addTruckTest() {
  //   let { equipments } = { ...this.state };
  //   equipments.push({
  //     'id': 1,
  //     'name': 'New truck (Single-Axle)',
  //     'type': 'Single-Axle',
  //     'styleId': 0,
  //     'maxCapacity': 1,
  //     'minCapacity': 0,
  //     'minHours': 1,
  //     'maxDistance': 0,
  //     'description': '',
  //     'licensePlate': '',
  //     'vin': '',
  //     'image': '',
  //     'currentAvailability': 1,
  //     'startAvailability': null,
  //     'endAvailability': null,
  //     'hourRate': 1,
  //     'tonRate': 0,
  //     'rateType': 'Hour',
  //     'companyId': 2,
  //     'defaultDriverId': 0,
  //     'driverEquipmentsId': 0,
  //     'driversId': 0,
  //     'equipmentAddressId': 77,
  //     'modelId': '',
  //     'makeId': '',
  //     'notes': '',
  //     'created  By': 0,
  //     'createdOn': 1571156242000,
  //     'modifiedBy': 0,
  //     'modifiedOn': 1571156242000,
  //     'isArchived': 0,
  //     'materials': [
  //       'Stone',
  //       'Sand'
  //     ]
  //   });
  //   this.setState({equipments});
  // }

  render() {
    const {equipments} = {...this.state};
    return (
      <ThemeProvider theme={theme}>
        <View style={globalStyles.container}>
          {this.renderAddEquipmentOverlay()}
          <View style={styles.addFirstContainer}>
            <Card title={translate('Welcome to TRELAR')}>
              <ScrollView style={styles.addFirstBody}>
                <Text style={{marginBottom: 10}}>
                  {translate("ADD_YOUR_TRUCK")}
                </Text>
                {equipments.length > 0 && (
                  <FlatList
                    renderItem={this.renderEquipment}
                    data={equipments}
                    extraData={this.state} // to reload the flatlist when state changes
                    keyExtractor={item => `list-item-${item.id}`}
                  />
                )}
                <View style={styles.addFirstButtonSection}>
                  <Button
                    buttonStyle={globalStyles.buttonStyle}
                    title={translate('Add Truck')}
                    onPress={() => {this.setState({isVisible: true})}}
                    // onPress={this.addTruckTest}
                  />
                  { equipments.length > 0 && (
                    <Button
                      buttonStyle={globalStyles.buttonStyle}
                      title={translate('Continue')}
                      onPress={this.handleContinue}
                    />
                  )}
                  <Button
                    buttonStyle={globalStyles.buttonStyle}
                    title={translate('Logout')}
                    type={'outline'}
                    onPress={this.handleSignOut}
                  />
                </View>
              </ScrollView>
            </Card>
          </View>
        </View>
      </ThemeProvider>
    );
  }
}

AddFirstEquipmentPage.propTypes = {
  onStateChange: PropTypes.func.isRequired,
  onEquipmentAdded: PropTypes.func.isRequired
};

export default AddFirstEquipmentPage;
