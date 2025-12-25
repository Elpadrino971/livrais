import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../constants';

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  errorDetails?: string;
  onDismiss: () => void;
  onRetry?: () => void;
  dismissButtonText?: string;
  retryButtonText?: string;
}

export default function ErrorModal({
  visible,
  title = 'Une erreur est survenue',
  message,
  errorDetails,
  onDismiss,
  onRetry,
  dismissButtonText = 'Fermer',
  retryButtonText = 'Réessayer',
}: ErrorModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>⚠️</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {errorDetails && __DEV__ && (
            <ScrollView style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Détails techniques :</Text>
              <Text style={styles.detailsText}>{errorDetails}</Text>
            </ScrollView>
          )}

          <View style={styles.buttonContainer}>
            {onRetry && (
              <TouchableOpacity
                style={[styles.button, styles.retryButton]}
                onPress={onRetry}
              >
                <Text style={styles.retryButtonText}>{retryButtonText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.dismissButton, onRetry && styles.secondaryButton]}
              onPress={onDismiss}
            >
              <Text style={[styles.dismissButtonText, onRetry && styles.secondaryButtonText]}>
                {dismissButtonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Common error messages mapping
export const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  NETWORK_ERROR: {
    title: 'Problème de connexion',
    message: 'Vérifiez votre connexion internet et réessayez.',
  },
  AUTH_ERROR: {
    title: 'Erreur d\'authentification',
    message: 'Veuillez vous reconnecter pour continuer.',
  },
  PERMISSION_DENIED: {
    title: 'Permission refusée',
    message: 'Vous n\'avez pas la permission d\'effectuer cette action.',
  },
  NOT_FOUND: {
    title: 'Introuvable',
    message: 'L\'élément demandé est introuvable.',
  },
  SERVER_ERROR: {
    title: 'Erreur serveur',
    message: 'Nos serveurs rencontrent un problème. Veuillez réessayer dans quelques instants.',
  },
  PAYMENT_ERROR: {
    title: 'Erreur de paiement',
    message: 'Le paiement n\'a pas pu être effectué. Vérifiez vos informations bancaires.',
  },
  GPS_ERROR: {
    title: 'Erreur de localisation',
    message: 'Impossible d\'accéder à votre position. Vérifiez les autorisations de localisation.',
  },
  VALIDATION_ERROR: {
    title: 'Données invalides',
    message: 'Certaines informations saisies sont incorrectes.',
  },
};

// Hook for using error modal
import { useState, useCallback } from 'react';

interface ErrorState {
  visible: boolean;
  title: string;
  message: string;
  errorDetails?: string;
  onRetry?: () => void;
}

export function useErrorModal() {
  const [error, setError] = useState<ErrorState>({
    visible: false,
    title: '',
    message: '',
  });

  const showError = useCallback((
    message: string,
    title?: string,
    errorDetails?: string,
    onRetry?: () => void
  ) => {
    setError({
      visible: true,
      title: title || 'Une erreur est survenue',
      message,
      errorDetails,
      onRetry,
    });
  }, []);

  const showErrorByCode = useCallback((
    errorCode: keyof typeof ERROR_MESSAGES,
    errorDetails?: string,
    onRetry?: () => void
  ) => {
    const errorConfig = ERROR_MESSAGES[errorCode];
    if (errorConfig) {
      setError({
        visible: true,
        title: errorConfig.title,
        message: errorConfig.message,
        errorDetails,
        onRetry,
      });
    } else {
      setError({
        visible: true,
        title: 'Erreur',
        message: 'Une erreur inattendue s\'est produite.',
        errorDetails,
        onRetry,
      });
    }
  }, []);

  const hideError = useCallback(() => {
    setError((prev) => ({ ...prev, visible: false }));
  }, []);

  const ErrorModalComponent = useCallback(
    () => (
      <ErrorModal
        visible={error.visible}
        title={error.title}
        message={error.message}
        errorDetails={error.errorDetails}
        onDismiss={hideError}
        onRetry={error.onRetry}
      />
    ),
    [error, hideError]
  );

  return {
    showError,
    showErrorByCode,
    hideError,
    ErrorModal: ErrorModalComponent,
  };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  detailsContainer: {
    maxHeight: 150,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b91c1c',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 11,
    color: '#991b1b',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  dismissButton: {
    backgroundColor: COLORS.primary,
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  secondaryButtonText: {
    color: COLORS.text,
  },
});
