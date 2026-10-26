// Публичный API домена auth (ProjectRules §2).
// LoginScreen сюда не входит: App загружает его лениво по пути к файлу экрана — иначе экран
// попал бы в основной бандл вместе с AuthProvider и React.lazy ничего бы не разделял
export { AuthProvider } from './components/AuthProvider/AuthProvider';
export { useAuthContext } from './hooks/useAuthContext';
export { useUnauthorizedLogout } from './hooks/useUnauthorizedLogout';
// Статус инстанса: уведомление stateInstanceChanged разбирает домен chat (п. 7.1)
export type { InstanceState } from './types/auth.types';
export { isInstanceState } from './utils/authGuards';
// Причина выхода по уведомлению stateInstanceChanged — тот же текст, что при отказе во входе (п. 7.5)
export { getInstanceStateErrorKey } from './utils/getInstanceStateErrorKey';
