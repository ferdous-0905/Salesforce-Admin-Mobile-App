import * as DocumentPicker from 'expo-document-picker';
export async function exportBackupFile(text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'salesforce-admin-quiz-backup.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function pickBackupText(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain'], base64: false });
  if (result.canceled)
    return null;
  const asset = result.assets[0];
  try {
    if (!asset.file)
      throw new Error('Could not read this backup. Please choose a local JSON file.');
    if (asset.file.size > 20000000)
      throw new Error('Backup is too large.');
    return await asset.file.text();
  }
  finally {
    URL.revokeObjectURL(asset.uri);
  }
}
