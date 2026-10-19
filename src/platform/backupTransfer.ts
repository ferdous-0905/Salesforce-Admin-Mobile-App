import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
export async function exportBackupFile(text: string) {
  const file = new File(Paths.cache, 'salesforce-admin-quiz-backup.json');
  file.write(text);
  if (!await Sharing.isAvailableAsync())
    throw new Error('File sharing is unavailable on this device.');
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Save your progress backup' });
}
export async function pickBackupText(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain'], copyToCacheDirectory: true });
  if (result.canceled)
    return null;
  const file = new File(result.assets[0].uri);
  if (file.size > 20000000)
    throw new Error('Backup is too large.');
  return file.text();
}
