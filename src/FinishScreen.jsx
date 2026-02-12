import { useState, useEffect } from "react";

export default function Finish() {
  const runnerId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = "https://script.google.com/macros/s/AKfycbxzpxbYQzVMSgnUheJ0N8y_KFmiMAeTBGxZBs3AFIghCQj82bN2W6E1TlBTEdcYuwE/exec";

  const formatTime = (decimalMins) => {
    if (!decimalMins || isNaN(decimalMins)) return "00:00";
    const totalSeconds = Math.round(decimalMins * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "getUserStats", userId: runnerId })
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
      setLoading(false);
    };
    fetchStats();
  }, [runnerId]);

  if (loading) return (
    <div className="app-content">
      <div className="screen-container">
        <p>Calculating final results...</p>
      </div>
    </div>
  );

  return (
    <div className="app-content"> {/* ⭐ Added wrapper to fix shrinking */}
      <div className="screen-container" style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ fontSize: '60px', marginBottom: '10px' }}>🏆</div>
        <h2 style={{ color: '#28a745' }}>Congratulations!</h2>
        <p style={{ fontSize: '18px', margin: '10px 0' }}>
          <strong>{userName}</strong>, you have successfully completed the DAI Walkathon!
        </p>

        <div className="finish-card" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '20px', margin: '20px 0', border: '2px solid #28a745', width: '100%' }}>
          <p style={{ textTransform: 'uppercase', fontSize: '12px', color: '#666', marginBottom: '5px' }}>Your Official Time</p>
          <h1 style={{ fontSize: '48px', margin: 0, color: '#333' }}>
            {stats?.total ? formatTime(stats.total) : "00:00"}
          </h1>
        </div>

        <p style={{ color: '#666', marginBottom: '25px' }}>
          Age Group: <strong>{stats?.ageGroup}</strong>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
          <a 
            href={`${API}?action=certificate&userId=${runnerId}`} 
            className="primary-btn" 
            style={{ textDecoration: 'none', background: '#28a745', display: 'block' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            🎓 Download Certificate
          </a>

          <button 
            className="secondary-btn" 
            onClick={() => window.location.hash = "#performance"}
          >
            Detailed Performance
          </button>
        </div>

        <p style={{ marginTop: '30px', fontSize: '11px', color: '#999' }}>
          Thank you for participating! Your results are now live on the leaderboard.
        </p>
      </div>
    </div>
  );
}