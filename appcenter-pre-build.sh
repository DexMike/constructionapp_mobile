#!/usr/bin/env bash
# note this is helpful
# https://github.com/microsoft/appcenter/tree/master/sample-build-scripts
# https://github.com/microsoft/appcenter/blob/master/sample-build-scripts/general/android/google-services/appcenter-pre-build.sh

# note local testing
# APPCENTER_BRANCH="dev"
# APPCENTER_SOURCE_DIRECTORY="/Users/adam/git/trelar/pluto"

ANDROID_MANIFEST_FILE=$APPCENTER_SOURCE_DIRECTORY/android/app/src/main/AndroidManifest.xml
ANDROID_APP_BUILD_FILE=$APPCENTER_SOURCE_DIRECTORY/android/app/build.gradle
GOOGLE_SERVICES_JSON_FILE=$APPCENTER_SOURCE_DIRECTORY/android/app/google-services.json
GOOGLE_SERVICES_JSON_DEV_FILE=$APPCENTER_SOURCE_DIRECTORY/android/app/google-services-dev.json
GOOGLE_SERVICES_JSON_QA_FILE=$APPCENTER_SOURCE_DIRECTORY/android/app/google-services-qa.json
GOOGLE_SERVICES_JSON_STAGING_FILE=$APPCENTER_SOURCE_DIRECTORY/android/app/google-services-staging.json
GOOGLE_SERVICES_JSON_DEMO_FILE=$APPCENTER_SOURCE_DIRECTORY/android/app/google-services-demo.json
ANDROID_STRINGS_FILE=$APPCENTER_SOURCE_DIRECTORY/android/app/src/main/res/values/strings.xml
INFO_PLIST_FILE=$APPCENTER_SOURCE_DIRECTORY/ios/Trelar/Info.plist
IOS_APP_DELEGATE_FILE=$APPCENTER_SOURCE_DIRECTORY/ios/Trelar/AppDelegate.m
APP_COMPONENT_FILE=$APPCENTER_SOURCE_DIRECTORY/src/components/App.js
APP_CONFIG_FILE=$APPCENTER_SOURCE_DIRECTORY/src/ConfigProperties.js
echo '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> STARTING PRE BUILD '
if [ "$APPCENTER_BRANCH" == "dev" ];
then
    # android specific env
    sed -i '' 's/applicationId "[0-9a-z.]*"/applicationId "net.trelar.dev"/' $ANDROID_APP_BUILD_FILE
    sed -i '' 's/android:value="54add[0-9a-z.]*"/android:value="e8b4698dffdf7c7bf6d0a994dffae24efac6441af1888a3626389b2cc95d3bf5"/' $ANDROID_MANIFEST_FILE
    sed -i '' 's/"app_name">[0-9a-zA-Z()]*/"app_name">Trelar(dev)/' $ANDROID_STRINGS_FILE
    sed -i '' 's/android:value="n9EHfOaRFl6EgI7GHVrw"/android:value="f4vuJoPhm3P4b0g0H4fd"/' $ANDROID_MANIFEST_FILE
    sed -i '' 's/android:value="8w97ZF0PS6p78yepG7p-AA"/android:value="f8dZ9I9Bpo1rVQbllYrYMA"/' $ANDROID_MANIFEST_FILE
    sed -i '' 's|android:value="jT2VQ[^"]*|android:value="C11O9oRyKR6xVzeoVUda5vmDeNKGJya1P2afoTNC1GDuCelA4GprA8MRJhXQnEtrnaH5LlJ5FZQQwiXxDtMvcgsXR/YRYLwAWgcWmlOlkdTOs/7zSkpYHeylRznHXIbSsL3G3WOn8RyccqYioKVSQyQR8EPGcFYvIOKQv5oGZV5RY5mUqSG3goUy/O5GHK0nI0dyP56VFqdLTIjkZrIRNsBUhzPNl86zygRvYtLAQamchfC9RMul2xeWxdBr7/dwojWEGBDVokPZ0xj+n3P2c8nggsV2zfwbkqd4Q0XUXneqhjjJ7WAuyFnepm8Kd724tc86czu7c4ZPOmAIwD8811CTzjox7W8bF6ydoDRULhS/vcEuIMrR92KBhqFHAFZNqJCQQ/zV7gJ3V5q4w6AAdlsGndPwfzwTbhQMek35wURjWO7xoHWcMEwr5ePLckRHkt4y4tZ+PzijamdY6HVjcrllcEMjy5t3A+oLExRD+wYEwni5+400iHd/ZmBZvIPgnVSxX1/i5IZ951tAdqytNzsh6DJA7wcKOTbpqYD8Mhl/rwEnEb3691GrGQklAJg8qhWQ1IKtKsNtDHO8kptaVDZ+eNi9d13JKD8jkJui2L4qGuilwDU6G0ngxF9+4sZTvfoQZpix+YoIPi9ZY0dbnYp6ZVy+cTUugjggkzak7FI=|' $ANDROID_MANIFEST_FILE
    cat $GOOGLE_SERVICES_JSON_DEV_FILE > $GOOGLE_SERVICES_JSON_FILE
    # ios specific env
    plutil -replace CFBundleDisplayName -string "\$(PRODUCT_NAME)(dev)" $INFO_PLIST_FILE
    plutil -replace CFBundleName -string "\$(PRODUCT_NAME)(dev)" $INFO_PLIST_FILE
    sed -i '' 's/kSampleAppID = @"[0-9a-zA-Z-]*/kSampleAppID = @"x87GmfJcNGVN7HC2RAPB/' $IOS_APP_DELEGATE_FILE
    sed -i '' 's/kSampleAppCode = @"[0-9a-zA-Z-]*/kSampleAppCode = @"zTdy0jRhDhtFnePtZY-qvA/' $IOS_APP_DELEGATE_FILE
    sed -i '' 's|kSampleMapLicenseKey = @"[^"]*|kSampleMapLicenseKey = @"CQgGPTaTDKTlLUtw2Xat+wHBzaJXdIIxdKL5vzj7AQzqpBLvCPSl4/d81lMoWJmm4HmFJNwXR3nLwbEI2ELS2f9fivACdYogphybkEKf5StAmOhsdnNhKo7vr96HF+DldqeWNQKdF3szPiNHwavwbbBL7bxx6qgXZa5pMj3c1apOeFf5k8iWHHrywRD4qBoFa+AFcvcI5zCgF7Vb7/6oI2GybTv8KXbhfmogJra4Mi9Jtuaae6mG+MFicVdOy5fYS8VAA9trpDSSwOciInL/tb5znrHosA8qqGITWuK1xRXeJjJOFggv17nLqHvTiT5s+o9D+jVy3hKyb9bwrj9htfF49ua8RB3EhRoWg4vZggSDEBTOOUZ5cZurNIL58XnY3rREiwkWMejdMgTLYlsjMuHKI9AWbJbE5UAgqurW35sXDBfjadk4W9fP3ENJq9mdXv8hbd3YmOJrlkDOsigofFtUq3NLIOESADqM1mNj9Z6NUnc8x05wVHzlW5Jy5TzioRydyx82WkYwphVBSRN25ZbBSotr3r3GqGxy4Yvb5cBWrrFz25L8A6i3sB6WxCekEsv2M1tTC7n0adxB4QzZqlbSsExM//RCQfYFKDiVl91K6nRnr3+ikeMqwezg4Gd3/+qx7QXXVBRBabcQoKpssPgRkZ7UrbrQ4C81LU67foM=|' $IOS_APP_DELEGATE_FILE
    # ios but needed when using the provisioning profile with app center
    # plutil -replace CFBundleIdentifier -string "\$(PRODUCT_BUNDLE_IDENTIFIER).dev" $INFO_PLIST_FILE
    # app specfic env
    sed -i '' 's/prod/dev/' $APP_COMPONENT_FILE
    sed -i '' 's/this.environment = this.prod/this.environment = this.dev/' $APP_CONFIG_FILE
fi
if [ "$APPCENTER_BRANCH" == "qa" ];
then
    # android specific env
    sed -i '' 's/applicationId "[0-9a-z.]*"/applicationId "net.trelar.qa"/' $ANDROID_APP_BUILD_FILE
    sed -i '' 's/android:value="54add[0-9a-z.]*"/android:value="c89e13ebfbf84d58cad218a9d63eeebe4a1667c254e6249ca63ef4b9e7f67c40"/' $ANDROID_MANIFEST_FILE
    sed -i '' 's/"app_name">[0-9a-zA-Z()]*/"app_name">Trelar(qa)/' $ANDROID_STRINGS_FILE
    sed -i '' 's/android:value="n9EHfOaRFl6EgI7GHVrw"/android:value="zQ10xFKkqmB4EywPEsBD"/' $ANDROID_MANIFEST_FILE
    sed -i '' 's/android:value="8w97ZF0PS6p78yepG7p-AA"/android:value="c0t3V9rh94YtqgS3AbBqHA"/' $ANDROID_MANIFEST_FILE
    sed -i '' 's|android:value="jT2VQ[^"]*|android:value="h7uz6yhELHFubLPv/UV0N6Wu+pRiyxu2zGwyeRp9lIJEZc6mCUqxwJgJE+l3nhn7tKEqDQmV4LUmcoteFNG2oe6QwgFNhIGO9Be7R3r6xbiorTKKPWC1A286KjoB9NDABXV+2LPnFYey4pLhTZVYux9B28LRoeakZm2LV+EdkauF3mhutLhw+eDaRtsuXNuTYP47dcIyIGmJtwO9i9CNDb7P7SZoUgIXxfFokbdkvtodc30T2BgU8u+kppgOx1WAARkDmNLlA3F+KRUvihTXP4QR1JQ/cbCl5UWuXRH1UIYod8eI41Ie2KfjvSxwimVYhz2vekW6Sw1H8DgPYNbleSWoXTYLMt3iSCmImDRLvtcyogtY1qi+hD35zd1PgmZg6piO8RJcAO3RvxBFbrXtkh0G9eQTJNPmE1XvA7JZ/ShKdCIDRfitmr/IvhgWJd4DBHIOIQ4m3kcyTbdnpz1j1BAKk80RPzQldseE4nnbS7YtgBgJyXAEvQP2dYW8u0RVH/hY2WGmpqzlGnmZvn4TFrtEX28S7wlznJ5iSOxTzH08FFF2Ts4e3yQwuRGuVnXHCDRE19xEgM13tK2RKDjKehKHbUSiUGfhLJNY33hnRZg1kl9gTG0iJsim28W/IW/AXkpDoHZqDFNazxRfeNip8N2RYm8WjvkXZtk5BeYYRHk=|' $ANDROID_MANIFEST_FILE
    cat $GOOGLE_SERVICES_JSON_QA_FILE > $GOOGLE_SERVICES_JSON_FILE
    # ios specific env
    plutil -replace CFBundleDisplayName -string "\$(PRODUCT_NAME)(qa)" $INFO_PLIST_FILE
    plutil -replace CFBundleName -string "\$(PRODUCT_NAME)(qa)" $INFO_PLIST_FILE
    sed -i '' 's/kSampleAppID = @"[0-9a-zA-Z-]*/kSampleAppID = @"yNkeaHNApRnCRt8qwtMP/' $IOS_APP_DELEGATE_FILE
    sed -i '' 's/kSampleAppCode = @"[0-9a-zA-Z-]*/kSampleAppCode = @"8btnqsqIkNy6vWXkRJRnhw/' $IOS_APP_DELEGATE_FILE
    sed -i '' 's|kSampleMapLicenseKey = @"[^"]*|kSampleMapLicenseKey = @"HbWaTehDDXoYAseFLBpeXEKFyW69BigHUoaAZtcyLVfqw0uBQ7s/T2p5h/o+WIV1bxeSKNlx/725S6sNUoFjyCNiVxZRcHC/DB4Qz3FAhsQgijOuuh80mTSVOXMQBJQ1Wjfho2GdPb2up9TA2CksVwaGW4wmxBu7Nj2sSRkbpEdppJtibBEeUfb+lpfHEqZ61wAqtUn5NaG3nsDx1zuEe2YOyYsYks443PcPffdXY117mV32rAEHIjeL62/fMxvvkcr6BWCPaBlseywPJDMKiA/fOmfyc8TbgQ/lGhKhetfZIgCn1CHRbMPE8JQhiTh/1hKZQRe9F/QZrv2Db35NKK3MIbyM4WOQ2Wbqz+wJFFsQl2sRj60CIyeDMUZeYz/tqSY/olOBYZHdjqV8JATVrg3rhNn+WIQ/wfRzSUeJLYkYVMCPZM7PuNnr7+tad/1n1ms6BEYnm2KM/DWBb1XTNlCJmyXEPSlUjAVpTNzOqvUSjbmZmVCa8/rYRIEDu9ra6yXPXmz93ppmwnaG1k26n/0eATxj9/sKAPgwAm99ecqc7a6ipNCcIIBLIMd5zY3XsZUjxJVSgoBaVyYIZ0euTvjgeP5srrZD14Inudzm/pf9XRV6jQQTcNzOnTpsNVzWvOSYcXP8xPDbtD2pVmqY3HkZEmRVr5LSbEYMrLJ7GBE=|' $IOS_APP_DELEGATE_FILE
    # ios but needed when using the provisioning profile with app center
    # plutil -replace CFBundleIdentifier -string "\$(PRODUCT_BUNDLE_IDENTIFIER).qa" $INFO_PLIST_FILE
    # app specfic env
    sed -i '' 's/prod/qa/' $APP_COMPONENT_FILE
    sed -i '' 's/this.environment = this.prod/this.environment = this.qa/' $APP_CONFIG_FILE
fi
# NOTE: for staging temporarily using here production in order to test it first before deploying to master
if [ "$APPCENTER_BRANCH" == "staging" ];
then
    # android specific env
    # sed -i '' 's/applicationId "[0-9a-z.]*"/applicationId "net.trelar.staging"/' $ANDROID_APP_BUILD_FILE
    # sed -i '' 's/android:value="54add[0-9a-z.]*"/android:value="b2b3671453f3747e5fd404ccdf96ae7521d167989e0a211cf0cb136b72bbd3ee"/' $ANDROID_MANIFEST_FILE
    sed -i '' 's/"app_name">[0-9a-zA-Z()]*/"app_name">Trelar(staging)/' $ANDROID_STRINGS_FILE
    # sed -i '' 's/android:value="n9EHfOaRFl6EgI7GHVrw"/android:value="zzn0sacef3sdGneRNAhS"/' $ANDROID_MANIFEST_FILE
    # sed -i '' 's/android:value="8w97ZF0PS6p78yepG7p-AA"/android:value="_rIZDoFxqPxkV7ipZCAclw"/' $ANDROID_MANIFEST_FILE
    # sed -i '' 's|android:value="jT2VQ[^"]*|android:value="RhEC7YhqIkLW63djiEHuPsXUJCFsbaFEyj0oNd8W2vDrnyp0ZF4T+qQcM+EooVxp8lOh81T/fm5wlTvfe3mKIhNM0i9mHJDXnpzBs5PPlWb4J1iNLtfUIohnQjvsFRCa1VA3f+JU3S4gjbUAkcQN/2WcRELdoyW1vwPw7YtbNeaO1z2n0oF18dKMi92NsBeVxbUGUwjOKdAq6GQRzuJFkhAKvYrtpmZyeTpfpNRZQ0gWSerfF2h2miW/oaL2Uu7VuIbXpyy3DGclZSnXGs4p2ZW1FD45YxB0sMeMi9OunWpfrXCsYSPb8AxigXWNeeYAwmffb/IyhBvn/rxh5YpzF/ygCFoFFoGhsyQMavCDdklvocf1bfEfGFKZCGGQhMCJSkKUEI/HO4ViUHs13FbPkJLOQBIU/JPWCjcGWycZwtlO26dTsMM33jqWmF30JbTaUduj65ZAeLpNjwa24GEB2w/h1FA025c831k6Qy0omfBDDxbPVjeuFgd+GTyQkrnWo1A/j10u8U9D1EbgMbyQe15fqGpfgznQFwyVZ/vXaIXqVMgg9Q7JAWYJ7hkIl8bi7MNlIplAYme6CpcYpqH8fh05CBYUJn0FHAb98VlY6y9iZlZwBDep3WMkDwIDRALEnpt7lSFMna+vg8+7COsXx3DxsrzA28eek/iAQfm957M=|' $ANDROID_MANIFEST_FILE
    # cat $GOOGLE_SERVICES_JSON_STAGING_FILE > $GOOGLE_SERVICES_JSON_FILE
    # ios specific env
    plutil -replace CFBundleDisplayName -string "\$(PRODUCT_NAME)(staging)" $INFO_PLIST_FILE
    # plutil -replace CFBundleName -string "\$(PRODUCT_NAME)(staging)" $INFO_PLIST_FILE
    # sed -i '' 's/kSampleAppID = @"[0-9a-zA-Z-]*/kSampleAppID = @"xGiqhW0G2HKvGZVpYm17/' $IOS_APP_DELEGATE_FILE
    # sed -i '' 's/kSampleAppCode = @"[0-9a-zA-Z-]*/kSampleAppCode = @"ESx1Md_D1wVpbTf8VtIlbQ/' $IOS_APP_DELEGATE_FILE
    # sed -i '' 's|kSampleMapLicenseKey = @"[^"]*|kSampleMapLicenseKey = @"VjM1Bpq34SuBWxjlj+BxbWAYfbKW1d246h3BUgrRyETfWpmuEs3WxPpWkTEPtAMHcCqjhuUfO2ALtCWHfACd/AgDq3CMc7x22UAWAHJQnQmOQ1mvxUbPOx5nJUWbuVlZ9XjXbuY/EiLfrQlSkLJemqBeDAOoNV4rsolGVzJugVwlIPZHQyS1w1ksZCihrSpOcJUUykqckXfl8OOigiLbNCrf2dthLjcw98xU/v8mnyAKI2JQ3A1Jh0ksRuphMZex/PmsiIQGI+qBwHdhNv7x7SRXwT/haWJsvOOEbXKKTctxQMQlTZsO047mPjkdIkKsoMMDRj9IHdRCHNorKe8N1Ef8U0U3JpT2qglwtU4FOj2QheBeiMf3KwAXH7baYPIzia2rCLJmIp9wYJV3ltcZRvJCCsSxZj3urNfxxJ6lKSGZzrx4bODwm960bz6gg5R6MSUwiffKY0dJkDOLOW9t9GYLF7g3DVegLLGlFfXT7FzhDVSfgnJHeko0ZK+UFTPFvugrqIf/qJRM/QENydjEzCRlcEHqa6x1UIRkdHKxx3mCbWLzU4d0+bZiNvkVDoc5Chqg6YrqsrNeYXjPbiyaW50zkc/JVA5oUDWnTS7H/VaS3xBYUkaBTWsOya0DJeK2wNyV3MlgTWqkhZPvdD74VrB+Pp/Re+iQWT9P8mX0JUM=|' $IOS_APP_DELEGATE_FILE
    # ios but needed when using the provisioning profile with app center
    # plutil -replace CFBundleIdentifier -string "\$(PRODUCT_BUNDLE_IDENTIFIER).staging" $INFO_PLIST_FILE
    # app specfic env
    sed -i '' 's/prod/staging/' $APP_COMPONENT_FILE
    sed -i '' 's/this.environment = this.prod/this.environment = this.staging/' $APP_CONFIG_FILE
fi
if [ "$APPCENTER_BRANCH" == "demo" ];
then
    # android specific env
    sed -i '' 's/applicationId "[0-9a-z.]*"/applicationId "net.trelar.demo"/' $ANDROID_APP_BUILD_FILE
    sed -i '' 's/android:value="54add[0-9a-z.]*"/android:value="7f133762cd76afb8ca9b976ee91f9d5e18d3fe2bf33728d1e5baf730e8fd807d"/' $ANDROID_MANIFEST_FILE
    sed -i '' 's/"app_name">[0-9a-zA-Z()]*/"app_name">Trelar(demo)/' $ANDROID_STRINGS_FILE
    sed -i '' 's/android:value="n9EHfOaRFl6EgI7GHVrw"/android:value="x87GmfJcNGVN7HC2RAPB"/' $ANDROID_MANIFEST_FILE
    sed -i '' 's/android:value="8w97ZF0PS6p78yepG7p-AA"/android:value="zTdy0jRhDhtFnePtZY-qvA"/' $ANDROID_MANIFEST_FILE
    sed -i '' 's|android:value="jT2VQ[^"]*|android:value="CQgGPTaTDKTlLUtw2Xat+wHBzaJXdIIxdKL5vzj7AQzqpBLvCPSl4/d81lMoWJmm4HmFJNwXR3nLwbEI2ELS2f9fivACdYogphybkEKf5StAmOhsdnNhKo7vr96HF+DldqeWNQKdF3szPiNHwavwbbBL7bxx6qgXZa5pMj3c1apOeFf5k8iWHHrywRD4qBoFa+AFcvcI5zCgF7Vb7/6oI2GybTv8KXbhfmogJra4Mi9Jtuaae6mG+MFicVdOy5fYS8VAA9trpDSSwOciInL/tb5znrHosA8qqGITWuK1xRXeJjJOFggv17nLqHvTiT5s+o9D+jVy3hKyb9bwrj9htfF49ua8RB3EhRoWg4vZggSDEBTOOUZ5cZurNIL58XnY3rREiwkWMejdMgTLYlsjMuHKI9AWbJbE5UAgqurW35sXDBfjadk4W9fP3ENJq9mdXv8hbd3YmOJrlkDOsigofFtUq3NLIOESADqM1mNj9Z6NUnc8x05wVHzlW5Jy5TzioRydyx82WkYwphVBSRN25ZbBSotr3r3GqGxy4Yvb5cBWrrFz25L8A6i3sB6WxCekEsv2M1tTC7n0adxB4QzZqlbSsExM//RCQfYFKDiVl91K6nRnr3+ikeMqwezg4Gd3/+qx7QXXVBRBabcQoKpssPgRkZ7UrbrQ4C81LU67foM=|' $ANDROID_MANIFEST_FILE
    cat $GOOGLE_SERVICES_JSON_DEMO_FILE > $GOOGLE_SERVICES_JSON_FILE
    # ios specific env
    plutil -replace CFBundleDisplayName -string "\$(PRODUCT_NAME)(demo)" $INFO_PLIST_FILE
    plutil -replace CFBundleName -string "\$(PRODUCT_NAME)(demo)" $INFO_PLIST_FILE
    sed -i '' 's/kSampleAppID = @"[0-9a-zA-Z-]*/kSampleAppID = @"ETcbCft8uoBLxNko4PHL/' $IOS_APP_DELEGATE_FILE
    sed -i '' 's/kSampleAppCode = @"[0-9a-zA-Z-]*/kSampleAppCode = @"f_8WJ1_DmzxRv6cTocOKZg/' $IOS_APP_DELEGATE_FILE
    sed -i '' 's|kSampleMapLicenseKey = @"[^"]*|kSampleMapLicenseKey = @"DLfchpeueyesZSnCE1JaW7is8tZ3CcFmZTW0koJqdFIusKhdNJ/Zdke1P7dfU+6hlTRZUcjqQ3x3syD+qoowLXD4uSiCXypGaCPKsDh3etWKmKc7MgkHO6aPf8JwL0QBHAdNrRPw0BMgBtHnRrSEXJ8MimMOrd8W3R1CNEXtiGiWT8aabKIk7nY3TtD+e8F2dVDYviyYlwyIIC82HhlNN0gyuPiZpFy3nNM3iKZJWeSARXdz7Iwik4pFG0FMP6kdV5ujtnyn3MOmoYqHxNyQPdI3G93hMbJu1Zfl0TlWgSudtP83qBtdyr49fiR4+8HncRenrgwgHV5isu4A4juy6q852b2UhcLfjphRs2/nqQWdMiZKmbzsHAuSVbIuG7iD6FsYu2ZJ3xi+bSeqfJ2hvKsHu3oE/4HCXhhSkLwqgw9TsKJurKdMw7S9adPptMEDdnlyVDEPHQz4LnPyQzOJYtBprDbb7oj1QETq4YRNHHzIM5gr76z+CC9Jo3cU8tXo9o770tuGH7GDOCMQXSOMQBHpZeFRJZAOcebcGymzg/5fkReG02ZOTkk4yVhwRgFTYDjV771XjV4uD1vTCPLVqgywPUKvvVl/ehl65xu+aeN1rXnl+txNkt1dqDfHWxs0ASl73ucSHcGGzCniooWDq0/fTGwBFwACXnYirG9XPKQ=|' $IOS_APP_DELEGATE_FILE
    # ios but needed when using the provisioning profile with app center
    # plutil -replace CFBundleIdentifier -string "\$(PRODUCT_BUNDLE_IDENTIFIER).demo" $INFO_PLIST_FILE
    # app specfic env
    sed -i '' 's/prod/demo/' $APP_COMPONENT_FILE
    sed -i '' 's/this.environment = this.prod/this.environment = this.demo/' $APP_CONFIG_FILE
fi
echo '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> $ANDROID_APP_BUILD_FILE '
cat $ANDROID_APP_BUILD_FILE
echo '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> $ANDROID_MANIFEST_FILE '
cat $ANDROID_MANIFEST_FILE
echo '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> $ANDROID_STRINGS_FILE '
cat $ANDROID_STRINGS_FILE
echo '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> $GOOGLE_SERVICES_JSON_FILE '
cat $GOOGLE_SERVICES_JSON_FILE
echo '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> $APP_COMPONENT_FILE '
cat $APP_COMPONENT_FILE
echo '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> $APP_CONFIG_FILE '
cat $APP_CONFIG_FILE
echo '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> $INFO_PLIST_FILE '
plutil -p $APPCENTER_SOURCE_DIRECTORY/ios/Trelar/Info.plist
echo '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ENDED PRE BUILD '
