import { useTranslation } from 'react-i18next';

import { GREEN_API_CONSOLE_URL } from '@/constants/greenApi';

import { useAuthContext } from '../hooks/useAuthContext';
import { useLogin } from '../hooks/useLogin';
import type { CredentialsFormValues } from '../types/auth.types';
import { LoginForm } from './LoginForm';

import styles from './LoginScreen.module.css';

// Экран входа: связывает useLogin с AuthContext (успешный вход → setCredentials)
export function LoginScreen() {
  const { setCredentials, logoutReason } = useAuthContext();
  const { isLoading, error, fieldErrors, login } = useLogin({ onSuccess: setCredentials });
  const { t } = useTranslation();

  // Ошибка последней попытки входа важнее причины прошлого автоматического выхода
  const errorKey = error ?? logoutReason;

  function handleSubmit(values: CredentialsFormValues) {
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
    </main>
  );
}
