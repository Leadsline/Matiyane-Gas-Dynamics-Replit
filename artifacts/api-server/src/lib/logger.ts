const isProduction = process.env.NODE_ENV === "production";

type LogData = Record<string, unknown> | string;

function serialize(data: LogData, msg?: string): string {
  if (typeof data === "string") return msg ? `${data} ${msg}` : data;
  const { err, ...rest } = data as Record<string, unknown>;
  const parts: string[] = [];
  if (msg) parts.push(msg);
  if (err instanceof Error) parts.push(`err="${err.message}"`);
  else if (err !== undefined) parts.push(`err=${String(err)}`);
  const restKeys = Object.keys(rest);
  if (restKeys.length) parts.push(JSON.stringify(rest));
  return parts.join(" ");
}

export const logger = {
  info: (data: LogData, msg?: string): void => {
    console.info(`[INFO] ${serialize(data, msg)}`);
  },
  warn: (data: LogData, msg?: string): void => {
    console.warn(`[WARN] ${serialize(data, msg)}`);
  },
  error: (data: LogData, msg?: string): void => {
    console.error(`[ERROR] ${serialize(data, msg)}`);
  },
  debug: (data: LogData, msg?: string): void => {
    if (!isProduction) console.debug(`[DEBUG] ${serialize(data, msg)}`);
  },
};
