import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

// This will be initialized in the API route
let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HTTPServer) {
    if (io) {
        return io;
    }

    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Join gym-specific room
        socket.on('join:gym', (gymOwnerId: string) => {
            socket.join(`gym:${gymOwnerId}`);
            console.log(`Socket ${socket.id} joined gym:${gymOwnerId}`);
        });

        // Handle member check-in event
        socket.on('checkin:member', (data: { gymOwnerId: string; memberName: string }) => {
            io?.to(`gym:${data.gymOwnerId}`).emit('checkin:update', data);
        });

        // Handle member check-out event
        socket.on('checkout:member', (data: { gymOwnerId: string; memberName: string }) => {
            io?.to(`gym:${data.gymOwnerId}`).emit('checkout:update', data);
        });

        // Handle new activity event
        socket.on('activity:new', (data: { gymOwnerId: string; activity: any }) => {
            io?.to(`gym:${data.gymOwnerId}`).emit('activity:update', data.activity);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
}

export function getSocketServer() {
    return io;
}

// Helper function to emit events from API routes
export function emitSocketEvent(event: string, data: any) {
    if (io) {
        io.emit(event, data);
    }
}

export function emitToRoom(room: string, event: string, data: any) {
    if (io) {
        io.to(room).emit(event, data);
    }
}
