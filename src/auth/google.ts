import { Platform } from "react-native";
import type { GoogleAccount } from "../domain/identity";
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
function validClientId(value: string | undefined) {
  return (
    !!value && /^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(value)
  );
}
export const googleSignInConfigured =
  validClientId(webClientId) &&
  (Platform.OS === "android" ||
    (Platform.OS === "ios" && validClientId(iosClientId)));
/** Only public profile fields are persisted. Google tokens stay with the native SDK. */
export async function signInWithGoogle(): Promise<GoogleAccount | null> {
  if (!googleSignInConfigured)
    throw new Error(
      "Google sign-in is not available in this build yet. Your local learning progress is still available.",
    );
  const sdk = await import("@react-native-google-signin/google-signin");
  sdk.GoogleSignin.configure({
    webClientId,
    iosClientId,
    offlineAccess: false,
  });
  try {
    await sdk.GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    const response = await sdk.GoogleSignin.signIn();
    if (!sdk.isSuccessResponse(response)) return null;
    const user = response.data.user;
    return {
      id: user.id,
      email: user.email,
      name: (
        user.name ||
        [user.givenName, user.familyName].filter(Boolean).join(" ") ||
        user.email.split("@")[0]
      ).slice(0, 80),
    };
  } catch (error) {
    if (
      sdk.isErrorWithCode(error) &&
      error.code === sdk.statusCodes.SIGN_IN_CANCELLED
    )
      return null;
    throw new Error(
      "Google sign-in could not finish. Check your connection and Google Play services, then try again.",
    );
  }
}
