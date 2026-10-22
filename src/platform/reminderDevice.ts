import { Linking, Platform } from "react-native";
export interface ReminderDeviceStatus {
  batteryOptimizationEnabled: boolean;
  batterySaver: boolean;
  backgroundRestricted: boolean;
  exactAlarmsAllowed: boolean;
  doNotDisturb: boolean;
}
interface NativeDevice {
  getStatus: () => Promise<ReminderDeviceStatus>;
  openSettings: (destination: string) => Promise<void>;
}
async function deviceModule() {
  if (Platform.OS !== "android") return null;
  const { requireOptionalNativeModule } = await import("expo-modules-core");
  return requireOptionalNativeModule<NativeDevice>("ReminderDevice");
}
export async function readReminderDeviceStatus() {
  const device = await deviceModule();
  return device ? device.getStatus() : null;
}
export async function openReminderDeviceSettings(
  destination: "battery" | "notifications" | "channel",
) {
  const device = await deviceModule();
  if (device) await device.openSettings(destination);
  else await Linking.openSettings();
}
