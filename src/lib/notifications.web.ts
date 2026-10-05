export async function requestNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function scheduleVisaReminder(expiryDate: Date, visaType: string = 'E-Visa'): Promise<string[]> {
  return [];
}

export async function cancelVisaReminders(): Promise<void> {
  return;
}

export async function sendLocalAlert(title: string, body: string, data?: Record<string, any>): Promise<void> {
  return;
}
