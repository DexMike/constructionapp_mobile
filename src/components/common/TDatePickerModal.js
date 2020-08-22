import React, {Component} from 'react';
import {
  DatePickerIOS,
  View,
  DatePickerAndroid, TouchableOpacity, Platform,
} from 'react-native';
import {Button, Overlay, Text, ThemeProvider} from "react-native-elements";
import {translate} from "../../i18n";
import * as PropTypes from "prop-types";
import DatePicker from 'react-native-datepicker';

class TDatePickerModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      date: null
    };
    this.setDate = this.setDate.bind(this);
    this.setDateAndroid = this.setDateAndroid.bind(this);
    this.triggerModal = this.triggerModal.bind(this);
  }

  async setDateAndroid() {
    let {date} = {...this.state};
    if (!date) {
      date = new Date();
    }
    try {
      const {
        action, year, month, day,
      } = await DatePickerAndroid.open({
        date
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        const newDate = new Date(year, month, day);
        this.setDate(newDate);
      }
    } catch ({code, message}) {
      console.warn('Cannot open date picker', message);
    }
  }

  triggerModal() {
    const {visible} = {...this.state};
    this.setState({visible: !visible});
  }

  setDate(date) {
    this.setState({date});
    this.props.changeDate(this.props.name, date);
  }

  renderButtons() {
    const {date} = {...this.state};
    return (
      <TouchableOpacity onPress={Platform.OS === 'ios' ? this.triggerModal : this.setDateAndroid}
                        underlayColor='rgb(255,255,255)'>
        <View style={{backgroundColor: 'white', borderColor: 'rgb(200, 200, 200)', borderWidth: 2}}>
          <Text style={{fontWeight: 'bold', margin: 10, color: date ? 'black' : 'rgb(200, 200, 200)'}}>{date
          && date.toLocaleDateString()}{!date && this.props.placeholder}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  renderModal() {
    const {visible} = {...this.state};
    let {date} = {...this.state};
    if (!date) {
      date = new Date();
    }
    return (
      <DatePicker
        style={{backgroundColor: 'white'}}
        date={date}
        mode="date"
        placeholder={date}
        format="MM/DD/YYYY"
        // minDate="2016-05-01"
        // maxDate="2016-06-01"
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        showIcon={false}
        onDateChange={(date) => {
          this.setDate(new Date(date));
        }}
      />
    );
  }

  // version with modal picker (does not display well on smaller ios screens)
// <Overlay
// isVisible={visible}
// onBackdropPress={() => this.setState({visible: false})}
// height="auto"
// >
// <View>
// <View>
// <View>
// <Text style={{color: 'rgb(0, 111, 83)', fontSize: 14}}>{this.props.modalTitle}</Text>
// </View>
// <View>
// <DatePickerIOS
// date={date}
// mode="date"
// onDateChange={(date) => this.setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()))}
// />
// </View>
// <Button
// type="outline"
// title={translate('Close')}
// onPress={() => this.setState({visible: false})}
// />
// </View>
// </View>
// </Overlay>

  render() {

    const theme = {
      colors: {
        primary: 'rgb(0, 111, 83)'
      },
      Text: {
        style: {
          fontFamily: 'Interstate-Regular',
          color: 'rgb(102, 102, 102)'
        }
      },
      Button: {
        titleStyle: {
          fontFamily: 'Interstate-Regular',
          fontColor: 'yellow'
        },
        buttonStyle: {
          borderColor: 'white',
          borderWidth: 2
        },
        placeholderStyle: {
          fontFamily: 'Interstate-Regular',
        }
      },
      Input: {
        inputStyle: {
          fontFamily: 'Interstate-Regular',
        },
        inputContainerStyle: {
          borderBottomWidth: 0
        },
        containerStyle: {
          backgroundColor: 'white',
          borderColor: 'rgb(203, 203, 203)',
          borderWidth: 2
        }
      },
      CheckBox: {
        fontFamily: 'Interstate-Regular',
        containerStyle: {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
        uncheckedColor: 'rgb(0, 111, 83)'
      }
    };

    return (
      <ThemeProvider theme={theme}>
        {/*{this.renderButtons()}*/}
        {this.renderModal()}
      </ThemeProvider>
    );
  }
}

TDatePickerModal.propTypes = {
  modalTitle: PropTypes.string,
  name: PropTypes.string.isRequired,
  changeDate: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};

TDatePickerModal.defaultProps = {
  modalTitle: '',
  placeholder: 'mm/dd/yyyy'
};

export default TDatePickerModal;
