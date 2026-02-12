import { useState, useEffect } from "react";
import confetti from "canvas-confetti"; 

export default function Finish() {
  const runnerId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = "https://script.google.com/macros/s/AKfycbxzpxbYQzVMSgnUheJ0Y8y_KFmiMAeTBGxZBs3AFIghCQj82bN2W6E1TlBTEdcYuwE/exec";

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
        
        if (data.status === "YES") {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 9999 
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
      setLoading(false);
    };
    fetchStats();
  }, [runnerId]);

  return (
    <div className="app-content" style={{ overflowY: 'auto' }}> {/* ⭐ Allows scrolling if content exceeds height */}
      <div className="header-blue">
        <div className="logo-white-box">
          <img src="logo.png" alt="DAI Walkathon" className="logo-img" />
        </div>
        <h2 className="header-title">DAI Walkathon</h2>
      </div>

      <div className="screen-container" style={{ textAlign: 'center', width: '100%', padding: '15px' }}>
        {loading ? (
          <div style={{ padding: '50px 0' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p>Fetching your final results...</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '50px', marginBottom: '5px' }}>🏆</div>
            <h2 style={{ color: '#28a745', fontSize: '22px', margin: '5px 0' }}>Great Job, {userName}!</h2>
            <p style={{ fontSize: '15px', margin: '5px 0', color: '#555' }}>
              You have successfully completed the DAI Walkathon!
            </p>

            {/* ⭐ FIXED: Adjusted padding and font-size to keep time within bounds */}
            <div className="finish-card" style={{ 
              background: '#f1f8f1', 
              padding: '15px 10px', 
              borderRadius: '20px', 
              margin: '20px 0', 
              border: '2px solid #28a745', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <p style={{ textTransform: 'uppercase', fontSize: '11px', color: '#666', marginBottom: '0' }}>Official Time</p>
              <h1 style={{ 
                fontSize: '52px', // Slightly smaller to ensure it fits mobile widths
                margin: '5px 0', 
                color: '#1a1a1a', 
                fontWeight: 'bold',
                lineHeight: '1'
              }}>
                {stats?.total ? formatTime(stats.total) : "00:00"}
              </h1>
              <p style={{ color: '#666', fontSize: '13px', margin: '0' }}>Age Group: <strong>{stats?.ageGroup}</strong></p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <a 
                href={`${API}?action=certificate&userId=${runnerId}`} 
                className="primary-btn" 
                style={{ 
                  textDecoration: 'none', 
                  background: '#28a745', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  padding: '16px', 
                  fontSize: '17px', 
                  borderRadius: '12px' 
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                🎓 Download Certificate
              </a>

              <button 
                className="secondary-btn" 
                style={{ padding: '14px', fontSize: '15px' }}
                onClick={() => window.location.hash = "#performance"}
              >
                Detailed Performance
              </button>
            </div>

            <p style={{ marginTop: '30px', fontSize: '11px', color: '#999' }}>
              Your rank is now updated on the live leaderboard!
            </p>
          </>
        )}
      </div>
    </div>
  );
}