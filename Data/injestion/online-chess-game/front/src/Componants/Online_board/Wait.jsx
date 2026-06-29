import { useEffect } from "react";
import socket from "../../socket";
import { useNavigate } from "react-router-dom";

export default function Wait({ My_color, room_name, setMyColor, setRoomName }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleStart = () => {
      navigate('/board');
    };

    const handleColor = (data) => {
      setMyColor(data.my_color);
      setRoomName(data.room_name);
    };

    socket.on('start the game', handleStart);
    socket.on('color of my pieaces', handleColor);
    return () => {
      socket.off('start the game', handleStart);
      socket.off('color of my pieaces', handleColor);
    };
  }, [navigate, setMyColor, setRoomName]);

  return (
    <div className="page-center">
      <div className="wait-card">
        <h2 className="hero-title">Waiting for opponent</h2>
        <p className="hero-copy">
          Your match is almost ready. The game begins automatically once both players are connected.
        </p>
        <div className="status-panel">
          <div className="status-card">
            <p><strong>Room</strong> {room_name || 'Connecting...'}</p>
          </div>
          <div className="status-card">
            <p><strong>Color</strong> {My_color || 'Loading...'}</p>
          </div>
        </div>
        <div className="button-group">
          <button className="button-secondary" onClick={() => navigate('/')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
