import axios from 'axios';

class NotificationService {
  async getVapidPublicKey() {
    let retryCount = 0;
    const maxRetries = 2;
    

    const hardcodedVapidKey = 'ВАШ VAPID';
    console.log(`Using hardcoded VAPID key: ${hardcodedVapidKey.substring(0, 10)}...`);
    return hardcodedVapidKey;
    
  }
  
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of existingRegistrations) {
          if (reg.active && reg.active.scriptURL.includes('service-worker.js')) {
            console.log('Push service worker already registered with scope:', reg.scope);
            return reg;
          }
        }
        
        console.log('Registering push service worker...');
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
          updateViaCache: 'none' 
        });
        console.log('Push service worker registered with scope:', registration.scope);
        
        // Force activation
        if (registration.installing) {
          console.log('Service worker installing...');
          registration.installing.addEventListener('statechange', e => {
            if (e.target.state === 'activated') {
              console.log('Service worker activated!');
            }
          });
        }
        
        return registration;
      } catch (error) {
        console.error('Push service worker registration failed:', error);
        throw error;
      }
    } else {
      throw new Error('Service Worker not supported in this browser');
    }
  }
  
  async subscribeToPushNotifications() {
    try {
      console.log('Starting push notification subscription process...');
      
      // Check permission first
      if (Notification.permission !== 'granted') {
        console.log('Notification permission not granted, requesting permission...');
        const permission = await this.requestNotificationPermission();
        if (permission !== 'granted') {
          throw new Error(`Notification permission not granted: ${permission}`);
        }
      }
      
      // Get the service worker registration
      let registration;
      if (navigator.serviceWorker.controller) {
        console.log('Service worker already controlling, getting ready state...');
        registration = await navigator.serviceWorker.ready;
      } else {
        console.log('Service worker not controlling, registering new service worker...');
        registration = await this.registerServiceWorker();
      }
      
      console.log('Getting VAPID public key...');
      const vapidPublicKey = await this.getVapidPublicKey();
      console.log('VAPID public key retrieved, length:', vapidPublicKey.length);
      
      // Convert base64 string to Uint8Array
      const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey);
      console.log('Converted VAPID key to Uint8Array, length:', convertedVapidKey.length);
      
      // Check for existing subscription
      console.log('Checking for existing push subscriptions...');
      let subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('Existing subscription found:', subscription.endpoint);
        
        // Compare with new applicationServerKey - if different, we need to resubscribe
        const currentServerKey = new Uint8Array(subscription.options.applicationServerKey);
        let needsResubscribe = currentServerKey.length !== convertedVapidKey.length;
        
        if (!needsResubscribe) {
          for (let i = 0; i < currentServerKey.length; i++) {
            if (currentServerKey[i] !== convertedVapidKey[i]) {
              needsResubscribe = true;
              break;
            }
          }
        }
        
        if (needsResubscribe) {
          console.log('Server key changed, unsubscribing from old subscription...');
          await subscription.unsubscribe();
          subscription = null;
        }
      }
      
      // If no subscription exists, create one
      if (!subscription) {
        console.log('Creating new push subscription...');
        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
          });
          console.log('Successfully subscribed to push notifications');
        } catch (subscribeError) {
          console.error('Error subscribing to push:', subscribeError);
          throw subscribeError;
        }
      }
      
      // Save subscription on server
      console.log('Saving subscription to server...');
      await this.saveSubscription(subscription);
      console.log('Subscription successfully saved to server');
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }
  
  async unsubscribeFromPushNotifications() {
    try {
      if (!navigator.serviceWorker.controller) {
        console.log('No active service worker found');
        return false;
      }
      
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Сначала удаляем с сервера
        await axios.delete('/api/notifications/push-subscription', {
          data: { endpoint: subscription.endpoint }
        });
        
        // Потом отписываемся локально
        await subscription.unsubscribe();
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }
  
  async saveSubscription(subscription) {
    try {
      const subscriptionJSON = subscription.toJSON();
      
      // Добавляем параметр отправки тестового уведомления
      const payload = {
        ...subscriptionJSON,
        send_test: true,  
        platform: this.getBrowserInfo(), // Добавляем информацию о браузере
        url: 'https://k-connect.ru'  
      };
      
      console.log('Saving subscription to server:', payload);
      const response = await axios.post('/api/notifications/push-subscription', payload);
      console.log('Subscription saved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving subscription to server:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
  }
  
  // Получение информации о браузере для аналитики
  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = 'other';
    
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = 'chrome';
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = 'firefox';
    } else if (userAgent.match(/safari/i)) {
      browserName = 'safari';
    } else if (userAgent.match(/opr\//i)) {
      browserName = 'opera';
    } else if (userAgent.match(/edg/i)) {
      browserName = 'edge';
    }
    
    return browserName;
  }
  
  async getNotificationPermissionStatus() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }
  
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    
    const permission = await Notification.requestPermission();
    return permission;
  }
  
  async isPushNotificationSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }
  
  // Вспомогательная функция для преобразования VAPID-ключа из base64 в Uint8Array
  // Метод работает со всеми браузерами, включая Safari/iOS
  urlBase64ToUint8Array(base64String) {
    if (!base64String) {
      console.error('Empty base64String provided to urlBase64ToUint8Array');
      throw new Error('Invalid VAPID key: empty string');
    }
    
    console.log(`Converting VAPID key to Uint8Array. Input length: ${base64String.length}, browser: ${this.getBrowserInfo()}`);
    
    try {
      // Ключ может быть с паддингом или без, с URL-safe или стандартными символами base64
      // Заменяем URL-safe символы стандартными символами base64
      let base64 = base64String.replace(/-/g, '+').replace(/_/g, '/');
      
      // Добавляем паддинг если нужно (должно быть кратно 4)
      while (base64.length % 4 !== 0) {
        base64 += '=';
      }
      
      console.log(`Normalized base64 length: ${base64.length}`);
      
      // Декодируем base64
      const binaryStr = atob(base64);
      console.log(`Decoded binary string length: ${binaryStr.length}`);
      
      // Конвертируем в Uint8Array
      const outputArray = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; ++i) {
        outputArray[i] = binaryStr.charCodeAt(i);
      }
      
      console.log(`Final Uint8Array length: ${outputArray.length}`);
      
      // Специальная обработка для iOS/Safari (нужно 65 байт для P-256)
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if ((isSafari || isIOS) && outputArray.length !== 65) {
        console.warn(`VAPID key may not be in correct format for Safari/iOS. Length: ${outputArray.length}, expected: 65`);
      }
      
      return outputArray;
    } catch (error) {
      console.error('Error converting VAPID key:', error);
      throw new Error(`Failed to convert VAPID key: ${error.message}`);
    }
  }
  
  // Send a test notification
  async sendTestNotification() {
    try {
      console.log('Sending test notification request...');
      const response = await axios.post('/api/notifications/test', {
        url: 'https://k-connect.ru',
        title: 'Тестовое уведомление',
        body: 'Уведомления настроены и работают'
      });
      console.log('Test notification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
  }
}

export default new NotificationService(); 