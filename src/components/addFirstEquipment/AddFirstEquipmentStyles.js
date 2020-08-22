import {Dimensions, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  addFirstContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addFirstBody: {
    maxHeight: (Dimensions.get('window').height - 180)
  },
  addFirstButtonSection: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 10,
    borderTopColor: '#ddd',
    borderTopWidth: 1
  },
  equipmentSection: {
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    paddingTop: 10,
    paddingBottom: 10
  }
});

export default styles;
