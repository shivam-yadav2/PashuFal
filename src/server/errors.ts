/**
 * Thrown for expected business-rule violations (invalid status transition,
 * referenced contact doesn't exist, etc). Routes map this to HTTP 400 with
 * the error's own message. Anything else thrown is treated as an
 * unexpected failure and mapped to a generic 500 — its real message is
 * logged server-side, never sent to the client.
 */
export class BusinessError extends Error {}

interface ErrorResponder {
  status(code: number): { json(body: unknown): unknown };
}

/**
 * Expected business-rule violations (BusinessError) are safe to show the
 * client and map to 400. Anything else is an unexpected failure — its real
 * message may contain SQL/driver internals (table names, constraints,
 * connection details), so it's logged here and never sent to the client.
 */
export function handleApiError(err: any, res: ErrorResponder): void {
  if (err instanceof BusinessError) {
    res.status(400).json({ success: false, error: err.message });
    return;
  }
  console.error('[API Error]', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
}
