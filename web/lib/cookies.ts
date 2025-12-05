import { setCookie, getCookie, deleteCookie } from 'cookies-next';
// 1. Importamos OptionsType desde la raíz, no desde /server para evitar conflictos estrictos
import { OptionsType } from 'cookies-next';

export const CLIENT_COOKIE_NAME = 'cantech_client_id';

// 2. Usamos Partial<OptionsType> para permitir que falten propiedades
const DEFAULT_OPTIONS: Partial<OptionsType> = {
  maxAge: 60 * 60 * 24 * 365, // 1 año
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  httpOnly: false,
};

/**
 * Guarda el ID del cliente en una cookie.
 * Funciona en Server y Client.
 */
// 3. Cambiamos el tipo de 'context' a cualquier cosa compatible con opciones o 'any'
// para evitar el choque entre NextRequest e IncomingMessage.
export const setClientSession = (clientId: string, context?: Partial<OptionsType>) => {
  setCookie(CLIENT_COOKIE_NAME, clientId, {
    ...DEFAULT_OPTIONS,
    ...context,
  } as OptionsType); // 4. Forzamos el tipado aquí con 'as OptionsType'
};

/**
 * Obtiene el ID del cliente.
 */
export const getClientSession = (context?: Partial<OptionsType>) => {
  // El 'as OptionsType' calma a TypeScript sobre la compatibilidad de req/res
  return getCookie(CLIENT_COOKIE_NAME, context as OptionsType);
};

/**
 * Cierra la sesión (borra la cookie).
 */
export const removeClientSession = (context?: Partial<OptionsType>) => {
  deleteCookie(CLIENT_COOKIE_NAME, context as OptionsType);
};
