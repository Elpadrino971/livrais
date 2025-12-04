import { useState, useCallback } from 'react';
import { showError } from '@/utils/toast';

/**
 * Hook pour gérer les erreurs de manière cohérente
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((err: any) => {
    console.error('Error:', err);
    setError(err);
    showError(err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      options?: {
        onSuccess?: (data: T) => void;
        onError?: (error: any) => void;
        showSuccessMessage?: string;
      }
    ): Promise<T | null> => {
      setIsLoading(true);
      clearError();

      try {
        const result = await asyncFn();
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
        if (options?.showSuccessMessage) {
          showError(options.showSuccessMessage);
        }
        return result;
      } catch (err) {
        handleError(err);
        if (options?.onError) {
          options.onError(err);
        }
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, clearError]
  );

  return {
    error,
    isLoading,
    handleError,
    clearError,
    execute,
  };
};
