import React, { Component } from 'react';
import {View, Text, ActivityIndicator, SafeAreaView, FlatList} from 'react-native';
// import AgentService from '../api/AgentService';
import CompanyService from '../api/CompanyService';

class CompanyListPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      companies: [],
      foobar: 'hello'
    }
  }

  async componentDidMount() {
    try {
      const responseJson = await CompanyService.getCompanies();
      this.setState({
        isLoading: false,
        companies: responseJson,
      });
    } catch (err) {
      console.error(err);
    }
  }

    render() {

    if (this.state.isLoading) {
        return (
          <View style={{flex: 1, padding: 20, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
            <ActivityIndicator size="large"/>
          </View>
        )
      }

      return (
        <View style={{ flex: 1, backgroundColor: "#ffffff", margin: 20 }}>
        <View style={{flex: 1, paddingTop: 20}}>
          <Text style={{fontSize: 30, marginBottom: 10}}>Companies</Text>
          <FlatList style={{flex: 1, color: 'green'}}
                    data={this.state.companies}
                    renderItem={({item}) => <View style={{flex: 1, borderBottomWidth: 2, padding: 10}}><Text>Name: {item.legalName}</Text></View>}
                    keyExtractor={({id}) => id.toString()}
          />
        </View>
        </View>
      );
    }
}

// const styles = StyleSheet.create({
//   header: {
//     fontSize: 20
//   }
// });

export default CompanyListPage;
