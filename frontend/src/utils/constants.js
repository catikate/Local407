// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// LocalStorage keys
export const TOKEN_KEY = 'local407_token';
export const USER_KEY = 'local407_user';

// Categorías de items
export const ITEM_CATEGORIES = [
  'Amplificador',
  'Batería',
  'Micrófono',
  'Guitarra',
  'Bajo',
  'Teclado',
  'Pedales',
  'Cables',
  'Otros',
];

// Condiciones de items
export const ITEM_CONDITIONS = [
  'Excelente',
  'Bueno',
  'Regular',
  'Necesita reparación',
];

// Roles de usuario
export const USER_ROLES = [
  'ADMIN',
  'MEMBER',
  'GUEST',
];