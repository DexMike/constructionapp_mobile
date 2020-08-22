import React, {Component} from 'react';
import {
  View,
  Platform,
  Picker, TouchableOpacity
} from 'react-native';
import {Button, Overlay, Text, ThemeProvider} from "react-native-elements";
import {translate} from "../../i18n";
import * as PropTypes from "prop-types";

class TPickerModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      selectedItem: null
    };
    this.setItem = this.setItem.bind(this);
    this.triggerModal = this.triggerModal.bind(this);
  }

  setItem(selectedItem) {
    this.setState({selectedItem});
    this.props.changeItem(this.props.name, selectedItem);
  }

  triggerModal() {
    const {visible} = {...this.state};
    this.setState({visible: !visible});
  }

  renderButtons() {
    const {selectedItem} = {...this.state};

    return (
      <TouchableOpacity onPress={this.triggerModal} underlayColor='rgb(255,255,255)'>
        <View style={{backgroundColor: 'white', borderColor: 'rgb(200, 200, 200)', borderWidth: 2}}>
          <Text style={{fontWeight: 'bold', margin: 10, color: selectedItem ? 'black' : 'rgb(200, 200, 200)'}}>{selectedItem
          && selectedItem}{!selectedItem && this.props.placeholder}</Text>
        </View>
      </TouchableOpacity>
    );
  }

// <View>
// <Button
// type="outline"
// buttonStyle={{borderWidth: 0}}
// titleStyle={{fontSize: this.props.buttonFontSize}}
// title={this.props.buttonTitle}
// onPress={() => this.setState({visible: !visible})}
// />
// </View>

  renderModal() {
    const {visible, selectedItem} = {...this.state};
    const {items} = {...this.props};
    return (
      <View>
        {Platform.OS === 'android' &&
        <Picker
          selectedValue={selectedItem}
          style={{flex: 1, paddingBottom: 30}}
          mode='dialog'
          onValueChange={(itemValue) => {
            this.setItem(itemValue)
          }
          }>
          {this.props.items.map((item, index) => {
            return (<Picker.Item label={item} value={item} key={index}/>)
          })}
        </Picker>
        }
        {Platform.OS === 'ios' &&
        <Overlay
          isVisible={visible}
          onBackdropPress={() => this.setState({visible: false})}
          height={300}
        >
          <View style={{
            flex: 1,
            flexDirection: 'column'
          }}>
            <View>
              <Text style={{color: 'rgb(0, 111, 83)', fontSize: 14}}>{this.props.modalTitle}</Text>
            </View>
            <View>
              <Picker
                selectedValue={selectedItem}
                style={{flex: 1, paddingBottom: 30}}
                onValueChange={(itemValue) =>
                  this.setItem(itemValue)
                }>
                {items.map((item, index) => {
                  return (<Picker.Item label={item} value={item} key={index}/>)
                })}
              </Picker>
            </View>
          </View>
          <Button
            type="outline"
            title={translate('Close')}
            onPress={() => this.setState({visible: false})}
          />
        </Overlay>
        }
      </View>
    );
  }

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
        {Platform.OS === 'ios' && this.renderButtons()}
        {this.renderModal()}
      </ThemeProvider>
    );
  }
}

TPickerModal.propTypes = {
  modalTitle: PropTypes.string,
  name: PropTypes.string.isRequired,
  changeItem: PropTypes.func.isRequired,
  buttonFontSize: PropTypes.number,
  items: PropTypes.array.isRequired,
  placeholder: PropTypes.string
};

TPickerModal.defaultProps = {
  buttonFontSize: 14,
  modalTitle: '',
  placeholder: 'Select'
};

export default TPickerModal;
