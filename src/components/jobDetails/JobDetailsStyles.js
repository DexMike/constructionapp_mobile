import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {flex: 1, paddingBottom: 17, backgroundColor: '#E7E7E2'},
  containerLoads: {flex: 1, paddingBottom: 17, paddingTop: 17, backgroundColor: 'rgb(207,227,232)'},
  title: {fontSize: 24, fontWeight: '600', color: 'rgb(37,100,119)', padding: 10},
  nameContainer: {borderBottomWidth: 2, borderBottomColor: 'rgb(113,149,160)'},
  nameLabel: {backgroundColor: 'rgb(228,239,242)', color: 'rgb(37,100,119)', padding: 10},
  companyContainer: {
    backgroundColor: 'rgb(228,239,242)',
    padding: 5,
    borderBottomWidth: 2,
    borderBottomColor: 'rgb(113,149,160)'
  },

  noDriversText: {
    color: 'rgb(152, 152, 152)',
    fontFamily: 'Interstate',
    fontSize: 18
  },

  sectionTitle: {color: 'rgb(89,89,89)', padding: 10},

  companyLabel: {padding: 5},
  dateContainer: {borderBottomWidth: 2, borderBottomColor: 'rgb(113,149,160)'},
  dateHeader: {padding: 10, fontSize: 15, fontWeight: '600'},
  detailsSection: {padding: 0},
  cardContainer: {
    borderWidth: 0.5,
    borderRadius: 5,
    borderColor: 'white',
    padding: 10,
    marginBottom: 13,
    backgroundColor: '#ffffff',
  },
  containerBox: {
    flex: 1,
    flexDirection: 'row',
  },
  columnBox: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'flex-start'
  },
  titleBox: {
    marginBottom: 10,
    paddingBottom: 7,
    borderBottomWidth: 4.5,
    borderBottomColor: 'rgb(207,227,232)',
  },
  mktButton: {
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10
  },
  addressDetails: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    textAlign: 'left'
  },
  section1: {flexDirection: 'row', alignItems: 'stretch'},
  section1a: {width: '55%', paddingRight: 4},
  section1aTitle: {borderBottomWidth: 3, borderBottomColor: 'rgb(207,227,232)', padding: 7},
  section1aDetails: {padding: 7},
  section1b: {width: '45%', paddingLeft: 4},
  incomeCard: {
    flex: 1,
    justifyContent: 'center',
    borderBottomWidth: 7,
    borderBottomColor: 'rgb(139,168,177)'
  },
  incomeTotal: {fontSize: 20, textAlign: 'center', color: 'rgb(66,145,166)', fontWeight: '700'},
  estimatedIncome: {textAlign: 'center', paddingTop: 7, paddingBottom: 7},
  incomeRate: {textAlign: 'center'},

  // New styles
  row: {
    flexDirection: 'row',
    marginTop: 16
  },
  card: {},
  flatButton: {
    height: 32,
    paddingLeft: 8,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    height: 32,
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
  input: {
    paddingLeft: 10,
    height: 40,
    borderColor: 'rgb(203,203,203)',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 2
  },
  errorText: {
    color: 'rgb(255, 0, 0)',
    fontWeight: 'bold'
  },
  errorMessage: {
    fontSize: 12,
    color: '#D32F2F'
  },
  label: {
    color: '#717171',
    paddingTop: 16,
    paddingBottom: 4
  },
  actionButton: {
    backgroundColor: '#006F53',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF'
  },
  actionOutlinedButton: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#006F53'
  },
  actionDisabledButton: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#CCC'
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF'
  },
  buttonDarkText: {
    fontWeight: 'bold',
    color: '#006F53'
  },
  buttonLightText: {
    fontWeight: 'bold',
    color: '#FFF'
  },
  buttonDisabledText: {
    fontWeight: 'bold',
    color: '#CCC'
  },
  superTitle: {
    fontWeight: "normal",
    fontFamily: 'Interstate',
    fontSize: 16,
    color: '#333333'
  },
  subtitle: {
    fontWeight: '100',
    fontFamily: 'Interstate',
    fontSize: 14,
    color: '#666666'
  },
  subtitleContainer: {
    width: 0,
    flexGrow: 1,
    flex: 1,
  },
  subtitlePhone: {
    fontWeight: '100',
    fontFamily: 'Interstate',
    fontSize: 14,
    color: 'rgb(0, 73, 191)',
    textDecorationLine: 'underline'
  },
  boxShadow: {
    borderBottomWidth: 1,
    borderRadius: 2,
    borderColor: 'rgb(183,182,179)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 5,
  }
});

export default styles;
