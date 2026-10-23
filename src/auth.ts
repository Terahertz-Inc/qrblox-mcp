export const SETTINGS_URL = "https://app.qrblox.com/settings";
export const KEY_PREFIX = "sk-qrblox-";

export const MISSING_API_KEY_MESSAGE = `qrblox-mcp: missing QRBLOX_API_KEY.

Merchant tools require a Qrblox API key (${KEY_PREFIX}...) for tools/call.
Mint one at ${SETTINGS_URL}, then set:

  QRBLOX_API_KEY=${KEY_PREFIX}...
`;

export const INVALID_API_KEY_MESSAGE = `qrblox-mcp: QRBLOX_API_KEY must start with ${KEY_PREFIX}.

Mint a merchant key at ${SETTINGS_URL}.
`;

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export function requireApiKey(env: NodeJS.ProcessEnv = process.env): string {
  const key = env.QRBLOX_API_KEY?.trim();
  if (!key) {
    throw new AuthError(MISSING_API_KEY_MESSAGE);
  }
  if (!key.startsWith(KEY_PREFIX)) {
    throw new AuthError(INVALID_API_KEY_MESSAGE);
  }
  return key;
}
