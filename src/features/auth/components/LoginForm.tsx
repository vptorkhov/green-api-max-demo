import { type ChangeEvent, type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { IconButton } from '@/components/ui/IconButton';
import { EyeIcon } from '@/components/ui/icons/EyeIcon';
import { EyeOffIcon } from '@/components/ui/icons/EyeOffIcon';
import { TextField } from '@/components/ui/TextField';
import { DEFAULT_API_URL } from '@/constants/greenApi';

import type {
  CredentialsField,
  CredentialsFieldErrors,
  CredentialsFormValues,
  LoginScreenErrorKey,
} from '../types/auth.types';

import styles from './LoginForm.module.css';

const INITIAL_VALUES: CredentialsFormValues = {
  idInstance: '',
  apiTokenInstance: '',
  apiUrl: DEFAULT_API_URL,
};

type Props = {
  isLoading: boolean;
  fieldErrors: CredentialsFieldErrors;
  errorKey: LoginScreenErrorKey | null;
  onSubmit: (values: CredentialsFormValues) => void;
};

// Форма входа: хранит только значения полей и видимость токена, проверку и запрос делает useLogin
export function LoginForm({ isLoading, fieldErrors, errorKey, onSubmit }: Props) {
  const { t } = useTranslation();

  const [values, setValues] = useState<CredentialsFormValues>(INITIAL_VALUES);
  const [isTokenVisible, setIsTokenVisible] = useState(false);

  const idInstanceError = fieldErrors.idInstance ? t(fieldErrors.idInstance) : null;
  const apiTokenInstanceError = fieldErrors.apiTokenInstance
    ? t(fieldErrors.apiTokenInstance)
    : null;
  const apiUrlError = fieldErrors.apiUrl ? t(fieldErrors.apiUrl) : null;
  const errorMessage = errorKey ? t(errorKey) : null;
  const hasErrorMessage = errorMessage !== null;
  const tokenVisibilityLabel = isTokenVisible
    ? t('pages.auth.hideToken')
    : t('pages.auth.showToken');

  function handleFieldChange(field: CredentialsField) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      setValues((previousValues) => ({ ...previousValues, [field]: value }));
    };
  }

  const handleIdInstanceChange = handleFieldChange('idInstance');
  const handleApiTokenInstanceChange = handleFieldChange('apiTokenInstance');
  const handleApiUrlChange = handleFieldChange('apiUrl');

  function handleTokenVisibilityToggle() {
    setIsTokenVisible((isVisible) => !isVisible);
  }

  // Отправка по Enter — нативно через <form>; браузерную валидацию заменяет validateCredentials
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      {/* disabled у fieldset блокирует все поля и кнопки на время запроса */}
      <fieldset className={styles.fields} disabled={isLoading}>
        <TextField
          label={t('pages.auth.fields.idInstance')}
          name="idInstance"
          value={values.idInstance}
          error={idInstanceError}
          inputMode="numeric"
          autoComplete="username"
          spellCheck={false}
          onChange={handleIdInstanceChange}
        />
        <TextField
          label={t('pages.auth.fields.apiTokenInstance')}
          name="apiTokenInstance"
          type={isTokenVisible ? 'text' : 'password'}
          value={values.apiTokenInstance}
          error={apiTokenInstanceError}
          autoComplete="current-password"
          autoCapitalize="none"
          spellCheck={false}
          endAdornment={
            <IconButton
              label={tokenVisibilityLabel}
              icon={isTokenVisible ? <EyeOffIcon /> : <EyeIcon />}
              aria-pressed={isTokenVisible}
              onClick={handleTokenVisibilityToggle}
            />
          }
          onChange={handleApiTokenInstanceChange}
        />
        <TextField
          label={t('pages.auth.fields.apiUrl')}
          name="apiUrl"
          type="url"
          value={values.apiUrl}
          error={apiUrlError}
          hint={t('pages.auth.apiUrlHint')}
          autoComplete="url"
          autoCapitalize="none"
          spellCheck={false}
          onChange={handleApiUrlChange}
        />
        {hasErrorMessage && <ErrorMessage message={errorMessage} />}
        <Button type="submit" className={styles.submit} isLoading={isLoading}>
          {t('pages.auth.submit')}
        </Button>
      </fieldset>
    </form>
  );
}
