import { Server } from "socket.io";

let ioInstance: Server;

export const rootSocket = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
          },
    });

    io.on('connection', (socket: any) => {
        
    });

    ioInstance = io; 

    return io;  
}

export const getIO = () => {
    if (!ioInstance) {
        throw new Error('Socket.IO has not been initialized');
    }

    return ioInstance;
};