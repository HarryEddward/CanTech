import { setCookie, getCookie, deleteCookie } from 'cookies-next';
import { OptionsType } from 'cookies-next/lib/types';

// Nombre constante para evitar errores de dedo
export const CLIENT_COOKIE_NAME = 'cantech_client_id';

// Configuración por defecto (1 año, HttpOnly, Secure)
const DEFAULT_OPTIONS: OptionsType = {
  maxAge: 60 * 60 * 24 * 365, // 1 año
  path: '/',
  // secure: true en producción (https), false en desarrollo
  secure: process.env.NODE_ENV === 'production', 
  sameSite: 'strict',
  // IMPORTANTE: httpOnly evita que el JS del cliente acceda a la cookie (seguridad XSS).
  // Si necesitas leerla desde JS (Client Components), pon esto en false.
  // Para un ID de sesión/cliente, true es más seguro, pero si quieres leerla
  // en el cliente para mostrar "Mis Pedidos", pon false o usa middleware.
  httpOnly: false, 
};

/**
 * Guarda el ID del cliente en una cookie.
 * Funciona en Server (pasando { cookies }) y Client.
 */
export const setClientSession = (clientId: string, context?: any) => {
  setCookie(CLIENT_COOKIE_NAME, clientId, {
    ...DEFAULT_OPTIONS,
    ...context, // Necesario para Server Actions / API Routes en Next 13+
  });
};

/**
 * Obtiene el ID del cliente.
 */
export const getClientSession = (context?: any) => {
  return getCookie(CLIENT_COOKIE_NAME, context);
};

/**
 * Cierra la sesión (borra la cookie).
 */
export const removeClientSession = (context?: any) => {
  deleteCookie(CLIENT_COOKIE_NAME, context);
};