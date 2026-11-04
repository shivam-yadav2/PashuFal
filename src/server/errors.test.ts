import { BusinessError, handleApiError } from './errors';

function fakeResponse() {
  const calls: { status?: number; body?: unknown } = {};
  const res = {
    status(code: number) {
      calls.status = code;
      return { json: (body: unknown) => { calls.body = body; } };
    },
  };
  return { res, calls };
}

describe('handleApiError', () => {
  it('maps a BusinessError to 400 with its own message', () => {
    const { res, calls } = fakeResponse();
    handleApiError(new BusinessError('Cannot reserve animal in \'SOLD\' status.'), res);
    expect(calls.status).toBe(400);
    expect(calls.body).toEqual({ success: false, error: "Cannot reserve animal in 'SOLD' status." });
  });

  it('maps any other error to a generic 500, never leaking the real message', () => {
    const { res, calls } = fakeResponse();
    const rawSqlError = new Error(
      "Cannot add or update a child row: a foreign key constraint fails (`purvanchal_dairy`.`animal_listings`, CONSTRAINT `fk_listings_sold_contact`...)"
    );
    handleApiError(rawSqlError, res);
    expect(calls.status).toBe(500);
    expect(calls.body).toEqual({ success: false, error: 'Internal server error' });
    expect(JSON.stringify(calls.body)).not.toContain('CONSTRAINT');
  });
});
