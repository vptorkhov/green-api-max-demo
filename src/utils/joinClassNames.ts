// Склеивает CSS-классы, пропуская пустые значения: joinClassNames(styles.button, isLoading && styles.loading)
export function joinClassNames(...classNames: (string | false | null | undefined)[]) {
  return classNames.filter(Boolean).join(' ');
}
