/**
 * IndexedDB кэш для K-Connect
 * 
 * В этой версии кэшируются ТОЛЬКО /assets/
 * Все остальное кэширование полностью отключено.
 *
 * @version 2.1.0
 * @modified: 2023-11-18
 */

// Настройки IndexedDB
const DB_NAME = 'k-connect-assets-cache';
const DB_VERSION = 1;
const STORE_NAME = 'assets';
const ASSETS_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 дней для ассетов

/**
 * Открыть соединение с IndexedDB
 * @returns {Promise<IDBDatabase>} Промис с открытой базой данных
 */
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB не поддерживается браузером'));
      return;
    }
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('[IndexedDB] Ошибка при открытии БД:', event.target.error);
      reject(event.target.error);
    };
    
    request.onupgradeneeded = (event) => {
      console.debug('[IndexedDB] Создание/обновление структуры БД');
      const db = event.target.result;
      
      // Создаем хранилище для ассетов, если его нет
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        console.debug('[IndexedDB] Создано хранилище для ассетов');
      }
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
};

/**
 * Проверяет, является ли URL ассетом
 * @param {string} url URL для проверки
 * @returns {boolean} true если это URL ассета
 */
const isAssetUrl = (url) => {
  return typeof url === 'string' && url.includes('/assets/');
};

/**
 * Сохраняет ассет в кэш
 * @param {string} url URL ассета
 * @param {Response} response Ответ от сервера
 * @returns {Promise<void>}
 */
const cacheResource = async (url, response) => {
  // Кэшируем только ассеты
  if (!isAssetUrl(url)) {
    return;
  }
  
  try {
    const db = await openDatabase();
    const clonedResponse = response.clone();
    const headers = {};
    
    // Сохраняем заголовки для воссоздания ответа позже
    clonedResponse.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    const blob = await clonedResponse.blob();
    
    // Не кэшируем слишком большие файлы
    if (blob.size > 5 * 1024 * 1024) { // 5MB
      console.debug(`[IndexedDB] Ассет слишком большой: ${url} (${blob.size} байт)`);
      return;
    }
    
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Записываем в хранилище
    const item = {
      url: url,
      data: blob,
      timestamp: Date.now(),
      headers: headers,
      status: clonedResponse.status,
      statusText: clonedResponse.statusText
    };
    
    store.put(item);
    
    transaction.oncomplete = () => {
      console.debug(`[IndexedDB] Ассет сохранен в кэш: ${url}`);
    };
    
    transaction.onerror = (event) => {
      console.error(`[IndexedDB] Ошибка при сохранении ассета: ${url}`, event.target.error);
    };
  } catch (error) {
    console.error(`[IndexedDB] Ошибка при кэшировании: ${url}`, error);
  }
};

/**
 * Получает ассет из кэша
 * @param {string} url URL ассета
 * @returns {Promise<Response|null>} Ответ из кэша или null
 */
const getCachedResource = async (url) => {
  // Проверяем только ассеты
  if (!isAssetUrl(url)) {
    return null;
  }
  
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve) => {
      const request = store.get(url);
      
      request.onsuccess = () => {
        const cachedItem = request.result;
        
        if (!cachedItem) {
          resolve(null);
          return;
        }
        
        // Проверяем, не устарел ли ассет
        if (Date.now() - cachedItem.timestamp > ASSETS_MAX_AGE) {
          console.debug(`[IndexedDB] Ассет устарел: ${url}`);
          
          // Удаляем устаревший ассет
          const deleteTransaction = db.transaction(STORE_NAME, 'readwrite');
          const deleteStore = deleteTransaction.objectStore(STORE_NAME);
          deleteStore.delete(url);
          
          resolve(null);
          return;
        }
        
        // Создаем новый Response из кэшированных данных
        const cachedResponse = new Response(cachedItem.data, {
          status: cachedItem.status,
          statusText: cachedItem.statusText,
          headers: cachedItem.headers
        });
        
        console.debug(`[IndexedDB] Ассет загружен из кэша: ${url}`);
        resolve(cachedResponse);
      };
      
      request.onerror = (event) => {
        console.error(`[IndexedDB] Ошибка при получении ассета: ${url}`, event.target.error);
        resolve(null);
      };
    });
  } catch (error) {
    console.error(`[IndexedDB] Ошибка при получении из кэша: ${url}`, error);
    return null;
  }
};

/**
 * Удаляет устаревшие ассеты и очищает другие кэши
 */
const deleteAllCaches = async () => {
  console.debug('[Cache] Очистка кэша...');
  
  try {
    // 1. Очистка Cache Storage API (используется Service Workers)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.debug('[Cache] Удаление Cache Storage:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }
    
    // 2. Удаление устаревших ассетов из IndexedDB
    try {
      const db = await openDatabase();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      
      const cutoffTime = Date.now() - ASSETS_MAX_AGE;
      const range = IDBKeyRange.upperBound(cutoffTime);
      const cursorRequest = index.openCursor(range);
      
      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          console.debug(`[IndexedDB] Удаление устаревшего ассета: ${cursor.value.url}`);
          cursor.delete();
          cursor.continue();
        }
      };
    } catch (e) {
      console.error('[IndexedDB] Ошибка при очистке устаревших ассетов:', e);
    }
    
    // 3. Очистка localStorage и sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    console.debug('[Cache] Очистка кэша завершена');
  } catch (error) {
    console.error('[Cache] Ошибка при очистке кэшей:', error);
  }
};

/**
 * Настраивает перехватчик fetch для обработки ассетов
 */
const setupFetchInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async function(resource, options = {}) {
    const url = resource instanceof Request ? resource.url : resource;
    
    // Если это не GET-запрос или не ассет - просто пропускаем
    if ((options.method && options.method !== 'GET') || !isAssetUrl(url)) {
      return originalFetch(resource, options);
    }
    
    try {
      // Сначала проверяем кэш
      const cachedResponse = await getCachedResource(url);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Если нет в кэше - делаем запрос
      const response = await originalFetch(resource, options);
      
      if (response && response.ok) {
        // Сохраняем в кэш только если успешный ответ
        cacheResource(url, response.clone());
      }
      
      return response;
    } catch (error) {
      console.error(`[IndexedDB] Ошибка при fetch: ${url}`, error);
      
      // При ошибке сети пробуем получить из кэша ещё раз (вдруг ошибка была при первой проверке)
      try {
        const cachedResponse = await getCachedResource(url);
        if (cachedResponse) {
          console.debug(`[IndexedDB] Используем кэш при ошибке сети: ${url}`);
          return cachedResponse;
        }
      } catch (e) {
        // Ничего не делаем
      }
      
      throw error;
    }
  };
};

/**
 * Инициализирует систему кэширования
 */
const init = () => {
  console.info(
    '%c[K-Connect] Включено кэширование только для /assets/',
    'background: #d0bcff; color: #1c1b1f; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
  );
  
  // Удаляем все старые кэши, кроме assets
  deleteAllCaches();
  
  // Устанавливаем мета-теги для предотвращения кэширования не-ассетов
  const metaNoCache = document.createElement('meta');
  metaNoCache.httpEquiv = 'Cache-Control';
  metaNoCache.content = 'no-cache, no-store, must-revalidate';
  document.head.appendChild(metaNoCache);
  
  const metaPragma = document.createElement('meta');
  metaPragma.httpEquiv = 'Pragma';
  metaPragma.content = 'no-cache';
  document.head.appendChild(metaPragma);
  
  const metaExpires = document.createElement('meta');
  metaExpires.httpEquiv = 'Expires';
  metaExpires.content = '0';
  document.head.appendChild(metaExpires);
  
  // Настраиваем перехват fetch для кэширования ассетов
  setupFetchInterceptor();
  
  return true;
};

// Экспортируем функции
export default {
  init,
  cacheResource,
  getCachedResource,
  deleteAllCaches
}; 