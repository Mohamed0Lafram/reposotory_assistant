import { useState } from 'react'
import Board from './Componants/Online_board/Board'
import Intro from './intro'
import Wait from './Componants/Online_board/Wait'
import Winner from './Winner';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  const [My_color, setMyColor] = useState('');
  const [room_name, setRoomName] = useState('');

  return (
    <div className="app-shell">
      <main className="app-main">
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Intro setMyColor={setMyColor} setRoomName={setRoomName} />} />
            <Route path='/waiting' element={<Wait My_color={My_color} room_name={room_name} setMyColor={setMyColor} setRoomName={setRoomName} />} />
            <Route path='/board' element={<Board My_color={My_color} room_name={room_name} />} />
            <Route path='/end_game/:winner' element={<Winner />} />
          </Routes>
        </BrowserRouter>
      </main>
    </div>
  )
}

export default App
