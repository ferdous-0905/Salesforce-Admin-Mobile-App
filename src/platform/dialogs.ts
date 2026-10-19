import { Alert } from 'react-native';
export function showMessage(title: string, message: string) { Alert.alert(title, message); }
export function confirmAction(title: string, message: string, confirmLabel: string, onConfirm: () => void) {
  Alert.alert(title, message, [{ text: 'Cancel', style: 'cancel' }, { text: confirmLabel, style: 'destructive', onPress: onConfirm }]);
}
export function confirmReplacement(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Replace', style: 'destructive', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}
