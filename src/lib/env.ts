import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  return value;
}

function readLocalEnvValue(name: string) {
  const envPath = path.join(process.cwd(), ".env");
  if (!existsSync(envPath)) return "";

  const line = readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith(`${name}=`));

  if (!line) return "";
  return line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
}

function looksLikePlaceholder(value: string) {
  return value.includes("sua") || value.includes("...") || value.includes("example") || value.includes("placeholder");
}

export function envValue(name: string) {
  const processValue = process.env[name]?.trim() || "";
  const localValue = readLocalEnvValue(name);

  if (localValue && (!processValue || looksLikePlaceholder(processValue))) return localValue;
  return processValue || localValue;
}

export function siteBaseUrl() {
  return process.env.SITE_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}
