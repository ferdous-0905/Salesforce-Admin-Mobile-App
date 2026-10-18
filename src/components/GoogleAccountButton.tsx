import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { googleSignInConfigured } from "../auth/google";
import { Button } from "../ui/primitives";
import { styles as s } from "../ui/theme";
type NativeButton =
  typeof import("@react-native-google-signin/google-signin").GoogleSigninButton;
export function GoogleAccountButton({
  busy,
  onPress,
}: {
  busy: boolean;
  onPress: () => void;
}) {
  const [Native, setNative] = useState<NativeButton | null>(null);
  useEffect(() => {
    if (!googleSignInConfigured) return;
    let mounted = true;
    void import("@react-native-google-signin/google-signin")
      .then((sdk) => {
        if (mounted) setNative(() => sdk.GoogleSigninButton);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <View style={{ gap: 10 }}>
      {!googleSignInConfigured ? (
        <>
          <Button
            title="Continue with Google"
            icon="book"
            secondary
            disabled
            onPress={onPress}
          />
          <Text style={s.small}>
            Google sign-in will be available in a configured build. You can
            continue learning offline below.
          </Text>
        </>
      ) : Native ? (
        <Native
          size={Native.Size.Wide}
          color={Native.Color.Light}
          style={{ width: "100%", height: 52 }}
          disabled={busy}
          onPress={onPress}
        />
      ) : (
        <ActivityIndicator accessibilityLabel="Preparing Google sign-in" />
      )}
    </View>
  );
}
