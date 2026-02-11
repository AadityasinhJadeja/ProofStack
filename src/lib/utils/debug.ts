const DEBUG_ENABLED = /^(1|true|yes)$/i.test(process.env.DEBUG ?? "");

/**
 * Writes lightweight debug logs only when DEBUG is truthy.
 */
export function debugLog(scope: string, message: string, payload?: unknown): void {
  if (!DEBUG_ENABLED) {
    return;
  }

  if (typeof payload === "undefined") {
    console.log(`[DEBUG:${scope}] ${message}`);
    return;
  }

  console.log(`[DEBUG:${scope}] ${message}`, payload);
}

export function isDebugEnabled(): boolean {
  return DEBUG_ENABLED;
}
