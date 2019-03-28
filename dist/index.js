"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const ws_1 = __importDefault(require("ws"));
function run() {
    const PORT = 3333;
    const [_interpreter, _script, target = '.'] = process.argv;
    // watcher first -- if the file doesn't exist, no sense continuing.
    const watcher = fs_1.default.watch(target, { recursive: true });
    console.log(`[fs] Watcher initialized for folder ${target}`);
    // socketServer prep
    const socketServer = new ws_1.default.Server({ port: PORT, clientTracking: true });
    console.log(`[ws] Socket initialized for reloading.`);
    socketServer.on('connection', clientSocket => {
        console.log(`[ws] Client connected.`);
        clientSocket.on('close', () => {
            console.log(`[ws] Client disconnected`);
            clientSocket.terminate();
        });
    });
    // watcher initialization
    const data = { shouldReload: true };
    const dataAsString = JSON.stringify(data);
    watcher.on('change', (_type, file) => {
        console.log(`[fs] Change detected in ${file}.`);
        socketServer.clients.forEach(client => {
            console.log(`[ws] Notifying socket.`);
            client.send(dataAsString, console.error);
        });
    });
    // signal handling
    process.on('SIGINT', () => {
        console.log('\nCaught SIGINT; exiting...');
        watcher.close();
        socketServer.clients.forEach(client => client.close());
        socketServer.close();
        process.exit(0);
    });
}
exports.run = run;
