import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "./socket";

export default function Intro({ setMyColor, setRoomName }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleColor = (data) => {
      setMyColor(data.my_color);
      setRoomName(data.room_name);
    };

    socket.on('color of my pieaces', handleColor);
    return () => {
      socket.off('color of my pieaces', handleColor);
    };
  }, [setMyColor, setRoomName]);

  const start_game = () => {
    socket.emit('enter game');
    navigate('/waiting');
  };

  return (
    <div className="page-center">
      <div className="hero-card">
        <h1 className="hero-title">Clean chess. no distractions.</h1>
        <p className="hero-copy">
          Start a match in a simple, dark interface that keeps the board visible and the moves crisp.
        </p>
        <div className="feature-grid">
          <div className="feature-card">
            <strong>Neutral palette</strong>
            <span>No blue tones, only subtle earth and slate colors.</span>
          </div>
          <div className="feature-card">
            <strong>Sharp typography</strong>
            <span>Readable headings, balanced spacing, and no clutter.</span>
          </div>
          <div className="feature-card">
            <strong>Straightforward controls</strong>
            <span>Plain, sharp buttons and clear game actions.</span>
          </div>
        </div>
        <button className="button-primary" onClick={start_game}>Create game</button>
      </div>
    </div>
  );
}
