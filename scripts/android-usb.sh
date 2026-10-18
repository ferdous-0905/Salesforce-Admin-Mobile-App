#!/bin/sh
set -eu
if [ "$(uname -s)" = "Darwin" ]; then
  JAVA_HOME="$(/usr/libexec/java_home -v 17)"
  ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
  export JAVA_HOME ANDROID_HOME
fi
if [ -z "${ANDROID_HOME:-}" ] || [ ! -x "$ANDROID_HOME/platform-tools/adb" ]; then
  echo 'Set ANDROID_HOME to your Android SDK directory.' >&2
  exit 1
fi
PATH="${JAVA_HOME:+$JAVA_HOME/bin:}$ANDROID_HOME/platform-tools:$PATH"
export PATH
export EXPO_NO_TELEMETRY=1
adb devices -l
exec npx expo run:android --device "$@"
