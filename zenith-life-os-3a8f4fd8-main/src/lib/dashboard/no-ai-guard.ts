declare global {
  var __AI_CALL_DEPTH__: number | undefined;
}

export function assertDashboardHasNoAICall(componentName: string): void {
  if (process.env.NODE_ENV === "development") {
    if (typeof globalThis !== "undefined" && globalThis.__AI_CALL_DEPTH__ !== undefined && globalThis.__AI_CALL_DEPTH__ > 0) {
      throw new Error(`[${componentName}] Dashboard must not consume AI quota on page load`);
    }
  }
}
