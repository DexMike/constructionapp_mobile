import React, {Component} from 'react';
import TMap from '../common/TMap';
import {View} from 'react-native';
import {Text} from 'react-native-elements';

class MapPolygonTestPage extends Component {
  render() {
    const startAddress = {
      latitude: 30.3140473,
      longitude: -97.7342294
    };
    const endAddress = {
      latitude: 30.3140473,
      longitude: -97.7342294
    };
    const multiPolygon = [
      [
        {
          latitude: 30.313470,
          longitude: -97.737579
        }, {
          latitude: 30.315267,
          longitude: -97.736088
        }, {
          latitude: 30.316480,
          longitude: -97.732365
        }, {
          latitude: 30.311525,
          longitude: -97.732719
        }, {
          latitude: 30.310858,
          longitude: -97.732987
        }
      ]
    ];
    return (
      <View style={{flex: 1}}>
        <Text>Testing</Text>
        <TMap
          startAddress={startAddress}
          endAddress={endAddress}
          trackings={[]}
          multiPolygon={multiPolygon}
        />
      </View>
    )
  }
}

export default MapPolygonTestPage;
