import { Server } from 'socket.io';

let ioInstance = null;

export const initSocket = (httpServer, clientUrl) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: clientUrl || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  ioInstance.on('connection', (socket) => {
    console.log(`⚡ [Socket Connected]: ${socket.id}`);

    socket.on('join_role', (payload) => {
      const { role, shopId, userId } = payload || {};
      if (role) {
        socket.join(`role_${role.toLowerCase()}`);
      }
      if (shopId) {
        socket.join(`shop_${shopId}`);
      }
      if (userId) {
        socket.join(`user_${userId}`);
      }

      socket.emit('joined_role_success', {
        status: 'joined',
        role,
        shopId,
        userId,
        socketId: socket.id,
      });
      console.log(`⚡ [Socket Joined]: role=${role}, shopId=${shopId}, userId=${userId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 [Socket Disconnected]: ${socket.id} (reason: ${reason})`);
    });
  });

  return ioInstance;
};

export const getIO = () => {
  return ioInstance;
};

export const emitEvent = (eventName, data, room = null) => {
  if (!ioInstance) return;
  if (room) {
    ioInstance.to(room).emit(eventName, data);
  } else {
    ioInstance.emit(eventName, data);
  }
};
