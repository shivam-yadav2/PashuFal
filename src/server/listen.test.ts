import net from 'net';
import http from 'http';
import { startListening } from './listen';

function close(server: { close: (cb: () => void) => void }) {
  return new Promise<void>((resolve) => server.close(() => resolve()));
}

describe('startListening', () => {
  it('resolves once the server is listening on a free port', async () => {
    const server = http.createServer();
    await startListening(server, 0, '127.0.0.1');
    expect(server.listening).toBe(true);
    await close(server);
  });

  it('rejects with a readable message naming the port and the PORT setting when the port is taken', async () => {
    const blocker = net.createServer();
    await new Promise<void>((resolve) => blocker.listen(0, '127.0.0.1', () => resolve()));
    const port = (blocker.address() as net.AddressInfo).port;

    const server = http.createServer();
    await expect(startListening(server, port, '127.0.0.1')).rejects.toThrow(
      new RegExp(`Port ${port} is already in use[\\s\\S]*PORT=`)
    );
    expect(server.listening).toBe(false);
    await close(blocker);
  });
});
