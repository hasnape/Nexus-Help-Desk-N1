import 'i18next';

declare module 'i18next' {
  interface TFunction {
    <TKeys extends string = string>(
      key: TKeys | TKeys[],
      options?: string | Record<string, unknown>
    ): string;
    <TKeys extends string = string>(
      key: TKeys | TKeys[],
      defaultValue: string,
      options?: Record<string, unknown>
    ): string;
  }

  interface TranslateOptions {
    [key: string]: unknown;
  }
}
