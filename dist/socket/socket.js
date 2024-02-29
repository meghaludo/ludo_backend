"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.rootSocket = void 0;
const socket_io_1 = require("socket.io");
let ioInstance;
const rootSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on('connection', (socket) => {
    });
    ioInstance = io;
    return io;
};
exports.rootSocket = rootSocket;
const getIO = () => {
    if (!ioInstance) {
        throw new Error('Socket.IO has not been initialized');
    }
    return ioInstance;
};
exports.getIO = getIO;
