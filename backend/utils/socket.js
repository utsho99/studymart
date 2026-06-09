const { Message, Conversation } = require('../models/Message');

const onlineUsers = new Map();

const initSocket = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    }

    // Join a conversation room
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
    });

    // Send a message
    socket.on('sendMessage', async ({ conversationId, senderId, text }) => {
      try {
        const message = await Message.create({ conversation: conversationId, sender: senderId, text });
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text,
          lastMessageAt: new Date(),
        });
        const populated = await message.populate('sender', 'name avatar');
        io.to(conversationId).emit('newMessage', populated);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('userTyping', { userId });
    });
    socket.on('stopTyping', ({ conversationId }) => {
      socket.to(conversationId).emit('userStoppedTyping');
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = { initSocket, onlineUsers };
