// Публичный API домена auth (ProjectRules §2).
// LoginScreen сюда не входит: App загружает его лениво по пути к файлу экрана — иначе экран
// попал бы в основной бандл вместе с AuthProvider и React.lazy ничего бы не разделял
export { AuthProvider } from './components/AuthProvider';
export { useAuthContext } from './hooks/useAuthContext';
