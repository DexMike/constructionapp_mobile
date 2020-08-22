import {StyleSheet} from 'react-native';
import RF from 'react-native-responsive-fontsize'

export default StyleSheet.create({
  rootView: {
    flex: 1,
    backgroundColor: 'white'
  },
  mainPad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: 'rgb(230, 230, 225)',
    padding: 24
  },

  signUpFormPad: {
    // flex: 0.5
    // position: 'absolute',
    // left: 35,
    // rightPadding: 35,
    // top: 130
  },

  signUpPageTitle: {
    // position: 'absolute',
    // left: 35,
    // right: 35,
    // top: 80
    paddingBottom: 20
  },

  signUpPageBody: {
    // position: 'absolute',
    // left: 35,
    // right: 35,
    //
    // top: 120
    paddingBottom: 20
  },

  footerButtons: {
    // position: 'absolute',
    // left: 45,
    // right: 45,
    // top: 180,
    paddingBottom: 40
  },

  rowInput: {
    paddingBottom: 25
  },

  rowInputZip: {
    paddingBottom: 15,
    width: 100
  },

  description: {
    fontSize: 14,
    color: 'rgb(37,100,119)'
  },
  header: {
    height: 60,
    justifyContent: 'center'
  },
  container: {
    backgroundColor: '#ffffff',
    flex: 1
  },
  topContent: {
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: 40
  },
  smallTitle: {
    marginVertical: 40,
    fontSize: 16
  },
  inlineRow: {
    flexDirection: 'row',
    // alignItems: 'flex-start',
    justifyContent: 'space-between',
    height: 80,
    alignItems: 'center'
  },
  inlineRowStart: {
    flexDirection: 'row',
    // alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height: 80,
    alignItems: 'center'
  },
  mtFifteen: {
    marginTop: 15
  },
  screenPad: {
    flex: 1,
    margin: 20
    // height: ScreenHeight,
  },
  center: {
    marginTop: 0,
    marginRight: 'auto',
    marginBottom: 0,
    marginLeft: 'auto'
  },
  button: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 20,
    paddingLeft: 20,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    backgroundColor: 'rgb(184,184,184)',
    color: 'white',
    fontWeight: '700'
  },
  buttonLoads: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 20,
    paddingLeft: 20,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    backgroundColor: 'rgb(65,149,165)',
    color: 'white',
    fontWeight: '700'
  },
  title: {
    fontWeight: '600',
    color: 'rgb(37,100,119)',
    fontSize: RF(3.5),
    marginTop: 15,
    marginBottom: 5
  },
  superTitle: {
    fontWeight: "normal",
    fontFamily: 'Interstate',
    fontSize: 16,
    color: '#333333'
  },
  subTitle: {
    color: 'rgb(37,100,119)',
    fontSize: 22,
    marginTop: 15,
    marginBottom: 5
  },
  subText: {
    color: 'rgb(37,100,119)',
    paddingBottom: 20
  },
  input: {
    paddingLeft: 10,
    height: 40,
    borderColor: 'rgb(203,203,203)',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 2
  },

  inputContainerLogin: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 2
  },

  inputContainerChangePassword: {
    height: 40,
    borderColor: 'rgb(212, 212, 212)',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 2
  },
  inputLogin: {
    fontSize: 14,
    paddingLeft: 15
  },

  inputLoginIconContainer: {
    marginLeft: -1,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#CCC',
    borderBottomLeftRadius: 2,
    borderTopLeftRadius: 2
  },

  inputRegularIconContainer: {
    paddingLeft: 5,
    paddingRight: 10,
    marginLeft: -5,
    backgroundColor: 'transparent'
  },
  inputLoginIcon: {
    color: '#666666'
  },
  eyeLoginContainer: {
    marginLeft: 0,
    marginRight: -1.5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#CCC',
    borderBottomRightRadius: 2,
    borderTopRightRadius: 2
  },
  eyeLoginContainerActive: {
    marginRight: -1.5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'rgb(0, 111, 83)',
    borderBottomRightRadius: 2,
    borderTopRightRadius: 2
  },
  eyeLoginContainerSignUp: {
    marginLeft: 0,
    marginRight: 0,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: 'transparent',
    borderBottomRightRadius: 2,
    borderTopRightRadius: 2
  },
  eyeLoginContainerActiveSignUp: {
    marginRight: 0,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: 'transparent',
    color: 'rgb(0, 111, 83)',
    borderBottomRightRadius: 2,
    borderTopRightRadius: 2
  },
  eyeLogin: {
    color: '#666666'
  },
  eyeLoginActive: {
    color: '#FFF'
  },
  loginBottom: {
    flexDirection: 'row',
    justifyContent: 'center'
  },

  linkButton: {
    backgroundColor: '#2089dc',
    padding: 8,
    color: 'white',
    borderRadius: 3,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 16
  },

  bottomFloat: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end'
  },

  // Modified Styles for React Native Elements

  squareIcon: {
    borderRadius: 0
  },

  alertText: {
    color: 'red',
    paddingTop: 20
  },

  account: {
    fontSize: 30
  },

  pageTitle: {
    fontSize: 20
  },

  accountButton: {
    backgroundColor: 'rgb(0, 111, 83)'
  },

  navButtonLight: {
    backgroundColor: 'white',
    color: 'rgb(0, 111, 83)',
    borderColor: 'rgb(0, 111, 83)',
    borderRadius: 3,
    borderWidth: 2,
    flexDirection: 'row',
    padding: 6
  },

  navButton: {
    backgroundColor: 'rgb(0, 111, 83)',
    color: 'white',
    borderColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 6
  },

  sectionTitle: {color: 'rgb(89,89,89)', padding: 10, paddingTop: 20, paddingLeft: 20},

  accountHead: {
    borderLeftColor: 'rgb(0, 111, 83)',
    borderLeftWidth: 5,
    paddingLeft: 10
    // borderLeftWidth: 1,
    // borderLeftColor: 'rgb(0, 111, 83)'
  },

  accountInputs: {
    paddingTop: 15
  },

  accountButtons: {
    paddingTop: 5
  },

  accountLogo: {
    fontWeight: 'bold'
  },

  errorText: {
    color: 'rgb(255, 0, 0)',
    fontWeight: 'bold'
  },

  accountMotto: {
    // fontSize: 20,
    lineHeight: 30
  },

  accountLogoAccent: {
    color: 'rgb(0, 111, 83)'
  },

  containerPanel: {
    backgroundColor: '#fff',
    margin: 10,
    overflow: 'hidden'
  },

  bodyPanel: {
    padding: 10,
    paddingTop: 0
  }

});
