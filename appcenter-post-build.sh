#!/usr/bin/env bash

#
# Send a slack notification specifying whether or
# not a build successfully completed.
#
# Contributed by: David Siegel
# https://github.com/quicktype/quicktype/
echo '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> STARTING POST BUILD '
cd $APPCENTER_SOURCE_DIRECTORY

ORG=TrelarDev

if [[ -z "${APPCENTER_XCODE_PROJECT}" ]]; then
  APP="trelar-android-${APPCENTER_BRANCH}"
else
  APP="trelar-ios-${APPCENTER_BRANCH}"
fi

# APP=trelar-android-dev

ICON=https://pbs.twimg.com/profile_images/1018995854181576704/E-nYFL4k_200x200.jpg

build_url=https://appcenter.ms/orgs/$ORG/apps/$APP/build/branches/$APPCENTER_BRANCH/builds/$APPCENTER_BUILD_ID
build_link="<$build_url|$APP $APPCENTER_BRANCH #$APPCENTER_BUILD_ID>"

if [ "$APPCENTER_BRANCH" == "dev" ];
then
  SLACK_WEBHOOK=https://hooks.slack.com/services/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
fi
if [ "$APPCENTER_BRANCH" == "qa" ];
then
  SLACK_WEBHOOK=https://hooks.slack.com/services/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
fi
if [ "$APPCENTER_BRANCH" == "staging" ];
then
  SLACK_WEBHOOK=https://hooks.slack.com/services/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
fi
#if [ "$APPCENTER_BRANCH" == "demo" ];
#then
#  SLACK_WEBHOOK=https://hooks.slack.com/services/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OP
#fi

version() {
    cat package.json | jq -r .version
}

slack_notify() {
    local message
    local "${@}"

    curl -X POST --data-urlencode \
        "payload={
            \"channel\": \"#dev\",
            \"username\": \"appcenter\",
            \"text\": \"$message\",
            \"icon_url\": \"$ICON\" \
        }" \
        $SLACK_WEBHOOK
}

slack_notify_build_passed() {
    slack_notify message="✓ $build_link built"
}

slack_notify_build_failed() {
    slack_notify message="💥 $build_link build failed"
}

#slack_notify_deployed() {
#    slack_notify message="✓ <$build_url|$APP v`version`> released to npm"
#}
#
#slack_notify_homebrew_bump() {
#    slack_notify message="✓ <https://github.com/Homebrew/homebrew-core/pulls|$APP v`version`> bump PR sent to Homebrew"
#}

if [ "$AGENT_JOBSTATUS" == "Succeeded" ];
then
	  slack_notify_build_passed
else
    slack_notify_build_failed
fi
echo '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ENDED POST BUILD '
