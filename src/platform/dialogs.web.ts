export function showMessage(title: string, message: string) { window.alert(`${title}\n\n${message}`); }
export function confirmAction(title: string, message: string, _confirmLabel: string, onConfirm: () => void) {
  if (window.confirm(`${title}\n\n${message}`))
    onConfirm();
}
export async function confirmReplacement(title: string, message: string): Promise<boolean> {
  return window.confirm(`${title}\n\n${message}`);
}
