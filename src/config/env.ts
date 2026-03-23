interface EnvConfig {
  apiUrl: string;
  appEnv: string;
}

function getRequiredEnv(key: string): string {
  const value = import.meta.env[key] as string | undefined;
  if (!value) {
    throw new Error(
      `[Env Error] La variable de entorno "${key}" es requerida pero no está definida. ` +
      `Asegúrate de que exista en tu archivo .env.`
    );
  }
  return value;
}

export const ENV: Readonly<EnvConfig> = Object.freeze({
  apiUrl: getRequiredEnv('VITE_API_URL'),
  appEnv: (import.meta.env.VITE_APP_ENV as string) || 'development',
});