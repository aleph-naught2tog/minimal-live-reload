type fn = (...args: any[]) => any;
type handlerIndex = { connect: fn[]; disconnect: fn[]; message: fn[] };

document.addEventListener('DOMContentLoaded', () => {
  const PORT = 3333;

  const socket = new MiniSocket(PORT);

  socket.on('message', ({ data }) => {
    const { shouldReload } = JSON.parse(data);
    if (shouldReload) {
      location.reload();
    }
  });
});

class MiniSocket {
  // --- static props ---
  private static readonly NORMAL_EXIT: number = 1001;

  // --- instance props ---
  private readonly port: number;

  private socket: WebSocket;

  private handlers: handlerIndex = {
    connect: [],
    disconnect: [],
    message: []
  };

  // --- static methods ---
  private static create(port: number) {
    return new WebSocket(`ws://localhost:${port}`);
  }

  constructor(port: number) {
    this.port = port;
    this.socket = MiniSocket.create(this.port);

    this.initializeSocket();

    document.addEventListener('beforeunload', () => {
      this.socket.close(MiniSocket.NORMAL_EXIT);
    });
  }

  // --- instance methods ---
  on = (kind: keyof handlerIndex, callback: fn) => {
    if (kind in this.handlers) {
      this.handlers[kind].push(callback);
    }
  };

  private initializeSocket() {
    this.socket.onopen = this.handle.bind(this, 'connect');
    this.socket.onclose = this.handle.bind(this, 'disconnect');
    this.socket.onmessage = this.handle.bind(this, 'message');
    this.socket.onerror = _errorEvent => {};
  }

  private handle(kind: keyof handlerIndex, event: Event) {
    for (const callback of this.handlers[kind]) {
      callback(event);
    }
  }
}
