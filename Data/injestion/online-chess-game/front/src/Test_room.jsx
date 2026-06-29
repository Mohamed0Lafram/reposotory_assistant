import { useEffect, useState } from "react"

import {io} from 'socket.io-client';

const socket = io("http://localhost:3000");

export default function Test(){
    useEffect(() =>{
        socket.on('chat',(data) =>{
            setH1(data.chat);
        })
    },[])

    const [room,setRoom] = useState('');
    const [chat,setShat] = useState('');
    const [h_1,setH1] = useState('')
    const enter_room = () =>{
        socket.emit('enter test room',room)
    }
    const send_chat = () =>{
        socket.emit('send chat',{chat : chat,room:room});
    }
    return(<>
    <div>
        <h1>{h_1}</h1>
        <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="room_name"></input>
        <button onClick={enter_room}>room </button>

        <input value={chat} onChange={(e) => setShat(e.target.value)} placeholder="chat"></input>
        <button onClick={send_chat}>chat</button>
    </div>
    </>)
}