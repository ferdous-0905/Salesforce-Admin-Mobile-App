import type { ConfigContext, ExpoConfig } from "expo/config";
/** OAuth client IDs are public configuration, not client secrets. */
export default ({ config }: ConfigContext): ExpoConfig => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const valid =
    !!iosClientId &&
    /^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(iosClientId);
  return {
    ...config,
    name: config.name ?? "Salesforce Admin Quiz 2026",
    slug: config.slug ?? "salesforce-admin-quiz-2026",
    plugins: [
      ...(config.plugins ?? []),
      ...(valid
        ? [
            [
              "@react-native-google-signin/google-signin",
              {
                iosUrlScheme: `com.googleusercontent.apps.${iosClientId!.replace(".apps.googleusercontent.com", "")}`,
              },
            ] as [string, Record<string, string>],
          ]
        : []),
    ],
  };
};
