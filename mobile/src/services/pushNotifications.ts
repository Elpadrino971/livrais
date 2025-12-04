import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Enregistre l'appareil pour recevoir des notifications push
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.warn('Les notifications push ne fonctionnent que sur un appareil physique');
    return null;
  }

  try {
    // Demander la permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permission de notification refusée');
      return null;
    }

    // Obtenir le token Expo Push
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    })).data;

    // Configurer le canal Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Livrais',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2196F3',
        sound: 'default',
      });

      // Canal pour les nouvelles demandes
      await Notifications.setNotificationChannelAsync('new_requests', {
        name: 'Nouvelles demandes',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#4CAF50',
        sound: 'default',
      });

      // Canal pour les messages
      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    return token;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des notifications:', error);
    return null;
  }
};

/**
 * Sauvegarde le token push de l'utilisateur
 */
export const savePushToken = async (userId: string, token: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du token:', error);
  }
};

/**
 * Envoie une notification locale
 */
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: any,
  channelId: string = 'default'
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: null, // Immédiat
  });
};

/**
 * Envoie une notification à un utilisateur via Expo Push API
 */
export const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: any
) => {
  try {
    // Appeler l'Edge Function
    const { error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        user_id: userId,
        title,
        body,
        data,
      },
    });

    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
  }
};

/**
 * Notifie les livreurs à proximité d'une nouvelle demande
 */
export const notifyNearbyDeliverers = async (
  requestId: string,
  location: { latitude: number; longitude: number },
  radiusKm: number = 10
) => {
  try {
    const { error } = await supabase.functions.invoke('notify-nearby-deliverers', {
      body: {
        request_id: requestId,
        latitude: location.latitude,
        longitude: location.longitude,
        radius_km: radiusKm,
      },
    });

    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors de la notification des livreurs:', error);
  }
};

/**
 * Types de notifications
 */
export enum NotificationType {
  NEW_REQUEST = 'new_request',
  REQUEST_ACCEPTED = 'request_accepted',
  DELIVERY_STARTED = 'delivery_started',
  DELIVERY_COMPLETED = 'delivery_completed',
  NEW_MESSAGE = 'new_message',
  PRICE_NEGOTIATION = 'price_negotiation',
  RATING_RECEIVED = 'rating_received',
}

/**
 * Crée une notification dans la base de données
 */
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  relatedId?: string
) => {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      related_id: relatedId,
    });

    if (error) throw error;

    // Envoyer aussi le push
    await sendPushNotification(userId, title, message, {
      type,
      related_id: relatedId,
    });
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
  }
};

/**
 * Écoute les notifications reçues quand l'app est ouverte
 */
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Écoute les clics sur les notifications
 */
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Récupère le nombre de notifications non lues
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de notifications:', error);
    return 0;
  }
};

/**
 * Marque une notification comme lue
 */
export const markAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error);
  }
};

/**
 * Marque toutes les notifications comme lues
 */
export const markAllAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors du marquage de toutes comme lues:', error);
  }
};

/**
 * Supprime le badge de l'app
 */
export const clearBadge = async () => {
  await Notifications.setBadgeCountAsync(0);
};
