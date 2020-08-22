import React from 'react';
import {
  createDrawerNavigator
} from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import JobListPage from '../JobListPage';
import MarketplacePage from '../MarketplacePage';
import TruckListPage from '../TruckListPage';
import DriverListPage from '../DriverListPage';
import PreferencesPage from '../preferences/PreferencesPage';
import UserSettings from '../preferences/UserSettings';
import NotificationSettings from '../preferences/NotificationSettings';
import CompanySettings from '../preferences/CompanySettings';
import NavBarItem from './NavBarItem';
import LogoTitle from './LogoTitle';
import PopUpMenu from './PopUpMenu';
import {translate} from '../../i18n';

const getDrawerItem = navigation => (
  <NavBarItem
    iconName="bars"
    onPress={() => {
      if(navigation.state.isDrawerOpen) {
        navigation.closeDrawer();
      } else {
        navigation.openDrawer();
      }
    }}
  />
);

const getDrawerIcon = (iconName, tintColor) => <Icon name={iconName} size={25} color={tintColor}/>;

const dashboardDrawerIcon = ({tintColor}) => getDrawerIcon('assignment', tintColor);
const userDrawerIcon = ({tintColor}) => getDrawerIcon('cog', tintColor);
const truckListDrawerIcon = ({tintColor}) => getDrawerIcon('local-shipping', tintColor);
const driverListDrawerIcon = ({tintColor}) => getDrawerIcon('airline-seat-recline-normal', tintColor);
const marketplaceDrawerIcon = ({tintColor}) => getDrawerIcon('work', tintColor);

let homeNavOptions = ({screenProps}) => ({
  drawerLabel: translate('Job Dashboard'),
  drawerIcon: dashboardDrawerIcon
});

let MarkteplaceNavOptions = ({screenProps}) => ({
  drawerLabel: translate('Marketplace'),
  drawerIcon: marketplaceDrawerIcon
});

let TruckListNavOptions = ({screenProps}) => {
  const profile = screenProps.profile;
  if (profile && (profile.isAdmin || !profile.driverId)) {
    return ({
      drawerLabel: translate('Truck List'),
      drawerIcon: truckListDrawerIcon
    });
  }        
  return ({
    drawerLabel: <Hidden/>,
  });
};

let DriverListNavOptions = ({screenProps}) => {
  const profile = screenProps.profile;
  if (profile && (profile.isAdmin || !profile.driverId)) {
    return ({
      drawerLabel: translate('Driver List'),
      drawerIcon: driverListDrawerIcon
    });
  }        
  return ({
    drawerLabel: <Hidden/>,
  });
};

const userNavOptions = ({
  drawerLabel: 'Settings',
  drawerIcon: userDrawerIcon
});

let HiddenNavOptions = ({screenProps}) => ({
  drawerLabel: <Hidden/>,
});

class Hidden extends React.Component {
  render() {
    return null;
  }
}

const routeConfigMap = {
  HomeScreen: {
    screen: JobListPage,
    navigationOptions: ({screenProps}) => homeNavOptions
  },
  Marketplace: {
    screen: MarketplacePage,
    navigationOptions: ({screenProps}) => MarkteplaceNavOptions
  },
  TruckList: {
    screen: TruckListPage,
    navigationOptions: TruckListNavOptions
  },
  DriverList: {
    screen: DriverListPage,
    navigationOptions: DriverListNavOptions
  },
  Settings: {
    screen: PreferencesPage,
    navigationOptions: {
      drawerLabel: <Hidden/>
    }
  },
  UserSettings: {
    screen: UserSettings,
    navigationOptions: {
      drawerLabel: <Hidden/>
    }
  },
  CompanySettings: {
    screen: CompanySettings,
    navigationOptions: {
      drawerLabel: <Hidden/>
    }
  },
  NotificationSettings: {
    screen: NotificationSettings,
    navigationOptions: {
      drawerLabel: <Hidden/>
    }
  },
};
const drawerConfig = {
  drawerWidth: 300,
  drawerPosition: 'left',
  navigationOptions: ({navigation, screenProps}) => {
    // const {language} = screenProps;
    // I18n.locale = language;
    homeNavOptions = ({
      drawerLabel: translate('Job Dashboard'),
      drawerIcon: dashboardDrawerIcon
    });
    MarkteplaceNavOptions = ({
      drawerLabel: screenProps.isAdmin ? translate('Marketplace') : <Hidden/>,
      drawerIcon: screenProps.isAdmin ? marketplaceDrawerIcon : <Hidden/>
    });
    return ({
      headerTitle: <LogoTitle/>,
      headerStyle: {
        backgroundColor: '#0c5e42',
      },
      headerTitleStyle: {
        color: 'white',
      },
      headerTintColor: 'white',
      headerBackTitle: translate(screenProps.backButtonTitle),
      headerLeft: getDrawerItem(navigation),
      headerRight: (
        <PopUpMenu
          screenProps={screenProps}
          navigation={navigation}
        />
      )
    })
  }
};
const DrawerNavigator = createDrawerNavigator(routeConfigMap, drawerConfig);

export default DrawerNavigator;
