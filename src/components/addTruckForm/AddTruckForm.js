import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  // CheckBox,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {Button, CheckBox, ThemeProvider} from 'react-native-elements';
import moment from 'moment';
import * as PropTypes from 'prop-types';
import MultiSelect from 'react-native-quick-select';
import ProfileService from '../../api/ProfileService';
import CompanyService from '../../api/CompanyService';
import LookupsService from '../../api/LookupsService';
import EquipmentService from '../../api/EquipmentService';
import EquipmentMaterialsService from '../../api/EquipmentMaterialsService';
import NavigationService from '../../service/NavigationService';
import styles from './AddTruckFormStyles';
import {translate} from '../../i18n';
import theme from '../../Theme';
import EquipmentDetailService from '../../api/EquipmentDetailService';

class AddTruckForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // id: 0, // for use if we are editing
      // driversId: 0, // for use if we are editing
      // defaultDriver: 0, // for use if we are editing
      selectedMaterials: [],
      allMaterials: [],
      truckTypes: [],
      maxCapacity: '0',
      // maxCapacityTouched: false,
      description: '',
      vin: '',
      licensePlate: '',
      ratesByHour: false,
      // ratesByTon: false,
      ratesCostPerTon: '0',
      ratesCostPerHour: '0',
      minOperatingTime: '0',
      minTons: '0',
      maxDistanceToPickup: '0',
      truckType: [],
      externalEquipmentNumber: "",
      truckName: "",
      isRatedHour: true,
      isRatedTon: true,
      activeTab: '1',
      screenHeight: 0,
      profile: null,
      company: null,
      loaded: false,
      defaultDriver: [],
      companyDrivers: [],

      // field review
      isTruckTypeValid: true,
      isTruckNameValid: true,
      isMaterialsValid: true,
      isExternalEquipmentNumberValid: true,
      isMaximumCapacityValid: true,
      externalEquipmentNumberError: '',
      isLoading: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.handleMultiChangeTrucks = this.handleMultiChangeTrucks.bind(this);
    this.handleDefaultDriverChange = this.handleDefaultDriverChange.bind(this);
    this.saveTruck = this.saveTruck.bind(this);
    // this.isFormValid = this.isFormValid.bind(this);
  }

  async componentDidMount() {
    let { profile, company, companyDrivers, defaultDriver } = { ...this.state };
    let params = null;
    profile = await ProfileService.getProfile();
    company = await CompanyService.getCompanyById(profile.companyId);

    if(NavigationService.getCurrentRoute()) {
      params = NavigationService.getCurrentRoute().params;
    }

    const editTruck = params && params.editTruck;
    const truckToEdit = params && params.truckToEdit;

    const equipmentId = (truckToEdit && truckToEdit.id) ? truckToEdit.id : 0;
    companyDrivers = (await EquipmentDetailService.getEquipmentDefaultDriverList(profile.companyId, equipmentId)).data.map((companyDriver) => {
      return {
        id: companyDriver.driverId,
        name: `${companyDriver.firstName} ${companyDriver.lastName}`
      }
    });
    companyDrivers = [{ id: null, name: translate('Unassigned') }, ...companyDrivers];

    await this.fetchMaterials(editTruck, truckToEdit);
    this.setState({
      loaded: true,
      profile,
      company,
      companyDrivers
    });
  }

  // Pull materials
  async fetchMaterials(editTruck, truckToEdit) {
    let materials = await LookupsService.getLookupsByType('MaterialType');
    const truckTypes = await LookupsService.getLookupsByType('EquipmentType');

    materials = materials.map(material => ({
      id: String(material.id),
      name: material.val1
    }));

    let allTruckTypes = [];
    allTruckTypes = truckTypes.map(truckType => ({
      id: String(truckType.id),
      name: truckType.val1
    }));

    if (editTruck && truckToEdit) {
      let selectedMaterials = await EquipmentMaterialsService.getEquipmentMaterialsByEquipmentId(truckToEdit.id);
      selectedMaterials = selectedMaterials.map(mat => mat.value);
      const truckType = [truckToEdit.type];
      const minTons = !truckToEdit.minCapacity ? 0 : truckToEdit.minCapacity;
      const truckName = truckToEdit.name;
      const externalEquipmentNumber = truckToEdit.externalEquipmentNumber;
      const minOperatingTime = !truckToEdit.minHours ? 0 : truckToEdit.minHours;
      const maxDistanceToPickup = !truckToEdit.maxDistance ? 0 : truckToEdit.maxDistance;
      const maxCapacity = !truckToEdit.maxCapacity ? 0 : truckToEdit.maxCapacity;
      const ratesCostPerHour = !truckToEdit.hourRate ? 0 : truckToEdit.hourRate;
      const ratesCostPerTon = !truckToEdit.tonRate ? 0 : truckToEdit.tonRate;
      const isRateTon = truckToEdit.rateType === 'Ton';
      this.setState({
        allMaterials: materials,
        truckTypes: allTruckTypes,
        selectedMaterials,
        truckType,
        minTons,
        truckName,
        minOperatingTime,
        maxCapacity,
        maxDistanceToPickup,
        ratesCostPerHour,
        ratesCostPerTon,
        isRateTon,
        externalEquipmentNumber,
        defaultDriver: truckToEdit.defaultDriverId ? [truckToEdit.defaultDriverId] : []
      });
    } else {
      this.setState({
        allMaterials: materials,
        truckTypes: allTruckTypes
      });
    }

    // check if there is preloaded info
    // const { getTruckFullInfo, passedTruckFullInfo, equipmentId } = this.props;
    /* const { getTruckFullInfo, equipmentId } = this.props;
    const preloaded = getTruckFullInfo(); */

    this.saveTruckInfo(false);
    // let's cache this info, in case we want to go back
  }

  saveTruckInfo(redir) {
    const {
      id,
      selectedMaterials,
      defaultDriver,
      driversId,
      truckType,
      maxCapacity,
      image,
      description,
      vin,
      licensePlate,
      isRatedHour,
      isRatedTon,
      ratesCostPerHour,
      ratesCostPerTon,
      minOperatingTime,
      minTons,
      maxDistanceToPickup
    } = this.state;
    const {
      getTruckFullInfo,
      equipmentId,
    } = this.props;
    let {saveValues} = this.state;
    // const { onTruckFullInfo } = this.props;

    // map the values with the ones on equipment
    const shortDesc = description.substring(0, 45);

    // dates if preloaded

    // const preloaded = getTruckFullInfo();

    // TODO-> Ask which params are required
    saveValues = {
      id,
      selectedMaterials,
      name: shortDesc, // unasigned
      type: truckType,
      styleId: 0, // unasigned
      maxCapacity, // This is a shorthand of (maxCapacity: maxCapacity)
      minCapacity: 0, // unasigned
      minHours: minOperatingTime,
      minTons,
      maxDistance: maxDistanceToPickup,
      description,
      licensePlate,
      vin,
      image,
      // currentAvailability: available, // unasigned
      // startAvailability: start, // careful here, it's date unless it exists
      // endAvailability: end,
      isRatedHour,
      isRatedTon,
      hourRate: ratesCostPerHour,
      tonRate: ratesCostPerTon,
      // rateType: chargeBy, // PENDING
      equipmentId,
      defaultDriverId: defaultDriver.id, // unasigned
      driverEquipmentsId: 0, // unasigned
      driversId, // THIS IS A FK
      equipmentAddressId: 3, // THIS IS A FK
      modelId: '', // unasigned
      makeId: '', // unasigned
      notes: '', // unasigned
      createdBy: 0,
      createdOn: moment.utc().format(),
      modifiedBy: 0,
      modifiedOn: moment.utc().format(),
      isArchived: 0,
      redir
    };

    // save info in the parent
    this.setState({ saveValues },
      function wait() {
        // onTruckFullInfo(saveValues);
        // this.handleSubmit('Truck');
      });
  }

  async isFormValid() {
    const { profile } = { ...this.state };

    let params = null;
    if(NavigationService.getCurrentRoute()) {
      params = NavigationService.getCurrentRoute().params;
    }
    const editTruck = params && params.editTruck;
    const truckToEdit = params && params.truckToEdit;

    let isValid = true;
    let {
      isTruckTypeValid,
      isMaterialsValid,
      isExternalEquipmentNumberValid,
      isMaximumCapacityValid,

      truckType,
      selectedMaterials,
      externalEquipmentNumber,
      maxCapacity,
      truckName,
      isTruckNameValid,
      externalEquipmentNumberError
    } = this.state;

    if(!truckType.length > 0){
      isValid = false;
      isTruckTypeValid = false;
    } else {
      isTruckTypeValid = true;
    }

    if(!selectedMaterials.length > 0){
      isValid = false;
      isMaterialsValid = false;
    } else {
      isMaterialsValid = true;
    }

    const response = await EquipmentService.checkExternalEquipmentNumber(
      {
        companyId: profile.companyId,
        externalEquipmentNumber
      }
    );

    if(externalEquipmentNumber === '' || externalEquipmentNumber === null) {
      isValid = false;
      isExternalEquipmentNumberValid = false;
      externalEquipmentNumberError = 'Please enter truck number';
    } else if (!response.isUnique && (!editTruck || (editTruck && truckToEdit.externalEquipmentNumber !== externalEquipmentNumber))) {
      isValid = false;
      isExternalEquipmentNumberValid = false;
      externalEquipmentNumberError = 'You have used this truck number for another truck';
    } else {
      isExternalEquipmentNumberValid = true;
    }

    if(Number(maxCapacity) < 1){
      isValid = false;
      isMaximumCapacityValid = false;
    } else {
      isMaximumCapacityValid = true;
    }

    if (editTruck && truckName.length < 1) {
      isTruckNameValid = false;
      isValid = false;
    }

    if (isValid) {
      externalEquipmentNumberError = '';
    }

    this.setState({
      isTruckTypeValid,
      isMaterialsValid,
      isExternalEquipmentNumberValid,
      isMaximumCapacityValid,
      isTruckNameValid,
      externalEquipmentNumber,
      externalEquipmentNumberError
    });

    return isValid;


  }

  async saveTruck() {
    const {
      truckNumber,
      truckType,
      isRatedTon,
      ratesCostPerTon,
      ratesCostPerHour,
      minOperatingTime,
      minTons,
      maxDistanceToPickup,
      maxCapacity,
      selectedMaterials,
      truckName,
      profile,
      company,
      externalEquipmentNumber,
      defaultDriver
    } = this.state;
    const { onSuccess } = { ...this.props };
    this.setState({ isLoading: true });
    const isFormValid = await this.isFormValid();
    if (!isFormValid) {
      this.setState({ isLoading: false });
      return;
    }
    let params = null;
    if(NavigationService.getCurrentRoute()) {
      params = NavigationService.getCurrentRoute().params;
    }
    const editTruck = params && params.editTruck;
    const truckToEdit = params && params.truckToEdit;

    let rated = 'Hour';
    if(isRatedTon){
      rated = 'Ton';
    }

    const equipment = {
      name: "New truck ("+truckType[0]+")",
      type: truckType[0],
      styleId: 0,
      maxCapacity: maxCapacity,
      minCapacity: minTons,
      minHours: minOperatingTime,
      maxDistance: maxDistanceToPickup,
      description: '',
      licensePlate: '',
      vin: '',
      image: '',
      currentAvailability: 1,
      hourRate: ratesCostPerHour,
      tonRate: ratesCostPerTon,
      rateType: rated,
      companyId: profile.companyId,
      defaultDriverId: defaultDriver.length > 0 ? defaultDriver[0] : null,
      driverEquipmentsId: 0,
      driversId: 0,
      equipmentAddressId: null,
      modelId: '',
      makeId: '',
      notes: '',
      externalEquipmentNumber,
      createdBy: 0,
      createdOn: moment.utc().format(),
      modifiedBy: 0,
      modifiedOn: moment.utc().format(),
      isArchived: 0
    };

    // edit truck
    if (editTruck && truckToEdit) {
      equipment.id = truckToEdit.id;
      equipment.name = truckName;
      try {
        const materials = [];
        for (const material of selectedMaterials) {
          const mat = {
            "equipmentsId": equipment.id,
            "value": material,
            "isArchived": 0
          };
          materials.push(mat);
        }

        let equipmentUpdate = {};
        equipmentUpdate.equipment = equipment;
        equipmentUpdate.equipmentMaterials = materials;
        await EquipmentService.updateEquipmentWithMaterials(equipmentUpdate);
        // await EquipmentMaterialsService.createEquipmentMaterials(mat);

        this.props.navigation.goBack();
      } catch(e) {
        console.log('>>Unable to save equipment:', e);
      }
    } else { // add new truck
      // for(let i = 0; i < truckNumber; i++) {
        try {
          // let newEquipment = await EquipmentService.createEquipment(equipment);
          const materials = selectedMaterials.map((mat) => {
            return {
              equipmentsId: 0,
              value: mat,
              createdOn: moment.utc().format(),
              createdBy: profile.userId,
              modifiedOn: moment.utc().format(),
              modifiedBy: profile.userId
            };
          });
          const equipments = [equipment];
          await EquipmentService.createEquipmentsBatch(equipments, materials);
          // for(const material of selectedMaterials) {
          //   const mat = {
          //     "equipmentsId": 0,
          //     "value": material,
          //     "isArchived": 0
          //   };
          //   await EquipmentMaterialsService.createEquipmentMaterials(mat);
          // }
          if (this.props.navigation) {
            this.props.navigation.goBack();
          }
          equipment.materials = materials.map((mat1) => { return mat1.value; });
          onSuccess(equipment);
        } catch(e) {
          console.log('>>Unable to save equipment:', e);
        }
      // }
    }
    this.setState({ isLoading: false });
    //TODO add success handler like on SG and don't do this if no screenProps.
    if (this.props.screenProps) {
      this.props.screenProps.setReloadTrucks(true);
    }
  }

  handleInputChange(name, value) {
    if (name === 'ratesByHour' && value) {
      this.setState({ isRatedHour: true });
    } else if (name === 'ratesByHour' && !value) {
      this.setState({ isRatedHour: false });
    }

    if (name === 'ratesByTon' && value) {
      this.setState({ isRatedTon: true });
    } else if (name === 'ratesByTon' && !value) {
      this.setState({ isRatedTon: false });
    }

    if (name === 'truckNumber') {
      this.setState({ truckNumber: value });
    }

    if (name === 'truckName') {
      this.setState({ truckName: value });
    }

    if (name === 'ratesCostPerHour') {
      let reqHandler = 'reqHandlerMinRate';
    } else if (name === 'minOperatingTime') {
      let reqHandler = 'reqHandlerMinTime';
    } else if (name === 'maxCapacity') {
      let reqHandler = 'reqHandlerMaxCapacity';
    }
    // Then we set the touched prop to false, hiding the error label
    /* this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      })
    }); */

    this.setState({ [name]: value },
      function wait() {
        this.saveTruckInfo(false);
      });
  }

  handleMultiChange(data) {
    this.setState({ selectedMaterials: data },
      function wait() {
        this.saveTruckInfo(false);
      });
  }

  handleMultiChangeTrucks(data) {
    this.setState({ truckType: data },
      function wait() {
        this.saveTruckInfo(false);
      });
  }

  handleDefaultDriverChange(data) {
    this.setState({ defaultDriver: data },
      () => this.saveTruckInfo(false)
    );
  }

  render() {
    const {loaded} = this.state;
    let {
      id,
      defaultDriver,
      selectedMaterials,
      allMaterials,
      truckType,
      maxCapacity,
      ratesCostPerHour,
      isRatedHour,
      isRatedTon,
      ratesCostPerTon,
      minOperatingTime,
      minTons,
      maxDistanceToPickup,
      truckTypes,
      externalEquipmentNumber,
      externalEquipmentNumberError,
      companyDrivers,
      isTruckTypeValid,
      isMaterialsValid,
      isExternalEquipmentNumberValid,
      isMaximumCapacityValid,
      isTruckNameValid,
      truckName,
      isLoading
    } = {...this.state};

    const { toggleOverlay, isFirstTruckPage } = {...this.props};

    let params = null;
    if(NavigationService.getCurrentRoute()) {
      params = NavigationService.getCurrentRoute().params;
    }
    const editTruck = params && params.editTruck;

    let defaultDriverName = companyDrivers.find(companyDriver => {
      return defaultDriver[0] && companyDriver.id === defaultDriver[0];
    });
    if (defaultDriverName) {
      defaultDriverName = defaultDriverName.name;
    } else {
      defaultDriverName = '';
    }

    if (!loaded) {
      return (
        <View style={{flex: 1, padding: 20, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
          {/*<ActivityIndicator size="large"/>*/}
          <Text style={{marginBottom: 10}}>
            {translate('ADD_YOUR_TRUCK')}
          </Text>
        </View>
      )
    }
    return (
      <ThemeProvider theme={theme}>

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "padding"}>
            <KeyboardAwareScrollView
              onContentSizeChange={this.onContentSizeChange}
              keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
              enableOnAndroid
            >
              <View style={{flex: 1, backgroundColor: '#E7E7E2'}}>
                <View style={styles.form}>
                  <View>
                    <Text style={styles.title}>
                      {translate('Tell us about your truck')}
                    </Text>
                  </View>
                  <React.Fragment>
                    <Text style={styles.label}>{translate('Truck Number')}</Text>
                    <TextInput
                      style={[styles.textInput, {paddingLeft: 16}]}
                      name="externalEquipmentNumber"
                      type="text"
                      autoCapitalize='none'
                      value={externalEquipmentNumber}
                      onChangeText={(value) => this.handleInputChange("externalEquipmentNumber", value)}
                    />
                    {
                      !isExternalEquipmentNumberValid
                        ? (
                          <Text style={styles.errorMessage}>
                            * {externalEquipmentNumberError}
                          </Text>
                        )
                        : null
                    }
                  </React.Fragment>
                  {editTruck &&
                  <React.Fragment>
                    <Text style={styles.label}>{translate('Truck Name')}</Text>
                    <TextInput
                      style={[styles.textInput, {paddingLeft: 16}]}
                      name="truckName"
                      type="text"
                      autoCapitalize='none'
                      value={truckName}
                      onChangeText={(value) => this.handleInputChange("truckName", value)}
                    />
                    {
                      !isTruckNameValid
                        ? (
                          <Text style={styles.errorMessage}>
                            * Please enter a truck name
                          </Text>
                        )
                        : null
                    }
                  </React.Fragment>
                  }
                  <Text style={styles.label}>{translate('Truck Type')}</Text>
                  <MultiSelect
                    single
                    items={truckTypes}
                    uniqueKey="name"
                    onSelectedItemsChange={this.handleMultiChangeTrucks}
                    fixedHeight={false}
                    selectedItems={truckType}
                    // selectText="Search Truck Type..."
                    searchInputPlaceholderText="Search Truck Type..."
                    selectText={truckType.length > 0 ? truckType[0] : translate('Pick Items')}
                  />
                  {
                    !isTruckTypeValid
                    ? (
                      <Text style={styles.errorMessage}>
                        * Please enter Truck Type
                      </Text>
                      )
                    : null
                    }
                  <Text style={styles.label}>{translate('Materials Hauled')}</Text>
                  <MultiSelect
                    items={allMaterials}
                    uniqueKey="name"
                    onSelectedItemsChange={this.handleMultiChange}
                    fixedHeight={false}
                    selectedItems={selectedMaterials}
                    selectText={`${translate('Search Materials')}...`}
                    searchInputPlaceholderText={`${translate('Search Materials')}...`}
                    tagRemoveIconColor="#348A74"
                    tagBorderColor="#348A74"
                    tagTextColor="#348A74"
                    selectedItemTextColor="#348A74"
                    selectedItemIconColor="#348A74"
                    itemTextColor="#555"
                    searchInputStyle={{ color: '#CCC' }}
                    submitButtonColor="#348A74"
                    submitButtonText="Ok"
                  />
                  {
                    !isMaterialsValid
                    ? (
                      <Text style={styles.errorMessage}>
                        * Please enter one or more materials
                      </Text>
                      )
                    : null
                  }
                  <Text style={styles.label}>{translate('Default Driver')}</Text>
                  <MultiSelect
                    single
                    items={companyDrivers}
                    uniqueKey="id"
                    displayKey="name"
                    onSelectedItemsChange={this.handleDefaultDriverChange}
                    fixedHeight={false}
                    selectedItems={defaultDriver}
                    searchInputPlaceholderText={translate('Default Driver')}
                    selectText={defaultDriver.length > 0 ? defaultDriverName : translate('Default Driver')}
                  />
                </View>

                <View style={styles.form}>
                  <View>
                    <Text style={styles.title}>
                      {translate('Truck Rates')}
                    </Text>
                    <Text style={{textAlign: 'center'}}>
                      ({translate('Optional')})
                    </Text>
                  </View>

                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={{flex: 1, flexDirection: 'column'}}>
                      <CheckBox
                        containerStyle={{paddingLeft: 0, marginLeft: 0}}
                        title={translate('By Hour')}
                        checked={isRatedHour}
                        onPress={() => this.handleInputChange('ratesByHour', !isRatedHour)}

                      />
                      {/*<Text style={{marginTop: 5}}>{translate('By Hour')}</Text>*/}
                    </View>
                  </View>

                  <View style={{flex: 1, flexDirection: 'row', alignContent: 'stretch'}}>
                    <View style={{flex:1}}>
                      <Text>{`$ ${translate('Cost')} / ${translate('Hour')}`}</Text>
                      <TextInput
                        style={[styles.textInput]}
                        name="ratesCostPerHour"
                        type="text"
                        value={ratesCostPerHour.toString()}
                        autoCapitalize='none'
                        onChangeText={(value) => this.handleInputChange("ratesCostPerHour", value)}
                      />
                    </View>
                    <View style={{flex:1, marginLeft: 5}}>
                      <Text>{translate('Minimum Hours')}</Text>
                      <TextInput
                        style={[styles.textInput]}
                        name="minOperatingTime"
                        type="text"
                        value={minOperatingTime.toString()}
                        autoCapitalize='none'
                        onChangeText={(value) => this.handleInputChange("minOperatingTime", value)}
                      />
                    </View>
                  </View>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                      <CheckBox
                        title={translate('By Ton')}
                        containerStyle={{paddingLeft: 0, marginLeft: 0}}
                        checked={isRatedTon}
                        onPress={() => this.handleInputChange('ratesByTon', !isRatedTon)}
                      />
                      {/*<Text style={{marginTop: 5, marginLeft: 8}}>{}</Text>*/}
                  </View>
                  <View style={{flex: 1, flexDirection: 'row', alignContent: 'stretch'}}>                   
                    <View style={{flex: 1}}>
                      <Text>{`$ ${translate('Cost')} / ${translate('Ton')}`}</Text>
                      <TextInput
                        style={[styles.textInput]}
                        name="ratesCostPerTon"
                        type="text"
                        value={ratesCostPerTon.toString()}
                        autoCapitalize='none'
                        onChangeText={(value) => this.handleInputChange("ratesCostPerTon", value)}
                      />
                    </View>
                    <View style={{flex: 1, marginLeft: 5}}>
                      <Text>{translate('Minimum Tons')}</Text>
                      <TextInput
                        style={[styles.textInput]}
                        name="minTons"
                        type="text"
                        value={minTons.toString()}
                        autoCapitalize='none'
                        onChangeText={(value) => this.handleInputChange("minTons", value)}
                      />
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    marginTop: 15,
                    borderBottomColor: '#cccccc',
                    borderBottomWidth: 1,
                  }}
                />

                <View style={styles.form}>
                  <Text style={styles.label}>
                    {`${translate('Maximum Capacity')} (${translate('Tons')})`}
                  </Text>
                  <TextInput
                    style={[styles.textInput, {paddingLeft: 16}]}
                    name="maxCapacity"
                    type="text"
                    value={maxCapacity.toString()}
                    autoCapitalize='none'
                    onChangeText={(value) => this.handleInputChange("maxCapacity", value)}
                  />
                  {
                    !isMaximumCapacityValid
                    ? (
                      <Text style={styles.errorMessage}>
                        * Please enter Maximum Capacity
                      </Text>
                      )
                    : null
                    }
                  <Text style={styles.label}>
                    {`${translate('Max Distance to Pickup')} (${translate('Miles')}, ${translate('Optional')})`}
                  </Text>
                  <TextInput
                    style={[styles.textInput, {paddingLeft: 16}]}
                    name="maxDistanceToPickup"
                    type="text"
                    value={maxDistanceToPickup.toString()}
                    autoCapitalize='none'
                    onChangeText={(value) => this.handleInputChange("maxDistanceToPickup", value)}
                  />
                </View>

                <View style={styles.form}>
                  <View style={{flex: 1, flexDirection: 'row', alignContent: 'space-between', marginTop: 5}}>
                    <View style={{flex: 1}}>
                      {
                        isFirstTruckPage && (
                          <TouchableOpacity
                            disabled={isLoading}
                            style={[styles.button, styles.actionOutlinedButton, {marginRight: 5}]}
                            onPress={() => toggleOverlay()}
                          >
                            <Text style={styles.buttonDarkText}>
                              &nbsp;{translate('Cancel')}&nbsp;
                            </Text>
                          </TouchableOpacity>
                        )
                      }
                      
                    </View>
                    <View style={{flex: 1}}>
                      <TouchableOpacity
                        disabled={isLoading}
                        style={[styles.button, styles.actionButton, {marginLeft: 5}]}
                        onPress={() => this.saveTruck()}
                      >
                        <Text style={styles.buttonLightText}>
                          &nbsp;{editTruck ? translate('Confirm Edit') : translate('Add Truck')}&nbsp;
                        </Text>
                        {
                          isLoading && (<ActivityIndicator color="#FFF"/>)
                        }
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </KeyboardAwareScrollView>
          </KeyboardAvoidingView>
      </ThemeProvider>
    );
  }
}

AddTruckForm.propTypes = {
  navigation: PropTypes.object,
  screenProps: PropTypes.object,
  onSuccess: PropTypes.func,
  toggleOverlay: PropTypes.func,
  isFirstTruckPage: PropTypes.bool
};

AddTruckForm.defaultProps = {
  navigation: null,
  screenProps: null,
  onSuccess: () => {},
  toggleOverlay: () => {},
  isFirstTruckPage: false
};

/* addTruckForm.propTypes = {
  screenProps: PropTypes.object,
  equipmentId: PropTypes.number,
  companyId: PropTypes.number,
  incomingPage: PropTypes.number,
  passedInfo: PropTypes.shape({
    info: PropTypes.object
  }),
  editTruckId: PropTypes.number
};

addTruckForm.defaultProps = {
  equipmentId: 0,
  companyId: 0,
  incomingPage: 0,
  passedInfo: null,
  editTruckId: null
}; */

export default AddTruckForm;
