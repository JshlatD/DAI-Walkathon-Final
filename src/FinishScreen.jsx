import { useState, useEffect } from "react";
import confetti from "canvas-confetti"; // ⭐ Mobile-friendly confetti

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
        
        // ⭐ Trigger mobile-optimized confetti on success
        if (data.status === "YES") {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 9999 // Ensures it is visible over other elements
          });
        }
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
    <div className="app-content" style={{ background: '#fff' }}> 
      <div className="screen-container" style={{ textAlign: 'center', width: '100%', padding: '10px' }}>
        <div style={{ fontSize: '70px', marginBottom: '10px' }}>🏆</div>
        <h2 style={{ color: '#28a745', fontSize: '24px' }}>Great Job, {userName}!</h2>
        <p style={{ fontSize: '16px', margin: '10px 0', color: '#555' }}>
          You have successfully completed the DAI Walkathon!
        </p>

        <div className="finish-card" style={{ 
          background: '#f1f8f1', 
          padding: '25px', 
          borderRadius: '20px', 
          margin: '25px 0', 
          border: '2px solid #28a745', 
          width: '100%',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)' 
        }}>
          <p style={{ textTransform: 'uppercase', fontSize: '12px', color: '#666', letterSpacing: '1px' }}>Official Time</p>
          <h1 style={{ fontSize: '56px', margin: '10px 0', color: '#1a1a1a', fontWeight: 'bold' }}>
            {stats?.total ? formatTime(stats.total) : "00:00"}
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>Age Group: <strong>{stats?.ageGroup}</strong></p>
        </div>

        {/* ⭐ MOBILE OPTIMIZED BUTTONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', marginTop: '10px' }}>
          <a 
            href={`${API}?action=certificate&userId=${runnerId}`} 
            className="primary-btn" 
            style={{ 
              textDecoration: 'none', 
              background: '#28a745', 
              display: 'block', 
              padding: '18px', 
              fontSize: '18px', 
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            🎓 Download Certificate
          </a>

          <button 
            className="secondary-btn" 
            style={{ padding: '15px', fontSize: '16px' }}
            onClick={() => window.location.hash = "#performance"}
          >
            View Detailed Performance
          </button>
        </div>

        <p style={{ marginTop: '40px', fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
          Your rank is now updated on the live leaderboard!
        </p>
      </div>
    </div>
  );
}