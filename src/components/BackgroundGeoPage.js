import React, {Component} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {Button} from 'react-native-elements';
// https://github.com/transistorsoft/react-native-background-geolocation#large_blue_diamond-example
// ref https://github.com/transistorsoft/rn-background-geolocation-demo/blob/master/src/hello-world/HelloWorld.tsx
class BackgroundGeoPage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { events, enabled, isMoving, setGeoLocation } = this.props;
    return (
      <View>
        { !enabled && (
          <Button title={'start tracking gps'} onPress={() => setGeoLocation(true)} />
        )}
        { enabled && (
          <Button title={'stop tracking gps'} onPress={() => setGeoLocation(false)} />
        )}
        <ScrollView>
        <Text>Enabled: {JSON.stringify(enabled)}</Text>
        <Text>Is Moving: {JSON.stringify(isMoving)}</Text>
        <Text>EVENTS</Text>
        { events.map(event => {
          return (<Text key={event.key} style={{paddingTop: 10}}>{JSON.stringify(event)}</Text>)
        })}
        </ScrollView>
      </View>
    )
  }
}

export default BackgroundGeoPage;
