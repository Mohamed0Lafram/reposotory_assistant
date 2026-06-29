import { useNavigate, useParams } from "react-router-dom";

export default function Winner() {
  const { color } = useParams();
  const navigate = useNavigate();
  const textColor = color === 'white' ? '#f5f5f5' : '#d9b26b';

  return (
    <div className="page-center">
      <div className="winner-card">
        <h1>Game over</h1>
        <p>
          The <strong style={{ color: textColor }}>{color}</strong> player has won.
        </p>
        <div className="button-group">
          <button className="button-primary" onClick={() => navigate('/')}>Back to home</button>
          <button className="button-secondary" onClick={() => navigate('/board')}>See board</button>
        </div>
      </div>
    </div>
  );
}
