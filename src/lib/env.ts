export function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  return value;
}

export function siteBaseUrl() {
  return process.env.SITE_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}
