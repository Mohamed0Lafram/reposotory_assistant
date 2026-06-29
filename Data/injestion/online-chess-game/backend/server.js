//create a an input where the user enter a room id and then it

const express = require('express');
const http = require('http')
const { Server } = require('socket.io');
const cors = require('cors');
const { Socket } = require('dgram');


const app = express();

// Apply CORS to Express routes
app.use(cors({
    origin: '*', // your frontend URL
    methods: ['GET', 'POST']
}));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

//const game list
const games_list = [
    //{room_name , color2}
]

const color = ['white', 'black'];
io.on('connection', (socket) => {
    socket.on('enter game', () => {
        if (games_list.length === 0) {
            //create a new GAME
            //genrate the rooms name
            let room_name = generateRandomString();
            socket.join(room_name);
            //generate the color 
            let color_index = Math.floor(Math.random() * 2);
            let player_color = color[color_index]
            console.log(`${player_color} you have joined a room  ${room_name} wait for someone else`)
            games_list.push({
                room_name: room_name,
                color2: player_color === 'white' ? 'black' : 'white'
            })
            socket.emit('color of my pieaces', {
                room_name: room_name,
                my_color: player_color,
            })
        } else {
            const roomName = games_list[0].room_name;
            socket.join(roomName);
            console.log(`${games_list[0].color2} you have joined a room (${roomName}) `)
            socket.emit('color of my pieaces', {
                room_name: roomName,
                my_color: games_list[0].color2
            })
            setTimeout(() => {
                io.to(roomName).emit('start the game', {
                    room_name: roomName,
                });
            }, 50);
            //delete the game from the list 
            games_list.shift();
        }
    })


    socket.on("send turn", (data) => {
        console.log("Turn received:", data);

        const room = io.sockets.adapter.rooms.get(data.room_name);
        const numClients = room ? room.size : 0;

        console.log(`Number of clients in room ${data.room_name}:`, numClients);
        // Broadcast the move to all *other* clients
        io.to(data.room_name).emit("turn", data);
    })


})

server.listen(3000, () => console.log('SERVER RUNING AT 3000 !!!!!'));


//yser


//function 
function generateRandomString(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}  