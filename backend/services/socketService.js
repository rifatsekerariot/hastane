module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Room Joining Logic (Tablet authentication)
        socket.on('join_room', async (data) => {
            const { deviceToken } = data;
            console.log(`Device attempting to join with token: ${deviceToken}`);
            // TODO: Validate token and join specific room channel
            // const room = await getRoomByToken(deviceToken);
            // if(room) socket.join(room.id);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
