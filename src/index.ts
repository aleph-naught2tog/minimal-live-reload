import fs from 'fs';
import ws from 'ws';
import path from 'path';
import http from 'http';

export function run() {
  const SOCKET_PORT = 3333;
  const HTTP_PORT = SOCKET_PORT + 1;
  const NORMAL_CLOSE_CODE = 1000;

  const [_interpreter, _script, target = process.cwd()] = process.argv;

  const socketServer = getSocketServer(SOCKET_PORT);
  const watcher = initializeFileWatcher(target, socketServer);
  const socketFile = fs.readFileSync(path.join(__dirname, 'socket.js'));

  const httpServer = http.createServer((request, response) => {
    if (request.url === '/socket.js') {
      response.end(socketFile);
    }
  });

  httpServer.listen(HTTP_PORT, () => {
    console.log(`[http] Serving 'socket.js' on port ${HTTP_PORT}.`);
  });

  process.on('SIGINT', () => {
    console.log('\nCaught SIGINT; exiting...');

    watcher.close();

    socketServer.clients.forEach(client => client.close(NORMAL_CLOSE_CODE));
    socketServer.close();

    process.exit(0);
  });
}

function initializeFileWatcher(target: string, socketServer: ws.Server) {
  const watcher = fs.watch(target, { recursive: true });
  console.log(`[fs] Watcher initialized for folder ${target}`);

  const data = { shouldReload: true };
  const dataAsString = JSON.stringify(data);

  watcher.on('change', (_type, file) => {
    console.log(`[fs] Change detected in ${file}.`);

    socketServer.clients.forEach(client => {
      console.log(`[ws] Notifying socket.`);
      client.send(dataAsString);
    });
  });

  return watcher;
}

function getSocketServer(port: number) {
  const socketServer = new ws.Server({ port: port, clientTracking: true });

  console.log(`[ws] Socket initialized for reloading.`);
  console.log(`[ws] Waiting for the client to connect...`);

  socketServer.on('connection', clientSocket => {
    console.log(`[ws] Client connected.`);

    clientSocket.on('close', () => {
      console.log(`[ws] Client disconnected`);
      clientSocket.terminate();
    });
  });

  return socketServer;
}
