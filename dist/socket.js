"use strict";
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
    constructor(port) {
        this.handlers = {
            connect: [],
            disconnect: [],
            message: []
        };
        // --- instance methods ---
        this.on = (kind, callback) => {
            if (kind in this.handlers) {
                this.handlers[kind].push(callback);
            }
        };
        this.port = port;
        this.socket = MiniSocket.create(this.port);
        this.initializeSocket();
        document.addEventListener('beforeunload', () => {
            this.socket.close(MiniSocket.NORMAL_EXIT);
        });
    }
    // --- static methods ---
    static create(port) {
        return new WebSocket(`ws://localhost:${port}`);
    }
    initializeSocket() {
        this.socket.onopen = this.handle.bind(this, 'connect');
        this.socket.onclose = this.handle.bind(this, 'disconnect');
        this.socket.onmessage = this.handle.bind(this, 'message');
        this.socket.onerror = _errorEvent => { };
    }
    handle(kind, event) {
        for (const callback of this.handlers[kind]) {
            callback(event);
        }
    }
}
// --- static props ---
MiniSocket.NORMAL_EXIT = 1001;
