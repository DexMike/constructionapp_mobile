import {Dimensions, StyleSheet} from 'react-native';

const {
  width,
  height
} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 17,
    backgroundColor: 'rgb(207,227,232)',
    width: width,
    height: height
  },
  form: {
    marginTop: 16,
    marginLeft: 32,
    marginRight: 32,
    marginBottom: 16
  },
  title: {
    fontFamily: 'Interstate-Regular',
    textAlign: 'center',
    fontSize: 18,
    color: '#348A74',
    fontWeight: 'bold'
  },
  label: {
    color: '#717171',
    paddingTop: 16,
    paddingBottom: 4
  },
  textInput: {
    backgroundColor: '#FFF',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    height: 40,
    borderRadius: 3,
    paddingLeft: 5,
    color: '#000'
  },
  disabledTextInput: {
    backgroundColor: '#EAEAEA',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    height: 40,
    borderRadius: 3,
    paddingLeft: 5,
    color: '#000'
  },
  errorMessage: {
    fontSize: 12,
    color: '#D32F2F'
  },
  tabNav: {
    flexDirection: 'row',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3
  },
  page: {
    backgroundColor: '#FFF',
    height: 60,
    width: (width/4),
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#348A74',
    borderBottomWidth: 3
  },
  tab: {
    backgroundColor: '#FFF',
    height: 60,
    width: (width/4),
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#8A8A8A',
    borderBottomWidth: 1
  },
  button: {
    height: 48,
    paddingLeft: 8,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderRadius: 2,
    borderColor: 'rgb(183,182,179)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 5,
  },
  actionButton: {
    backgroundColor: '#006F53',
    borderRadius: 5,
    borderWidth: 3,
    borderColor: '#FFF'
  },
  buttonLightText: {
    fontWeight: 'bold',
    color: '#FFF'
  },
  row: {
    flexDirection: 'row',
    marginTop: 16
  },
  actionOutlinedButton: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#006F53'
  },
  buttonDarkText: {
    fontWeight: 'bold',
    color: '#006F53'
  }
});

export default styles;
