/**
 * Utility functions for date and time formatting with timezone support
 * 
 * TODO: There are duplicate date formatting functions in formatters.js that should be
 * consolidated with these functions to maintain consistency throughout the application.
 * The formatters in this file provide better timezone handling and should be preferred.
 */

// Функция для получения локального смещения часового пояса в минутах
export const getLocalTimezoneOffset = () => {
  return new Date().getTimezoneOffset();
};

// Функция для получения смещения часового пояса Москвы в минутах (+3 часа)
export const getMoscowTimezoneOffset = () => {
  return -180; // -180 минут = +3 часа
};

// Функция для получения названия часового пояса пользователя
export const getUserTimezoneName = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Parses a date string consistently handling UTC and timezones
 * @param {string} dateString - The date string to parse
 * @returns {Date} - A properly parsed Date object
 */
export const parseDate = (dateString) => {
  if (!dateString) return new Date();
  
  // For debugging
  console.log(`Parsing date string: "${dateString}"`);
  
  // Проверяем есть ли уже Z в конце строки (индикатор UTC)
  if (dateString.endsWith('Z')) {
    console.log('  ✓ String has Z suffix, parsing as UTC');
    return new Date(dateString);
  } 
  // Проверяем ISO формат (содержит T) но без Z
  else if (dateString.includes('T') && !dateString.includes('Z')) {
    console.log('  ✓ String is ISO format but missing Z, adding Z suffix');
    // Скорее всего время в UTC без индикатора Z - добавляем его
    return new Date(dateString + 'Z');
  } 
  // Если формат неизвестен, парсим как есть
  else {
    console.log('  ✓ String format uncertain, parsing as-is');
    return new Date(dateString);
  }
};

/**
 * Утилита для отладки парсинга даты
 * @param {string} dateString - Строка даты для проверки
 * @returns {Object} - Информация о том, как парсится дата
 */
export const debugDate = (dateString) => {
  const standardParse = new Date(dateString);
  const utcParse = new Date(dateString + 'Z');
  const now = new Date();
  
  return {
    originalString: dateString,
    standardParseResult: standardParse.toString(),
    standardParseISO: standardParse.toISOString(),
    utcParseResult: utcParse.toString(),
    utcParseISO: utcParse.toISOString(),
    currentTime: now.toString(),
    currentTimeISO: now.toISOString(),
    diffStandard: Math.floor((now - standardParse) / 1000) + ' seconds',
    diffUTC: Math.floor((now - utcParse) / 1000) + ' seconds',
    userTimezone: getUserTimezoneName(),
    timezoneOffset: getLocalTimezoneOffset() + ' minutes'
  };
};

// Функция для форматирования времени с учетом часового пояса
export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  
  const date = parseDate(dateString);
  const now = new Date();
  
  // Calculate difference in seconds
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  return formatTimeAgoDiff(diffInSeconds);
};

// Helper function to format the time difference
const formatTimeAgoDiff = (diffInSeconds) => {
  if (diffInSeconds < 0) {
    // If still negative after adjustments, just show "just now"
    return 'только что';
  } else if (diffInSeconds < 60) {
    return 'только что';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${getRussianWordForm(minutes, ['минуту', 'минуты', 'минут'])} назад`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${getRussianWordForm(hours, ['час', 'часа', 'часов'])} назад`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${getRussianWordForm(days, ['день', 'дня', 'дней'])} назад`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${getRussianWordForm(months, ['месяц', 'месяца', 'месяцев'])} назад`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ${getRussianWordForm(years, ['год', 'года', 'лет'])} назад`;
  }
};

// Функция для форматирования даты
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = parseDate(dateString);
  
  // Форматируем дату в локальном формате пользователя
  return new Intl.DateTimeFormat(navigator.language || 'ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: getUserTimezoneName() // Use client's timezone
  }).format(date);
};

// Функция для форматирования даты и времени с коротким форматом месяца
export const formatDateTimeShort = (dateString) => {
  if (!dateString) return '';
  
  const date = parseDate(dateString);
  
  return new Intl.DateTimeFormat(navigator.language || 'ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: getUserTimezoneName()
  }).format(date);
};

// Функция для получения правильной формы слова в зависимости от числа
export const getRussianWordForm = (number, forms) => {
  const cases = [2, 0, 1, 1, 1, 2];
  const mod100 = number % 100;
  const mod10 = number % 10;
  return forms[(mod100 > 4 && mod100 < 20) ? 2 : cases[(mod10 < 5) ? mod10 : 5]];
}; 