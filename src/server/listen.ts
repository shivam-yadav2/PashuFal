import type { Server } from 'http';

/**
 * Starts listening and resolves once the port is bound. A port that's already
 * taken rejects with an explanation the owner can act on, instead of Node's
 * raw "Unhandled 'error' event" crash.
 */
export function startListening(server: Server, port: number, host: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const onError = (err: NodeJS.ErrnoException) => {
      server.off('listening', onListening);
      if (err.code === 'EADDRINUSE') {
        reject(
          new Error(
            `Port ${port} is already in use by another program — often another project's dev server, ` +
              `or this app already running in a different terminal. Stop that program, or run this app ` +
              `on another port by setting PORT=3001 (or any free port) in your .env file.`
          )
        );
      } else {
        reject(err);
      }
    };
    const onListening = () => {
      server.off('error', onError);
      resolve();
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, host);
  });
}
