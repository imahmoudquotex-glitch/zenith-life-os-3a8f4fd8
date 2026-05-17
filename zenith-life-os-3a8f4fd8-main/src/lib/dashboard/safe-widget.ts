import { logger } from "../logger";

export async function safeWidget<T>(
  name: string,
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    logger.warn({ err, widget: name }, "dashboard_widget_failed");
    return fallback;
  }
}
