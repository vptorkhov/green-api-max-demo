import { useTranslation } from 'react-i18next';

import { LanguageSelect } from '@/components/LanguageSelect/LanguageSelect';
import { ThemeSelect } from '@/components/ThemeSelect/ThemeSelect';
import { GREEN_API_CONSOLE_URL } from '@/constants/greenApi';

import { useAuthContext } from '../../hooks/useAuthContext';
import { useLogin } from '../../hooks/useLogin';
import type { CredentialsFormValues } from '../../types/auth.types';
import { LoginForm } from '../LoginForm/LoginForm';

import styles from './LoginScreen.module.css';

// Экран входа: связывает useLogin с AuthContext (успешный вход → setCredentials)
export function LoginScreen() {
  const { setCredentials, logoutReason, clearLogoutReason } = useAuthContext();
  const { isLoading, error, fieldErrors, login } = useLogin({ onSuccess: setCredentials });
  const { t } = useTranslation();

  // Причина прошлого выхода видна до первой новой попытки входа, дальше — только её результат
  const errorKey = error ?? logoutReason;

  function handleSubmit(values: CredentialsFormValues) {
    clearLogoutReason();
    void login(values);
  }

  return (
    <main className={styles.screen}>
      <section className={styles.card} aria-labelledby="login-title">
        <header className={styles.header}>
          <h1 id="login-title" className={styles.title}>
            {t('pages.auth.title')}
          </h1>
          <p className={styles.subtitle}>{t('pages.auth.subtitle')}</p>
        </header>
        <LoginForm
          isLoading={isLoading}
          fieldErrors={fieldErrors}
          errorKey={errorKey}
          onSubmit={handleSubmit}
        />
        <p className={styles.hint}>
          {t('pages.auth.consoleHint')}{' '}
          <a className={styles.link} href={GREEN_API_CONSOLE_URL} target="_blank" rel="noreferrer">
            {t('pages.auth.consoleLink')}
          </a>
        </p>
      </section>
      {/* Язык и тема — до входа: экран входа тоже должен быть понятен и удобен (п. 8.4–8.5) */}
      <div className={styles.preferences}>
        <LanguageSelect />
        <ThemeSelect />
      </div>
    </main>
  );
}
