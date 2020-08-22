import React, {Component} from 'react';
import RNFetchBlob from 'react-native-fetch-blob';
import {Buffer} from 'buffer';
import StringGenerator from '../../utils/StringGenerator';
import {Storage} from 'aws-amplify';
import {Platform, TouchableOpacity, View, ProgressViewIOS, ProgressBarAndroid} from 'react-native';
import {Button, Image, Text} from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import moment from 'moment';
import * as PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImageResizer from 'react-native-image-resizer';
import AgentService from '../../api/AgentService';
import {translate} from '../../i18n';


// import delay from '../utils/delay';

const maxWidth = 1200;
const maxHeight = 800;
const compressFormat = 'JPEG';
const quality = 98;

class TMultiImageUploader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      images: [],
      isUploading: false,
      uploadingImageNum: 0,
      // uploadingImageProgress: 0
    };
    // console.log('constructor');
    this.selectFromGallery = this.selectFromGallery.bind(this);
    this.uploadImages = this.uploadImages.bind(this);
    this.progressCallback = this.progressCallback.bind(this);
    this.selectFromCamera = this.selectFromCamera.bind(this);
    this.removeImage = this.removeImage.bind(this);
    this.getImageUploadNum = this.getImageUploadNum.bind(this);
  }

  async componentWillReceiveProps(nextProps, nextContext) {
    const {startUpload} = this.props;
    const newStartUpload = nextProps.startUpload;
    if (startUpload !== newStartUpload && newStartUpload) {
      await this.uploadImages();
    }
  }

  getImageUploadNum() {
    const {images} = {...this.state};
    return images;
  }

  shorten(long) {
    if (long.length <= 20) {
      return long;
    }
    return long.replace(/..+(.{20})/, '…$1');
  }

  async selectFromGallery() {
    let {images} = this.state;
    // request object: https://github.com/ivpusic/react-native-image-crop-picker#request-object
    // https://github.com/ivpusic/react-native-image-crop-picker#select-from-gallery
    try {
      let newImages = await ImagePicker.openPicker({multiple: true});
      newImages = newImages.map(newImage => {
        newImage.percentUploaded = 0;
        return newImage;
      });
      // This adds new image(s) if haven't already picked them.
      images = [...images, ...newImages];
      images = images.reduce((a, b) => {
        const match = a.some(item => {
          if (Platform.OS === 'ios') {
            return item.sourceURL === b.sourceURL;
          } else {
            return item.path === b.path;
          }
        });
        if (!match) {
          a.push(b);
        }
        return a;
      }, []);
      // response object: https://github.com/ivpusic/react-native-image-crop-picker#response-object
      this.setState({images});
    } catch (err) {
      // They cancelled the image gallery / photo roll.
    }
  }

  async selectFromCamera() {
    let {images} = this.state;
    // https://github.com/ivpusic/react-native-image-crop-picker#select-from-camera
    try {
      let newImage = await ImagePicker.openCamera({});
      newImage.percentUploaded = 0;
      images = [...images, newImage];
      this.setState({images});
    } catch (err) {
      // They cancelled the camera.
    }
  }

  progressCallback(progress) {
    const {images, uploadingImageNum} = this.state;
    // console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
    // console.log(progress);
    // 123    x
    // --- = --
    // 1234 100
    const percent = Math.round((progress.loaded * 100) / progress.total);
    images[uploadingImageNum].percentUploaded = percent;
    this.setState({images});
    // this.setState({ uploadImageProgress: percent });
  }

  async uploadImages() {
    const {isServersideUpload} = {...this.props};
    try {
      if (isServersideUpload) {
        await this.uploadImagesServerside();
      } else {
        await this.uploadImagesClientside();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async uploadImagesClientside() {
    const {images} = this.state;
    const {imagesUploadedHandler} = this.props;
    let imageKeys = [];
    if (images.length > 0) {
      this.setState({isUploading: true});
      let count = 0;

      for (const file of images) {
        ImageResizer.createResizedImage(file.path, maxWidth, maxHeight, compressFormat, quality)
          .then(async (f) => {
            this.setState({uploadingImageNum: count});
            const data = await RNFetchBlob.fs.readFile(f.path, 'base64');
            const buffer = new Buffer(data, 'base64');
            const year = moment.utc().format('YYYY');
            const month = moment.utc().format('MM');
            const fileName = StringGenerator.makeId(6);
            const contentType = file.mime;
            const fileNamePieces = file.path.split(/[\s.]+/);
            const fileExtension = fileNamePieces[fileNamePieces.length - 1];
            const s3Key = `${year}/${month}/${fileName}.${fileExtension}`;
            // {key: "2019/03/PMOTnT.jpg"}
            const storageConfig = {
              contentType,
              progressCallback: this.progressCallback,
              level: 'public'
            };
            const response = await Storage.put(s3Key, buffer, storageConfig);
            imageKeys.push(response.key);
            count++;
            if (count === images.length) {
              this.setState({images, isUploading: false});
              imagesUploadedHandler(imageKeys);
            }
          })
          .catch(err => {
            console.log(err);
            return console.error('Unable to resize the photo.');
          });
      }
    } else {
      this.setState({isUploading: false});
      imagesUploadedHandler(imageKeys);
    }
  }

  async uploadImagesServerside() {
    const {images} = this.state;
    const {imagesUploadedHandler, accessToken, idToken} = this.props;
    let imageKeys = [];
    if (images.length > 0) {
      this.setState({isUploading: true});
      const uploadingFiles = [];
      const imageKeys = [];
      for (const file of images) {
        try {
          const f = await ImageResizer.createResizedImage(file.path, maxWidth, maxHeight, compressFormat, quality);
          const data = await RNFetchBlob.fs.readFile(f.path, 'base64');
          const year = moment.utc().format('YYYY');
          const month = moment.utc().format('MM');
          const fileName = StringGenerator.makeId(6);
          const fileNamePieces = file.path.split(/[\s.]+/);
          const fileExtension = fileNamePieces[fileNamePieces.length - 1];
          const s3Key = `${year}/${month}/${fileName}.${fileExtension}`;
          imageKeys.push(s3Key);
          uploadingFiles.push({
            name: 'uploadingFiles',
            filename: s3Key,
            type: 'image/jpeg',
            data
          });
        } catch (err) {
          console.log(err);
          return console.error('Unable to resize the photo.');
        }
      }
      const headers = {
        // "Authorization" : token,
        // "X-AUTH-SECURE" : secure,
        'Content-Type': 'multipart/form-data'
      };
      try {
        let response;
        if(accessToken && idToken) {
          response = await AgentService.multipartUploadOnBoarding(uploadingFiles, accessToken, idToken);
        } else {
          response = await AgentService.multipartUpload(uploadingFiles);
        }
        this.setState({images, isUploading: false});
        imagesUploadedHandler(imageKeys);
      } catch (err) {
        console.log(error);
      }

        // .then(response => {
        //   if(response.status===401){
        //     return;
        //   }
        //   console.log('The file upload ', response)
        // }).catch(error=>{
        //   console.log(error);
        // });

    } else {
      this.setState({isUploading: false});
      imagesUploadedHandler(imageKeys);
    }
  }

  removeImage(index) {
    const {images, isUploading} = this.state;
    if (!isUploading) {
      images.splice(index, 1);
      this.setState({images});
    }
  }

  renderProgressBar(image) {
    const {isServersideUpload} = {...this.props};
    const {path, percentUploaded} = image;
    let {filename} = image;
    filename = (filename) ? filename : path;
    if(isServersideUpload) {
      return (
        <View style={{flex: 1, padding: 5}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text>{this.shorten(filename)}</Text>
          </View>
        </View>
      );
    } else {
      if(Platform.OS === 'ios') {
        return (
          <View style={{flex: 1, padding: 5}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text>{this.shorten(filename)}</Text>
              <Text>{percentUploaded}%</Text>
            </View>
            <ProgressViewIOS progress={(percentUploaded / 100)}/>
          </View>
        );
      } else {
        return (
          <View style={{flex: 1, padding: 5}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text>{this.shorten(filename)}</Text>
              <Text>{percentUploaded}%</Text>
            </View>
            <ProgressBarAndroid
              styleAttr="Horizontal"
              indeterminate={false}
              progress={(percentUploaded / 100)}
            />
          </View>
        );
      }
    }

  }

  renderPickedImage(image, index) {
    const {path} = image;
    return (
      <View key={index} style={{padding: 5, flexDirection: 'row'}}>
        <Image
          source={{uri: path}}
          style={{width: 50, height: 50, borderWidth: 1, borderColor: 'gray'}}
        />
        {this.renderProgressBar(image)}
        <TouchableOpacity onPress={() => this.removeImage(index)}>
          <View style={{width: 25, height: 25, backgroundColor: 'rgb(175,0,0)', alignItems: 'center'}}>
            <Text style={{color: 'white'}}>
              x
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    const {images, isUploading} = this.state;
    const {buttonTitle, startUpload, cameraTitle, hide} = this.props;
    if (hide) {
      return null;
    }
    return (
      <View>
        {images.length > 0 && (
          <View>
            {/*<Text style={{paddingTop: 15}}>Upload Files</Text>*/}
            <View style={{
              padding: 10,
              marginBottom: 10,
              backgroundColor: 'white',
            }}>
              {
                images.map((image, index) => {
                  return this.renderPickedImage(image, index);
                })
              }
            </View>
          </View>
        )}
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'stretch'
          }}>
            <Button
              onPress={this.selectFromCamera}
              title={cameraTitle}
              disabled={isUploading}
              titleStyle={{fontSize: 15}}
              icon={
                <Icon
                  name="add-a-photo"
                  size={15}
                  color="white"
                  style={{paddingRight: 6}}
                />
              }
            />
          </View>
          <View style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'stretch'
          }}>
            <Button
              onPress={this.selectFromGallery}
              title={buttonTitle}
              disabled={isUploading}
              titleStyle={{fontSize: 15}}
              icon={
                <Icon
                  name="collections"
                  size={15}
                  color="white"
                  style={{paddingRight: 6}}
                />
              }
            />
          </View>
        </View>
        {
          images.length > 0 && startUpload === undefined &&
          <Button onPress={this.uploadImages} title={translate('Submit Images')} disabled={isUploading}/>
        }
        {/*<Text>{JSON.stringify(images)}</Text>*/}
      </View>
    );
  }
}

TMultiImageUploader.propTypes = {
  buttonTitle: PropTypes.string.isRequired,
  cameraTitle: PropTypes.string.isRequired,
  imagesUploadedHandler: PropTypes.func.isRequired,
  startUpload: PropTypes.bool,
  isServersideUpload: PropTypes.bool,
  accessToken: PropTypes.string,
  idToken: PropTypes.string,
  hide: PropTypes.bool
};

TMultiImageUploader.defaultProps = {
  buttonTitle: 'Pick Images',
  cameraTitle: 'TAKE PHOTO',
  imagesUploadedHandler: (imageKeys) => {},
  isServersideUpload: false,
  hide: false
};

export default TMultiImageUploader;
