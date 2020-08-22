import React, {Component} from 'react';
// import {Link} from 'react-router-native';
import {
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  FlatList
} from 'react-native';
import {Button} from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import Amplify from 'aws-amplify-react-native';
import {Auth} from 'aws-amplify';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

import CompanySettings from './CompanySettings';
import UserSettings from './UserSettings';
import JobSettings from './JobSettings';
import NotificationSettings from './NotificationSettings';

class PreferencesPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      option: 0,
      toMainScreen: true,
      headerTitle: 'User Preferences'
    };

    this.toggleMainScreen = this.toggleMainScreen.bind(this);
    this.changeSettingsScreen = this.changeSettingsScreen.bind(this);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  async changeSettingsScreen(option, title) {
    let toMainScreen = false;
    if (option == 0) {
      toMainScreen = true;
    }
    this.setState({
      toMainScreen,
      option,
      headerTitle: title
    });
  }

  toggleMainScreen() {
    this.setState({
      toMainScreen: true,
      option: 0,
      headerTitle: 'User Preferences'
    });
  }

  renderSection(option) {
    if (option === 0) {
      return(
        <View style={{ margin: 20}}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => this.changeSettingsScreen(1, 'User Settings')}>
            <Icon style={styles.itemIcon} name={'user'} size={24} color="#006F53" solid />
            <Text style={styles.itemText}>User Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() => this.changeSettingsScreen(2, 'Job Preferences')}>
            <Icon style={styles.itemIcon} name={'truck'} size={20} color="#006F53" solid />
            <Text style={styles.itemText}>Job Preferences</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() => this.changeSettingsScreen(3, 'Notifications Settings')}>
            <Icon style={styles.itemIcon} name={'bell'} size={20} color="#006F53" solid />
            <Text style={styles.itemText}>Notifications Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() => this.changeSettingsScreen(4, 'Company Settings')}>
            <Icon style={styles.itemIcon} name={'bell'} size={20} color="#006F53" solid />
            <Text style={styles.itemText}>Company Settings</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (option === 1) {
      return (
        <View>
          <UserSettings
            toMainControl={this.toggleMainScreen}
          />
        </View>
      )
    }
    if (option === 2) {
      return (
        <View>
          <JobSettings toMainControl={this.toggleMainScreen}/>
        </View>
      )
    }
    if (option === 3) {
      return (
        <View>
          <NotificationSettings toMainControl={this.toggleMainScreen}/>
        </View>
      )
    }
    if (option === 4) {
      return (
        <View>
          <CompanySettings toMainControl={this.toggleMainScreen}/>
        </View>
      )
    }
  }

  renderGoTo() {
    const { toMainScreen, option } = this.state;
    if (toMainScreen) {
      return (
        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
            <Icon name={'angle-left'} size={20} color="white" solid />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity onPress={() => this.changeSettingsScreen(0, 'User Preferences')} style={{width: 60, paddingLeft: 20}}>
        <Icon name={'angle-left'} size={20} color="white" solid />
      </TouchableOpacity>
    );
  }

  render() {
    const { headerTitle, option, dialogVisible } = this.state;
    return(
      <View style={styles.container}>
        {
          /*
          <View style={styles.header}>
            {this.renderGoTo()}
            <Text style={{padding: 0, fontSize: 16, color: '#FFF'}}>
              {headerTitle}
            </Text>
          </View>
          */
        }
        {this.renderSection(option)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7E7E2',
    overflow: 'scroll'
  },
  header: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#7caab5',
    alignItems: 'center',
    marginBottom: 20
  },
  item: {
    flexDirection: 'row',
    height: 54,
    backgroundColor: '#FFF',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 8
  },
  itemIcon: {
    width: 30,
    marginLeft: 16,
    marginRight: 16,
  },
  itemText: {
    fontSize: 14,
    color: '#717171'
  }
});

export default PreferencesPage;
