# mobile

## App versioning

There current app version for IOS is over here pluto/ios/Trelar/Info.plist as CFBundleShortVersionString
For android is it over at pluto/android/app/build.gradle at andriod.defaultConfig.versionName.

The server app version is current grabbed from the orion api at GET /appmeta that returns JSON { "version": "0.0.0" }


## Deployment

After running android bundle command on PLUTO be sure to delete the
resources in folder android/app/src/main/res/drawable-mdpi
...otherwise build fails. It will work locally but when we try to create
signed apk it will fail. You can test out the creation of the signed apk
by opening the android project in android studio and clicking build signed apk.

## Private repo info
https://stackoverflow.com/questions/28728665/how-to-use-private-github-repo-as-npm-dependency
https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line
https://docs.npmjs.com/files/package.json#git-urls-as-dependencies
"react-native-background-geolocation-android": "git+https://9d238bfb64dda658e51764f665bcd26dc6cfc0a8:x-oauth-basic@github.com/transistorsoft/react-native-background-geolocation-android.git#v3.0.2",

## Windows (for Android)
generate a file called local.properties in the /android folder, the contents should be: sdk.dir=C:/Users/<USER>/AppData/Local/Android/Sdk

## transistorsoft-notes
general gps android logging

adb logcat -s TSLocationManager

##
CSS Styles
https://facebook.github.io/react-native/docs/text

Scroll down to STYLE (near the bottom)


```
  render() {
    this.onPressJob();
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, padding: 20}}>
          <ActivityIndicator/>
        </View>
      )
    }

    return (
      <View style={styles.jobList}>
        <View style={styles.container}>
          <Text style={styles.title}> Jobs {jobs.length}</Text>
          <div style={}>
            <FlatList
              keyExtractor={(item) => `list-item-${item.id}`}
              data={this.state.jobs}
              renderItem={this.renderJob}
            />
          </div>
        </View>
      </View>
    );

```


```
const styles = StyleSheet.create({
  jobList: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 20
  },
  container: {flex: 1, paddingTop: 20},
  title: {fontSize: 30, marginBottom: 10}
});


```
List of styles:
```
Valid style props:
alignContent
alignItems
alignSelf
aspectRatio
backfaceVisibility

backgroundColor

borderBottomColor
borderBottomEndRadius
borderBottomLeftRadius
borderBottomRightRadius
borderBottomStartRadius
borderBottomWidth
borderColor
borderEndColor
borderEndWidth
borderLeftColor
borderLeftWidth
borderRadius
borderRightColor
borderRightWidth
borderStartColor
borderStartWidth
borderStyle
borderTopColor
borderTopEndRadius
borderTopLeftRadius
borderTopRightRadius
borderTopStartRadius
borderTopWidth
borderWidth

bottom
color
decomposedMatrix
direction
display
elevation
end

flex
flexBasis
flexDirection
flexGrow
flexShrink
flexWrap

fontFamily
fontSize
fontStyle
fontVariant
fontWeight

height
includeFontPadding
justifyContent
left
letterSpacing
lineHeight

margin
marginBottom
marginEnd
marginHorizontal
marginLeft
marginRight
marginStart
marginTop
marginVertical

maxHeight
maxWidth
minHeight
minWidth

opacity
overflow
overlayColor

padding
paddingBottom
paddingEnd
paddingHorizontal
paddingLeft
paddingRight
paddingStart
paddingTop
paddingVertical

position
resizeMode
right
rotation
scaleX
scaleY
shadowColor
shadowOffset
shadowOpacity
shadowRadius
start

textAlign
textAlignVertical
textDecorationColor
textDecorationLine
textDecorationStyle
textShadowColor
textShadowOffset
textShadowRadius
textTransform

tintColor
top

transform
transformMatrix
translateX
translateY
width

writingDirection

zIndex
```
