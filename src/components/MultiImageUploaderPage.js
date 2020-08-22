import React, {Component} from 'react';
import {Text, View} from 'react-native';
import TMultiImageUploader from './common/TMultiImageUploader';
import ConfigProperties from '../ConfigProperties';
import {Button} from 'react-native-elements';

// import delay from '../utils/delay';

class MultiImageUploaderPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      startUpload: false,
      uploadedImages: []
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.imagesUploadedHandler = this.imagesUploadedHandler.bind(this);
  }

  handleSubmit() {
    this.setState({ startUpload: true });
  }

  imagesUploadedHandler(imageKeys) {
    const configObject = ConfigProperties.instance.getEnv();
    const API_UPLOADS_ENDPOINT = configObject.AWS_UPLOADS_ENDPOINT;
    const { uploadedImages} = this.state;
    for (const imageKey of imageKeys) {
      uploadedImages.push(`${API_UPLOADS_ENDPOINT}/public/${imageKey}`);
    }
    this.setState({ uploadedImages, startUpload: false });
  }

  render() {
    const { startUpload, uploadedImages } = this.state;
    return (
      <View style={{flex: 1, padding: 10, backgroundColor: 'rgb(228,239,242)'}}>
        <View style={{flex: 1, paddingTop: 20}}>
          <Text style={{fontSize: 30, marginBottom: 10}}>Image Picker</Text>
          <TMultiImageUploader
            startUpload={startUpload}
            buttonTitle={'SELECT IMAGE'}
            imagesUploadedHandler={this.imagesUploadedHandler}
            isServersideUpload={true}
          />
        </View>
        <View>
          <Text>Uploaded Images</Text>
          <Text>{JSON.stringify(uploadedImages)}</Text>
          <View style={{paddingTop: 15}}>
            <Button title={'Submit'} onPress={this.handleSubmit} disabled={startUpload}/>
          </View>
        </View>
      </View>
    );
  }


}

// [
//   {
//     "height": 1199,
//     "mime": ",image/jpeg",
//     "modificationDate": ",1553617188000",
//     "path": "file:///data/user/0/net.trelar/cache/react-native-image-crop-picker/1.jpg",
//     "size": 910128,
//     "width": 1920,
//     "__proto__": "Object"
//   },
//   {
//     "height": 1200,
//     "mime": "image/jpeg",
//     "modificationDate'": "1553617189000",
//     "path": "file:///data/user/0/net.trelar/cache/react-native-image-crop-picker/2.jpg",
//     "size": 941661,
//     "width": 1920,
//     "__proto__": "Object"
//   }
// ]


export default MultiImageUploaderPage;
