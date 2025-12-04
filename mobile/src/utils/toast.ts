import { Alert, Platform, ToastAndroid } from 'react-native';

/**
 * Affiche un message toast (Android) ou une alerte (iOS)
 */
export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // Sur iOS, utiliser une alerte plus discrète
    Alert.alert(
      type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️',
      message,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  }
};

/**
 * Affiche un message d'erreur formaté
 */
export const showError = (error: any) => {
  const message = error?.message || error || 'Une erreur est survenue';
  showToast(message, 'error');
};

/**
 * Affiche un message de succès
 */
export const showSuccess = (message: string) => {
  showToast(message, 'success');
};
