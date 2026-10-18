#!/usr/bin/env bash
# Installs the APK on the CI emulator and screenshots the main screens.
set -x
APK=android/app/build/outputs/apk/release/app-release.apk
PKG=ae.edgeacademy.learn
ACT=$PKG/.MainActivity
SITE=https://edgemarketingae-eng.github.io/forexclass/
OUT=preview
mkdir -p "$OUT"
shot(){ sleep "$2"; adb exec-out screencap -p > "$OUT/$1.png"; }

adb shell settings put system screen_off_timeout 1800000
adb shell svc power stayon true
adb shell wm size
adb install -r "$APK"

# 1-2: launch, splash then home
adb shell am start -n "$ACT"
shot 01-launch 1.5
shot 02-home 18
adb shell input swipe 540 1900 540 700 500
shot 03-home-scroll 3
adb shell input swipe 540 1900 540 500 500
shot 04-class-cards 3

# 5: phone menu
adb shell am start -n "$ACT" -d "${SITE}#home"
sleep 8
sleep 10
adb shell input tap 975 205
shot 05-menu 2
adb shell input keyevent KEYCODE_BACK

# 6-8: classroom (recording + slides)
adb shell am start -n "$ACT" -d "${SITE}#class-3"
shot 06-classroom 15
adb shell input swipe 900 1350 150 1350 300
shot 07-next-slide 3
# tap the middle of the video to play
adb shell input tap 540 640
shot 08-video-play 30
shot 08b-video-play-60s 30
shot 08c-video-play-90s 30
adb shell input swipe 540 1900 540 900 500
shot 09-class-details 3

# 10: course outline
adb shell am start -n "$ACT" -d "${SITE}#outline"
shot 10-outline 8
adb shell dumpsys window | grep -m1 mCurrentFocus || true
ls -la "$OUT"
