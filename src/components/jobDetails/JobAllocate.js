import React, {Component} from 'react';
import {TouchableOpacity, View, ActivityIndicator, Picker} from 'react-native';
import {Button, Overlay, Text} from 'react-native-elements';
import styles from './JobDetailsStyles';
import {translate} from '../../i18n';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import LoadService from '../../api/LoadService';
import MultiSelect from 'react-native-quick-select';
import EquipmentService from '../../api/EquipmentService';
import EquipmentDetailService from '../../api/EquipmentDetailService';
import moment from 'moment';

class JobAllocate extends Component {

  constructor(props) {
    super(props);

    this.state = {
      savingSelectedDrivers: false,
      driversWithLoads: [],
      bookingEquipments: [],
      drivers: [],
      equipments: [],

      selectableDrivers: [],
      selectableEquipments: [],

      allocateDriversModal: false,
      selectedDriver: null,
      selectedEquipment: null,

      activeDrivers: [],

      // field review
      isDriverValid: true,
      isEquipmentValid: true,
      isLoading: false
    };

    this.renderBERow = this.renderBERow.bind(this);
    this.handleDriverSelect = this.handleDriverSelect.bind(this);
    this.handleEquipmentSelect = this.handleEquipmentSelect.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  async componentDidMount() {
    const { booking, profile } = { ...this.props };
    let {
      bookingEquipments,
      equipments,
      drivers,
      selectableEquipments,
      selectableDrivers
    } = { ...this.state };
    const { driversWithLoads } = { ...this.state };
    if (booking) {
      try {
        bookingEquipments = await BookingEquipmentService
          .getBookingEquipmentsByBookingId(booking.id);
        // 999 since not able to page dropdown and trucks per company should be a small amount.
        equipments = await EquipmentService.getEquipmentByCompanyId(profile.companyId, 999, 0);
        equipments = equipments.data;
        selectableEquipments = equipments
          .filter(equipment => !bookingEquipments
            .some(bookingEquipment => bookingEquipment.equipmentId === equipment.id))
          .map(equipment => ({
          name: (equipment.externalEquipmentNumber
            ? equipment.externalEquipmentNumber
            : translate('Number not set')),
          id: String(equipment.id),
          defaultDriverId: equipment.defaultDriverId
        }));
        drivers = await EquipmentDetailService.getDefaultDriverList(profile.companyId);
        drivers = drivers.data.map(driver => ({
          ...driver,
          name: `${driver.firstName} ${driver.lastName}`
        }));
        selectableDrivers = drivers
          .filter(driver => !bookingEquipments
            .some(bookingEquipment => bookingEquipment.driverId === driver.driverId))
          .map(driver => ({
            name: driver.name,
            id: String(driver.driverId)
          }));
        const driversResponse = await LoadService.getDriversWithLoadsByBookingId(booking.id);
        if (driversResponse && driversResponse.length > 0) {
          driversResponse.map(driver => (
            driversWithLoads.push(driver.id)
          ));
        }
      } catch (err) {
        console.error(error);
      }
    }
    this.setState({
      bookingEquipments,
      driversWithLoads,
      equipments,
      drivers,
      selectableDrivers,
      selectableEquipments
    });
  }

  closeModal() {
    this.setState({
      allocateDriversModal: false,
      selectedEquipment: [],
      selectedDriver: [],
      isDriverValid: true,
      isEquipmentValid: true
    });
  }

  async handleAllocateDrivers() {
    this.setState({
      savingSelectedDrivers: true,
      isLoading: true
    });
    const { booking, profile, job } = { ...this.props };
    const { bookingEquipments, selectedDriver, selectedEquipment, equipments, drivers } = { ...this.state };
    const isValid = this.isFormValid();
    if (!isValid) {
      this.setState({ isLoading: false });
      return;
    }
    const driverId = parseInt(selectedDriver, 10);
    const equipmentId = parseInt(selectedEquipment, 10);
    let newBookingEquipment = {
      bookingId: booking.id,
      schedulerId: profile.userId,
      driverId,
      equipmentId,
      rateType: booking.rateType, // This could be from equipment
      rateActual: 0,
      startTime: moment().utc().format(),
      endTime: moment().utc().format(),
      startAddressId: job.startAddress.id,
      endAddressId: job.endAddress.id,
      notes: '',
      createdBy: profile.userId,
      createdOn: moment().utc().format(),
      modifiedBy: profile.userId,
      modifiedOn: moment().utc().format(),
    };
    try {
      [ newBookingEquipment ] = await BookingEquipmentService
        .allocateDrivers([newBookingEquipment], booking.id);
    } catch (err) {
      console.log('Failed to save the booking equipment.');
    }
    bookingEquipments.push(newBookingEquipment);

    const selectableEquipments = equipments
      .filter(equipment => !bookingEquipments
        .some(bookingEquipment => bookingEquipment.equipmentId === equipment.id))
      .map(equipment => ({
        name: (equipment.externalEquipmentNumber
          ? equipment.externalEquipmentNumber
          : translate('Number not set')),
        id: equipment.id,
        defaultDriverId: equipment.defaultDriverId
      }));
    const selectableDrivers = drivers
      .filter(driver => !bookingEquipments
        .some(bookingEquipment => bookingEquipment.driverId === driver.driverId))
      .map(driver => ({
        name: driver.name,
        id: driver.driverId
      }));

    this.closeModal();
    this.setState({
      isLoading: false,
      bookingEquipments,
      selectableDrivers,
      selectableEquipments
    });
  }

  async unAllocateDriver(id, isAlreadyDrivingMatch) {
    const { equipments, drivers } = { ...this.state };
    let { bookingEquipments, selectableEquipments, selectableDrivers } = { ...this.state };
    if (isAlreadyDrivingMatch) {
      alert('You cannot remove drivers that have already started a load');
    } else {
      try {
        await BookingEquipmentService.deleteBookingEquipmentById(id);
      } catch (err) {
        console.log('Failed to remove the booking equipment');
      }
      bookingEquipments = bookingEquipments.filter(bookingEquipment => bookingEquipment.id !== id);
      bookingEquipments = bookingEquipments.filter(bookingEquipment => bookingEquipment.id !== id);
      selectableEquipments = equipments
        .filter(equipment => !bookingEquipments
          .some(bookingEquipment => bookingEquipment.equipmentId === equipment.id))
        .map(equipment => ({
          name: (equipment.externalEquipmentNumber
            ? equipment.externalEquipmentNumber
            : translate('Number not set')),
          id: equipment.id,
          defaultDriverId: equipment.defaultDriverId
        }));
      selectableDrivers = drivers
        .filter(driver => !bookingEquipments
          .some(bookingEquipment => bookingEquipment.driverId === driver.driverId))
        .map(driver => ({
          name: driver.name,
          id: driver.driverId
        }));
      this.setState({ bookingEquipments, selectableEquipments, selectableDrivers });
    }
  }

  handleDriverSelect(itemValue) {
    this.setState({
      selectedDriver: itemValue,
      isDriverValid: true
    });
  }

  handleEquipmentSelect(itemValue) {
    const { selectableDrivers, equipments } = { ...this.state };
    const equipment = equipments.find(equipment => parseInt(itemValue, 10) === equipment.id);

    let selectedDriver = null;
    if (equipment) {
      selectedDriver = selectableDrivers
        .find(driver => parseInt(driver.id, 10) === equipment.defaultDriverId);
      selectedDriver = selectedDriver ? selectedDriver.id : null;
    }
    this.setState({
      selectedDrivers: selectedDriver,
      selectedEquipment: itemValue,
      isEquipmentValid: true
    });
  }

  isFormValid() {
    let { selectedEquipment, selectedDriver } = { ...this.state };
    let isEquipmentValid = !!selectedEquipment;
    let isDriverValid = !!selectedDriver;
    this.setState({
      isEquipmentValid,
      isDriverValid
    });
    return !!(isEquipmentValid && isDriverValid);
  }


  renderAllocateDriversOverlay() {
    const {
      allocateDriversModal,
      selectedDriver,
      selectedEquipment,
      selectableDrivers,
      selectableEquipments,
      isEquipmentValid,
      isDriverValid,
      drivers,
      isLoading
    } = {...this.state};
    return (
      <Overlay
        isVisible={allocateDriversModal}
        onBackdropPress={() => this.setState({allocateDriversModal: false})}
        height="auto"
      >
        <View style={{height: 400, display: 'flex'}}>
          <View>
            <Text h4>{translate('Allocate Driver')}</Text>
          </View>
          <Text style={{
            marginBottom: 0,
            // backgroundColor: 'rgba(0,255,0,0.4)'
          }}>Truck</Text>
          {
            !isEquipmentValid
              ? (
                <Text style={styles.errorMessage}>
                  * {translate('Please select a Truck')}
                </Text>
              )
              : null
          }
          <Picker
            selectedValue={selectedEquipment}
            style={{
              height: 134,
              // backgroundColor: 'rgba(0,0,255,0.4)'
            }}
            itemStyle={{height: 134, fontSize: 14}}
            // onValueChange={(itemValue, itemIndex) => this.setState({language: itemValue})}
            onValueChange={this.handleEquipmentSelect}
          >
            <Picker.Item label={translate('Pick Truck')} value={null} />
            {selectableEquipments.map(selectableEquipment => {
              return (
                <Picker.Item key={selectableEquipment.id} label={selectableEquipment.name} value={selectableEquipment.id} />
              )
            })}
          </Picker>
          <Text>Driver</Text>
          {
            !isDriverValid
              ? (
                <Text style={styles.errorMessage}>
                  * {translate('Please select a Driver')}
                </Text>
              )
              : null
          }
          <Picker
            selectedValue={selectedDriver}
            style={{
              height: 134,
              // backgroundColor: 'rgba(0,0,255,0.4)'
            }}
            itemStyle={{height: 134, fontSize: 14}}
            onValueChange={this.handleDriverSelect}
          >
            <Picker.Item label={translate('Pick Driver')} value={null} />
            {selectableDrivers.map(selectableDriver => {
              return (
                <Picker.Item key={selectableDriver.id} label={selectableDriver.name} value={selectableDriver.id} />
              )
            })}
          </Picker>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            // backgroundColor: 'rgba(255,0,0,0.4)'
          }}>
             <View style={styles.row}>
              <TouchableOpacity
                disabled={isLoading}
                style={[styles.button, styles.actionOutlinedButton]}
                onPress={() => this.closeModal()}
              >
                <Text style={styles.buttonDarkText}>
                  &nbsp;{translate('Close')}&nbsp;
                </Text>
                {
                  isLoading && (<ActivityIndicator color="#FFF"/>)
                }
              </TouchableOpacity>
            </View>
            {drivers.length === 0 &&
            <Button
              title={translate('Invite Driver')}
              onPress={() => {
                this.setState({allocateDriversModal: false});
                this.props.navigation.navigate('AddDriverForm');
              }}
            />
            }
            {drivers.length !== 0 &&
             <View style={styles.row}>
              <TouchableOpacity
                disabled={isLoading}
                style={[styles.button, styles.actionButton]}
                onPress={() => this.handleAllocateDrivers()}
              >
                <Text style={styles.buttonLightText}>
                  &nbsp;{translate('Save')}&nbsp;
                </Text>
                {
                  isLoading && (<ActivityIndicator color="#FFF"/>)
                }
              </TouchableOpacity>
            </View>
            }
          </View>
        </View>
      </Overlay>
    );
  }

  renderBERow(bookingEquipment) {
    const { driversWithLoads } = { ...this.state };
    if(bookingEquipment) {
      const isAlreadyDrivingMatch = driversWithLoads
        .find(driverWithLoads => driverWithLoads === bookingEquipment.driverId);
      return (
        <View key={bookingEquipment.id} style={{flex: 1, flexDirection: 'row', padding: 10}}>
          { this.renderBEColumn(<Text>{bookingEquipment.externalEquipmentNumber}</Text>) }
          { this.renderBEColumn(<Text>{bookingEquipment.driverName}</Text>) }
          { this.renderBEColumn(<Text>{moment(bookingEquipment.createdOn).format('MM/DD/YY')}</Text>) }
          { this.renderBEColumn(
            <TouchableOpacity onPress={() => this.unAllocateDriver(bookingEquipment.id, isAlreadyDrivingMatch)}>
              <Icon name={'highlight-off'} size={32} color={isAlreadyDrivingMatch ? 'grey' : 'red'} />
            </TouchableOpacity>
          ) }
        </View>
      )
    } else {
      return (
        <View style={{flex: 1, flexDirection: 'row', padding: 10}}>
          { this.renderBEColumn(<Text>{translate('Truck')}</Text>) }
          { this.renderBEColumn(<Text>{translate('Driver')}</Text>) }
          { this.renderBEColumn(<Text>{translate('Allocated')}</Text>) }
          { this.renderBEColumn(<Text>{translate('Actions')}</Text>) }
        </View>
      )
    }

  }

  renderBEColumn(content) {
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        // backgroundColor: '#F00',
        // borderRadius: 3,
        padding: 12,
        justifyContent: 'center',
      }}
      >
        {content}
      </View>
    );
  }

  render() {
    let { bookingEquipments, drivers, equipments } = { ...this.state };
    const { selectableDrivers, selectableEquipments } = { ...this.state };
    bookingEquipments = bookingEquipments.map(bookingEquipments => {
      const driverMatch = drivers.find(driver => {
        return driver.driverId === bookingEquipments.driverId;
      });
      const driverName = (driverMatch && driverMatch.name) ? driverMatch.name : '-';
      const equipmentMatch = equipments.find(equipment => {
        return equipment.id === bookingEquipments.equipmentId;
      });
      const externalEquipmentNumber = (equipmentMatch && equipmentMatch.externalEquipmentNumber) ? equipmentMatch.externalEquipmentNumber : '-';
      return {
        ...bookingEquipments,
        driverName,
        externalEquipmentNumber
      }
    });

    return (
      <View
        style={{
          marginTop: 16,
          marginBottom: 8
        }}
      >
        { this.renderAllocateDriversOverlay() }
        <View
          style={{
            flexDirection: 'column'
          }}
        >
          <Text
            style={styles.sectionTitle}
          >
            {translate('Allocate')}
          </Text>
        </View>

        <View
          style={[{
            flexDirection: 'column',
            backgroundColor: '#FFF',
            borderRadius: 3,
            padding: 12,
            justifyContent: 'center'
          }, styles.boxShadow]}>
          <View style={styles.row}>
            { selectableDrivers.length > 0 && selectableEquipments.length > 0 && (
              <TouchableOpacity
                style={[styles.button, styles.actionButton]}
                onPress={() => {
                  // await this.getDrivers();
                  this.setState({allocateDriversModal: true});
                }}
              >
                <Icon
                  name="local-shipping"
                  size={20}
                  color="white"
                />
                <Text style={styles.buttonLightText}>&nbsp;{translate('ALLOCATE DRIVERS')}</Text>
              </TouchableOpacity>
            )}
          </View>
          { bookingEquipments.length > 0 && this.renderBERow() }
          { bookingEquipments.length > 0 &&
            bookingEquipments.map((bookingEquipment => {
              return (
                this.renderBERow(bookingEquipment)
              )
            }))
          }
          { (selectableEquipments.length === 0 && selectableDrivers.length > 0) && (
            <Text>{translate('NO_TRUCKS')}</Text>
          )}
          { (selectableDrivers.length === 0 && selectableEquipments.length > 0) && (
            <Text>{translate('NO_DRIVERS')}</Text>
          )}
          { (selectableDrivers.length === 0 && selectableEquipments.length === 0) && (
            <Text>{translate('NO_TRUCKS_OR_DRIVERS')}</Text>
          )}
          { bookingEquipments.length <= 0 && (
            <Text>{'You have no allocated drivers'}</Text>
          )}
        </View>
      </View>
    );
  }
}

export default JobAllocate;
